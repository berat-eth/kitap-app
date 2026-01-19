import { Router } from 'express';
import { AdminController } from '../controllers/admin.controller';
import { adminAuth } from '../middleware/admin-auth.middleware';
import { requireRole } from '../middleware/role.middleware';

const router = Router();

// All routes require admin authentication
router.use(adminAuth);
router.use(requireRole('admin'));

router.get('/dashboard/stats', AdminController.getDashboardStats);
router.get('/users', AdminController.getUsers);
router.get('/users/:id', AdminController.getUserById);
router.put('/users/:id', AdminController.updateUser);
router.delete('/users/:id', AdminController.deleteUser);

export default router;

