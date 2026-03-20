const pool = require('../db/pool');
const { error } = require('../utils/response');

async function deviceAuth(req, res, next) {
  const deviceId = req.headers['x-device-id'];
  if (!deviceId) return error(res, 'X-Device-ID gerekli', 401);

  try {
    const [rows] = await pool.query('SELECT id FROM device_tokens WHERE id = ? LIMIT 1', [deviceId]);
    if (rows.length === 0) return error(res, 'Cihaz bulunamadı', 401);
    req.deviceId = deviceId;
    return next();
  } catch (e) {
    return next(e);
  }
}

module.exports = { deviceAuth };

