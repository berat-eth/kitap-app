const express = require('express');
const router = express.Router();
const categoriesController = require('../controllers/categories.controller');
const authMiddleware = require('../middlewares/auth');
const adminMiddleware = require('../middlewares/admin');

router.get('/', categoriesController.list);
router.post('/', authMiddleware, adminMiddleware, categoriesController.create);

module.exports = router;
