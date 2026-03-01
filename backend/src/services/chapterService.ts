import pool from '../config/database';
import { Chapter } from '../types';
import { RowDataPacket, ResultSetHeader } from 'mysql2';

export async function getChaptersByBookId(bookId: string): Promise<Chapter[]> {
  const [rows] = await pool.execute<RowDataPacket[]>(
    'SELECT * FROM chapters WHERE book_id = ? ORDER BY order_num ASC',
    [bookId],
  );
  return rows as Chapter[];
}

export async function getChapterById(id: string): Promise<Chapter | null> {
  const [rows] = await pool.execute<RowDataPacket[]>(
    'SELECT * FROM chapters WHERE id = ? LIMIT 1',
    [id],
  );
  return (rows[0] as Chapter) ?? null;
}

export async function createChapter(data: {
  book_id: string;
  title: string;
  order_num: number;
  audio_url: string;
  duration?: number;
}): Promise<Chapter> {
  await pool.execute<ResultSetHeader>(
    'INSERT INTO chapters (book_id, title, order_num, audio_url, duration) VALUES (?, ?, ?, ?, ?)',
    [data.book_id, data.title, data.order_num, data.audio_url, data.duration ?? 0],
  );
  const [rows] = await pool.execute<RowDataPacket[]>(
    'SELECT * FROM chapters WHERE id = LAST_INSERT_ID() LIMIT 1',
  );
  return rows[0] as Chapter;
}

export async function deleteChapter(id: string): Promise<boolean> {
  const [result] = await pool.execute<ResultSetHeader>('DELETE FROM chapters WHERE id = ?', [id]);
  return result.affectedRows > 0;
}
