import { Request, Response, NextFunction } from 'express';
import { ApiResponse } from '../types';

// Custom Error Class
export class AppError extends Error {
  statusCode: number;
  isOperational: boolean;

  constructor(message: string, statusCode: number = 500) {
    super(message);
    this.statusCode = statusCode;
    this.isOperational = true;

    Error.captureStackTrace(this, this.constructor);
  }
}

// Not Found Error
export class NotFoundError extends AppError {
  constructor(message: string = 'Kaynak bulunamadı') {
    super(message, 404);
  }
}

// Validation Error
export class ValidationError extends AppError {
  constructor(message: string = 'Geçersiz veri') {
    super(message, 400);
  }
}

// Unauthorized Error
export class UnauthorizedError extends AppError {
  constructor(message: string = 'Yetkilendirme gerekli') {
    super(message, 401);
  }
}

// Forbidden Error
export class ForbiddenError extends AppError {
  constructor(message: string = 'Erişim reddedildi') {
    super(message, 403);
  }
}

// Error Handler Middleware
export const errorHandler = (
  err: Error | AppError,
  req: Request,
  res: Response,
  _next: NextFunction
): void => {
  let statusCode = 500;
  let message = 'Sunucu hatası';

  if (err instanceof AppError) {
    statusCode = err.statusCode;
    message = err.message;
  } else if (err.name === 'QueryFailedError') {
    // TypeORM hataları
    statusCode = 400;
    message = 'Veritabanı işlemi başarısız';
  } else if (err.name === 'EntityNotFoundError') {
    statusCode = 404;
    message = 'Kayıt bulunamadı';
  }

  // Hata logla
  console.error(`[${new Date().toISOString()}] ${statusCode} - ${message}`);
  if (process.env.NODE_ENV === 'development') {
    console.error(err.stack);
  }

  const response: ApiResponse = {
    success: false,
    error: message,
  };

  res.status(statusCode).json(response);
};

// 404 Handler
export const notFoundHandler = (req: Request, res: Response): void => {
  const response: ApiResponse = {
    success: false,
    error: `Endpoint bulunamadı: ${req.method} ${req.originalUrl}`,
  };
  res.status(404).json(response);
};

// Async Handler Wrapper
export const asyncHandler = (
  fn: (req: Request, res: Response, next: NextFunction) => Promise<void>
) => {
  return (req: Request, res: Response, next: NextFunction): void => {
    Promise.resolve(fn(req, res, next)).catch(next);
  };
};
