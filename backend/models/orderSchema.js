// models/orderSchema.js
const mongoose = require('mongoose');

const orderSchema = new mongoose.Schema({
  orderNumber: {
    type: String,
    required: true,
    unique: true
  },
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  items: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'OrderItem'
  }],
  subtotal: {
    type: Number,
    required: true
  },
  shipping: {
    type: Number,
    default: 0
  },
  total: {
    type: Number,
    required: true
  },
  deliveryAddress: {
    type: String,
    required: true
  },
  customerPhone: {
    type: String,
    required: true
  },
  customerNotes: {
    type: String
  },
  orderStatus: {
    type: String,
    enum: ['pending', 'confirmed', 'preparing', 'on_the_way', 'delivered', 'cancelled'],
    default: 'pending'
  },
  estimatedDelivery: {
    type: Date
  },
  deliveredAt: {
    type: Date
  }
}, {
  timestamps: true
});

// Generate order number before saving
orderSchema.pre('save', function(next) {
  if (!this.orderNumber) {
    const date = new Date();
    const year = date.getFullYear().toString().slice(-2);
    const month = (date.getMonth() + 1).toString().padStart(2, '0');
    const day = date.getDate().toString().padStart(2, '0');
    const random = Math.floor(Math.random() * 10000).toString().padStart(4, '0');
    this.orderNumber = `ORD${year}${month}${day}${random}`;
  }
  next();
});

// Calculate delivery time (30-60 minutes)
orderSchema.pre('save', function(next) {
  if (this.isNew && !this.estimatedDelivery) {
    const now = new Date();
    const deliveryTime = 30 + Math.floor(Math.random() * 30); // 30-60 minutes
    this.estimatedDelivery = new Date(now.getTime() + deliveryTime * 60000);
  }
  next();
});

module.exports = mongoose.model('Order', orderSchema);
