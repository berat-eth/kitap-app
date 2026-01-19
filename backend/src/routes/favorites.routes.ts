import { Router } from 'express';
import { FavoritesController } from '../controllers/favorites.controller';
import { deviceAuth } from '../middleware/device.middleware';

const router = Router();

// All routes require device authentication
router.use(deviceAuth);

router.get('/', FavoritesController.getAll);
router.post('/', FavoritesController.add);
router.delete('/:bookId', FavoritesController.remove);

export default router;

