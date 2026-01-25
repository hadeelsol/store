// routes/orderRoutes.js
const express = require('express');
const router = express.Router();
const orderController = require('../controllers/orderController');
const { protect, adminOnly } = require('../MiddleWare/Auth');


router.use(protect);

router.post('/checkout', orderController.createOrder);  // Customer creates order
router.get('/my-orders', orderController.getMyOrders);  // Customer sees their orders

// Admin routes
router.get('/admin/all', protect, adminOnly, orderController.getAllOrders);     // Admin sees all orders
router.get('/admin/:id', protect, adminOnly, orderController.getOrderById);    // Admin sees specific order
router.put('/admin/:id/status', protect, adminOnly, orderController.updateOrderStatus); // Admin updates status

module.exports = router;
