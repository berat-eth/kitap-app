const { v4: uuidv4 } = require('uuid');
const pool = require('../config/database');
const { getMessaging } = require('../config/firebase');
const { success, error } = require('../utils/response');

async function send(req, res) {
  try {
    const { title, body, type, target, target_user_id } = req.body;
    if (!title || !target) {
      return error(res, 'Başlık ve hedef gerekli', 400);
    }
    if (!['all', 'user'].includes(target)) {
      return error(res, 'Hedef all veya user olmalı', 400);
    }
    if (target === 'user' && !target_user_id) {
      return error(res, 'Belirli kullanıcı için target_user_id gerekli', 400);
    }

    let tokens = [];
    if (target === 'all') {
      const [rows] = await pool.query('SELECT token FROM device_tokens');
      tokens = rows.map((r) => r.token).filter(Boolean);
    } else {
      const [rows] = await pool.query('SELECT token FROM device_tokens WHERE user_id = ?', [target_user_id]);
      tokens = rows.map((r) => r.token).filter(Boolean);
    }

    const notificationId = uuidv4();
    await pool.query(
      'INSERT INTO notifications (id, title, body, type, target, target_user_id) VALUES (?, ?, ?, ?, ?, ?)',
      [notificationId, title, body || null, type || null, target, target === 'user' ? target_user_id : null]
    );

    const messaging = getMessaging();
    if (messaging && tokens.length > 0) {
      const message = {
        notification: { title, body: body || '' },
        data: type ? { type } : {},
        tokens,
      };
      try {
        await messaging.sendEachForMulticast(message);
      } catch (firebaseErr) {
        console.warn('Firebase send error:', firebaseErr.message);
      }
    }

    return success(res, {
      id: notificationId,
      message: 'Bildirim gönderildi',
      tokensCount: tokens.length,
    });
  } catch (err) {
    return error(res, err.message || 'Bildirim gönderilemedi', 500);
  }
}

async function list(req, res) {
  try {
    const [rows] = await pool.query(
      'SELECT * FROM notifications ORDER BY sent_at DESC LIMIT 100'
    );
    return success(res, rows);
  } catch (err) {
    return error(res, err.message || 'Bildirimler alınamadı', 500);
  }
}

module.exports = { send, list };
