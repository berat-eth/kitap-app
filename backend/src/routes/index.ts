import { Router } from 'express';
import booksRouter from './books';
import chaptersRouter from './chapters';
import categoriesRouter from './categories';
import deviceRouter from './device';
import adminRouter from './admin';
import submitBookRouter from './submitBook';
import uploadRouter from './upload';

const router = Router();

router.get('/health', (req, res) => {
  const forwarded = req.headers['x-forwarded-for'];
  const clientIp = forwarded
    ? (typeof forwarded === 'string' ? forwarded : forwarded[0]).split(',')[0].trim()
    : req.ip || req.socket.remoteAddress || 'unknown';
  res.json({
    success: true,
    message: 'API is running',
    timestamp: new Date().toISOString(),
    clientIp,
  });
});

router.use('/books', booksRouter);
router.use('/chapters', chaptersRouter);
router.use('/categories', categoriesRouter);
router.use('/device', deviceRouter);
router.use('/admin', adminRouter);
router.use('/submit-book', submitBookRouter);
router.use('/upload', uploadRouter);

export default router;
