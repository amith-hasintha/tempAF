const express = require('express');
const path = require('path');
const router = express.Router();
const userController = require('../controllers/authController');


// Routes
router.post('/create', userController.createUser);
router.post('/login', userController.loginUser);

router.get('/get',userController.getAllUsers);

router.get('/:id',userController.getUserById);


// Route to update a user by ID (if needed to allow updating the CV, it would require additional logic)
router.put('/:id/update', userController.updateUserById);

// Route to delete a user by ID
router.delete('/:id/delete', userController.deleteUserById);

module.exports = router;
