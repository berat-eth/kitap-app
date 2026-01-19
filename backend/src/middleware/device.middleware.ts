import { Request, Response, NextFunction } from 'express';
import { RowDataPacket } from 'mysql2';
import { AuthenticatedRequest } from '../types';
import { config } from '../config/env';
import { getPool } from '../config/database';
import { isValidUUID } from '../utils/helpers';
import { errorResponse } from '../utils/helpers';
import logger from '../utils/logger';

export const deviceAuth = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const deviceId = req.headers[config.device.headerName.toLowerCase()] as string;

    if (!deviceId) {
      res.status(400).json(
        errorResponse('DEVICE_ID_REQUIRED', 'Device ID is required in header')
      );
      return;
    }

    // Validate UUID format
    if (!isValidUUID(deviceId)) {
      res.status(400).json(
        errorResponse('INVALID_DEVICE_ID', 'Invalid device ID format. Must be a valid UUID.')
      );
      return;
    }

    const pool = getPool();

    // Find or create user by device_id
    let [users] = await pool.execute<({ id: number; [key: string]: unknown } & RowDataPacket)[]>(
      'SELECT * FROM users WHERE device_id = ?',
      [deviceId]
    );

    let user;
    if (users.length === 0) {
      // Create new user automatically
      const [result] = await pool.execute(
        'INSERT INTO users (device_id, name, role, last_active_at) VALUES (?, ?, ?, NOW())',
        [deviceId, `User_${deviceId.substring(0, 8)}`, 'user']
      );

      const insertResult = result as { insertId: number };
      [users] = await pool.execute<({ id: number; [key: string]: unknown } & RowDataPacket)[]>(
        'SELECT * FROM users WHERE id = ?',
        [insertResult.insertId]
      );

      user = users[0];
      logger.info(`New user created with device_id: ${deviceId}`);
    } else {
      user = users[0];
      // Update last_active_at
      await pool.execute('UPDATE users SET last_active_at = NOW() WHERE id = ?', [user.id]);
    }

    // Attach user to request
    req.user = user as AuthenticatedRequest['user'];
    req.deviceId = deviceId;

    next();
  } catch (error) {
    logger.error('Device auth middleware error:', error);
    res.status(500).json(errorResponse('INTERNAL_ERROR', 'Internal server error'));
  }
};

