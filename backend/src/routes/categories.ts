import { Router } from 'express';
import * as categoryController from '../controllers/categoryController';

const router = Router();

router.get('/', categoryController.listCategories);
router.get('/:slug/books', categoryController.getBooksByCategory);

export default router;
