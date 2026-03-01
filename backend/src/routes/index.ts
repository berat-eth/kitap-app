import { Router } from 'express';
import booksRouter from './books';
import chaptersRouter from './chapters';
import categoriesRouter from './categories';
import deviceRouter from './device';
import adminRouter from './admin';

const router = Router();

router.get('/health', (req, res) => {
  res.json({ success: true, message: 'API is running', timestamp: new Date().toISOString() });
});

router.use('/books', booksRouter);
router.use('/chapters', chaptersRouter);
router.use('/categories', categoriesRouter);
router.use('/device', deviceRouter);
router.use('/admin', adminRouter);

export default router;
