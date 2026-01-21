const express = require('express');
const router = express.Router();
const productController = require("../controllers/productController");
const { protect, adminOnly } = require("../MiddleWare/Auth");

router.post('/create', protect, adminOnly, productController.createProduct);
router.put('/:id', protect, adminOnly, productController.updateProduct);
router.delete('/:id', protect, adminOnly, productController.deleteProduct);
router.patch('/:id/status', protect, adminOnly, productController.updateProductStatus);

router.get('/', productController.getAllProducts);
router.get('/search', productController.searchProducts);
router.get('/category/:categoryId', productController.getProductsByCategory);
router.get('/:id', productController.getProductById);

module.exports = router;
