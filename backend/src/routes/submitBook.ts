import { Router } from 'express';
import * as submitBookController from '../controllers/submitBookController';

const router = Router();

router.post('/', submitBookController.submitBook);
router.get('/my', submitBookController.getMySubmissions);

export default router;
