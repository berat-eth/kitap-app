import { Request, Response, NextFunction } from 'express';
import { env } from '../config/env';
import { logger, LOG_CONTEXT } from '../utils/logger';

export class AppError extends Error {
  constructor(
    public statusCode: number,
    message: string,
    public isOperational = true,
  ) {
    super(message);
    Object.setPrototypeOf(this, new.target.prototype);
  }
}

export function notFoundHandler(req: Request, res: Response): void {
  logger.warn(LOG_CONTEXT.ERROR, 'Route not found', {
    method: req.method,
    url: req.originalUrl,
  });
  res.status(404).json({
    success: false,
    error: 'Not Found',
    message: `Route ${req.method} ${req.originalUrl} does not exist.`,
  });
}

export function errorHandler(
  err: Error,
  req: Request,
  res: Response,
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  _next: NextFunction,
): void {
  if (err instanceof AppError) {
    logger.warn(LOG_CONTEXT.ERROR, 'AppError', {
      statusCode: err.statusCode,
      message: err.message,
      method: req.method,
      url: req.originalUrl,
    });
    res.status(err.statusCode).json({
      success: false,
      error: err.name,
      message: err.message,
    });
    return;
  }

  logger.errorEx(LOG_CONTEXT.ERROR, 'Unhandled error', err);

  res.status(500).json({
    success: false,
    error: 'Internal Server Error',
    message: env.NODE_ENV === 'production' ? 'An unexpected error occurred.' : err.message,
  });
}
