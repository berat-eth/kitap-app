import pool from '../config/database';
import { Device, Progress, Favorite, Book } from '../types';
import { RowDataPacket, ResultSetHeader } from 'mysql2';
import { v4 as uuidv4 } from 'uuid';

// ── Device ──────────────────────────────────────────────────────────────────

export async function registerDevice(data: {
  deviceName?: string;
  platform?: string;
}): Promise<Device> {
  const id = uuidv4();
  await pool.execute<ResultSetHeader>(
    'INSERT INTO devices (id, device_name, platform) VALUES (?, ?, ?)',
    [id, data.deviceName ?? null, data.platform ?? null],
  );
  return getDeviceById(id) as Promise<Device>;
}

export async function getDeviceById(id: string): Promise<Device | null> {
  const [rows] = await pool.execute<RowDataPacket[]>(
    'SELECT * FROM devices WHERE id = ? LIMIT 1',
    [id],
  );
  return (rows[0] as Device) ?? null;
}

export async function touchDevice(id: string): Promise<void> {
  await pool.execute('UPDATE devices SET last_seen = CURRENT_TIMESTAMP WHERE id = ?', [id]);
}

export async function getAllDevices(page = 1, limit = 50): Promise<{ devices: Device[]; total: number }> {
  const offset = (page - 1) * limit;
  const [[countRow], [rows]] = await Promise.all([
    pool.execute<RowDataPacket[]>('SELECT COUNT(*) AS total FROM devices'),
    pool.execute<RowDataPacket[]>('SELECT * FROM devices ORDER BY registered_at DESC LIMIT ? OFFSET ?', [limit, offset]),
  ]);
  return {
    devices: rows as Device[],
    total: (countRow[0] as { total: number }).total,
  };
}

// ── Progress ─────────────────────────────────────────────────────────────────

export async function getProgress(deviceId: string, bookId: string): Promise<Progress | null> {
  const [rows] = await pool.execute<RowDataPacket[]>(
    'SELECT * FROM progress WHERE device_id = ? AND book_id = ? LIMIT 1',
    [deviceId, bookId],
  );
  if (!rows[0]) return null;
  return { ...rows[0], is_completed: Boolean(rows[0].is_completed) } as Progress;
}

export async function saveProgress(data: {
  deviceId: string;
  bookId: string;
  chapterId?: string;
  currentTime: number;
  isCompleted?: boolean;
}): Promise<Progress> {
  await pool.execute(
    `INSERT INTO progress (device_id, book_id, chapter_id, \`current_time\`, is_completed)
     VALUES (?, ?, ?, ?, ?)
     ON DUPLICATE KEY UPDATE
       chapter_id    = VALUES(chapter_id),
       \`current_time\` = VALUES(\`current_time\`),
       is_completed = VALUES(is_completed),
       updated_at   = CURRENT_TIMESTAMP`,
    [
      data.deviceId,
      data.bookId,
      data.chapterId ?? null,
      data.currentTime,
      data.isCompleted ? 1 : 0,
    ],
  );
  return getProgress(data.deviceId, data.bookId) as Promise<Progress>;
}

// ── Favorites ────────────────────────────────────────────────────────────────

export async function getFavorites(deviceId: string): Promise<Book[]> {
  const [rows] = await pool.execute<RowDataPacket[]>(
    `SELECT b.*, c.name AS category_name, c.slug AS category_slug
     FROM favorites f
     JOIN books b ON b.id = f.book_id
     LEFT JOIN categories c ON c.id = b.category_id
     WHERE f.device_id = ?
     ORDER BY f.created_at DESC`,
    [deviceId],
  );
  return rows.map((r) => ({
    ...r,
    is_featured: Boolean(r.is_featured),
    is_popular: Boolean(r.is_popular),
    category: r.category_name ? { id: r.category_id, name: r.category_name, slug: r.category_slug } : undefined,
  })) as Book[];
}

export async function addFavorite(deviceId: string, bookId: string): Promise<void> {
  await pool.execute(
    'INSERT IGNORE INTO favorites (device_id, book_id) VALUES (?, ?)',
    [deviceId, bookId],
  );
}

export async function removeFavorite(deviceId: string, bookId: string): Promise<boolean> {
  const [result] = await pool.execute<ResultSetHeader>(
    'DELETE FROM favorites WHERE device_id = ? AND book_id = ?',
    [deviceId, bookId],
  );
  return result.affectedRows > 0;
}
