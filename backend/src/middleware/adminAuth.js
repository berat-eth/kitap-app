const { error } = require('../utils/response');
const { normalizeSecret } = require('../utils/normalizeSecret');

function adminAuth(req, res, next) {
  const expected = normalizeSecret(process.env.ADMIN_API_KEY);
  const provided = normalizeSecret(req.headers['x-admin-key']);

  // Admin panel endpoint'leri için ADMIN_API_KEY yoksa istekleri reddet.
  if (!expected) {
    return error(res, 'Admin API key server-side not configured', 500);
  }

  if (!provided || provided !== expected) {
    return error(res, 'Admin API key geçersiz', 401);
  }

  return next();
}

module.exports = { adminAuth };

