import { Response } from 'express';
import { AuthenticatedRequest, Book, BookFilters, PaginationParams } from '../types';
import { getPool } from '../config/database';
import { successResponse, errorResponse, paginatedResponse, getOffset } from '../utils/helpers';
import { paginationSchema, categoryFilterSchema } from '../utils/validators';

export class BooksController {
  static async getAll(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      const { page = 1, limit = 20, category, search, featured, published } = req.query;
      const pool = getPool();
      const offset = getOffset(Number(page), Number(limit));

      let query = `
        SELECT b.*, c.name as category_name, c.slug as category_slug,
               COUNT(DISTINCT ch.id) as chapter_count
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

      if (featured === 'true') {
        query += ' AND b.is_featured = true';
      }

      if (published !== undefined) {
        query += published === 'true' ? ' AND b.is_published = true' : ' AND b.is_published = false';
      } else {
        // Default: only show published books for non-admin users
        if (!req.user || req.user.role !== 'admin') {
          query += ' AND b.is_published = true';
        }
      }

      query += ' GROUP BY b.id ORDER BY b.created_at DESC LIMIT ? OFFSET ?';
      params.push(Number(limit), offset);

      const [books] = await pool.execute<Array<Book & { category_name: string; category_slug: string; chapter_count: number }>>(
        query,
        params
      );

      // Get total count
      let countQuery = 'SELECT COUNT(DISTINCT b.id) as total FROM books b LEFT JOIN categories c ON b.category_id = c.id WHERE 1=1';
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

      if (featured === 'true') {
        countQuery += ' AND b.is_featured = true';
      }

      if (published !== undefined) {
        countQuery += published === 'true' ? ' AND b.is_published = true' : ' AND b.is_published = false';
      } else {
        if (!req.user || req.user.role !== 'admin') {
          countQuery += ' AND b.is_published = true';
        }
      }

      const [countResult] = await pool.execute<Array<{ total: number }>>(countQuery, countParams);
      const total = countResult[0]?.total || 0;

      res.status(200).json(
        successResponse(
          paginatedResponse(books, Number(page), Number(limit), total),
          undefined,
          {
            page: Number(page),
            limit: Number(limit),
            total,
            totalPages: Math.ceil(total / Number(limit)),
          }
        )
      );
    } catch (error) {
      res.status(500).json(errorResponse('INTERNAL_ERROR', 'Failed to fetch books'));
    }
  }

  static async getById(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      const pool = getPool();

      const [books] = await pool.execute<Array<Book>>(
        `SELECT b.*, c.name as category_name, c.slug as category_slug
         FROM books b
         LEFT JOIN categories c ON b.category_id = c.id
         WHERE b.id = ?`,
        [id]
      );

      if (books.length === 0) {
        res.status(404).json(errorResponse('NOT_FOUND', 'Book not found'));
        return;
      }

      const book = books[0];

      // Check if user can view unpublished books
      if (!book.is_published && (!req.user || req.user.role !== 'admin')) {
        res.status(404).json(errorResponse('NOT_FOUND', 'Book not found'));
        return;
      }

      res.status(200).json(successResponse(book));
    } catch (error) {
      res.status(500).json(errorResponse('INTERNAL_ERROR', 'Failed to fetch book'));
    }
  }

  static async getChapters(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      const pool = getPool();

      const [chapters] = await pool.execute(
        'SELECT * FROM chapters WHERE book_id = ? ORDER BY order_number ASC',
        [id]
      );

      res.status(200).json(successResponse(chapters));
    } catch (error) {
      res.status(500).json(errorResponse('INTERNAL_ERROR', 'Failed to fetch chapters'));
    }
  }

  static async getFeatured(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      const pool = getPool();

      const [books] = await pool.execute<Array<Book>>(
        `SELECT b.*, c.name as category_name, c.slug as category_slug
         FROM books b
         LEFT JOIN categories c ON b.category_id = c.id
         WHERE b.is_featured = true AND b.is_published = true
         ORDER BY b.rating DESC, b.total_listens DESC
         LIMIT 10`
      );

      res.status(200).json(successResponse(books));
    } catch (error) {
      res.status(500).json(errorResponse('INTERNAL_ERROR', 'Failed to fetch featured books'));
    }
  }

  static async getPopular(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      const pool = getPool();

      const [books] = await pool.execute<Array<Book>>(
        `SELECT b.*, c.name as category_name, c.slug as category_slug
         FROM books b
         LEFT JOIN categories c ON b.category_id = c.id
         WHERE b.is_published = true
         ORDER BY b.total_listens DESC, b.rating DESC
         LIMIT 20`
      );

      res.status(200).json(successResponse(books));
    } catch (error) {
      res.status(500).json(errorResponse('INTERNAL_ERROR', 'Failed to fetch popular books'));
    }
  }

  static async search(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      const { q } = req.query;
      const pool = getPool();

      if (!q || typeof q !== 'string') {
        res.status(400).json(errorResponse('VALIDATION_ERROR', 'Search query is required'));
        return;
      }

      const searchTerm = `%${q}%`;
      const [books] = await pool.execute<Array<Book>>(
        `SELECT b.*, c.name as category_name, c.slug as category_slug
         FROM books b
         LEFT JOIN categories c ON b.category_id = c.id
         WHERE b.is_published = true
         AND (b.title LIKE ? OR b.author LIKE ? OR b.description LIKE ?)
         ORDER BY b.rating DESC
         LIMIT 50`,
        [searchTerm, searchTerm, searchTerm]
      );

      res.status(200).json(successResponse(books));
    } catch (error) {
      res.status(500).json(errorResponse('INTERNAL_ERROR', 'Failed to search books'));
    }
  }

  static async getByCategory(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      const { slug } = req.params;
      const pool = getPool();

      const [books] = await pool.execute<Array<Book>>(
        `SELECT b.*, c.name as category_name, c.slug as category_slug
         FROM books b
         LEFT JOIN categories c ON b.category_id = c.id
         WHERE c.slug = ? AND b.is_published = true
         ORDER BY b.created_at DESC`,
        [slug]
      );

      res.status(200).json(successResponse(books));
    } catch (error) {
      res.status(500).json(errorResponse('INTERNAL_ERROR', 'Failed to fetch books by category'));
    }
  }

  static async create(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      if (!req.user || req.user.role !== 'admin') {
        res.status(403).json(errorResponse('FORBIDDEN', 'Admin access required'));
        return;
      }

      const pool = getPool();
      const {
        title,
        author,
        narrator,
        description,
        cover_image_url,
        category_id,
        duration_seconds = 0,
        is_featured = false,
        is_published = false,
      } = req.body;

      const [result] = await pool.execute(
        `INSERT INTO books (title, author, narrator, description, cover_image_url, category_id, 
         duration_seconds, is_featured, is_published, created_by, published_at)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [
          title,
          author,
          narrator || null,
          description || null,
          cover_image_url || null,
          category_id,
          duration_seconds,
          is_featured,
          is_published,
          req.user.id,
          is_published ? new Date() : null,
        ]
      );

