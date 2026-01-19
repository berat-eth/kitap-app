import { Router } from 'express';
import { ProgressController } from '../controllers/progress.controller';
import { deviceAuth } from '../middleware/device.middleware';
import { validate } from '../middleware/validation.middleware';
import { progressCreateSchema, progressUpdateSchema } from '../utils/validators';

const router = Router();

// All routes require device authentication
router.use(deviceAuth);

router.get('/', ProgressController.getAll);
router.get('/:bookId', ProgressController.getByBookId);
router.post('/', validate(progressCreateSchema), ProgressController.create);
router.put('/:bookId', validate(progressUpdateSchema), ProgressController.update);
router.delete('/:bookId', ProgressController.delete);

export default router;

