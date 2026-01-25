const orderService = require('../services/orderServices');

const createOrder = async (req, res) => {
  try {
    console.log('📞 Checkout request received');
    const { deliveryAddress, customerPhone, customerNotes } = req.body;
    
    // Validation
    if (!deliveryAddress || !deliveryAddress.trim()) {
      return res.status(400).json({
        success: false,
        message: 'Delivery address is required'
      });
    }
    
    if (!customerPhone || !customerPhone.trim()) {
      return res.status(400).json({
        success: false,
        message: 'Customer phone number is required'
      });
    }
    
    console.log('📋 Order data validated');
    
    const order = await orderService.createOrderFromCart(req.user._id, {
      deliveryAddress,      
      customerPhone,        
      customerNotes       
    });
    
    console.log('✅ Order created, sending response');
    
    return res.status(201).json({
      success: true,
      message: 'Order created successfully',
      data: order
    });
  } catch (error) {
    console.error('❌ Checkout error:', error.message);
    return res.status(400).json({
      success: false,
      message: error.message
    });
  }
};

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

const updateOrderStatus = async (req, res) => {
  try {
    const { status } = req.body;
    const validStatuses = ['pending', 'confirmed', 'preparing', 'delivered', 'cancelled'];
    
    if (!status || !validStatuses.includes(status)) {
      return res.status(400).json({
        success: false,
        message: `Valid status required: ${validStatuses.join(', ')}`
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
