const { error } = require('../utils/response');

function adminAuth(req, res, next) {
  const expectedRaw = process.env.ADMIN_API_KEY;
  const expected = expectedRaw != null ? String(expectedRaw).trim() : '';
  const providedRaw = req.headers['x-admin-key'];
  const provided = providedRaw != null ? String(providedRaw).trim() : '';

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

