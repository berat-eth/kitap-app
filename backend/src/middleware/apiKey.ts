import { Request, Response, NextFunction } from 'express';
import { env } from '../config/env';

export function requireApiKey(req: Request, res: Response, next: NextFunction): void {
  const key = req.headers['x-api-key'];

  if (!key || key !== env.API_KEY) {
    res.status(401).json({
      success: false,
      error: 'Unauthorized',
      message: 'Valid API key required. Provide it via the X-API-Key header.',
    });
    return;
  }

  next();
}
