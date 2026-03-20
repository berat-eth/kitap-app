const express = require('express');
const router = express.Router();

const categoriesController = require('../controllers/categories.controller');

router.get('/', categoriesController.list);
router.get('/:slug/books', categoriesController.listBooksBySlug);

module.exports = router;

