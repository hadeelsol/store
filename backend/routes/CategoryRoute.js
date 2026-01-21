const express = require('express');
const router = express.Router();
const CategoryController = require('../controllers/categoriesController');
const { protect, adminOnly } = require('../MiddleWare/Auth');


router.get('/', CategoryController.getAllCategories);          
router.get('/active', CategoryController.getActiveCategories); 


router.post('/create',protect, adminOnly,CategoryController.createCategories);     
router.put('/:id', protect, adminOnly,CategoryController.updateCategory);           
router.delete('/:id', protect, adminOnly,CategoryController.deleteCategories);        

module.exports = router;
