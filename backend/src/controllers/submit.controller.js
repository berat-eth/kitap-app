const pool = require('../db/pool');
const { success, error } = require('../utils/response');
const { v4: uuidv4 } = require('uuid');
const { logger } = require('../utils/logger');

function slugify(input) {
  return String(input || '')
    .trim()
    .toLowerCase()
    .replace(/ğ/g, 'g')
    .replace(/ş/g, 's')
    .replace(/ı/g, 'i')
    .replace(/ö/g, 'o')
    .replace(/ç/g, 'c')
    .replace(/ü/g, 'u')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)+/g, '');
}

async function submitBook(req, res) {
  try {
    const {
      title,
      author,
      narrator,
      description,
      category,
      cover_image,
      chapters,
    } = req.body || {};

    if (!title || !author) return error(res, 'title ve author gerekli', 400);
    if (!category) return error(res, 'category gerekli', 400);
    if (!Array.isArray(chapters) || chapters.length === 0) return error(res, 'chapters gerekli', 400);

    // category: client tarafı name veriyor gibi görünüyor.
    const categoryNameOrSlug = String(category).trim();

    let categoryRow = null;
    const [found] = await pool.query(
      `SELECT id, name, slug FROM categories WHERE name = ? OR slug = ? LIMIT 1`,
      [categoryNameOrSlug, categoryNameOrSlug]
    );
    if (found.length) categoryRow = found[0];

    if (!categoryRow) {
      const slug = slugify(categoryNameOrSlug) || uuidv4().slice(0, 8);
      const [result] = await pool.query(
        `INSERT INTO categories (name, slug, icon_url, description) VALUES (?, ?, NULL, NULL)`,
        [categoryNameOrSlug, slug]
      );
      const [rows] = await pool.query(`SELECT id, name, slug FROM categories WHERE id = ? LIMIT 1`, [result.insertId]);
      categoryRow = rows[0];
    }

    const bookId = uuidv4();

    // Pending: client admin approval bekliyor olabilir
    await pool.query(
      `
      INSERT INTO books
        (id, title, author, description, device_id, narrator, category_id, cover_url, duration_seconds, play_count, rating, is_premium, status, admin_note, is_active)
      VALUES
        (?, ?, ?, ?, ?, ?, ?, ?, 0, 0, 0, 0, 'pending', NULL, 0)
      `,
      [
        bookId,
        String(title).trim(),
        String(author).trim(),
        description ? String(description) : null,
        req.deviceId || null,
        narrator ? String(narrator) : null,
        categoryRow.id,
        cover_image ? String(cover_image) : null,
      ]
    );

    // narrator alanı DB şemasında yok; şimdilik yok sayıyoruz.
    for (let i = 0; i < chapters.length; i++) {
      const ch = chapters[i] || {};
      if (!ch.title) return error(res, 'chapter.title gerekli', 400);
      if (!ch.audio_url) return error(res, 'chapter.audio_url gerekli', 400);

      const orderNo = ch.order_num != null ? Number(ch.order_num) : i + 1;
      const chapterId = uuidv4();

      await pool.query(
        `
        INSERT INTO chapters (id, book_id, title, order_no, audio_url, duration_seconds)
        VALUES (?, ?, ?, ?, ?, 0)
        `,
        [
          chapterId,
          bookId,
          String(ch.title).trim(),
          Number.isFinite(orderNo) ? orderNo : i + 1,
          String(ch.audio_url),
        ]
      );
    }

    return success(res, { id: bookId, status: 'pending' }, 201);
  } catch (e) {
    logger.error('submit.submitBook.err', { requestId: req.requestId, error: e.message, stack: e.stack });
    return error(res, e.message || 'Kitap gönderilemedi', 500);
  }
}

module.exports = { submitBook };

