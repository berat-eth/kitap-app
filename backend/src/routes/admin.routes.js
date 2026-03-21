const express = require('express');
const router = express.Router();

const { adminAuth } = require('../middleware/adminAuth');
const adminController = require('../controllers/admin.controller');

router.get('/submissions', adminAuth, adminController.listSubmissions);
router.put('/submissions/:id/approve', adminAuth, adminController.approveSubmission);
router.put('/submissions/:id/reject', adminAuth, adminController.rejectSubmission);

module.exports = router;

