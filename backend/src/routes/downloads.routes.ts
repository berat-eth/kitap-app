import { Router } from 'express';
import { DownloadsController } from '../controllers/downloads.controller';
import { deviceAuth } from '../middleware/device.middleware';

const router = Router();

// All routes require device authentication
router.use(deviceAuth);

router.get('/', DownloadsController.getAll);
router.post('/:bookId', DownloadsController.add);
router.delete('/:bookId', DownloadsController.remove);
router.get('/:bookId/status', DownloadsController.getStatus);

export default router;

