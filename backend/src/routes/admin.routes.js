const express = require('express');
const router = express.Router();

const { adminAuth } = require('../middleware/adminAuth');
const adminController = require('../controllers/admin.controller');

router.get('/stats', adminAuth, adminController.stats);

router.get('/submissions', adminAuth, adminController.listSubmissions);
router.put('/submissions/:id/approve', adminAuth, adminController.approveSubmission);
router.put('/submissions/:id/reject', adminAuth, adminController.rejectSubmission);

router.get('/categories', adminAuth, adminController.listCategoriesAdmin);
router.post('/categories', adminAuth, adminController.createCategory);
router.patch('/categories/:id', adminAuth, adminController.updateCategory);
router.delete('/categories/:id', adminAuth, adminController.deleteCategory);

router.get('/books', adminAuth, adminController.listBooksAdmin);
router.get('/books/:bookId/chapters', adminAuth, adminController.listChaptersAdmin);
router.get('/books/:id', adminAuth, adminController.getBookAdmin);
router.patch('/books/:id', adminAuth, adminController.updateBookAdmin);
router.delete('/books/:id', adminAuth, adminController.deleteBookAdmin);

router.post('/chapters', adminAuth, adminController.createChapter);
router.patch('/chapters/:id', adminAuth, adminController.updateChapter);
router.delete('/chapters/:id', adminAuth, adminController.deleteChapter);

router.get('/devices', adminAuth, adminController.listDevices);

module.exports = router;
