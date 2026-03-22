const path = require('path');
const fs = require('fs');
const pool = require('../db/pool');
const { logger } = require('../utils/logger');

const uploadsRoot = path.join(__dirname, '../../uploads');

function ensureDir(dir) {
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
}

function isUuid(id) {
  return /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(String(id || '').trim());
}

/** Dosya sistemi için güvenli klasör adı; kitap başlığını korur (Türkçe dahil). */
function safeBookDirName(title) {
  let s = String(title ?? 'kitap').trim() || 'kitap';
  s = s
    .replace(/[<>:"\\/|?*\x00-\x1f]/g, '_')
    .replace(/\s+/g, '_')
    .replace(/_+/g, '_')
    .replace(/^_+|_+$/g, '');
  if (s.length > 80) s = s.slice(0, 80);
  return s || 'kitap';
}

/**
 * POST /api/upload?book_id=... ile gelen ses dosyalarını
 * uploads/books/<baslik>__<id8>/audio/ altına yönlendirir.
 * book_id yoksa veya kitap bulunamazsa req.wirbooksBookAudioDir atanmaz (varsayılan audio/).
 */
async function resolveBookAudioUpload(req, res, next) {
  req.wirbooksBookAudioDir = null;
  const bookId = req.query.book_id != null ? String(req.query.book_id).trim() : '';
  if (!bookId) return next();
  if (!isUuid(bookId)) {
    logger.warn('upload.book_id.invalid', { requestId: req.requestId, bookId: bookId.slice(0, 12) });
    return next();
  }

  try {
    const [rows] = await pool.query('SELECT title FROM books WHERE id = ? LIMIT 1', [bookId]);
    if (!rows.length) {
      logger.warn('upload.book_id.not_found', { requestId: req.requestId, bookId });
      return next();
    }
    const slug = safeBookDirName(rows[0].title);
    const shortId = bookId.replace(/-/g, '').slice(0, 8);
    const relDir = path.join('books', `${slug}__${shortId}`, 'audio');
    const absDir = path.join(uploadsRoot, relDir);
    ensureDir(absDir);
    req.wirbooksBookAudioDir = absDir;
    logger.info('upload.book_audio.dir', { requestId: req.requestId, bookId, relDir });
    return next();
  } catch (e) {
    logger.error('upload.book_audio.resolve.err', {
      requestId: req.requestId,
      error: e.message,
      stack: e.stack,
    });
    return next(e);
  }
}

module.exports = { resolveBookAudioUpload };
