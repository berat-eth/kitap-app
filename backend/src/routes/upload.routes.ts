import { Router } from 'express';
import { adminAuth } from '../middleware/admin-auth.middleware';
import { requireRole } from '../middleware/role.middleware';
import { uploadCover, uploadAudio, uploadTranscriptFile, uploadAvatar, handleUploadError } from '../middleware/upload.middleware';
import { StorageService } from '../services/storage.service';
import { successResponse, errorResponse } from '../utils/helpers';
import { Response } from 'express';
import { AuthenticatedRequest } from '../types';

const router = Router();

// Upload cover (admin only)
router.post(
  '/book-cover',
  adminAuth,
  requireRole('admin'),
  uploadCover,
  async (req: AuthenticatedRequest, res: Response) => {
    try {
      if (!req.file) {
        res.status(400).json(errorResponse('VALIDATION_ERROR', 'No file uploaded'));
        return;
      }

      const { filePath, publicUrl } = await StorageService.saveFile('cover', req.file);

      res.status(200).json(
        successResponse(
          {
            url: publicUrl,
            path: filePath,
            filename: req.file.filename,
            size: req.file.size,
          },
          'Cover uploaded successfully'
        )
      );
    } catch (error) {
      res.status(500).json(errorResponse('INTERNAL_ERROR', 'Failed to upload cover'));
    }
  }
);

// Upload audio (admin only)
router.post(
  '/chapter-audio',
  adminAuth,
  requireRole('admin'),
  uploadAudio,
  async (req: AuthenticatedRequest, res: Response) => {
    try {
      if (!req.file) {
        res.status(400).json(errorResponse('VALIDATION_ERROR', 'No file uploaded'));
        return;
      }

      const { filePath, publicUrl } = await StorageService.saveFile('audio', req.file);

      res.status(200).json(
        successResponse(
          {
            url: publicUrl,
            path: filePath,
            filename: req.file.filename,
            size: req.file.size,
          },
          'Audio uploaded successfully'
        )
      );
    } catch (error) {
      res.status(500).json(errorResponse('INTERNAL_ERROR', 'Failed to upload audio'));
    }
  }
);

// Upload transcript (admin only)
router.post(
  '/chapter-transcript',
  adminAuth,
  requireRole('admin'),
  uploadTranscriptFile,
  async (req: AuthenticatedRequest, res: Response) => {
    try {
      if (!req.file) {
        res.status(400).json(errorResponse('VALIDATION_ERROR', 'No file uploaded'));
        return;
      }

      const { filePath, publicUrl } = await StorageService.saveFile('transcript', req.file);

      res.status(200).json(
        successResponse(
          {
            url: publicUrl,
            path: filePath,
            filename: req.file.filename,
            size: req.file.size,
          },
          'Transcript uploaded successfully'
        )
      );
    } catch (error) {
      res.status(500).json(errorResponse('INTERNAL_ERROR', 'Failed to upload transcript'));
    }
  }
);

// Upload avatar (device auth)
router.post(
  '/avatar',
  uploadAvatar,
  async (req: AuthenticatedRequest, res: Response) => {
    try {
      if (!req.file) {
        res.status(400).json(errorResponse('VALIDATION_ERROR', 'No file uploaded'));
        return;
      }

      const { filePath, publicUrl } = await StorageService.saveFile('avatar', req.file);

      res.status(200).json(
        successResponse(
          {
            url: publicUrl,
            path: filePath,
            filename: req.file.filename,
            size: req.file.size,
          },
          'Avatar uploaded successfully'
        )
      );
    } catch (error) {
      res.status(500).json(errorResponse('INTERNAL_ERROR', 'Failed to upload avatar'));
    }
  }
);

export default router;

