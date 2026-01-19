import { Router } from 'express';
import { DeviceController } from '../controllers/device.controller';
import { deviceAuth } from '../middleware/device.middleware';
import { validate } from '../middleware/validation.middleware';
import { userUpdateSchema } from '../utils/validators';

const router = Router();

// All routes require device authentication
router.use(deviceAuth);

router.post('/register', DeviceController.register);
router.get('/me', DeviceController.getMe);
router.put('/me', validate(userUpdateSchema), DeviceController.updateMe);

export default router;

