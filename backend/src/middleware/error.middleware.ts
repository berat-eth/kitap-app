import { Request, Response, NextFunction } from 'express';
import { errorResponse } from '../utils/helpers';
import logger from '../utils/logger';

export const errorHandler = (
  err: Error,
  req: Request,
  res: Response,
  next: NextFunction
): void => {
  logger.error('Error:', {
    message: err.message,
    stack: err.stack,
    path: req.path,
    method: req.method,
  });

  // MySQL errors
  if (err.message.includes('ER_DUP_ENTRY')) {
    res.status(409).json(
      errorResponse('DUPLICATE_ENTRY', 'Resource already exists')
    );
    return;
  }

  if (err.message.includes('ER_NO_REFERENCED_ROW')) {
    res.status(400).json(
      errorResponse('INVALID_REFERENCE', 'Referenced resource does not exist')
    );
    return;
  }

  // Default error
  res.status(500).json(
    errorResponse('INTERNAL_ERROR', 'Internal server error')
  );
};

export const notFoundHandler = (req: Request, res: Response): void => {
  res.status(404).json(
    errorResponse('NOT_FOUND', `Route ${req.method} ${req.path} not found`)
  );
};

