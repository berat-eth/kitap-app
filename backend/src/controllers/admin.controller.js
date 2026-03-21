const pool = require('../db/pool');
const { logger } = require('../utils/logger');
const { v4: uuidv4 } = require('uuid');

function toStatusLabel(status) {
  const s = String(status || '').toLowerCase();
  if (s === 'approved') return 'approved';
  if (s === 'rejected') return 'rejected';
  return 'pending';
}

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

function mapAdminBookRow(row) {
  return {
    id: row.id,
    title: row.title,
    author: row.author,
    narrator: row.narrator || null,
    description: row.description ?? null,
    device_id: row.device_id || null,
    category_id: row.category_id != null ? Number(row.category_id) : null,
    category_name: row.category_name ?? null,
    category_slug: row.category_slug ?? null,
    cover_url: row.cover_url ?? null,
    duration_seconds: row.duration_seconds ?? 0,
    play_count: row.play_count ?? 0,
    rating: Number(row.rating || 0),
    is_premium: Boolean(row.is_premium),
    status: toStatusLabel(row.status),
    admin_note: row.admin_note ?? null,
    is_active: Boolean(row.is_active),
    created_at: row.created_at,
    updated_at: row.updated_at,
  };
}

function mapChapterAdmin(row) {
  return {
    id: row.id,
    book_id: row.book_id,
    title: row.title,
    order_no: row.order_no,
    audio_url: row.audio_url,
    duration_seconds: row.duration_seconds ?? 0,
  };
}

async function stats(req, res) {
  try {
    const [[row]] = await pool.query(`
      SELECT
        (SELECT COUNT(*) FROM books) AS books_total,
        (SELECT COUNT(*) FROM books WHERE status = 'pending') AS books_pending,
        (SELECT COUNT(*) FROM books WHERE status = 'approved') AS books_approved,
        (SELECT COUNT(*) FROM books WHERE status = 'rejected') AS books_rejected,
        (SELECT COUNT(*) FROM device_tokens) AS devices,
        (SELECT COUNT(*) FROM categories) AS categories,
        (SELECT COUNT(*) FROM chapters) AS chapters,
        (SELECT COUNT(*) FROM device_favorites) AS favorites
    `);
    return res.status(200).json({
      success: true,
      data: {
        books_total: Number(row.books_total || 0),
        books_pending: Number(row.books_pending || 0),
        books_approved: Number(row.books_approved || 0),
        books_rejected: Number(row.books_rejected || 0),
        devices: Number(row.devices || 0),
        categories: Number(row.categories || 0),
        chapters: Number(row.chapters || 0),
        favorites: Number(row.favorites || 0),
      },
    });
  } catch (e) {
    logger.error('admin.stats.err', { requestId: req.requestId, error: e.message, stack: e.stack });
    return res.status(500).json({ success: false, error: 'stats_failed', message: e.message });
  }
}

async function listSubmissions(req, res) {
  try {
    const rawStatus = String(req.query.status || '').toLowerCase();
    const status =
      rawStatus === 'approved' || rawStatus === 'rejected' || rawStatus === 'pending' ? rawStatus : '';

    const whereSql = status ? `WHERE COALESCE(b.status, 'pending') = ?` : '';
    const params = status ? [status] : [];

    const sql = `
      SELECT
        b.id,
        COALESCE(b.device_id, '') AS device_id,
        b.title,
        b.author,
        COALESCE(b.narrator, '') AS narrator,
        b.description,
        c.name AS category,
        b.cover_url AS cover_image,
        COALESCE(b.status, 'pending') AS status,
        b.admin_note AS admin_note,
        b.created_at,
        b.updated_at
      FROM books b
      LEFT JOIN categories c ON b.category_id = c.id
      ${whereSql}
      ORDER BY b.created_at DESC
    `;

    const [rows] = await pool.query(sql, params);

    return res.status(200).json({
      success: true,
      data: rows.map((r) => ({
        id: r.id,
        device_id: r.device_id,
        title: r.title,
        author: r.author,
        narrator: r.narrator,
        description: r.description ?? null,
        category: r.category ?? '',
        cover_image: r.cover_image ?? null,
        status: toStatusLabel(r.status),
        admin_note: r.admin_note ?? null,
        created_at: r.created_at,
        updated_at: r.updated_at,
      })),
    });
  } catch (e) {
    logger.error('admin.listSubmissions.err', { requestId: req.requestId, error: e.message, stack: e.stack });
    return res.status(500).json({ success: false, error: 'Failed to fetch submissions', message: e.message });
  }
}

