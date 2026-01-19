import { Request, Response, NextFunction } from 'express';
import { z, ZodSchema } from 'zod';
import { errorResponse } from '../utils/helpers';

export const validate = (schema: ZodSchema) => {
  return (req: Request, res: Response, next: NextFunction): void => {
    try {
      schema.parse({
        ...req.body,
        ...req.params,
        ...req.query,
      });
      next();
    } catch (error) {
      if (error instanceof z.ZodError) {
        res.status(400).json(
          errorResponse(
            'VALIDATION_ERROR',
            'Validation failed',
            error.errors
          )
        );
        return;
      }
      next(error);
    }
  };
};

