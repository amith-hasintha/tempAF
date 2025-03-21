const express = require('express');
const goalController = require('../controllers/goalController');
const authController = require('../controllers/authController');

const router = express.Router();

// Protected routes
router.use(authController.protect);


router.post('/', goalController.createGoal);
router.get('/', goalController.getAllGoals);
router.put('/:id', goalController.updateGoal);
router.delete('/:id', goalController.deleteGoal);

module.exports = router;