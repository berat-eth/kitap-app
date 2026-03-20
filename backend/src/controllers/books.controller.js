const pool = require('../db/pool');
const { success, error } = require('../utils/response');
const { logger } = require('../utils/logger');

function mapBookRow(row) {
  return {
    id: row.id,
    title: row.title,
    author: row.author,
    narrator: row.narrator || undefined,
    description: row.description || undefined,
    cover_image: row.cover_image || row.cover_url || null,
    duration: row.duration_seconds || 0,
    rating: Number(row.rating || 0),
    play_count: row.play_count ?? 0,
    category: row.category_id
      ? { id: String(row.category_id), name: row.category_name, slug: row.category_slug }
      : undefined,
  };
}

function mapChapterRow(row) {
  return {
    id: row.id,
    title: row.title,
    order_num: row.order_no,
    audio_url: row.audio_url,
    duration: row.duration_seconds || 0,
  };
}

async function getBooks(req, res) {
  try {
    const { search, category, sort, page, limit } = req.query;
    const pageNum = page ? Math.max(parseInt(page, 10) || 1, 1) : 1;
    const pageLimit = limit ? Math.max(parseInt(limit, 10) || 20, 1) : 20;
    const offset = (pageNum - 1) * pageLimit;

    const where = ['b.is_active = 1'];
    const params = [];

    if (search) {
      where.push('(b.title LIKE ? OR b.author LIKE ?)');
      params.push(`%${search}%`, `%${search}%`);
    }

    if (category) {
      const isNumeric = /^\d+$/.test(String(category));
      if (isNumeric) {
        where.push('b.category_id = ?');
        params.push(Number(category));
      } else {
        where.push('c.slug = ?');
        params.push(String(category));
      }
    }

    const sortMap = {
      newest: 'b.created_at DESC',
      popular: 'b.play_count DESC',
      rating: 'b.rating DESC',
      title: 'b.title ASC',
    };
    const orderBy = sortMap[String(sort)] || 'b.created_at DESC';

    const whereSql = where.length ? `WHERE ${where.join(' AND ')}` : '';

    const countSql = `
      SELECT COUNT(*) AS total
      FROM books b
      LEFT JOIN categories c ON b.category_id = c.id
      ${whereSql}
    `;

    const [countRows] = await pool.query(countSql, params);
    const total = countRows[0]?.total ? Number(countRows[0].total) : 0;

    const sql = `
      SELECT
        b.*,
        c.id AS category_id,
        c.name AS category_name,
        c.slug AS category_slug
      FROM books b
      LEFT JOIN categories c ON b.category_id = c.id
      ${whereSql}
      ORDER BY ${orderBy}
      LIMIT ? OFFSET ?
    `;

    const [rows] = await pool.query(sql, [...params, pageLimit, offset]);
    const books = rows.map(mapBookRow);

    return success(res, books, 200, {
      pagination: { total, page: pageNum, limit: pageLimit, totalPages: Math.ceil(total / pageLimit) || 1 },
    });
  } catch (e) {
    logger.error('books.getBooks.err', { requestId: req.requestId, error: e.message, stack: e.stack });
    return error(res, e.message || 'Kitaplar alınamadı', 500);
  }
}

async function getBookById(req, res) {
  try {
    const { id } = req.params;
    const sql = `
      SELECT
        b.*,
        c.id AS category_id,
        c.name AS category_name,
        c.slug AS category_slug
      FROM books b
      LEFT JOIN categories c ON b.category_id = c.id
      WHERE b.id = ? AND b.is_active = 1
      LIMIT 1
    `;

    const [rows] = await pool.query(sql, [id]);
    if (rows.length === 0) return error(res, 'Kitap bulunamadı', 404);

    return success(res, mapBookRow(rows[0]));
  } catch (e) {
    logger.error('books.getBookById.err', { requestId: req.requestId, error: e.message, stack: e.stack });
    return error(res, e.message || 'Kitap alınamadı', 500);
  }
}

async function getFeatured(req, res) {
  try {
    const [rows] = await pool.query(
      `
      SELECT b.*, c.id AS category_id, c.name AS category_name, c.slug AS category_slug
      FROM books b
      LEFT JOIN categories c ON b.category_id = c.id
      WHERE b.is_active = 1
      ORDER BY b.created_at DESC
      LIMIT 10
      `
    );
    return success(res, rows.map(mapBookRow));
  } catch (e) {
    logger.error('books.getFeatured.err', { requestId: req.requestId, error: e.message, stack: e.stack });
    return error(res, e.message || 'Featured alınamadı', 500);
  }
}

async function getPopular(req, res) {
  try {
    const [rows] = await pool.query(
      `
      SELECT b.*, c.id AS category_id, c.name AS category_name, c.slug AS category_slug
      FROM books b
      LEFT JOIN categories c ON b.category_id = c.id
      WHERE b.is_active = 1
      ORDER BY b.play_count DESC
      LIMIT 10
      `
    );
    return success(res, rows.map(mapBookRow));
  } catch (e) {
    logger.error('books.getPopular.err', { requestId: req.requestId, error: e.message, stack: e.stack });
    return error(res, e.message || 'Popüler alınamadı', 500);
  }
}

async function search(req, res) {
  try {
    const q = String(req.query.q || '').trim();
    if (!q) return success(res, []);
    const like = `%${q}%`;
    const [rows] = await pool.query(
      `
      SELECT b.*, c.id AS category_id, c.name AS category_name, c.slug AS category_slug
      FROM books b
      LEFT JOIN categories c ON b.category_id = c.id
      WHERE b.is_active = 1 AND (b.title LIKE ? OR b.author LIKE ?)
      ORDER BY b.created_at DESC
      LIMIT 30
      `,
      [like, like]
    );
    return success(res, rows.map(mapBookRow));
  } catch (e) {
    logger.error('books.search.err', { requestId: req.requestId, error: e.message, stack: e.stack });
    return error(res, e.message || 'Arama başarısız', 500);
  }
}

async function getChaptersByBookId(req, res) {
  try {
    const { bookId } = req.params;
    const sql = `
      SELECT id, book_id, title, order_no, audio_url, duration_seconds
      FROM chapters
      WHERE book_id = ?
      ORDER BY order_no ASC
    `;
    const [rows] = await pool.query(sql, [bookId]);
    return success(res, rows.map(mapChapterRow));
  } catch (e) {
    logger.error('books.getChaptersByBookId.err', { requestId: req.requestId, error: e.message, stack: e.stack });
    return error(res, e.message || 'Bölümler alınamadı', 500);
  }
}

async function streamChapter(req, res) {
  try {
    const { id } = req.params;
    const [rows] = await pool.query(
      `SELECT audio_url FROM chapters WHERE id = ? LIMIT 1`,
      [id]
    );
    if (rows.length === 0) return error(res, 'Bölüm bulunamadı', 404);
    return success(res, { audioUrl: rows[0].audio_url });
  } catch (e) {
    logger.error('books.streamChapter.err', { requestId: req.requestId, error: e.message, stack: e.stack });
    return error(res, e.message || 'Stream URL alınamadı', 500);
  }
}

module.exports = {
  getBooks,
  getBookById,
  getFeatured,
  getPopular,
  search,
  getChaptersByBookId,
  streamChapter,
};

