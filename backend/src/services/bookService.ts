import pool from '../config/database';
import { Book, BooksQuery } from '../types';
import { RowDataPacket, ResultSetHeader } from 'mysql2';

type SqlParam = string | number | boolean | null | Buffer | Date;

const BOOK_SELECT = `
  SELECT b.*,
         c.name  AS category_name,
         c.slug  AS category_slug,
         c.icon  AS category_icon
  FROM books b
  LEFT JOIN categories c ON c.id = b.category_id
`;

function mapBook(row: RowDataPacket): Book {
  return {
    ...row,
    is_featured: Boolean(row.is_featured),
    is_popular: Boolean(row.is_popular),
    category: row.category_name
      ? { id: row.category_id, name: row.category_name, slug: row.category_slug, icon: row.category_icon }
      : undefined,
  } as Book;
}

export async function getBooks(query: BooksQuery): Promise<{ books: Book[]; total: number }> {
  const page = Math.max(1, query.page ?? 1);
  const limit = Math.min(50, Math.max(1, query.limit ?? 20));
  const offset = (page - 1) * limit;

  const conditions: string[] = [];
  const params: SqlParam[] = [];

  if (query.category) {
    conditions.push('c.slug = ?');
    params.push(query.category);
  }

  if (query.search) {
    conditions.push('MATCH(b.title, b.author, b.description) AGAINST(? IN BOOLEAN MODE)');
    params.push(`${query.search}*`);
  }

  const where = conditions.length ? `WHERE ${conditions.join(' AND ')}` : '';

  const [countRows] = await pool.execute<RowDataPacket[]>(
    `SELECT COUNT(*) AS total FROM books b LEFT JOIN categories c ON c.id = b.category_id ${where}`,
    params,
  );
  const total = (countRows[0] as { total: number }).total;

  const [rows] = await pool.execute<RowDataPacket[]>(
    `${BOOK_SELECT} ${where} ORDER BY b.created_at DESC LIMIT ? OFFSET ?`,
    [...params, limit, offset] as SqlParam[],
  );

  return { books: rows.map(mapBook), total };
}

export async function getFeaturedBooks(): Promise<Book[]> {
  const [rows] = await pool.execute<RowDataPacket[]>(
    `${BOOK_SELECT} WHERE b.is_featured = 1 ORDER BY b.play_count DESC LIMIT 10`,
  );
  return rows.map(mapBook);
}

export async function getPopularBooks(): Promise<Book[]> {
  const [rows] = await pool.execute<RowDataPacket[]>(
    `${BOOK_SELECT} WHERE b.is_popular = 1 ORDER BY b.play_count DESC LIMIT 20`,
  );
  return rows.map(mapBook);
}

export async function searchBooks(q: string): Promise<Book[]> {
  const [rows] = await pool.execute<RowDataPacket[]>(
    `${BOOK_SELECT}
     WHERE MATCH(b.title, b.author, b.description) AGAINST(? IN BOOLEAN MODE)
     ORDER BY b.play_count DESC
     LIMIT 30`,
    [`${q}*`],
  );
  return rows.map(mapBook);
}

export async function getBookById(id: string): Promise<Book | null> {
  const [rows] = await pool.execute<RowDataPacket[]>(
    `${BOOK_SELECT} WHERE b.id = ? LIMIT 1`,
    [id],
  );
  if (!rows[0]) return null;
  return mapBook(rows[0]);
}

export async function incrementPlayCount(id: string): Promise<void> {
  await pool.execute('UPDATE books SET play_count = play_count + 1 WHERE id = ?', [id]);
}

export async function createBook(data: Partial<Book>): Promise<Book> {
  const insertParams: SqlParam[] = [
    data.title ?? '',
    data.author ?? '',
    data.narrator ?? null,
    data.description ?? null,
    data.cover_image ?? null,
    data.category_id ?? null,
    data.duration ?? 0,
    data.rating ?? 0,
    data.is_featured ? 1 : 0,
    data.is_popular ? 1 : 0,
  ];
  await pool.execute<ResultSetHeader>(
    `INSERT INTO books (title, author, narrator, description, cover_image, category_id, duration, rating, is_featured, is_popular)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    insertParams,
  );
  const [rows] = await pool.execute<RowDataPacket[]>(`${BOOK_SELECT} WHERE b.id = LAST_INSERT_ID() LIMIT 1`);
  return mapBook(rows[0]);
}

export async function updateBook(id: string, data: Partial<Book>): Promise<Book | null> {
  const fields: string[] = [];
  const params: SqlParam[] = [];

  const allowed: (keyof Book)[] = [
    'title', 'author', 'narrator', 'description', 'cover_image',
    'category_id', 'duration', 'rating', 'is_featured', 'is_popular',
  ];

  for (const key of allowed) {
    if (data[key] !== undefined) {
      fields.push(`${key} = ?`);
      if (key === 'is_featured' || key === 'is_popular') {
        params.push(data[key] ? 1 : 0);
      } else {
        params.push(data[key] as SqlParam);
      }
    }
  }

  if (!fields.length) return getBookById(id);

  params.push(id);
  await pool.execute(`UPDATE books SET ${fields.join(', ')} WHERE id = ?`, params);
  return getBookById(id);
}

export async function deleteBook(id: string): Promise<boolean> {
  const [result] = await pool.execute<ResultSetHeader>('DELETE FROM books WHERE id = ?', [id]);
  return result.affectedRows > 0;
}

export async function getAdminStats(): Promise<{
  totalBooks: number;
  totalDevices: number;
  totalPlayCount: number;
  totalCategories: number;
}> {
  const [[books], [devices], [plays], [cats]] = await Promise.all([
    pool.execute<RowDataPacket[]>('SELECT COUNT(*) AS cnt FROM books'),
    pool.execute<RowDataPacket[]>('SELECT COUNT(*) AS cnt FROM devices'),
    pool.execute<RowDataPacket[]>('SELECT COALESCE(SUM(play_count), 0) AS cnt FROM books'),
    pool.execute<RowDataPacket[]>('SELECT COUNT(*) AS cnt FROM categories'),
  ]);

  return {
    totalBooks: (books[0] as { cnt: number }).cnt,
    totalDevices: (devices[0] as { cnt: number }).cnt,
    totalPlayCount: (plays[0] as { cnt: number }).cnt,
    totalCategories: (cats[0] as { cnt: number }).cnt,
  };
}