async function approveSubmission(req, res) {
  try {
    const { id } = req.params;
    const body = req.body || {};
    const note = body.note ? String(body.note) : '';

    const [result] = await pool.query(
      `
      UPDATE books
      SET
        is_active = 1,
        status = 'approved',
        admin_note = NULL,
        updated_at = CURRENT_TIMESTAMP
      WHERE id = ?
      `,
      [id]
    );

    const affected = result && typeof result.affectedRows === 'number' ? result.affectedRows : 0;
    if (affected === 0) {
      return res.status(404).json({ success: false, error: 'Submission not found', message: 'No rows updated' });
    }

    if (note) {
      logger.info('admin.approve.note.ignored', { requestId: req.requestId, id });
    }

    return res.status(200).json({ success: true });
  } catch (e) {
    logger.error('admin.approveSubmission.err', { requestId: req.requestId, error: e.message, stack: e.stack });
    return res.status(500).json({ success: false, error: 'Failed to approve submission', message: e.message });
  }
}

async function rejectSubmission(req, res) {
  try {
    const { id } = req.params;
    const body = req.body || {};
    const note = body.note ? String(body.note) : '';

    const [result] = await pool.query(
      `
      UPDATE books
      SET
        is_active = 0,
        status = 'rejected',
        admin_note = ?,
        updated_at = CURRENT_TIMESTAMP
      WHERE id = ?
      `,
      [note || null, id]
    );

    const affected = result && typeof result.affectedRows === 'number' ? result.affectedRows : 0;
    if (affected === 0) {
      return res.status(404).json({ success: false, error: 'Submission not found', message: 'No rows updated' });
    }

    return res.status(200).json({ success: true });
  } catch (e) {
    logger.error('admin.rejectSubmission.err', { requestId: req.requestId, error: e.message, stack: e.stack });
    return res.status(500).json({ success: false, error: 'Failed to reject submission', message: e.message });
  }
}

async function listCategoriesAdmin(req, res) {
  try {
    const [rows] = await pool.query(
      `
      SELECT c.id, c.name, c.slug, c.icon_url, c.description,
        (SELECT COUNT(*) FROM books b WHERE b.category_id = c.id) AS book_count
      FROM categories c
      ORDER BY c.name ASC
      `
    );
    return res.status(200).json({
      success: true,
      data: rows.map((r) => ({
        id: r.id,
        name: r.name,
        slug: r.slug,
        icon_url: r.icon_url ?? null,
        description: r.description ?? null,
        book_count: Number(r.book_count || 0),
      })),
    });
  } catch (e) {
    logger.error('admin.listCategories.err', { requestId: req.requestId, error: e.message, stack: e.stack });
    return res.status(500).json({ success: false, message: e.message });
  }
}

async function createCategory(req, res) {
  try {
    const body = req.body || {};
    const name = String(body.name || '').trim();
    if (!name) return res.status(400).json({ success: false, message: 'name gerekli' });

    let slug = String(body.slug || '').trim();
    if (!slug) slug = slugify(name) || uuidv4().slice(0, 8);

    const [dup] = await pool.query('SELECT id FROM categories WHERE slug = ? LIMIT 1', [slug]);
    if (dup.length) {
      slug = `${slug}-${uuidv4().slice(0, 6)}`;
    }

    const icon_url = body.icon_url != null ? String(body.icon_url).trim() || null : null;
    const description = body.description != null ? String(body.description) : null;

    const [result] = await pool.query(
      `INSERT INTO categories (name, slug, icon_url, description) VALUES (?, ?, ?, ?)`,
      [name, slug, icon_url, description]
    );
    const [rows] = await pool.query('SELECT * FROM categories WHERE id = ? LIMIT 1', [result.insertId]);
    const r = rows[0];
    return res.status(201).json({
      success: true,
      data: {
        id: r.id,
        name: r.name,
        slug: r.slug,
        icon_url: r.icon_url,
        description: r.description,
        book_count: 0,
      },
    });
  } catch (e) {
    logger.error('admin.createCategory.err', { requestId: req.requestId, error: e.message, stack: e.stack });
    return res.status(500).json({ success: false, message: e.message });
  }
}

