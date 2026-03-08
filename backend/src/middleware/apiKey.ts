import { Request, Response, NextFunction } from 'express';
import { env } from '../config/env';
import { logger, LOG_CONTEXT } from '../utils/logger';

export function requireApiKey(req: Request, res: Response, next: NextFunction): void {
  if (req.method === 'OPTIONS') {
    return next();
  }

  const key = req.headers['x-api-key'];

  if (!key || key !== env.API_KEY) {
    logger.warn(LOG_CONTEXT.API_KEY, 'API key validation failed', {
      hasKey: !!key,
      method: req.method,
      url: req.originalUrl,
    });
    res.status(401).json({
      success: false,
      error: 'Unauthorized',
      message: 'Valid API key required. Provide it via the X-API-Key header.',
    });
    return;
  }

  logger.debug(LOG_CONTEXT.API_KEY, 'API key validated');
  next();
}
