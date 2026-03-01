import pool from '../config/database';
import { Category } from '../types';
import { RowDataPacket, ResultSetHeader } from 'mysql2';

export async function getAllCategories(): Promise<(Category & { book_count: number })[]> {
  const [rows] = await pool.execute<RowDataPacket[]>(
    `SELECT c.*, COUNT(b.id) AS book_count
     FROM categories c
     LEFT JOIN books b ON b.category_id = c.id
     GROUP BY c.id
     ORDER BY c.name ASC`,
  );
  return rows as (Category & { book_count: number })[];
}

export async function getCategoryBySlug(slug: string): Promise<Category | null> {
  const [rows] = await pool.execute<RowDataPacket[]>(
    'SELECT * FROM categories WHERE slug = ? LIMIT 1',
    [slug],
  );
  return (rows[0] as Category) ?? null;
}

export async function createCategory(data: {
  name: string;
  slug: string;
  description?: string;
  icon?: string;
}): Promise<Category> {
  const [result] = await pool.execute<ResultSetHeader>(
    'INSERT INTO categories (name, slug, description, icon) VALUES (?, ?, ?, ?)',
    [data.name, data.slug, data.description ?? null, data.icon ?? null],
  );
  const [rows] = await pool.execute<RowDataPacket[]>(
    'SELECT * FROM categories WHERE id = LAST_INSERT_ID() LIMIT 1',
  );
  void result;
  return rows[0] as Category;
}
