const Cart = require('../models/cartSchema');
const CartItem = require('../models/cartItemSchema');
const Product = require('../models/productSchema');

async function getCart(userId) {
  try {
    let cart = await Cart.findOne({ user: userId })
      .populate({
        path: 'items',
        populate: {
          path: 'product',
          select: 'name price discount images status quantity'
        }
      });
    if (!cart) {
      cart = await createCart(userId);
    }
    return cart;
  } catch (error) {
    console.error('Get cart error:', error);
    throw error;
  }
}

async function createCart(userId) {
  try {
    const cart = new Cart({
      user: userId,
      items: [],
      subtotal: 0,
      shipping: 0,
      total: 0
    });
    return await cart.save();
  } catch (error) {
    console.error('Create cart error:', error);
    throw error;
  }
}

// Helper function to calculate cart totals
async function calculateCartTotals(cart) {
  const allCartItems = await CartItem.find({ _id: { $in: cart.items } });
  
  cart.subtotal = allCartItems.reduce((sum, item) => {
    const discountedPrice = item.price - (item.price * item.discount / 100);
    return sum + (discountedPrice * item.quantity);
  }, 0);
  
  cart.total = cart.subtotal + cart.shipping;
  return cart;
}

async function addItem(userId, productId, quantity = 1) {
  try {
    const product = await Product.findById(productId);
    if (!product) {
      throw new Error('Product not found');
    }
    if (product.status !== 'active') {
      throw new Error('Product is not available');
    }
    if (product.quantity < quantity) {
      throw new Error(`Only ${product.quantity} items available`);
    }
    
    // Get or create cart
    let cart = await Cart.findOne({ user: userId });
    if (!cart) {
      cart = await createCart(userId);
    }
    
    // Check if item already in cart
    let cartItem = await CartItem.findOne({
      user: userId,
      product: productId
    });
    
    if (cartItem) {
      cartItem.quantity += quantity;
    } else {
      cartItem = new CartItem({
        product: productId,
        quantity,
        price: product.price,
        discount: product.discount,
        user: userId
      });
    }
    
    await cartItem.save();
    
    // Add item to cart if not already there
    if (!cart.items.includes(cartItem._id)) {
      cart.items.push(cartItem._id);
    }
    
    // Calculate and update totals
    cart = await calculateCartTotals(cart);
    await cart.save();
    
    return await getCart(userId);
    
  } catch (error) {
    console.error('Add item error:', error);
    throw error;
  }
}

async function updateItem(userId, itemId, quantity) {
  try {
    if (quantity < 1) {
      throw new Error('Quantity must be at least 1');
    }
    const cartItem = await CartItem.findOne({
      _id: itemId,
      user: userId
    });
    
    if (!cartItem) {
      throw new Error('Item not found in cart');
    }
    
    // Check product stock
    const product = await Product.findById(cartItem.product);
    if (product.quantity < quantity) {
      throw new Error(`Only ${product.quantity} items available`);
    }
    
    cartItem.quantity = quantity;
    await cartItem.save();
    
    // Update cart totals
    const cart = await Cart.findOne({ user: userId });
    if (cart) {
      await calculateCartTotals(cart);
      await cart.save();
    }
    
    return await getCart(userId);  
  } catch (error) {
    console.error('Update item error:', error);
    throw error;
  }
}

async function removeItem(userId, itemId) {
  try {
    const cartItem = await CartItem.findOneAndDelete({
      _id: itemId,
      user: userId
    });
    if (!cartItem) {
      throw new Error('Item not found');
    }
    
    const cart = await Cart.findOne({ user: userId });
    if (cart) {
      cart.items = cart.items.filter(item => item.toString() !== itemId);
      await calculateCartTotals(cart);
      await cart.save();
    }
    
    return await getCart(userId);
  } catch (error) {
    console.error('Remove item error:', error);
    throw error;
  }
}

async function clearCart(userId) {
  try {
    const cart = await Cart.findOne({ user: userId });
    if (!cart) {
      throw new Error('Cart not found');
    }
    
    // Delete all cart items
    await CartItem.deleteMany({ user: userId });
    
    // Reset cart
    cart.items = [];
    cart.subtotal = 0;
    cart.total = 0;
    
    await cart.save();
    
    return cart;
    
  } catch (error) {
    console.error('Clear cart error:', error);
    throw error;
  }
}

async function updateShipping(userId, shippingCost) {
  try {
    const cart = await Cart.findOne({ user: userId });
    if (!cart) {
      throw new Error('Cart not found');
    }
    
    cart.shipping = shippingCost;
    await calculateCartTotals(cart);
    await cart.save();
    
    return await getCart(userId);
    
  } catch (error) {
    console.error('Update shipping error:', error);
    throw error;
  }
}

async function getItemCount(userId) {
  try {
    const cart = await Cart.findOne({ user: userId });
    if (!cart) return 0;
    
    return cart.items.length;
  } catch (error) {
    console.error('Get item count error:', error);
    throw error;
  }
}

module.exports = {
  getCart,
  createCart,
  addItem,
  updateItem,
  removeItem,
  clearCart,
  updateShipping,
  getItemCount
};
