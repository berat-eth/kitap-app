const pool = require('../db/pool');
const { success, error } = require('../utils/response');
const { logger } = require('../utils/logger');

function mapCategoryRow(row) {
  return {
    id: row.id,
    name: row.name,
    slug: row.slug,
    icon: row.icon_url,
    description: row.description || undefined,
    book_count: undefined,
  };
}

async function list(req, res) {
  try {
    const [rows] = await pool.query(
      `SELECT id, name, slug, icon_url, description FROM categories ORDER BY name ASC`
    );
    return success(res, rows.map(mapCategoryRow));
  } catch (e) {
    logger.error('categories.list.err', { requestId: req.requestId, error: e.message, stack: e.stack });
    return error(res, e.message || 'Kategoriler alınamadı', 500);
  }
}

async function listBooksBySlug(req, res) {
  try {
    const { slug } = req.params;
    const [rows] = await pool.query(
      `
      SELECT
        b.*,
        c.id AS category_id,
        c.name AS category_name,
        c.slug AS category_slug
      FROM books b
      INNER JOIN categories c ON b.category_id = c.id
      WHERE c.slug = ? AND b.is_active = 1
      ORDER BY b.created_at DESC
      `,
      [slug]
    );

    const books = rows.map((row) => ({
      id: row.id,
      title: row.title,
      author: row.author,
      description: row.description || undefined,
      cover_image: row.cover_url || null,
      duration: row.duration_seconds || 0,
      rating: Number(row.rating || 0),
      play_count: row.play_count ?? 0,
      category: {
        id: String(row.category_id),
        name: row.category_name,
        slug: row.category_slug,
      },
    }));

    return success(res, { books });
  } catch (e) {
    logger.error('categories.listBooksBySlug.err', { requestId: req.requestId, error: e.message, stack: e.stack });
    return error(res, e.message || 'Kategori kitapları alınamadı', 500);
  }
}

module.exports = { list, listBooksBySlug };

