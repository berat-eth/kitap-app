import { Router } from 'express';
import * as bookController from '../controllers/bookController';

const router = Router();

router.get('/', bookController.listBooks);
router.get('/featured', bookController.getFeatured);
router.get('/popular', bookController.getPopular);
router.get('/search', bookController.searchBooks);
router.get('/:id', bookController.getBook);
router.get('/:id/chapters', bookController.getBookChapters);

export default router;