async function updateCategory(req, res) {
  try {
    const { id } = req.params;
    const body = req.body || {};
    const [existing] = await pool.query('SELECT id FROM categories WHERE id = ? LIMIT 1', [id]);
    if (!existing.length) return res.status(404).json({ success: false, message: 'Kategori bulunamadı' });

    const updates = [];
    const params = [];
    if (body.name !== undefined) {
      updates.push('name = ?');
      params.push(String(body.name).trim());
    }
    if (body.slug !== undefined) {
      updates.push('slug = ?');
      params.push(String(body.slug).trim());
    }
    if (body.icon_url !== undefined) {
      updates.push('icon_url = ?');
      params.push(body.icon_url ? String(body.icon_url) : null);
    }
    if (body.description !== undefined) {
      updates.push('description = ?');
      params.push(body.description != null ? String(body.description) : null);
    }
    if (!updates.length) return res.status(400).json({ success: false, message: 'Güncellenecek alan yok' });

    params.push(id);
    await pool.query(`UPDATE categories SET ${updates.join(', ')} WHERE id = ?`, params);
    const [rows] = await pool.query(
      `
      SELECT c.id, c.name, c.slug, c.icon_url, c.description,
        (SELECT COUNT(*) FROM books b WHERE b.category_id = c.id) AS book_count
      FROM categories c WHERE c.id = ? LIMIT 1
      `,
      [id]
    );
    const r = rows[0];
    return res.status(200).json({
      success: true,
      data: {
        id: r.id,
        name: r.name,
        slug: r.slug,
        icon_url: r.icon_url,
        description: r.description,
        book_count: Number(r.book_count || 0),
      },
    });
  } catch (e) {
    if (e.code === 'ER_DUP_ENTRY') {
      return res.status(409).json({ success: false, message: 'Bu slug zaten kullanılıyor' });
    }
    logger.error('admin.updateCategory.err', { requestId: req.requestId, error: e.message, stack: e.stack });
    return res.status(500).json({ success: false, message: e.message });
  }
}

async function deleteCategory(req, res) {
  try {
    const { id } = req.params;
    const [result] = await pool.query('DELETE FROM categories WHERE id = ?', [id]);
    const affected = result && typeof result.affectedRows === 'number' ? result.affectedRows : 0;
    if (affected === 0) return res.status(404).json({ success: false, message: 'Kategori bulunamadı' });
    return res.status(200).json({ success: true });
  } catch (e) {
    if (e.code === 'ER_ROW_IS_REFERENCED_2' || e.errno === 1451) {
      return res.status(409).json({
        success: false,
        message: 'Bu kategoriye bağlı kitaplar var; önce kitapları başka kategoriye taşıyın veya silin.',
      });
    }
    logger.error('admin.deleteCategory.err', { requestId: req.requestId, error: e.message, stack: e.stack });
    return res.status(500).json({ success: false, message: e.message });
  }
}