      const insertResult = result as { insertId: number };
      const [books] = await pool.execute<Array<Book>>('SELECT * FROM books WHERE id = ?', [
        insertResult.insertId,
      ]);

      res.status(201).json(successResponse(books[0], 'Book created successfully'));
    } catch (error) {
      res.status(500).json(errorResponse('INTERNAL_ERROR', 'Failed to create book'));
    }
  }

  static async update(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      if (!req.user || req.user.role !== 'admin') {
        res.status(403).json(errorResponse('FORBIDDEN', 'Admin access required'));
        return;
      }

      const { id } = req.params;
      const pool = getPool();

      // Check if book exists
      const [existing] = await pool.execute<Array<Book>>('SELECT * FROM books WHERE id = ?', [id]);
      if (existing.length === 0) {
        res.status(404).json(errorResponse('NOT_FOUND', 'Book not found'));
        return;
      }

      const updates: string[] = [];
      const values: unknown[] = [];

      const allowedFields = [
        'title',
        'author',
        'narrator',
        'description',
        'cover_image_url',
        'category_id',
        'duration_seconds',
        'is_featured',
        'is_published',
      ];

      for (const field of allowedFields) {
        if (req.body[field] !== undefined) {
          updates.push(`${field} = ?`);
          values.push(req.body[field]);
        }
      }

      // Handle published_at
      if (req.body.is_published !== undefined) {
        if (req.body.is_published && !existing[0].published_at) {
          updates.push('published_at = ?');
          values.push(new Date());
        } else if (!req.body.is_published) {
          updates.push('published_at = NULL');
        }
      }

      if (updates.length === 0) {
        res.status(400).json(errorResponse('VALIDATION_ERROR', 'No fields to update'));
        return;
      }

      values.push(id);
      await pool.execute(`UPDATE books SET ${updates.join(', ')} WHERE id = ?`, values);

      const [books] = await pool.execute<Array<Book>>('SELECT * FROM books WHERE id = ?', [id]);
      res.status(200).json(successResponse(books[0], 'Book updated successfully'));
    } catch (error) {
      res.status(500).json(errorResponse('INTERNAL_ERROR', 'Failed to update book'));
    }
  }

  static async delete(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      if (!req.user || req.user.role !== 'admin') {
        res.status(403).json(errorResponse('FORBIDDEN', 'Admin access required'));
        return;
      }

      const { id } = req.params;
      const pool = getPool();

      const [existing] = await pool.execute<Array<Book>>('SELECT * FROM books WHERE id = ?', [id]);
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
}

