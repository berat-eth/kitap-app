import { Request, Response, NextFunction } from 'express';
import { env } from '../config/env';

export function requireAdminKey(req: Request, res: Response, next: NextFunction): void {
  const key = req.headers['x-admin-key'];

  if (!key || key !== env.ADMIN_API_KEY) {
    res.status(403).json({
      success: false,
      error: 'Forbidden',
      message: 'Admin access required. Provide a valid X-Admin-Key header.',
    });
    return;
  }

  next();
}
