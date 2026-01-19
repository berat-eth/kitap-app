import { Router } from 'express';
import { AdminAuthController } from '../controllers/admin-auth.controller';
import { adminAuth } from '../middleware/admin-auth.middleware';
import { validate } from '../middleware/validation.middleware';
import { adminLoginSchema } from '../utils/validators';

const router = Router();

router.post('/login', validate(adminLoginSchema), AdminAuthController.login);
router.post('/refresh', AdminAuthController.refresh);
router.get('/me', adminAuth, AdminAuthController.getMe);
router.post('/logout', adminAuth, AdminAuthController.logout);

export default router;

