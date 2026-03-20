const express = require('express');
const router = express.Router();
const { streamChapter } = require('../controllers/books.controller');

router.get('/:id/stream', streamChapter);

module.exports = router;

