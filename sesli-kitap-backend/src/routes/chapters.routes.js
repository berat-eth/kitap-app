const express = require('express');
const chaptersController = require('../controllers/chapters.controller');
const authMiddleware = require('../middlewares/auth');
const adminMiddleware = require('../middlewares/admin');
const { audioUpload } = require('../middlewares/upload');

const bookChaptersRouter = express.Router({ mergeParams: true });
bookChaptersRouter.get('/', chaptersController.list);
bookChaptersRouter.post('/', authMiddleware, adminMiddleware, audioUpload.single('audio'), chaptersController.create);

const chapterActionsRouter = express.Router();
chapterActionsRouter.delete('/:id', authMiddleware, adminMiddleware, chaptersController.remove);
chapterActionsRouter.post('/:id/progress', authMiddleware, chaptersController.saveProgress);

module.exports = { bookChaptersRouter, chapterActionsRouter };
