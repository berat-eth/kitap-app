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

/** Tek .env: önce ENV_PATH, sonra /root/data/.env, yoksa admin-panel/.env */
function resolveEnvPath() {
  if (process.env.ENV_PATH) return process.env.ENV_PATH;
  const central = '/root/data/.env';
  if (fs.existsSync(central)) return central;
  return path.join(__dirname, '.env');
}

const _envFile = resolveEnvPath();
dotenv.config({ path: _envFile, override: true });

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
const BACKEND_URL = process.env.BACKEND_URL || 'http://127.0.0.1:3001';

async function main() {
  const app = express();
  app.disable('x-powered-by');
  app.use(express.json({ limit: '2mb' }));

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

  app.post('/api/auth/login', async (req, res) => {
    const envUser = process.env.ADMIN_USERNAME;
    const envPass = process.env.ADMIN_PASSWORD;
    const adminApiKey = process.env.ADMIN_API_KEY != null ? String(process.env.ADMIN_API_KEY).trim() : '';

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
      const r = await fetch(`${BACKEND_URL}/api/admin/stats`, {
        headers: { 'X-Admin-Key': adminApiKey },
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
      onProxyReq(proxyReq, req) {
        const p = proxyReq.path || '';
        if (p.startsWith('/api/admin')) {
          proxyReq.setHeader('X-Admin-Key', req.session.adminKey);
        }
      },
    })
  );

  const server = http.createServer(app);

  if (!isProd) {
    const vite = await createViteServer({
      server: {
        middlewareMode: true,
        hmr: { server },
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
