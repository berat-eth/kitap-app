import { Request, Response, NextFunction } from 'express';
import { env } from '../config/env';
import { logger, LOG_CONTEXT } from '../utils/logger';

export function requireAdminKey(req: Request, res: Response, next: NextFunction): void {
  const key = req.headers['x-admin-key'];

  if (!key || key !== env.ADMIN_API_KEY) {
    logger.warn(LOG_CONTEXT.ADMIN, 'Admin key validation failed', {
      hasKey: !!key,
      method: req.method,
      url: req.originalUrl,
    });
    res.status(403).json({
      success: false,
      error: 'Forbidden',
      message: 'Admin access required. Provide a valid X-Admin-Key header.',
    });
    return;
  }

  logger.debug(LOG_CONTEXT.ADMIN, 'Admin key validated');
  next();
}
