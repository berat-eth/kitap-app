const pool = require('../db/pool');
const { success, error } = require('../utils/response');
const { v4: uuidv4 } = require('uuid');
const { logger } = require('../utils/logger');

async function register(req, res) {
  try {
    const { deviceName, platform } = req.body || {};
    if (!platform) return error(res, 'platform gerekli', 400);

    // Client bazı yerlerde platform'u 'Web'/'iOS'/'Android' gibi gönderiyor.
    const platformNorm = String(platform).toLowerCase();
    const normalized =
      platformNorm.includes('ios') ? 'ios' :
      platformNorm.includes('android') ? 'android' :
      'web';

    const deviceId = uuidv4();

    await pool.query(
      `INSERT INTO device_tokens (id, device_name, platform) VALUES (?, ?, ?)`,
      [deviceId, deviceName || null, normalized]
    );

    return success(res, { id: deviceId }, 201);
  } catch (e) {
    logger.error('device.register.err', { requestId: req.requestId, error: e.message, stack: e.stack });
    return error(res, e.message || 'Cihaz kaydı başarısız', 500);
  }
}

async function getFavorites(req, res) {
  try {
    const deviceId = req.deviceId;
    const [rows] = await pool.query(
      `SELECT book_id FROM device_favorites WHERE device_id = ? ORDER BY created_at DESC`,
      [deviceId]
    );
    return success(res, rows.map((r) => ({ book_id: r.book_id })));
  } catch (e) {
    logger.error('device.getFavorites.err', { requestId: req.requestId, error: e.message, stack: e.stack });
    return error(res, e.message || 'Favoriler alınamadı', 500);
  }
}

async function addFavorite(req, res) {
  try {
    const deviceId = req.deviceId;
    const { bookId } = req.params;

    await pool.query(
      `INSERT IGNORE INTO device_favorites (id, device_id, book_id) VALUES (?, ?, ?)`,
      [uuidv4(), deviceId, bookId]
    );
    return success(res, { message: 'Favori eklendi' });
  } catch (e) {
    logger.error('device.addFavorite.err', { requestId: req.requestId, error: e.message, stack: e.stack });
    return error(res, e.message || 'Favori eklenemedi', 500);
  }
}

async function removeFavorite(req, res) {
  try {
    const deviceId = req.deviceId;
    const { bookId } = req.params;

    await pool.query(
      `DELETE FROM device_favorites WHERE device_id = ? AND book_id = ?`,
      [deviceId, bookId]
    );
    return success(res, { message: 'Favori silindi' });
  } catch (e) {
    logger.error('device.removeFavorite.err', { requestId: req.requestId, error: e.message, stack: e.stack });
    return error(res, e.message || 'Favori silinemedi', 500);
  }
}

async function getProgress(req, res) {
  try {
    const deviceId = req.deviceId;
    const { bookId } = req.params;

    const [rows] = await pool.query(
      `SELECT chapter_id, position_seconds FROM listening_progress WHERE device_id = ? AND book_id = ? LIMIT 1`,
      [deviceId, bookId]
    );
    if (!rows.length) return success(res, null);
    return success(res, { chapterId: rows[0].chapter_id, currentTime: rows[0].position_seconds });
  } catch (e) {
    logger.error('device.getProgress.err', { requestId: req.requestId, error: e.message, stack: e.stack });
    return error(res, e.message || 'İlerleme alınamadı', 500);
  }
}

async function saveProgress(req, res) {
  try {
    const deviceId = req.deviceId;
    const { bookId } = req.params;
    const { chapterId, currentTime, isCompleted } = req.body || {};

    if (!chapterId) return error(res, 'chapterId gerekli', 400);
    if (currentTime == null) return error(res, 'currentTime gerekli', 400);

    // isCompleted kullanımı: burada sadece ilerleme kaydı tutuyoruz
    await pool.query(
      `
      INSERT INTO listening_progress (id, device_id, book_id, chapter_id, position_seconds)
      VALUES (?, ?, ?, ?, ?)
      ON DUPLICATE KEY UPDATE
        chapter_id = VALUES(chapter_id),
        position_seconds = VALUES(position_seconds)
      `,
      [uuidv4(), deviceId, bookId, chapterId, Number(currentTime) || 0]
    );

    return success(res, { message: isCompleted ? 'Tamamlandı' : 'İlerleme kaydedildi' });
  } catch (e) {
    logger.error('device.saveProgress.err', { requestId: req.requestId, error: e.message, stack: e.stack });
    return error(res, e.message || 'İlerleme kaydedilemedi', 500);
  }
}

module.exports = {
  register,
  getFavorites,
  addFavorite,
  removeFavorite,
  getProgress,
  saveProgress,
};

