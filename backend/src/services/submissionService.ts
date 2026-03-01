import pool from '../config/database';
import { RowDataPacket, ResultSetHeader } from 'mysql2';
import { v4 as uuidv4 } from 'uuid';

type SqlParam = string | number | boolean | null | Buffer | Date;

export interface CreateSubmissionInput {
  device_id: string;
  title: string;
  author: string;
  narrator: string;
  description?: string;
  category: string;
  cover_image?: string;
  chapters: { title: string; order_num: number; audio_url: string }[];
}

export interface BookSubmission {
  id: string;
  device_id: string;
  title: string;
  author: string;
  narrator: string;
  description: string | null;
  category: string;
  cover_image: string | null;
  status: 'pending' | 'approved' | 'rejected';
  admin_note: string | null;
  created_at: Date;
  updated_at: Date;
}

export async function createSubmission(data: CreateSubmissionInput): Promise<BookSubmission> {
  const id = uuidv4();

  await pool.execute<ResultSetHeader>(
    `INSERT INTO book_submissions (id, device_id, title, author, narrator, description, category, cover_image, status)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, 'pending')`,
    [
      id,
      data.device_id,
      data.title,
      data.author,
      data.narrator,
      data.description ?? null,
      data.category,
      data.cover_image ?? null,
    ] as SqlParam[],
  );

  for (let i = 0; i < data.chapters.length; i++) {
    const ch = data.chapters[i];
    await pool.execute<ResultSetHeader>(
      `INSERT INTO book_submission_chapters (id, submission_id, title, order_num, audio_url, duration)
       VALUES (?, ?, ?, ?, ?, 0)`,
      [uuidv4(), id, ch.title, ch.order_num ?? i + 1, ch.audio_url] as SqlParam[],
    );
  }

  const [rows] = await pool.execute<RowDataPacket[]>(
    'SELECT * FROM book_submissions WHERE id = ?',
    [id],
  );
  return rows[0] as BookSubmission;
}

export async function getSubmissionsByDevice(deviceId: string): Promise<BookSubmission[]> {
  const [rows] = await pool.execute<RowDataPacket[]>(
    'SELECT * FROM book_submissions WHERE device_id = ? ORDER BY created_at DESC',
    [deviceId],
  );
  return rows as BookSubmission[];
}

export async function getAllSubmissions(status?: 'pending' | 'approved' | 'rejected'): Promise<BookSubmission[]> {
  let sql = 'SELECT * FROM book_submissions';
  const params: SqlParam[] = [];
  if (status) {
    sql += ' WHERE status = ?';
    params.push(status);
  }
  sql += ' ORDER BY created_at DESC';
  const [rows] = await pool.execute<RowDataPacket[]>(sql, params);
  return rows as BookSubmission[];
}

export async function updateSubmissionStatus(
  id: string,
  status: 'approved' | 'rejected',
  adminNote?: string
): Promise<BookSubmission | null> {
  await pool.execute<ResultSetHeader>(
    'UPDATE book_submissions SET status = ?, admin_note = ? WHERE id = ?',
    [status, adminNote ?? null, id] as SqlParam[],
  );
  const [rows] = await pool.execute<RowDataPacket[]>(
    'SELECT * FROM book_submissions WHERE id = ?',
    [id],
  );
  return (rows[0] as BookSubmission) ?? null;
}
