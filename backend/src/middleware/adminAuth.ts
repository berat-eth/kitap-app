import { Response, NextFunction } from 'express';
import { AdminRequest, ApiResponse } from '../types';
import { config } from '../config';

/**
 * Admin API Key kontrolü
 * Header: X-Admin-Key
 */
export const adminAuth = (
  req: AdminRequest,
  res: Response,
  next: NextFunction
): void => {
  const apiKey = req.headers['x-admin-key'] as string;

  if (!apiKey) {
    const response: ApiResponse = {
      success: false,
      error: 'Admin API key gerekli (X-Admin-Key header)',
    };
    res.status(401).json(response);
    return;
  }

  if (apiKey !== config.adminApiKey) {
    const response: ApiResponse = {
      success: false,
      error: 'Geçersiz Admin API key',
    };
    res.status(403).json(response);
    return;
  }

  req.isAdmin = true;
  next();
};
