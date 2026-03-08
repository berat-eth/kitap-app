const bcrypt = require('bcryptjs');
const { v4: uuidv4 } = require('uuid');
const pool = require('../config/database');
const { success, error } = require('../utils/response');

async function list(req, res) {
  try {
    const [rows] = await pool.query(
      'SELECT id, name, email, role, avatar, is_active, created_at FROM users ORDER BY created_at DESC'
    );
    return success(res, rows);
  } catch (err) {
    return error(res, err.message || 'Kullanıcılar alınamadı', 500);
  }
}

async function updateProfile(req, res) {
  try {
    const { name, avatar } = req.body;
    const userId = req.user.id;
    const updates = [];
    const params = [];
    if (name !== undefined) {
      updates.push('name = ?');
      params.push(name);
    }
    if (avatar !== undefined) {
      updates.push('avatar = ?');
      params.push(avatar);
    }
    if (updates.length === 0) {
      return error(res, 'Güncellenecek alan gerekli', 400);
    }
    params.push(userId);
    await pool.query(`UPDATE users SET ${updates.join(', ')} WHERE id = ?`, params);
    const [rows] = await pool.query(
      'SELECT id, name, email, role, avatar, is_active, created_at FROM users WHERE id = ?',
      [userId]
    );
    return success(res, rows[0]);
  } catch (err) {
    return error(res, err.message || 'Profil güncellenemedi', 500);
  }
}

async function saveDeviceToken(req, res) {
  try {
    const { token, platform } = req.body;
    const userId = req.user.id;
    if (!token || !platform) {
      return error(res, 'Token ve platform gerekli', 400);
    }
    if (!['ios', 'android'].includes(platform)) {
      return error(res, 'Platform ios veya android olmalı', 400);
    }
    const id = uuidv4();
    await pool.query(
      'INSERT INTO device_tokens (id, user_id, token, platform) VALUES (?, ?, ?, ?)',
      [id, userId, token, platform]
    );
    return success(res, { message: 'Cihaz token kaydedildi' });
  } catch (err) {
    return error(res, err.message || 'Token kaydedilemedi', 500);
  }
}

module.exports = { list, updateProfile, saveDeviceToken };
