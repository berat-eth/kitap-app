import { Router } from 'express';
import { BooksController } from '../controllers/books.controller';
import { deviceAuth } from '../middleware/device.middleware';
import { adminAuth } from '../middleware/admin-auth.middleware';
import { requireRole } from '../middleware/role.middleware';
import { validate } from '../middleware/validation.middleware';
import { bookCreateSchema, bookUpdateSchema } from '../utils/validators';

const router = Router();

// Public routes (no auth required)
router.get('/featured', BooksController.getFeatured);
router.get('/popular', BooksController.getPopular);
router.get('/search', BooksController.search);
router.get('/category/:slug', BooksController.getByCategory);

// Device auth routes
router.get('/', deviceAuth, BooksController.getAll);
router.get('/:id', deviceAuth, BooksController.getById);
router.get('/:id/chapters', deviceAuth, BooksController.getChapters);

// Admin routes
router.post('/', adminAuth, requireRole('admin'), validate(bookCreateSchema), BooksController.create);
router.put('/:id', adminAuth, requireRole('admin'), validate(bookUpdateSchema), BooksController.update);
router.delete('/:id', adminAuth, requireRole('admin'), BooksController.delete);

export default router;

