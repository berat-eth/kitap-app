const { error } = require('../utils/response');

function adminMiddleware(req, res, next) {
  if (!req.user) {
    return error(res, 'Kimlik doğrulama gerekli', 401);
  }
  if (req.user.role !== 'admin') {
    return error(res, 'Yetkisiz erişim', 403);
  }
  next();
}

module.exports = adminMiddleware;
