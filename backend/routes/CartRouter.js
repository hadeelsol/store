const express = require('express');
const router = express.Router();
const cartController = require('../controllers/cartController');
const { protect } = require('../MiddleWare/Auth');

router.use(protect);

// Cart routes
router.get('/', cartController.getCart);                      // GET /api/cart
router.get('/count', cartController.getCartItemCount);        // GET /api/cart/count
router.post('/add', cartController.addToCart);                // POST /api/cart/add
router.put('/item/:itemId', cartController.updateCartItem);   // PUT /api/cart/item/:itemId
router.delete('/item/:itemId', cartController.removeFromCart);// DELETE /api/cart/item/:itemId
router.delete('/clear', cartController.clearCart);            // DELETE /api/cart/clear
router.put('/shipping', cartController.updateShipping);       // PUT /api/cart/shipping

module.exports = router;
