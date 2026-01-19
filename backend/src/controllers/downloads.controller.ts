import { Response } from 'express';
import { AuthenticatedRequest, UserDownload, Book } from '../types';
import { getPool } from '../config/database';
import { successResponse, errorResponse } from '../utils/helpers';

export class DownloadsController {
  static async getAll(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      if (!req.user) {
        res.status(401).json(errorResponse('UNAUTHORIZED', 'Device authentication required'));
        return;
      }

      const pool = getPool();

      const [downloads] = await pool.execute<Array<Book & { download_progress: number; is_completed: boolean; downloaded_at: Date }>>(
        `SELECT b.*, ud.download_progress, ud.is_completed, ud.downloaded_at
         FROM user_downloads ud
         LEFT JOIN books b ON ud.book_id = b.id
         WHERE ud.user_id = ? AND b.is_published = true
         ORDER BY ud.downloaded_at DESC`,
        [req.user.id]
      );

      res.status(200).json(successResponse(downloads));
    } catch (error) {
      res.status(500).json(errorResponse('INTERNAL_ERROR', 'Failed to fetch downloads'));
    }
  }

  static async add(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      if (!req.user) {
        res.status(401).json(errorResponse('UNAUTHORIZED', 'Device authentication required'));
        return;
      }

      const { bookId } = req.params;
      const pool = getPool();

      // Check if book exists
      const [books] = await pool.execute('SELECT id FROM books WHERE id = ?', [bookId]);
      if (books.length === 0) {
        res.status(404).json(errorResponse('NOT_FOUND', 'Book not found'));
        return;
      }

      // Check if already downloading
      const [existing] = await pool.execute<Array<UserDownload>>(
        'SELECT * FROM user_downloads WHERE user_id = ? AND book_id = ?',
        [req.user.id, bookId]
      );

      if (existing.length > 0) {
        res.status(200).json(successResponse(existing[0], 'Download already exists'));
        return;
      }

      const [result] = await pool.execute(
        'INSERT INTO user_downloads (user_id, book_id, download_progress, is_completed) VALUES (?, ?, ?, ?)',
        [req.user.id, bookId, 0, false]
      );

      const insertResult = result as { insertId: number };
      const [downloads] = await pool.execute<Array<UserDownload>>(
        'SELECT * FROM user_downloads WHERE id = ?',
        [insertResult.insertId]
      );

      res.status(201).json(successResponse(downloads[0], 'Download started'));
    } catch (error) {
      res.status(500).json(errorResponse('INTERNAL_ERROR', 'Failed to start download'));
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

      const [existing] = await pool.execute<Array<UserDownload>>(
        'SELECT * FROM user_downloads WHERE user_id = ? AND book_id = ?',
        [req.user.id, bookId]
      );

      if (existing.length === 0) {
        res.status(404).json(errorResponse('NOT_FOUND', 'Download not found'));
        return;
      }

      await pool.execute('DELETE FROM user_downloads WHERE user_id = ? AND book_id = ?', [
        req.user.id,
        bookId,
      ]);

      res.status(200).json(successResponse(null, 'Download removed'));
    } catch (error) {
      res.status(500).json(errorResponse('INTERNAL_ERROR', 'Failed to remove download'));
    }
  }

  static async getStatus(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      if (!req.user) {
        res.status(401).json(errorResponse('UNAUTHORIZED', 'Device authentication required'));
        return;
      }

      const { bookId } = req.params;
      const pool = getPool();

      const [downloads] = await pool.execute<Array<UserDownload>>(
        'SELECT * FROM user_downloads WHERE user_id = ? AND book_id = ?',
        [req.user.id, bookId]
      );

      if (downloads.length === 0) {
        res.status(404).json(errorResponse('NOT_FOUND', 'Download not found'));
        return;
      }

      res.status(200).json(successResponse(downloads[0]));
    } catch (error) {
      res.status(500).json(errorResponse('INTERNAL_ERROR', 'Failed to get download status'));
    }
  }
}