async function listBooksAdmin(req, res) {
  try {
    const pageNum = req.query.page ? Math.max(parseInt(req.query.page, 10) || 1, 1) : 1;
    const pageLimit = req.query.limit ? Math.max(parseInt(req.query.limit, 10) || 20, 1) : 20;
    const offset = (pageNum - 1) * pageLimit;
    const rawStatus = String(req.query.status || '').toLowerCase();
    const status =
      rawStatus === 'approved' || rawStatus === 'rejected' || rawStatus === 'pending' ? rawStatus : '';
    const search = String(req.query.search || '').trim();

    const where = [];
    const params = [];
    if (status) {
      where.push(`COALESCE(b.status, 'pending') = ?`);
      params.push(status);
    }
    if (search) {
      where.push('(b.title LIKE ? OR b.author LIKE ?)');
      params.push(`%${search}%`, `%${search}%`);
    }
    const whereSql = where.length ? `WHERE ${where.join(' AND ')}` : '';

    const [countRows] = await pool.query(
      `SELECT COUNT(*) AS total FROM books b ${whereSql}`,
      params
    );
    const total = countRows[0]?.total ? Number(countRows[0].total) : 0;

    const sql = `
      SELECT b.*, c.name AS category_name, c.slug AS category_slug
      FROM books b
      LEFT JOIN categories c ON b.category_id = c.id
      ${whereSql}
      ORDER BY b.updated_at DESC
      LIMIT ? OFFSET ?
    `;
    const [rows] = await pool.query(sql, [...params, pageLimit, offset]);

    return res.status(200).json({
      success: true,
      data: rows.map(mapAdminBookRow),
      pagination: {
        total,
        page: pageNum,
        limit: pageLimit,
        totalPages: Math.ceil(total / pageLimit) || 1,
      },
    });
  } catch (e) {
    logger.error('admin.listBooks.err', { requestId: req.requestId, error: e.message, stack: e.stack });
    return res.status(500).json({ success: false, message: e.message });
  }
}

async function getBookAdmin(req, res) {
  try {
    const { id } = req.params;
    const [books] = await pool.query(
      `
      SELECT b.*, c.name AS category_name, c.slug AS category_slug
      FROM books b
      LEFT JOIN categories c ON b.category_id = c.id
      WHERE b.id = ?
      LIMIT 1
      `,
      [id]
    );
    if (!books.length) return res.status(404).json({ success: false, message: 'Kitap bulunamadı' });

    const [chapters] = await pool.query(
      `SELECT * FROM chapters WHERE book_id = ? ORDER BY order_no ASC`,
      [id]
    );

    return res.status(200).json({
      success: true,
      data: {
        book: mapAdminBookRow(books[0]),
        chapters: chapters.map(mapChapterAdmin),
      },
    });
  } catch (e) {
    logger.error('admin.getBook.err', { requestId: req.requestId, error: e.message, stack: e.stack });
    return res.status(500).json({ success: false, message: e.message });
  }
}

async function listChaptersAdmin(req, res) {
  try {
    const { bookId } = req.params;
    const [chapters] = await pool.query(
      `SELECT * FROM chapters WHERE book_id = ? ORDER BY order_no ASC`,
      [bookId]
    );
    return res.status(200).json({ success: true, data: chapters.map(mapChapterAdmin) });
  } catch (e) {
    logger.error('admin.listChapters.err', { requestId: req.requestId, error: e.message, stack: e.stack });
    return res.status(500).json({ success: false, message: e.message });
  }
}

const BOOK_PATCH_FIELDS = [
  'title',
  'author',
  'narrator',
  'description',
  'category_id',
  'cover_url',
  'duration_seconds',
  'play_count',
  'rating',
  'is_premium',
  'is_active',
  'status',
];

