const express = require('express');
const router = express.Router();
const booksController = require('../controllers/books.controller');
const authMiddleware = require('../middlewares/auth');
const adminMiddleware = require('../middlewares/admin');

router.get('/', booksController.list);
router.get('/:id', booksController.getById);
router.post('/', authMiddleware, adminMiddleware, booksController.create);
router.put('/:id', authMiddleware, adminMiddleware, booksController.update);
router.delete('/:id', authMiddleware, adminMiddleware, booksController.remove);

module.exports = router;
