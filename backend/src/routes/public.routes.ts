import { Router } from 'express';
import { BooksController } from '../controllers/books.controller';
import { CategoriesController } from '../controllers/categories.controller';

const router = Router();

// Public routes - no authentication required
router.get('/books', BooksController.getAll);
router.get('/categories', CategoriesController.getAll);

export default router;

