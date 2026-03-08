const { v4: uuidv4 } = require('uuid');
const pool = require('../config/database');
const { success, error } = require('../utils/response');

async function list(req, res) {
  try {
    const { search, category_id, sort } = req.query;
    let sql = `
      SELECT b.*, c.name as category_name 
      FROM books b 
      LEFT JOIN categories c ON b.category_id = c.id 
      WHERE b.is_active = 1
    `;
    const params = [];

    if (search) {
      sql += ' AND (b.title LIKE ? OR b.author LIKE ?)';
      params.push(`%${search}%`, `%${search}%`);
    }
    if (category_id) {
      sql += ' AND b.category_id = ?';
      params.push(category_id);
    }

    const sortMap = {
      newest: 'b.created_at DESC',
      popular: 'b.play_count DESC',
      rating: 'b.rating DESC',
      title: 'b.title ASC',
    };
    sql += ` ORDER BY ${sortMap[sort] || 'b.created_at DESC'}`;

    const [rows] = await pool.query(sql, params);
    return success(res, rows);
  } catch (err) {
    return error(res, err.message || 'Kitaplar alınamadı', 500);
  }
}

async function getById(req, res) {
  try {
    const { id } = req.params;
    const [books] = await pool.query(
      'SELECT b.*, c.name as category_name FROM books b LEFT JOIN categories c ON b.category_id = c.id WHERE b.id = ? AND b.is_active = 1',
      [id]
    );
    if (books.length === 0) {
      return error(res, 'Kitap bulunamadı', 404);
    }
    const [chapters] = await pool.query(
      'SELECT id, book_id, title, order_no, audio_url, duration_seconds FROM chapters WHERE book_id = ? ORDER BY order_no',
      [id]
    );
    const book = { ...books[0], chapters };
    return success(res, book);
  } catch (err) {
    return error(res, err.message || 'Kitap alınamadı', 500);
  }
}

async function create(req, res) {
  try {
    const { title, author, description, category_id, cover_url, duration_seconds, is_premium } = req.body;
    if (!title || !author) {
      return error(res, 'Başlık ve yazar gerekli', 400);
    }
    const id = uuidv4();
    await pool.query(
      `INSERT INTO books (id, title, author, description, category_id, cover_url, duration_seconds, is_premium) 
       VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        id,
        title,
        author,
        description || null,
        category_id || null,
        cover_url || null,
        duration_seconds || 0,
        is_premium ? 1 : 0,
      ]
    );
    const [rows] = await pool.query('SELECT * FROM books WHERE id = ?', [id]);
    return success(res, rows[0], 201);
  } catch (err) {
    return error(res, err.message || 'Kitap oluşturulamadı', 500);
  }
}

async function update(req, res) {
  try {
    const { id } = req.params;
    const { title, author, description, category_id, cover_url, duration_seconds, play_count, rating, is_premium, is_active } = req.body;
    const [existing] = await pool.query('SELECT id FROM books WHERE id = ?', [id]);
    if (existing.length === 0) {
      return error(res, 'Kitap bulunamadı', 404);
    }
    await pool.query(
      `UPDATE books SET 
        title = COALESCE(?, title),
        author = COALESCE(?, author),
        description = COALESCE(?, description),
        category_id = COALESCE(?, category_id),
        cover_url = COALESCE(?, cover_url),
        duration_seconds = COALESCE(?, duration_seconds),
        play_count = COALESCE(?, play_count),
        rating = COALESCE(?, rating),
        is_premium = COALESCE(?, is_premium),
        is_active = COALESCE(?, is_active)
      WHERE id = ?`,
      [
        title,
        author,
        description,
        category_id,
        cover_url,
        duration_seconds,
        play_count,
        rating,
        is_premium,
        is_active,
        id,
      ]
    );
    const [rows] = await pool.query('SELECT * FROM books WHERE id = ?', [id]);
    return success(res, rows[0]);
  } catch (err) {
    return error(res, err.message || 'Kitap güncellenemedi', 500);
  }
}

async function remove(req, res) {
  try {
    const { id } = req.params;
    const [result] = await pool.query('DELETE FROM books WHERE id = ?', [id]);
    if (result.affectedRows === 0) {
      return error(res, 'Kitap bulunamadı', 404);
    }
    return success(res, { message: 'Kitap silindi' });
  } catch (err) {
    return error(res, err.message || 'Kitap silinemedi', 500);
  }
}

module.exports = { list, getById, create, update, remove };
