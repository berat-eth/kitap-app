import { Response } from 'express';
import { AuthenticatedRequest, UserProgress } from '../types';
import { getPool } from '../config/database';
import { successResponse, errorResponse } from '../utils/helpers';

export class ProgressController {
  static async getAll(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      if (!req.user) {
        res.status(401).json(errorResponse('UNAUTHORIZED', 'Device authentication required'));
        return;
      }

      const pool = getPool();

      const [progress] = await pool.execute<Array<UserProgress>>(
        `SELECT up.*, b.title as book_title, ch.title as chapter_title
         FROM user_progress up
         LEFT JOIN books b ON up.book_id = b.id
         LEFT JOIN chapters ch ON up.chapter_id = ch.id
         WHERE up.user_id = ?
         ORDER BY up.last_played_at DESC`,
        [req.user.id]
      );

      res.status(200).json(successResponse(progress));
    } catch (error) {
      res.status(500).json(errorResponse('INTERNAL_ERROR', 'Failed to fetch progress'));
    }
  }

  static async getByBookId(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      if (!req.user) {
        res.status(401).json(errorResponse('UNAUTHORIZED', 'Device authentication required'));
        return;
      }

      const { bookId } = req.params;
      const pool = getPool();

      const [progress] = await pool.execute<Array<UserProgress>>(
        `SELECT up.*, ch.title as chapter_title, ch.order_number
         FROM user_progress up
         LEFT JOIN chapters ch ON up.chapter_id = ch.id
         WHERE up.user_id = ? AND up.book_id = ?
         ORDER BY ch.order_number ASC`,
        [req.user.id, bookId]
      );

      res.status(200).json(successResponse(progress));
    } catch (error) {
      res.status(500).json(errorResponse('INTERNAL_ERROR', 'Failed to fetch progress'));
    }
  }

  static async create(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      if (!req.user) {
        res.status(401).json(errorResponse('UNAUTHORIZED', 'Device authentication required'));
        return;
      }

      const pool = getPool();
      const { book_id, chapter_id, current_position_seconds = 0, is_completed = false } = req.body;

      // Check if progress already exists
      const [existing] = await pool.execute<Array<UserProgress>>(
        'SELECT * FROM user_progress WHERE user_id = ? AND book_id = ? AND chapter_id = ?',
        [req.user.id, book_id, chapter_id]
      );

      if (existing.length > 0) {
        // Update existing progress
        await pool.execute(
          `UPDATE user_progress 
           SET current_position_seconds = ?, is_completed = ?, last_played_at = NOW(), updated_at = NOW()
           WHERE id = ?`,
          [current_position_seconds, is_completed, existing[0].id]
        );

        const [updated] = await pool.execute<Array<UserProgress>>(
          'SELECT * FROM user_progress WHERE id = ?',
          [existing[0].id]
        );
        res.status(200).json(successResponse(updated[0], 'Progress updated successfully'));
        return;
      }

      // Create new progress
      const [result] = await pool.execute(
        `INSERT INTO user_progress (user_id, book_id, chapter_id, current_position_seconds, is_completed)
         VALUES (?, ?, ?, ?, ?)`,
        [req.user.id, book_id, chapter_id, current_position_seconds, is_completed]
      );

      const insertResult = result as { insertId: number };
      const [progress] = await pool.execute<Array<UserProgress>>(
        'SELECT * FROM user_progress WHERE id = ?',
        [insertResult.insertId]
      );

      res.status(201).json(successResponse(progress[0], 'Progress created successfully'));
    } catch (error) {
      res.status(500).json(errorResponse('INTERNAL_ERROR', 'Failed to save progress'));
    }
  }

  static async update(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      if (!req.user) {
        res.status(401).json(errorResponse('UNAUTHORIZED', 'Device authentication required'));
        return;
      }

      const { bookId } = req.params;
      const pool = getPool();
      const { current_position_seconds, is_completed, chapter_id } = req.body;

      if (!chapter_id) {
        res.status(400).json(errorResponse('VALIDATION_ERROR', 'chapter_id is required'));
        return;
      }

      // Find existing progress
      const [existing] = await pool.execute<Array<UserProgress>>(
        'SELECT * FROM user_progress WHERE user_id = ? AND book_id = ? AND chapter_id = ?',
        [req.user.id, bookId, chapter_id]
      );

      if (existing.length === 0) {
        res.status(404).json(errorResponse('NOT_FOUND', 'Progress not found'));
        return;
      }

      const updates: string[] = [];
      const values: unknown[] = [];

      if (current_position_seconds !== undefined) {
        updates.push('current_position_seconds = ?');
        values.push(current_position_seconds);
      }

      if (is_completed !== undefined) {
        updates.push('is_completed = ?');
        values.push(is_completed);
      }

      if (updates.length === 0) {
        res.status(400).json(errorResponse('VALIDATION_ERROR', 'No fields to update'));
        return;
      }

      updates.push('last_played_at = NOW()', 'updated_at = NOW()');
      values.push(existing[0].id);

      await pool.execute(
        `UPDATE user_progress SET ${updates.join(', ')} WHERE id = ?`,
        values
      );

      const [updated] = await pool.execute<Array<UserProgress>>(
        'SELECT * FROM user_progress WHERE id = ?',
        [existing[0].id]
      );
      res.status(200).json(successResponse(updated[0], 'Progress updated successfully'));
    } catch (error) {
      res.status(500).json(errorResponse('INTERNAL_ERROR', 'Failed to update progress'));
    }
  }

  static async delete(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      if (!req.user) {
        res.status(401).json(errorResponse('UNAUTHORIZED', 'Device authentication required'));
        return;
      }

      const { bookId } = req.params;
      const pool = getPool();

      await pool.execute('DELETE FROM user_progress WHERE user_id = ? AND book_id = ?', [
        req.user.id,
        bookId,
      ]);

      res.status(200).json(successResponse(null, 'Progress deleted successfully'));
    } catch (error) {
      res.status(500).json(errorResponse('INTERNAL_ERROR', 'Failed to delete progress'));
    }
  }
}

