const express = require('express');
const categoryController = require('../controllers/categoryController');

const router = express.Router();


// Allow all authenticated users to fetch categories
router.get('/', categoryController.getAllCategories);



router.post('/', categoryController.addCategory);
router.put('/:id', categoryController.updateCategory);
router.delete('/:id', categoryController.deleteCategory);


module.exports = router;