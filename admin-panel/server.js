import dotenv from 'dotenv';
import crypto from 'crypto';
import http from 'http';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import express from 'express';
import session from 'express-session';
import { createProxyMiddleware } from 'http-proxy-middleware';
import { createServer as createViteServer } from 'vite';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

/** Tek .env: ENV_PATH → /root/data/.env → repo kökü .env → admin-panel/.env */
function resolveEnvPath() {
  if (process.env.ENV_PATH) return process.env.ENV_PATH;
  const central = '/root/data/.env';
  if (fs.existsSync(central)) return central;
  const repoRoot = path.join(__dirname, '..', '.env');
  if (fs.existsSync(repoRoot)) return repoRoot;
  return path.join(__dirname, '.env');
}

const _envFile = resolveEnvPath();
dotenv.config({ path: _envFile, override: true });

/** .env / kopyala-yapıştır kaynaklı BOM ve zero-width karakterleri temizler */
function normalizeSecret(v) {
  if (v == null || v === '') return '';
  return String(v)
    .replace(/^\uFEFF/, '')
    .replace(/[\u200B-\u200D\uFEFF]/g, '')
    .trim();
}

function sha256Utf8(s) {
  return crypto.createHash('sha256').update(String(s), 'utf8').digest();
}

/** Zamanlama saldırılarına karşı güvenli karşılaştırma (uzunluk sabit: 32 bayt) */
function safeCredentialEq(provided, expected) {
  if (expected == null || expected === '') return false;
  try {
    return crypto.timingSafeEqual(sha256Utf8(provided), sha256Utf8(expected));
  } catch {
    return false;
  }
}

const isProd = process.env.NODE_ENV === 'production';
/** Birleşik .env içinde PORT backend ile çakışmasın diye ADMIN_PANEL_PORT kullanın */
const PORT = Number(process.env.ADMIN_PANEL_PORT) || 3050;
const BACKEND_URL = String(process.env.BACKEND_URL || 'http://127.0.0.1:3001')
  .trim()
  .replace(/\/+$/, '');

