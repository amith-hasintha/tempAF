const express = require('express');
const budgetController = require('../controllers/budgetController');
const authController = require('../controllers/authController');

const router = express.Router();

// Protected routes
router.use(authController.protect);

router.post('/', budgetController.createBudget);
router.get('/', budgetController.getAllBudgets);
router.put('/:id', budgetController.updateBudget);
router.delete('/:id', budgetController.deleteBudget);

module.exports = router;