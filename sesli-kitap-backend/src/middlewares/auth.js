const { verifyToken } = require('../utils/jwt');
const { error } = require('../utils/response');

function authMiddleware(req, res, next) {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return error(res, 'Token gerekli', 401);
  }
  const token = authHeader.split(' ')[1];
  try {
    const decoded = verifyToken(token);
    req.user = decoded;
    next();
  } catch (err) {
    return error(res, 'Geçersiz veya süresi dolmuş token', 401);
  }
}

module.exports = authMiddleware;
