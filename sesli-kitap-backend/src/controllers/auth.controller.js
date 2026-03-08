const bcrypt = require('bcryptjs');
const { v4: uuidv4 } = require('uuid');
const pool = require('../config/database');
const { generateToken, generateRefreshToken, verifyRefreshToken } = require('../utils/jwt');
const { success, error } = require('../utils/response');

async function register(req, res) {
  try {
    const { name, email, password } = req.body;
    if (!name || !email || !password) {
      return error(res, 'Ad, email ve şifre gerekli', 400);
    }
    const [existing] = await pool.query('SELECT id FROM users WHERE email = ?', [email]);
    if (existing.length > 0) {
      return error(res, 'Bu email zaten kayıtlı', 400);
    }
    const hashedPassword = await bcrypt.hash(password, 10);
    const id = uuidv4();
    await pool.query(
      'INSERT INTO users (id, name, email, password) VALUES (?, ?, ?, ?)',
      [id, name, email, hashedPassword]
    );
    const accessToken = generateToken({ id, email, role: 'user' });
    const refreshToken = generateRefreshToken({ id });
    await pool.query('UPDATE users SET refresh_token = ? WHERE id = ?', [refreshToken, id]);
    return success(res, {
      user: { id, name, email, role: 'user' },
      accessToken,
      refreshToken,
      expiresIn: process.env.JWT_EXPIRES_IN || '15m',
    }, 201);
  } catch (err) {
    return error(res, err.message || 'Kayıt hatası', 500);
  }
}

async function login(req, res) {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      return error(res, 'Email ve şifre gerekli', 400);
    }
    const [rows] = await pool.query('SELECT * FROM users WHERE email = ?', [email]);
    if (rows.length === 0) {
      return error(res, 'Geçersiz email veya şifre', 401);
    }
    const user = rows[0];
    if (!user.is_active) {
      return error(res, 'Hesap devre dışı', 403);
    }
    const valid = await bcrypt.compare(password, user.password);
    if (!valid) {
      return error(res, 'Geçersiz email veya şifre', 401);
    }
    const accessToken = generateToken({ id: user.id, email: user.email, role: user.role });
    const refreshToken = generateRefreshToken({ id: user.id });
    await pool.query('UPDATE users SET refresh_token = ? WHERE id = ?', [refreshToken, user.id]);
    const { password: _, refresh_token: __, ...userSafe } = user;
    return success(res, {
      user: userSafe,
      accessToken,
      refreshToken,
      expiresIn: process.env.JWT_EXPIRES_IN || '15m',
    });
  } catch (err) {
    return error(res, err.message || 'Giriş hatası', 500);
  }
}

async function refresh(req, res) {
  try {
    const { refreshToken } = req.body;
    if (!refreshToken) {
      return error(res, 'Refresh token gerekli', 400);
    }
    const decoded = verifyRefreshToken(refreshToken);
    const [rows] = await pool.query('SELECT id, email, role, refresh_token FROM users WHERE id = ?', [decoded.id]);
    if (rows.length === 0 || rows[0].refresh_token !== refreshToken) {
      return error(res, 'Geçersiz refresh token', 401);
    }
    const user = rows[0];
    const accessToken = generateToken({ id: user.id, email: user.email, role: user.role });
    return success(res, {
      accessToken,
      expiresIn: process.env.JWT_EXPIRES_IN || '15m',
    });
  } catch (err) {
    return error(res, 'Geçersiz veya süresi dolmuş refresh token', 401);
  }
}

async function logout(req, res) {
  try {
    const userId = req.user?.id;
    if (userId) {
      await pool.query('UPDATE users SET refresh_token = NULL WHERE id = ?', [userId]);
    }
    return success(res, { message: 'Çıkış yapıldı' });
  } catch (err) {
    return error(res, err.message || 'Çıkış hatası', 500);
  }
}

async function me(req, res) {
  try {
    const [rows] = await pool.query(
      'SELECT id, name, email, role, avatar, is_active, created_at FROM users WHERE id = ?',
      [req.user.id]
    );
    if (rows.length === 0) {
      return error(res, 'Kullanıcı bulunamadı', 404);
    }
    return success(res, rows[0]);
  } catch (err) {
    return error(res, err.message || 'Hata', 500);
  }
}

module.exports = { register, login, refresh, logout, me };
