import { Response } from 'express';
import { AuthenticatedRequest, UserFavorite, Book } from '../types';
import { getPool } from '../config/database';
import { successResponse, errorResponse } from '../utils/helpers';

export class FavoritesController {
  static async getAll(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      if (!req.user) {
        res.status(401).json(errorResponse('UNAUTHORIZED', 'Device authentication required'));
        return;
      }

      const pool = getPool();

      const [favorites] = await pool.execute<Array<Book & { favorited_at: Date }>>(
        `SELECT b.*, uf.created_at as favorited_at
         FROM user_favorites uf
         LEFT JOIN books b ON uf.book_id = b.id
         WHERE uf.user_id = ? AND b.is_published = true
         ORDER BY uf.created_at DESC`,
        [req.user.id]
      );

      res.status(200).json(successResponse(favorites));
    } catch (error) {
      res.status(500).json(errorResponse('INTERNAL_ERROR', 'Failed to fetch favorites'));
    }
  }

  static async add(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      if (!req.user) {
        res.status(401).json(errorResponse('UNAUTHORIZED', 'Device authentication required'));
        return;
      }

      const { bookId } = req.body;
      const pool = getPool();

      if (!bookId) {
        res.status(400).json(errorResponse('VALIDATION_ERROR', 'bookId is required'));
        return;
      }

      // Check if book exists
      const [books] = await pool.execute('SELECT id FROM books WHERE id = ?', [bookId]);
      if (books.length === 0) {
        res.status(404).json(errorResponse('NOT_FOUND', 'Book not found'));
        return;
      }

      // Check if already favorited
      const [existing] = await pool.execute<Array<UserFavorite>>(
        'SELECT * FROM user_favorites WHERE user_id = ? AND book_id = ?',
        [req.user.id, bookId]
      );

      if (existing.length > 0) {
        res.status(200).json(successResponse(existing[0], 'Book already in favorites'));
        return;
      }

      const [result] = await pool.execute(
        'INSERT INTO user_favorites (user_id, book_id) VALUES (?, ?)',
        [req.user.id, bookId]
      );

      const insertResult = result as { insertId: number };
      const [favorites] = await pool.execute<Array<UserFavorite>>(
        'SELECT * FROM user_favorites WHERE id = ?',
        [insertResult.insertId]
      );

      res.status(201).json(successResponse(favorites[0], 'Book added to favorites'));
    } catch (error) {
      res.status(500).json(errorResponse('INTERNAL_ERROR', 'Failed to add favorite'));
    }
  }

  static async remove(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      if (!req.user) {
        res.status(401).json(errorResponse('UNAUTHORIZED', 'Device authentication required'));
        return;
      }

      const { bookId } = req.params;
      const pool = getPool();

      const [existing] = await pool.execute<Array<UserFavorite>>(
        'SELECT * FROM user_favorites WHERE user_id = ? AND book_id = ?',
        [req.user.id, bookId]
      );

      if (existing.length === 0) {
        res.status(404).json(errorResponse('NOT_FOUND', 'Favorite not found'));
        return;
      }

      await pool.execute('DELETE FROM user_favorites WHERE user_id = ? AND book_id = ?', [
        req.user.id,
        bookId,
      ]);

      res.status(200).json(successResponse(null, 'Book removed from favorites'));
    } catch (error) {
      res.status(500).json(errorResponse('INTERNAL_ERROR', 'Failed to remove favorite'));
    }
  }
}

