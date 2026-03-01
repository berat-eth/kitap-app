import { Router } from 'express';
import { requireAdminKey } from '../middleware/adminKey';
import * as adminController from '../controllers/adminController';

const router = Router();

router.use(requireAdminKey);

router.get('/stats', adminController.getStats);
router.get('/users', adminController.listUsers);

router.post('/books', adminController.createBook);
router.put('/books/:id', adminController.updateBook);
router.delete('/books/:id', adminController.deleteBook);

router.post('/chapters', adminController.createChapter);
router.delete('/chapters/:id', adminController.deleteChapter);

router.post('/categories', adminController.createCategory);

export default router;
