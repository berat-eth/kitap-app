import { Response } from 'express';
import { RowDataPacket } from 'mysql2';
import { AuthenticatedRequest, Book, BookFilters, PaginationParams } from '../types';
import { getPool } from '../config/database';
import { successResponse, errorResponse, paginatedResponse, getOffset } from '../utils/helpers';
import { paginationSchema, categoryFilterSchema } from '../utils/validators';

interface BookRow extends Book, RowDataPacket {}
interface BookWithCategoryRow extends Book, RowDataPacket {
  category_name: string;
  category_slug: string;
  chapter_count: number;
}
interface CountRow extends RowDataPacket {
  total: number;
}

export class BooksController {
  static async getAll(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      const { page = 1, limit = 20, category, search, featured, published } = req.query;

      const pool = getPool();
      let query = `
        SELECT 
          b.*,
          c.name as category_name,
          c.slug as category_slug,
          COUNT(ch.id) as chapter_count
        FROM books b
        LEFT JOIN categories c ON b.category_id = c.id
        LEFT JOIN chapters ch ON b.id = ch.book_id
        WHERE 1=1
      `;
      const params: unknown[] = [];

      if (category) {
        query += ' AND c.slug = ?';
        params.push(category);
      }

      if (search) {
        query += ' AND (b.title LIKE ? OR b.author LIKE ? OR b.description LIKE ?)';
        const searchTerm = `%${search}%`;
        params.push(searchTerm, searchTerm, searchTerm);
      }

      if (featured !== undefined) {
        query += ' AND b.is_featured = ?';
        params.push(featured === 'true' ? 1 : 0);
      }

      if (published !== undefined) {
        query += ' AND b.is_published = ?';
        params.push(published === 'true' ? 1 : 0);
      }

      query += ' GROUP BY b.id ORDER BY b.created_at DESC';

      // Count query
      let countQuery = `SELECT COUNT(DISTINCT b.id) as total FROM books b LEFT JOIN categories c ON b.category_id = c.id WHERE 1=1`;
      const countParams: unknown[] = [];

      if (category) {
        countQuery += ' AND c.slug = ?';
        countParams.push(category);
      }

      if (search) {
        countQuery += ' AND (b.title LIKE ? OR b.author LIKE ? OR b.description LIKE ?)';
        const searchTerm = `%${search}%`;
        countParams.push(searchTerm, searchTerm, searchTerm);
      }

      if (featured !== undefined) {
        countQuery += ' AND b.is_featured = ?';
        countParams.push(featured === 'true' ? 1 : 0);
      }

      if (published !== undefined) {
        countQuery += ' AND b.is_published = ?';
        countParams.push(published === 'true' ? 1 : 0);
      }

      const offset = (Number(page) - 1) * Number(limit);
      query += ` LIMIT ? OFFSET ?`;
      params.push(Number(limit), offset);

      const [books] = await pool.execute<BookWithCategoryRow[]>(query, params);
      const [countResult] = await pool.execute<CountRow[]>(countQuery, countParams);
      const total = countResult[0]?.total || 0;

      res.status(200).json(
        successResponse(books, undefined, {
          page: Number(page),
          limit: Number(limit),
          total,
          totalPages: Math.ceil(total / Number(limit)),
        })
      );
    } catch (error) {
      res.status(500).json(errorResponse('INTERNAL_ERROR', 'Failed to fetch books'));
    }
  }

  static async getById(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      const pool = getPool();

      const [books] = await pool.execute<BookRow[]>(
        'SELECT * FROM books WHERE id = ?',
        [id]
      );

      if (books.length === 0) {
        res.status(404).json(errorResponse('NOT_FOUND', 'Book not found'));
        return;
      }

      res.status(200).json(successResponse(books[0]));
    } catch (error) {
      res.status(500).json(errorResponse('INTERNAL_ERROR', 'Failed to fetch book'));
    }
  }

  static async create(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      const { title, author, description, cover_url, category_id, is_published, is_featured } =
        req.body;

      const pool = getPool();
      const [result] = await pool.execute(
        `INSERT INTO books (title, author, description, cover_url, category_id, is_published, is_featured)
         VALUES (?, ?, ?, ?, ?, ?, ?)`,
        [title, author, description, cover_url, category_id, is_published || false, is_featured || false]
      );

      const insertId = (result as any).insertId;
      const [books] = await pool.execute<BookRow[]>(
        'SELECT * FROM books WHERE id = ?',
        [insertId]
      );

      res.status(201).json(successResponse(books[0], 'Book created successfully'));
    } catch (error) {
      res.status(500).json(errorResponse('INTERNAL_ERROR', 'Failed to create book'));
    }
  }

  static async update(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      const pool = getPool();

      const [existing] = await pool.execute<BookRow[]>('SELECT * FROM books WHERE id = ?', [id]);
      if (existing.length === 0) {
        res.status(404).json(errorResponse('NOT_FOUND', 'Book not found'));
        return;
      }

      const updates: string[] = [];
      const values: unknown[] = [];

      const allowedFields = ['title', 'author', 'description', 'cover_url', 'category_id', 'is_published', 'is_featured'];

      for (const field of allowedFields) {
        if (req.body[field] !== undefined) {
          updates.push(`${field} = ?`);
          values.push(req.body[field]);
        }
      }

      if (updates.length === 0) {
        res.status(400).json(errorResponse('VALIDATION_ERROR', 'No fields to update'));
        return;
      }

      values.push(id);
      await pool.execute(`UPDATE books SET ${updates.join(', ')}, updated_at = NOW() WHERE id = ?`, values);

      const [books] = await pool.execute<BookRow[]>('SELECT * FROM books WHERE id = ?', [id]);
      res.status(200).json(successResponse(books[0], 'Book updated successfully'));
    } catch (error) {
      res.status(500).json(errorResponse('INTERNAL_ERROR', 'Failed to update book'));
    }
  }

  static async delete(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      const pool = getPool();

      const [existing] = await pool.execute<BookRow[]>('SELECT * FROM books WHERE id = ?', [id]);
      if (existing.length === 0) {
        res.status(404).json(errorResponse('NOT_FOUND', 'Book not found'));
        return;
      }

      await pool.execute('DELETE FROM books WHERE id = ?', [id]);
      res.status(200).json(successResponse(null, 'Book deleted successfully'));
    } catch (error) {
      res.status(500).json(errorResponse('INTERNAL_ERROR', 'Failed to delete book'));
    }
  }

  static async getFeatured(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      const pool = getPool();
      const [books] = await pool.execute<BookRow[]>(
        'SELECT * FROM books WHERE is_featured = true AND is_published = true ORDER BY created_at DESC LIMIT 10'
      );

      res.status(200).json(successResponse(books));
    } catch (error) {
      res.status(500).json(errorResponse('INTERNAL_ERROR', 'Failed to fetch featured books'));
    }
  }

  static async getRecommended(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      const pool = getPool();
      const [books] = await pool.execute<BookRow[]>(
        `SELECT b.* FROM books b
         LEFT JOIN book_ratings br ON b.id = br.book_id
         WHERE b.is_published = true
         GROUP BY b.id
         ORDER BY AVG(br.rating) DESC, b.view_count DESC
         LIMIT 10`
      );

      res.status(200).json(successResponse(books));
    } catch (error) {
      res.status(500).json(errorResponse('INTERNAL_ERROR', 'Failed to fetch recommended books'));
    }
  }

  static async incrementViewCount(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      const pool = getPool();

      await pool.execute('UPDATE books SET view_count = view_count + 1 WHERE id = ?', [id]);

      res.status(200).json(successResponse(null, 'View count incremented'));
    } catch (error) {
      res.status(500).json(errorResponse('INTERNAL_ERROR', 'Failed to increment view count'));
    }
  }
}
