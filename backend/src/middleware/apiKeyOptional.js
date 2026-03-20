const { error } = require('../utils/response');

function apiKeyOptional(req, res, next) {
  const expected = process.env.API_KEY;
  if (!expected) return next();

  const provided = req.headers['x-api-key'];
  if (!provided || provided !== expected) {
    return error(res, 'API key geçersiz', 401);
  }
  return next();
}

module.exports = { apiKeyOptional };

