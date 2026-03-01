import { Router } from 'express';
import * as deviceController from '../controllers/deviceController';
import { strictRateLimiter } from '../middleware/rateLimiter';

const router = Router();

router.post('/register', strictRateLimiter, deviceController.registerDevice);
router.get('/progress/:bookId', deviceController.getProgress);
router.post('/progress/:bookId', deviceController.saveProgress);
router.get('/favorites', deviceController.getFavorites);
router.post('/favorites/:bookId', deviceController.addFavorite);
router.delete('/favorites/:bookId', deviceController.removeFavorite);

export default router;
