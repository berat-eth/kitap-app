import { Response, NextFunction } from 'express';
import { AuthenticatedRequest } from '../types';
import { errorResponse } from '../utils/helpers';

export const requireRole = (...roles: string[]) => {
  return (req: AuthenticatedRequest, res: Response, next: NextFunction): void => {
    if (!req.user) {
      res.status(401).json(
        errorResponse('UNAUTHORIZED', 'Authentication required')
      );
      return;
    }

    if (!roles.includes(req.user.role)) {
      res.status(403).json(
        errorResponse('FORBIDDEN', `Access denied. Required role: ${roles.join(' or ')}`)
      );
      return;
    }

    next();
  };
};

