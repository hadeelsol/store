// controllers/orderController.js
const orderService = require('../services/orderServices');

// Customer: Create order from cart
const createOrder = async (req, res) => {
  try {
    const { shippingAddress, paymentMethod, notes } = req.body;
    
    if (!shippingAddress || !shippingAddress.address) {
      return res.status(400).json({
        success: false,
        message: 'Shipping address is required'
      });
    }
    
    const order = await orderService.createOrderFromCart(req.user._id, {
      shippingAddress,
      paymentMethod,
      notes
    });
    
    return res.status(201).json({
      success: true,
      message: 'Order created successfully',
      data: order
    });
  } catch (error) {
    return res.status(400).json({
      success: false,
      message: error.message
    });
  }
};

// Customer: Get their orders
const getMyOrders = async (req, res) => {
  try {
    const orders = await orderService.getCustomerOrders(req.user._id);
    
    return res.status(200).json({
      success: true,
      data: orders
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// Admin: Get all orders
const getAllOrders = async (req, res) => {
  try {
    const { page, limit, status } = req.query;
    
    const result = await orderService.getAllOrders({
      page: parseInt(page) || 1,
      limit: parseInt(limit) || 20,
      status: status || null
    });
    
    return res.status(200).json({
      success: true,
      data: result
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// Admin: Get order by ID
const getOrderById = async (req, res) => {
  try {
    const order = await orderService.getOrderById(req.params.id);
    
    return res.status(200).json({
      success: true,
      data: order
    });
  } catch (error) {
    if (error.message === 'Order not found') {
      return res.status(404).json({
        success: false,
        message: 'Order not found'
      });
    }
    return res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// Admin: Update order status
const updateOrderStatus = async (req, res) => {
  try {
    const { status } = req.body;
    
    if (!status || !['processing', 'shipped', 'delivered', 'cancelled'].includes(status)) {
      return res.status(400).json({
        success: false,
        message: 'Valid status is required'
      });
    }
    
    const order = await orderService.updateOrderStatus(req.params.id, status);
    
    return res.status(200).json({
      success: true,
      message: `Order status updated to ${status}`,
      data: order
    });
  } catch (error) {
    if (error.message === 'Order not found') {
      return res.status(404).json({
        success: false,
        message: 'Order not found'
      });
    }
    return res.status(400).json({
      success: false,
      message: error.message
    });
  }
};

module.exports = {
  createOrder,
  getMyOrders,
  getAllOrders,
  getOrderById,
  updateOrderStatus
};
