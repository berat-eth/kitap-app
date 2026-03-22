const { error } = require('../utils/response');
const { normalizeSecret } = require('../utils/normalizeSecret');

function apiKeyOptional(req, res, next) {
  // /api/admin/* zaten X-Admin-Key + ADMIN_API_KEY ile korunur; burada X-API-Key
  // istenmez. Aksi halde admin paneli login isteği 401 alır (API_KEY üretimde doluysa).
  const p = req.path || '';
  if (p === '/admin' || p.startsWith('/admin/')) return next();
  const orig = (req.originalUrl || req.url || '').split('?')[0];
  if (/\/api\/admin(?:\/|$)/.test(orig)) return next();

  const exp = normalizeSecret(process.env.API_KEY);
  if (!exp) return next();

  const provided = req.headers['x-api-key'];
  const prov = normalizeSecret(provided);
  if (!prov || prov !== exp) {
    return error(res, 'API key geçersiz', 401);
  }
  return next();
}

module.exports = { apiKeyOptional };