async function updateBookAdmin(req, res) {
  try {
    const { id } = req.params;
    const body = req.body || {};
    const [existing] = await pool.query('SELECT id FROM books WHERE id = ? LIMIT 1', [id]);
    if (!existing.length) return res.status(404).json({ success: false, message: 'Kitap bulunamadı' });

    const updates = [];
    const params = [];

    for (const key of BOOK_PATCH_FIELDS) {
      if (body[key] === undefined) continue;
      if (key === 'category_id') {
        updates.push('category_id = ?');
        params.push(body.category_id === null || body.category_id === '' ? null : Number(body.category_id));
        continue;
      }
      if (key === 'is_premium' || key === 'is_active') {
        updates.push(`${key} = ?`);
        params.push(body[key] ? 1 : 0);
        continue;
      }
      if (key === 'duration_seconds' || key === 'play_count') {
        updates.push(`${key} = ?`);
        params.push(Math.max(0, parseInt(body[key], 10) || 0));
        continue;
      }
      if (key === 'rating') {
        updates.push('rating = ?');
        params.push(Math.min(5, Math.max(0, Number(body[key]) || 0)));
        continue;
      }
      if (key === 'status') {
        const s = String(body.status).toLowerCase();
        if (!['pending', 'approved', 'rejected'].includes(s)) {
          return res.status(400).json({ success: false, message: 'Geçersiz status' });
        }
        updates.push('status = ?');
        params.push(s);
        continue;
      }
      updates.push(`${key} = ?`);
      params.push(body[key] != null ? String(body[key]) : null);
    }

    if (!updates.length) return res.status(400).json({ success: false, message: 'Güncellenecek alan yok' });

    params.push(id);
    await pool.query(`UPDATE books SET ${updates.join(', ')}, updated_at = CURRENT_TIMESTAMP WHERE id = ?`, params);

    const [books] = await pool.query(
      `
      SELECT b.*, c.name AS category_name, c.slug AS category_slug
      FROM books b
      LEFT JOIN categories c ON b.category_id = c.id
      WHERE b.id = ?
      LIMIT 1
      `,
      [id]
    );
    return res.status(200).json({ success: true, data: mapAdminBookRow(books[0]) });
  } catch (e) {
    logger.error('admin.updateBook.err', { requestId: req.requestId, error: e.message, stack: e.stack });
    return res.status(500).json({ success: false, message: e.message });
  }
}

async function deleteBookAdmin(req, res) {
  try {
    const { id } = req.params;
    const [result] = await pool.query('DELETE FROM books WHERE id = ?', [id]);
    const affected = result && typeof result.affectedRows === 'number' ? result.affectedRows : 0;
    if (affected === 0) return res.status(404).json({ success: false, message: 'Kitap bulunamadı' });
    return res.status(200).json({ success: true });
  } catch (e) {
    logger.error('admin.deleteBook.err', { requestId: req.requestId, error: e.message, stack: e.stack });
    return res.status(500).json({ success: false, message: e.message });
  }
}

async function createChapter(req, res) {
  try {
    const body = req.body || {};
    const book_id = String(body.book_id || '').trim();
    const title = String(body.title || '').trim();
    const audio_url = String(body.audio_url || '').trim();
    if (!book_id || !title || !audio_url) {
      return res.status(400).json({ success: false, message: 'book_id, title ve audio_url gerekli' });
    }

    const [bk] = await pool.query('SELECT id FROM books WHERE id = ? LIMIT 1', [book_id]);
    if (!bk.length) return res.status(404).json({ success: false, message: 'Kitap bulunamadı' });

    const order_no =
      body.order_no != null && body.order_no !== ''
        ? Math.max(1, parseInt(body.order_no, 10) || 1)
        : 1;
    const duration_seconds =
      body.duration_seconds != null
        ? Math.max(0, parseInt(String(body.duration_seconds), 10) || 0)
        : 0;

    const chapterId = uuidv4();
    await pool.query(
      `INSERT INTO chapters (id, book_id, title, order_no, audio_url, duration_seconds) VALUES (?, ?, ?, ?, ?, ?)`,
      [chapterId, book_id, title, order_no, audio_url, duration_seconds]
    );
    const [rows] = await pool.query('SELECT * FROM chapters WHERE id = ? LIMIT 1', [chapterId]);
    return res.status(201).json({ success: true, data: mapChapterAdmin(rows[0]) });
  } catch (e) {
    logger.error('admin.createChapter.err', { requestId: req.requestId, error: e.message, stack: e.stack });
    return res.status(500).json({ success: false, message: e.message });
  }
}

