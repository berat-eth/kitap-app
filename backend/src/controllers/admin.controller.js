const pool = require('../db/pool');
const { logger } = require('../utils/logger');

function toStatusLabel(status) {
  const s = String(status || '').toLowerCase();
  if (s === 'approved') return 'approved';
  if (s === 'rejected') return 'rejected';
  return 'pending';
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

    // mysql2: result is an OkPacket
    const affected = result && typeof result.affectedRows === 'number' ? result.affectedRows : 0;
    if (affected === 0) {
      return res.status(404).json({ success: false, error: 'Submission not found', message: 'No rows updated' });
    }

    // note şu an sadece log amaçlı saklanmıyor; istenirse admin_note'ye de yazılabilir.
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

module.exports = {
  listSubmissions,
  approveSubmission,
  rejectSubmission,
};

