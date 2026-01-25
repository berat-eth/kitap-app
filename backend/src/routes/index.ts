import { Router } from 'express';
import booksRouter from './books';
import chaptersRouter from './chapters';
import categoriesRouter from './categories';
import deviceRouter from './device';
import adminRouter from './admin';

const router = Router();

// Public routes
router.use('/books', booksRouter);
router.use('/chapters', chaptersRouter);
router.use('/categories', categoriesRouter);

// Device routes (X-Device-ID gerekli)
router.use('/device', deviceRouter);

// Admin routes (X-Admin-Key gerekli)
router.use('/admin', adminRouter);

export default router;