async function main() {
  const app = express();
  app.disable('x-powered-by');
  // Nginx TLS sonlandırma: req.secure / Secure cookie doğru çalışsın (oturum kaybolmasın)
  app.set('trust proxy', 1);
  /** Yalnızca login: global json parser proxy isteklerinde gövdeyi tüketir; POST/PUT/DELETE backend'e boş gider. */
  const jsonParser = express.json({ limit: '2mb' });

  app.use(
    session({
      name: 'wirbooks.admin.sid',
      secret: process.env.SESSION_SECRET || 'dev-secret-change-in-production',
      resave: false,
      saveUninitialized: false,
      cookie: {
        httpOnly: true,
        sameSite: 'lax',
        secure: process.env.NODE_ENV === 'production' && process.env.TRUST_SECURE_COOKIE === 'true',
        maxAge: 1000 * 60 * 60 * 12,
      },
    })
  );

  app.post('/api/auth/login', jsonParser, async (req, res) => {
    const envUser = process.env.ADMIN_USERNAME;
    const envPass = process.env.ADMIN_PASSWORD;
    const adminApiKey = normalizeSecret(process.env.ADMIN_API_KEY);

    if (!envUser || !envPass) {
      return res.status(503).json({
        success: false,
        message: 'Sunucu yapılandırması eksik: ADMIN_USERNAME ve ADMIN_PASSWORD .env içinde tanımlı olmalı.',
      });
    }
    if (!adminApiKey) {
      return res.status(503).json({
        success: false,
        message: 'Sunucu yapılandırması eksik: ADMIN_API_KEY .env içinde tanımlı olmalı (backend X-Admin-Key).',
      });
    }

    const username = req.body?.username != null ? String(req.body.username) : '';
    const password = req.body?.password != null ? String(req.body.password) : '';

    if (!username.trim() || !password) {
      return res.status(400).json({ success: false, message: 'Kullanıcı adı ve şifre gerekli' });
    }

    const userOk = safeCredentialEq(username, envUser);
    const passOk = safeCredentialEq(password, envPass);
    if (!userOk || !passOk) {
      return res.status(401).json({ success: false, message: 'Geçersiz kullanıcı adı veya şifre' });
    }

    try {
      const fetchApiKey = normalizeSecret(process.env.API_KEY);
      const r = await fetch(`${BACKEND_URL}/api/admin/stats`, {
        headers: {
          'X-Admin-Key': adminApiKey,
          ...(fetchApiKey ? { 'X-API-Key': fetchApiKey } : {}),
        },
      });
      if (r.status === 401) {
        return res.status(401).json({
          success: false,
          message: 'ADMIN_API_KEY backend tarafından reddedildi; anahtarı ve BACKEND_URL değerini kontrol edin.',
        });
      }
      if (!r.ok) {
        const t = await r.text();
        return res.status(502).json({
          success: false,
          message: `Backend yanıtı: ${r.status}`,
          detail: t.slice(0, 400),
        });
      }
      req.session.adminKey = adminApiKey;
      req.session.authenticated = true;
      return res.json({ success: true });
    } catch (e) {
      return res.status(502).json({
        success: false,
        message: "Backend'e bağlanılamadı. BACKEND_URL ve API sunucusunu kontrol edin.",
        detail: String(e),
      });
    }
  });

  app.post('/api/auth/logout', (req, res) => {
    req.session.destroy(() => res.json({ success: true }));
  });

  app.get('/api/auth/me', (req, res) => {
    res.json({ authenticated: Boolean(req.session.authenticated && req.session.adminKey) });
  });

  function requireSession(req, res, next) {
    if (!req.session?.authenticated || !req.session?.adminKey) {
      return res.status(401).json({ success: false, message: 'Oturum gerekli' });
    }
    next();
  }

  app.use(
    '/api/backend',
    requireSession,
    createProxyMiddleware({
      target: BACKEND_URL,
      changeOrigin: true,
      pathRewrite: { '^/api/backend': '' },
      proxyTimeout: 600_000,
      // http-proxy-middleware v3: sadece options.on.proxyReq dinlenir; üst seviye onProxyReq yok sayılır.
      on: {
        proxyReq(proxyReq, req) {
          // Admin paneli host'unu iletme: /api/upload yanıtındaki dosya URL'leri yanlış
          // olur (dosya API'de, link admin.wirbooks.../uploads olur ve 404 verir).
          // Kökeni BACKEND_PUBLIC_URL veya BACKEND_URL'den türet.
          const originRaw = String(process.env.BACKEND_PUBLIC_URL || BACKEND_URL || '')
            .trim()
            .replace(/\/+$/, '');
          if (originRaw) {
            try {
              const u = new URL(originRaw.includes('://') ? originRaw : `http://${originRaw}`);
              proxyReq.setHeader('X-Forwarded-Host', u.host);
              proxyReq.setHeader('X-Forwarded-Proto', u.protocol === 'https:' ? 'https' : 'http');
            } catch {
              /* yoksay */
            }
          }
          const apiKey = normalizeSecret(process.env.API_KEY);
          if (apiKey) {
            proxyReq.setHeader('X-API-Key', apiKey);
          }
          const pathForAdmin = (req.originalUrl || req.url || '').split('?')[0];
          if (pathForAdmin.includes('/api/admin')) {
            const adminKey = normalizeSecret(req.session?.adminKey);
            if (adminKey) {
              proxyReq.setHeader('X-Admin-Key', adminKey);
            }
          }
        },
      },
    })
  );

  const server = http.createServer(app);

  if (!isProd) {
    const vite = await createViteServer({
      server: {
        middlewareMode: true,
        hmr: { server },
        allowedHosts: ['admin.wirbooks.com.tr'],
      },
      appType: 'custom',
      root: __dirname,
    });
    app.use(vite.middlewares);
    app.get(/^(?!\/api\/).*/, async (req, res, next) => {
      try {
        const template = fs.readFileSync(path.resolve(__dirname, 'index.html'), 'utf-8');
        const html = await vite.transformIndexHtml(req.originalUrl, template);
        res.status(200).set({ 'Content-Type': 'text/html' }).end(html);
      } catch (e) {
        vite.ssrFixStacktrace(e);
        next(e);
      }
    });
  } else {
    const dist = path.resolve(__dirname, 'dist');
    app.use(express.static(dist, { index: false }));
    app.get(/^(?!\/api\/).*/, (req, res, next) => {
      if (req.method !== 'GET') return next();
      res.sendFile(path.join(dist, 'index.html'), (err) => {
        if (err) next(err);
      });
    });
  }

  server.listen(PORT, () => {
    // eslint-disable-next-line no-console
    console.log(`[wirbooks-admin] ${isProd ? 'production' : 'dev'} → http://127.0.0.1:${PORT}`);
    // eslint-disable-next-line no-console
    console.log(`[wirbooks-admin] env file → ${_envFile}`);
    // eslint-disable-next-line no-console
    console.log(`[wirbooks-admin] backend proxy → ${BACKEND_URL}`);
  });
}

main().catch((e) => {
  // eslint-disable-next-line no-console
  console.error(e);
  process.exit(1);
});
