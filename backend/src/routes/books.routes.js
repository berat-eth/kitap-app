const express = require('express');
const router = express.Router();

const booksController = require('../controllers/books.controller');

router.get('/', booksController.getBooks);
router.get('/featured', booksController.getFeatured);
router.get('/popular', booksController.getPopular);
router.get('/search', booksController.search);

router.get('/:id', booksController.getBookById);
router.get('/:bookId/chapters', booksController.getChaptersByBookId);

module.exports = router;