async function updateChapter(req, res) {
  try {
    const { id } = req.params;
    const body = req.body || {};
    const [existing] = await pool.query('SELECT id FROM chapters WHERE id = ? LIMIT 1', [id]);
    if (!existing.length) return res.status(404).json({ success: false, message: 'Bölüm bulunamadı' });

    const updates = [];
    const params = [];
    if (body.title !== undefined) {
      updates.push('title = ?');
      params.push(String(body.title).trim());
    }
    if (body.order_no !== undefined) {
      updates.push('order_no = ?');
      params.push(Math.max(1, parseInt(body.order_no, 10) || 1));
    }
    if (body.audio_url !== undefined) {
      updates.push('audio_url = ?');
      params.push(String(body.audio_url).trim());
    }
    if (body.duration_seconds !== undefined) {
      updates.push('duration_seconds = ?');
      params.push(Math.max(0, parseInt(body.duration_seconds, 10) || 0));
    }
    if (!updates.length) return res.status(400).json({ success: false, message: 'Güncellenecek alan yok' });

    params.push(id);
    await pool.query(`UPDATE chapters SET ${updates.join(', ')} WHERE id = ?`, params);
    const [rows] = await pool.query('SELECT * FROM chapters WHERE id = ? LIMIT 1', [id]);
    return res.status(200).json({ success: true, data: mapChapterAdmin(rows[0]) });
  } catch (e) {
    logger.error('admin.updateChapter.err', { requestId: req.requestId, error: e.message, stack: e.stack });
    return res.status(500).json({ success: false, message: e.message });
  }
}

async function deleteChapter(req, res) {
  try {
    const { id } = req.params;
    const [result] = await pool.query('DELETE FROM chapters WHERE id = ?', [id]);
    const affected = result && typeof result.affectedRows === 'number' ? result.affectedRows : 0;
    if (affected === 0) return res.status(404).json({ success: false, message: 'Bölüm bulunamadı' });
    return res.status(200).json({ success: true });
  } catch (e) {
    if (e.code === 'ER_ROW_IS_REFERENCED_2' || e.errno === 1451) {
      return res.status(409).json({
        success: false,
        message: 'Bu bölüm dinleme ilerlemesinde kullanılıyor; önce ilgili kayıtları temizleyin.',
      });
    }
    logger.error('admin.deleteChapter.err', { requestId: req.requestId, error: e.message, stack: e.stack });
    return res.status(500).json({ success: false, message: e.message });
  }
}

async function listDevices(req, res) {
  try {
    const pageNum = req.query.page ? Math.max(parseInt(req.query.page, 10) || 1, 1) : 1;
    const pageLimit = req.query.limit ? Math.max(parseInt(req.query.limit, 10) || 20, 1) : 20;
    const offset = (pageNum - 1) * pageLimit;

    const [countRows] = await pool.query(`SELECT COUNT(*) AS total FROM device_tokens`);
    const total = countRows[0]?.total ? Number(countRows[0].total) : 0;

    const [rows] = await pool.query(
      `
      SELECT
        d.id,
        d.device_name,
        d.platform,
        d.created_at,
        (SELECT COUNT(*) FROM device_favorites f WHERE f.device_id = d.id) AS favorite_count,
        (SELECT COUNT(*) FROM listening_progress p WHERE p.device_id = d.id) AS progress_count
      FROM device_tokens d
      ORDER BY d.created_at DESC
      LIMIT ? OFFSET ?
      `,
      [pageLimit, offset]
    );

    return res.status(200).json({
      success: true,
      data: rows.map((r) => ({
        id: r.id,
        device_name: r.device_name ?? null,
        platform: r.platform,
        created_at: r.created_at,
        favorite_count: Number(r.favorite_count || 0),
        progress_count: Number(r.progress_count || 0),
      })),
      pagination: {
        total,
        page: pageNum,
        limit: pageLimit,
        totalPages: Math.ceil(total / pageLimit) || 1,
      },
    });
  } catch (e) {
    logger.error('admin.listDevices.err', { requestId: req.requestId, error: e.message, stack: e.stack });
    return res.status(500).json({ success: false, message: e.message });
  }
}

module.exports = {
  stats,
  listSubmissions,
  approveSubmission,
  rejectSubmission,
  listCategoriesAdmin,
  createCategory,
  updateCategory,
  deleteCategory,
  listBooksAdmin,
  getBookAdmin,
  listChaptersAdmin,
  updateBookAdmin,
  deleteBookAdmin,
  createChapter,
  updateChapter,
  deleteChapter,
  listDevices,
};
