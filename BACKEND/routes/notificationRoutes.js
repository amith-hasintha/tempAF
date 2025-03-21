const express = require('express');
const notificationController = require('../controllers/notificationController');
const authController = require('../controllers/authController');

const router = express.Router();

// Protected routes
router.use(authController.protect);

router.get('/', notificationController.getAllNotifications);
router.put('/:id', notificationController.markAsRead);

module.exports = router;