import { Response } from 'express';
import { AuthenticatedRequest } from '../types';
import { AdminAuthService } from '../services/admin-auth.service';
import { successResponse, errorResponse } from '../utils/helpers';

export class AdminAuthController {
  static async login(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      const { email, password } = req.body;

      if (!email || !password) {
        res.status(400).json(
          errorResponse('VALIDATION_ERROR', 'Email and password are required')
        );
        return;
      }

      const { user, tokens } = await AdminAuthService.login(email, password);

      res.status(200).json(
        successResponse(
          {
            user: {
              id: user.id,
              email: user.email,
              name: user.name,
              role: user.role,
            },
            tokens,
          },
          'Login successful'
        )
      );
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Login failed';
      res.status(401).json(errorResponse('LOGIN_FAILED', message));
    }
  }

  static async refresh(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      const { refreshToken } = req.body;

      if (!refreshToken) {
        res.status(400).json(
          errorResponse('VALIDATION_ERROR', 'Refresh token is required')
        );
        return;
      }

      const { accessToken } = await AdminAuthService.refreshToken(refreshToken);

      res.status(200).json(
        successResponse(
          { accessToken },
          'Token refreshed successfully'
        )
      );
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Token refresh failed';
      res.status(401).json(errorResponse('REFRESH_FAILED', message));
    }
  }

  static async getMe(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      if (!req.user) {
        res.status(401).json(errorResponse('UNAUTHORIZED', 'Authentication required'));
        return;
      }

      res.status(200).json(
        successResponse({
          id: req.user.id,
          email: req.user.email,
          name: req.user.name,
          role: req.user.role,
          created_at: req.user.created_at,
        })
      );
    } catch (error) {
      res.status(500).json(errorResponse('INTERNAL_ERROR', 'Failed to get admin info'));
    }
  }

  static async logout(req: AuthenticatedRequest, res: Response): Promise<void> {
    // In JWT-based auth, logout is handled client-side by removing the token
    // But we can log the action for audit purposes
    res.status(200).json(
      successResponse(null, 'Logout successful')
    );
  }
}

