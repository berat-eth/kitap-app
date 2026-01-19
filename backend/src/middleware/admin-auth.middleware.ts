import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { AuthenticatedRequest } from '../types';
import { config } from '../config/env';
import { getPool } from '../config/database';
import { errorResponse } from '../utils/helpers';
import logger from '../utils/logger';

export interface AdminJwtPayload {
  userId: number;
  email: string;
  role: string;
}

export const adminAuth = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      res.status(401).json(
        errorResponse('UNAUTHORIZED', 'Authorization token required')
      );
      return;
    }

    const token = authHeader.substring(7);

    try {
      const decoded = jwt.verify(token, config.adminJwt.secret) as AdminJwtPayload;

      // Verify user exists and is admin
      const pool = getPool();
      const [users] = await pool.execute<Array<{ id: number; role: string; is_active: boolean; [key: string]: unknown }>>(
        'SELECT * FROM users WHERE id = ? AND email = ?',
        [decoded.userId, decoded.email]
      );

      if (users.length === 0) {
        res.status(401).json(
          errorResponse('UNAUTHORIZED', 'Invalid token')
        );
        return;
      }

      const user = users[0];

      if (user.role !== 'admin') {
        res.status(403).json(
          errorResponse('FORBIDDEN', 'Admin access required')
        );
        return;
      }

      if (!user.is_active) {
        res.status(403).json(
          errorResponse('FORBIDDEN', 'Account is inactive')
        );
        return;
      }

      req.user = user as AuthenticatedRequest['user'];
      next();
    } catch (error) {
      if (error instanceof jwt.JsonWebTokenError) {
        res.status(401).json(
          errorResponse('UNAUTHORIZED', 'Invalid or expired token')
        );
        return;
      }
      throw error;
    }
  } catch (error) {
    logger.error('Admin auth middleware error:', error);
    res.status(500).json(errorResponse('INTERNAL_ERROR', 'Internal server error'));
  }
};

