import { Response } from 'express';
import { AuthenticatedRequest, User } from '../types';
import { getPool } from '../config/database';
import { successResponse, errorResponse } from '../utils/helpers';

export class AdminController {
  static async getDashboardStats(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      if (!req.user || req.user.role !== 'admin') {
        res.status(403).json(errorResponse('FORBIDDEN', 'Admin access required'));
        return;
      }

      const pool = getPool();

      // Get stats
      const [userStats] = await pool.execute<Array<{ total: number; active: number }>>(
        `SELECT 
          COUNT(*) as total,
          SUM(CASE WHEN last_active_at >= DATE_SUB(NOW(), INTERVAL 30 DAY) THEN 1 ELSE 0 END) as active
         FROM users WHERE role = 'user'`
      );

      const [bookStats] = await pool.execute<Array<{ total: number; published: number }>>(
        `SELECT 
          COUNT(*) as total,
          SUM(CASE WHEN is_published = true THEN 1 ELSE 0 END) as published
         FROM books`
      );

      const [listeningStats] = await pool.execute<Array<{ total_hours: number }>>(
        `SELECT 
          COALESCE(SUM(duration_seconds), 0) / 3600 as total_hours
         FROM user_progress up
         LEFT JOIN chapters ch ON up.chapter_id = ch.id
         WHERE up.is_completed = true`
      );

      const [revenueStats] = await pool.execute<Array<{ total: number }>>(
        `SELECT COALESCE(SUM(amount), 0) as total
         FROM donations
         WHERE payment_status = 'completed'
         AND created_at >= DATE_SUB(NOW(), INTERVAL 30 DAY)`
      );

      res.status(200).json(
        successResponse({
          users: {
            total: userStats[0]?.total || 0,
            active: userStats[0]?.active || 0,
          },
          books: {
            total: bookStats[0]?.total || 0,
            published: bookStats[0]?.published || 0,
          },
          listening: {
            totalHours: listeningStats[0]?.total_hours || 0,
          },
          revenue: {
            monthly: revenueStats[0]?.total || 0,
          },
        })
      );
    } catch (error) {
      res.status(500).json(errorResponse('INTERNAL_ERROR', 'Failed to fetch dashboard stats'));
    }
  }

  static async getUsers(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      if (!req.user || req.user.role !== 'admin') {
        res.status(403).json(errorResponse('FORBIDDEN', 'Admin access required'));
        return;
      }

      const pool = getPool();
      const { page = 1, limit = 20 } = req.query;
      const offset = (Number(page) - 1) * Number(limit);

      const [users] = await pool.execute<Array<User>>(
        `SELECT id, device_id, email, name, avatar_url, role, is_active, created_at, last_active_at
         FROM users
         WHERE role = 'user'
         ORDER BY created_at DESC
         LIMIT ? OFFSET ?`,
        [Number(limit), offset]
      );

      const [countResult] = await pool.execute<Array<{ total: number }>>(
        'SELECT COUNT(*) as total FROM users WHERE role = ?',
        ['user']
      );
      const total = countResult[0]?.total || 0;

      res.status(200).json(
        successResponse(users, undefined, {
          page: Number(page),
          limit: Number(limit),
          total,
          totalPages: Math.ceil(total / Number(limit)),
        })
      );
    } catch (error) {
      res.status(500).json(errorResponse('INTERNAL_ERROR', 'Failed to fetch users'));
    }
  }

  static async getUserById(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      if (!req.user || req.user.role !== 'admin') {
        res.status(403).json(errorResponse('FORBIDDEN', 'Admin access required'));
        return;
      }

      const { id } = req.params;
      const pool = getPool();

      const [users] = await pool.execute<Array<User>>(
        'SELECT * FROM users WHERE id = ?',
        [id]
      );

      if (users.length === 0) {
        res.status(404).json(errorResponse('NOT_FOUND', 'User not found'));
        return;
      }

      res.status(200).json(successResponse(users[0]));
    } catch (error) {
      res.status(500).json(errorResponse('INTERNAL_ERROR', 'Failed to fetch user'));
    }
  }

  static async updateUser(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      if (!req.user || req.user.role !== 'admin') {
        res.status(403).json(errorResponse('FORBIDDEN', 'Admin access required'));
        return;
      }

      const { id } = req.params;
      const pool = getPool();

      const updates: string[] = [];
      const values: unknown[] = [];

      const allowedFields = ['name', 'avatar_url', 'is_active'];

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
      await pool.execute(`UPDATE users SET ${updates.join(', ')} WHERE id = ?`, values);

      const [users] = await pool.execute<Array<User>>('SELECT * FROM users WHERE id = ?', [id]);
      res.status(200).json(successResponse(users[0], 'User updated successfully'));
    } catch (error) {
      res.status(500).json(errorResponse('INTERNAL_ERROR', 'Failed to update user'));
    }
  }

  static async deleteUser(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      if (!req.user || req.user.role !== 'admin') {
        res.status(403).json(errorResponse('FORBIDDEN', 'Admin access required'));
        return;
      }

      const { id } = req.params;
      const pool = getPool();

      // Don't allow deleting admin users
      const [existing] = await pool.execute<Array<User>>('SELECT role FROM users WHERE id = ?', [
        id,
      ]);
      if (existing.length === 0) {
        res.status(404).json(errorResponse('NOT_FOUND', 'User not found'));
        return;
      }

      if (existing[0].role === 'admin') {
        res.status(403).json(errorResponse('FORBIDDEN', 'Cannot delete admin user'));
        return;
      }

      await pool.execute('DELETE FROM users WHERE id = ?', [id]);
      res.status(200).json(successResponse(null, 'User deleted successfully'));
    } catch (error) {
      res.status(500).json(errorResponse('INTERNAL_ERROR', 'Failed to delete user'));
    }
  }
}

