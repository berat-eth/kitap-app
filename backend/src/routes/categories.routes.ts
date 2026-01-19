import { Router } from 'express';
import { CategoriesController } from '../controllers/categories.controller';
import { adminAuth } from '../middleware/admin-auth.middleware';
import { requireRole } from '../middleware/role.middleware';
import { validate } from '../middleware/validation.middleware';
import { categoryCreateSchema, categoryUpdateSchema } from '../utils/validators';

const router = Router();

// Public routes
router.get('/', CategoriesController.getAll);
router.get('/:id', CategoriesController.getById);

// Admin routes
router.post('/', adminAuth, requireRole('admin'), validate(categoryCreateSchema), CategoriesController.create);
router.put('/:id', adminAuth, requireRole('admin'), validate(categoryUpdateSchema), CategoriesController.update);
router.delete('/:id', adminAuth, requireRole('admin'), CategoriesController.delete);

export default router;

