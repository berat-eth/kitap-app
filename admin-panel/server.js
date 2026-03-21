import 'dotenv/config';
import http from 'http';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import express from 'express';
import session from 'express-session';
import { createProxyMiddleware } from 'http-proxy-middleware';
import { createServer as createViteServer } from 'vite';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const isProd = process.env.NODE_ENV === 'production';
const PORT = Number(process.env.PORT) || 3050;
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
    const adminKey = req.body?.adminKey != null ? String(req.body.adminKey).trim() : '';
    if (!adminKey) {
      return res.status(400).json({ success: false, message: 'Admin anahtarı gerekli' });
    }
    try {
      const r = await fetch(`${BACKEND_URL}/api/admin/stats`, {
        headers: { 'X-Admin-Key': adminKey },
      });
      if (r.status === 401) {
        return res.status(401).json({ success: false, message: 'Geçersiz admin anahtarı' });
      }
      if (!r.ok) {
        const t = await r.text();
        return res.status(502).json({
          success: false,
          message: `Backend yanıtı: ${r.status}`,
          detail: t.slice(0, 400),
        });
      }
      req.session.adminKey = adminKey;
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
    console.log(`[wirbooks-admin] backend proxy → ${BACKEND_URL}`);
  });
}

main().catch((e) => {
  // eslint-disable-next-line no-console
  console.error(e);
  process.exit(1);
});
