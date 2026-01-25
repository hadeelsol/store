// models/cartSchema.js
const mongoose = require('mongoose');

const cartSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    unique: true  
  },
  items: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'CartItem'
  }],
  subtotal: {
    type: Number,
    default: 0
  },
  shipping: {
    type: Number,
    default: 0
  },
  total: {
    type: Number,
    default: 0
  }
}, {
  timestamps: true
});

cartSchema.pre('save', async function(next) {
  try {
    const CartItem = mongoose.model('CartItem');
    const cartItems = await CartItem.find({ _id: { $in: this.items } });
    
    this.subtotal = cartItems.reduce((sum, item) => {
      return sum + (item.finalPrice * item.quantity);
    }, 0);
    
    this.total = this.subtotal + this.shipping;
  
  } catch (error) {
    console.error('Cart save error:', error);
  }
});

module.exports = mongoose.model('Cart', cartSchema);
