const express = require('express');
const reportController = require('../controllers/reportController');
const authController = require('../controllers/authController');

const router = express.Router();

// Protected routes
router.use(authController.protect);

router.post('/', reportController.createReport);
router.get('/', reportController.getAllReports);

module.exports = router;