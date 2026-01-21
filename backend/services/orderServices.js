// services/orderServices.js
const mongoose = require('mongoose');
const Order = require('../models/orderSchema');
const OrderItem = require('../models/orderItemSchema');
const Cart = require('../models/cartSchema');
const CartItem = require('../models/cartItemSchema');
const Product = require('../models/productSchema');

// Customer creates order from cart
async function createOrderFromCart(userId, orderData) {
  try {
    // Get user's cart
    const cart = await Cart.findOne({ user: userId })
      .populate({
        path: 'items',
        populate: {
          path: 'product',
          select: 'name price discount quantity'
        }
      });
    
    if (!cart || cart.items.length === 0) {
      throw new Error('Cart is empty');
    }
    
    // Check stock availability
    for (const item of cart.items) {
      const product = await Product.findById(item.product._id);
      if (product.quantity < item.quantity) {
        throw new Error(`Insufficient stock for ${product.name}. Only ${product.quantity} available.`);
      }
    }
    
    // Create order
    const order = new Order({
      user: userId,
      subtotal: cart.subtotal,
      shipping: cart.shipping,
      total: cart.total,
      deliveryAddress: orderData.deliveryAddress,
      customerPhone: orderData.customerPhone,
      customerNotes: orderData.customerNotes
    });
    
    // Save order first to get ID
    const savedOrder = await order.save();
    
    // Create order items and reduce stock
    const orderItems = [];
    for (const cartItem of cart.items) {
      // Create order item
      const orderItem = new OrderItem({
        product: cartItem.product._id,
        quantity: cartItem.quantity,
        price: cartItem.price,
        discount: cartItem.discount,
        order: savedOrder._id
      });
      
      const savedOrderItem = await orderItem.save();
      orderItems.push(savedOrderItem._id);
      
      // Reduce product stock
      await Product.findByIdAndUpdate(
        cartItem.product._id,
        { $inc: { quantity: -cartItem.quantity } }
      );
    }
    
    // Update order with order items
    savedOrder.items = orderItems;
    await savedOrder.save();
    
    // Clear cart
    await CartItem.deleteMany({ user: userId });
    cart.items = [];
    cart.subtotal = 0;
    cart.total = 0;
    await cart.save();
    
    // Return populated order
    return await Order.findById(savedOrder._id)
      .populate({
        path: 'items',
        populate: {
          path: 'product',
          select: 'name price images'
        }
      })
      .populate('user', 'name email');
      
  } catch (error) {
    console.error('Create order error:', error);
    throw error;
  }
}

// Customer gets their own orders
async function getCustomerOrders(userId) {
  try {
    const orders = await Order.find({ user: userId })
      .populate({
        path: 'items',
        populate: {
          path: 'product',
          select: 'name images'
        }
      })
      .sort({ createdAt: -1 });
    
    return orders;
  } catch (error) {
    console.error('Get customer orders error:', error);
    throw error;
  }
}

// Admin: Get all orders
async function getAllOrders({ page = 1, limit = 20, status = null }) {
  try {
    const skip = (page - 1) * limit;
    const filter = {};
    
    if (status) filter.orderStatus = status;
    
    const orders = await Order.find(filter)
      .skip(skip)
      .limit(limit)
      .populate('user', 'name email phone')
      .populate({
        path: 'items',
        populate: {
          path: 'product',
          select: 'name price'
        }
      })
      .sort({ createdAt: -1 });
    
    const total = await Order.countDocuments(filter);
    
    return {
      orders,
      total,
      page,
      pages: Math.ceil(total / limit)
    };
  } catch (error) {
    console.error('Get all orders error:', error);
    throw error;
  }
}

// Admin: Get order by ID
async function getOrderById(orderId) {
  try {
    const order = await Order.findById(orderId)
      .populate('user', 'name email phone')
      .populate({
        path: 'items',
        populate: {
          path: 'product',
          select: 'name price images description'
        }
      });
    
    if (!order) throw new Error('Order not found');
    
    return order;
  } catch (error) {
    console.error('Get order by ID error:', error);
    throw error;
  }
}

// Admin: Update order status
async function updateOrderStatus(orderId, status) {
  try {
    const updateData = { orderStatus: status };
    
    // If delivered, set deliveredAt
    if (status === 'delivered') {
      updateData.deliveredAt = new Date();
    }
    
    const order = await Order.findByIdAndUpdate(
      orderId,
      updateData,
      { new: true, runValidators: true }
    ).populate('user', 'name email');
    
    if (!order) throw new Error('Order not found');
    
    return order;
  } catch (error) {
    console.error('Update order status error:', error);
    throw error;
  }
}

module.exports = {
  createOrderFromCart,
  getCustomerOrders,
  getAllOrders,
  getOrderById,
  updateOrderStatus
};
