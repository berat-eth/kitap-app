import { Request, Response, NextFunction } from 'express';
import { logger, LOG_CONTEXT } from '../utils/logger';

export function requestLogger(req: Request, res: Response, next: NextFunction): void {
  const start = Date.now();
  const { method, originalUrl, ip } = req;
  const deviceId = req.headers['x-device-id'] as string | undefined;

  logger.info(LOG_CONTEXT.HTTP, 'Request started', {
    method,
    url: originalUrl,
    ip: ip || req.socket.remoteAddress,
    deviceId: deviceId || '-',
  });

  res.on('finish', () => {
    const duration = Date.now() - start;
    const { statusCode } = res;

    const meta: Record<string, unknown> = {
      method,
      url: originalUrl,
      status: statusCode,
      durationMs: duration,
      deviceId: deviceId || '-',
    };

    if (statusCode >= 500) {
      logger.error(LOG_CONTEXT.HTTP, 'Request completed (5xx)', meta);
    } else if (statusCode >= 400) {
      logger.warn(LOG_CONTEXT.HTTP, 'Request completed (4xx)', meta);
    } else {
      logger.info(LOG_CONTEXT.HTTP, 'Request completed', meta);
    }
  });

  next();
}
