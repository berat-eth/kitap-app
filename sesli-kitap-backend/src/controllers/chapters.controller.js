const { v4: uuidv4 } = require('uuid');
const pool = require('../config/database');
const { success, error } = require('../utils/response');

async function list(req, res) {
  try {
    const { bookId } = req.params;
    const [rows] = await pool.query(
      'SELECT id, book_id, title, order_no, audio_url, duration_seconds FROM chapters WHERE book_id = ? ORDER BY order_no',
      [bookId]
    );
    return success(res, rows);
  } catch (err) {
    return error(res, err.message || 'Bölümler alınamadı', 500);
  }
}

async function create(req, res) {
  try {
    const { bookId } = req.params;
    const { title, order_no } = req.body;
    const audioFile = req.file;
    if (!title || !audioFile) {
      return error(res, 'Başlık ve ses dosyası gerekli', 400);
    }
    const [bookCheck] = await pool.query('SELECT id FROM books WHERE id = ?', [bookId]);
    if (bookCheck.length === 0) {
      return error(res, 'Kitap bulunamadı', 404);
    }
    const audioUrl = `/uploads/audio/${audioFile.filename}`;
    const id = uuidv4();
    const orderNo = order_no != null ? parseInt(order_no, 10) : 0;
    await pool.query(
      'INSERT INTO chapters (id, book_id, title, order_no, audio_url, duration_seconds) VALUES (?, ?, ?, ?, ?, ?)',
      [id, bookId, title, orderNo, audioUrl, 0]
    );
    const [rows] = await pool.query('SELECT * FROM chapters WHERE id = ?', [id]);
    return success(res, rows[0], 201);
  } catch (err) {
    return error(res, err.message || 'Bölüm oluşturulamadı', 500);
  }
}

async function remove(req, res) {
  try {
    const { id } = req.params;
    const [result] = await pool.query('DELETE FROM chapters WHERE id = ?', [id]);
    if (result.affectedRows === 0) {
      return error(res, 'Bölüm bulunamadı', 404);
    }
    return success(res, { message: 'Bölüm silindi' });
  } catch (err) {
    return error(res, err.message || 'Bölüm silinemedi', 500);
  }
}

async function saveProgress(req, res) {
  try {
    const { id: chapterId } = req.params;
    const { position_seconds } = req.body;
    const userId = req.user.id;
    if (position_seconds == null) {
      return error(res, 'position_seconds gerekli', 400);
    }
    const [chapter] = await pool.query('SELECT book_id FROM chapters WHERE id = ?', [chapterId]);
    if (chapter.length === 0) {
      return error(res, 'Bölüm bulunamadı', 404);
    }
    const bookId = chapter[0].book_id;
    const progressId = uuidv4();
    await pool.query(
      `INSERT INTO listening_progress (id, user_id, book_id, chapter_id, position_seconds) 
       VALUES (?, ?, ?, ?, ?) 
       ON DUPLICATE KEY UPDATE chapter_id = ?, position_seconds = ?`,
      [progressId, userId, bookId, chapterId, position_seconds, chapterId, position_seconds]
    );
    return success(res, { message: 'İlerleme kaydedildi' });
  } catch (err) {
    return error(res, err.message || 'İlerleme kaydedilemedi', 500);
  }
}

module.exports = { list, create, remove, saveProgress };
