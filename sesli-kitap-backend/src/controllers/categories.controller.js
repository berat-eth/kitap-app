const pool = require('../config/database');
const { success, error } = require('../utils/response');

async function list(req, res) {
  try {
    const [rows] = await pool.query('SELECT * FROM categories ORDER BY name');
    return success(res, rows);
  } catch (err) {
    return error(res, err.message || 'Kategoriler alınamadı', 500);
  }
}

async function create(req, res) {
  try {
    const { name, slug, icon_url } = req.body;
    if (!name || !slug) {
      return error(res, 'Ad ve slug gerekli', 400);
    }
    const [result] = await pool.query(
      'INSERT INTO categories (name, slug, icon_url) VALUES (?, ?, ?)',
      [name, slug, icon_url || null]
    );
    const [rows] = await pool.query('SELECT * FROM categories WHERE id = ?', [result.insertId]);
    return success(res, rows[0], 201);
  } catch (err) {
    if (err.code === 'ER_DUP_ENTRY') {
      return error(res, 'Bu slug zaten kullanılıyor', 400);
    }
    return error(res, err.message || 'Kategori oluşturulamadı', 500);
  }
}

module.exports = { list, create };
