import { Router } from 'express';
import { ChaptersController } from '../controllers/chapters.controller';
import { deviceAuth } from '../middleware/device.middleware';
import { adminAuth } from '../middleware/admin-auth.middleware';
import { requireRole } from '../middleware/role.middleware';
import { validate } from '../middleware/validation.middleware';
import { chapterCreateSchema, chapterUpdateSchema } from '../utils/validators';

const router = Router();

// Device auth routes
router.get('/:id', deviceAuth, ChaptersController.getById);
router.get('/:id/audio', deviceAuth, ChaptersController.getAudioUrl);
router.get('/:id/transcript', deviceAuth, ChaptersController.getTranscriptUrl);

// Admin routes
router.post('/', adminAuth, requireRole('admin'), validate(chapterCreateSchema), ChaptersController.create);
router.put('/:id', adminAuth, requireRole('admin'), validate(chapterUpdateSchema), ChaptersController.update);
router.delete('/:id', adminAuth, requireRole('admin'), ChaptersController.delete);

export default router;

