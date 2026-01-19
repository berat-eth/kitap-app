import { Response } from 'express';
import { AuthenticatedRequest } from '../types';
import { DeviceService } from '../services/device.service';
import { successResponse, errorResponse } from '../utils/helpers';
import { userUpdateSchema } from '../utils/validators';
import { validate } from '../middleware/validation.middleware';

export class DeviceController {
  static async register(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      // User is already created by deviceAuth middleware
      if (!req.user) {
        res.status(401).json(errorResponse('UNAUTHORIZED', 'Device authentication required'));
        return;
      }

      res.status(200).json(
        successResponse(
          {
            id: req.user.id,
            device_id: req.user.device_id,
            name: req.user.name,
            avatar_url: req.user.avatar_url,
            role: req.user.role,
            created_at: req.user.created_at,
          },
          'Device registered successfully'
        )
      );
    } catch (error) {
      res.status(500).json(errorResponse('INTERNAL_ERROR', 'Failed to register device'));
    }
  }

  static async getMe(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      if (!req.user) {
        res.status(401).json(errorResponse('UNAUTHORIZED', 'Device authentication required'));
        return;
      }

      res.status(200).json(
        successResponse({
          id: req.user.id,
          device_id: req.user.device_id,
          name: req.user.name,
          avatar_url: req.user.avatar_url,
          role: req.user.role,
          created_at: req.user.created_at,
          last_active_at: req.user.last_active_at,
        })
      );
    } catch (error) {
      res.status(500).json(errorResponse('INTERNAL_ERROR', 'Failed to get user info'));
    }
  }

  static async updateMe(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      if (!req.user) {
        res.status(401).json(errorResponse('UNAUTHORIZED', 'Device authentication required'));
        return;
      }

      const updatedUser = await DeviceService.updateUser(req.user.id, req.body);

      res.status(200).json(
        successResponse(
          {
            id: updatedUser.id,
            device_id: updatedUser.device_id,
            name: updatedUser.name,
            avatar_url: updatedUser.avatar_url,
            role: updatedUser.role,
          },
          'User updated successfully'
        )
      );
    } catch (error) {
      res.status(500).json(errorResponse('INTERNAL_ERROR', 'Failed to update user'));
    }
  }
}

