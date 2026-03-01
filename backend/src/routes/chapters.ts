import { Router } from 'express';
import * as chapterController from '../controllers/chapterController';

const router = Router();

router.get('/:id/stream', chapterController.streamChapter);

export default router;
