// controllers/cartController.js
const CartService = require('../services/cartServices');

// 1. Get user's cart
const getCartController = async (req, res) => {
  try {
    const cart = await CartService.getCart(req.user._id);
    
    return res.status(200).json({
      success: true,
      data: cart
    });
  } catch (error) {
    console.error('Get cart error:', error);
    return res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// 2. Add item to cart
const addToCart = async (req, res) => {
  try {
    const { productId, quantity } = req.body;
    
    if (!productId) {
      return res.status(400).json({
        success: false,
        message: 'Product ID is required'
      });
    }
    
    const cart = await CartService.addItem(
      req.user._id,
      productId,
      quantity || 1
    );
    
    return res.status(200).json({
      success: true,
      message: 'Item added to cart',
      data: cart
    });
  } catch (error) {
    console.error('Add to cart error:', error);
    return res.status(400).json({
      success: false,
      message: error.message
    });
  }
};

// 3. Update cart item quantity
const updateCartItem = async (req, res) => {
  try {
    const { itemId } = req.params;
    const { quantity } = req.body;
    
    if (!quantity || quantity < 1) {
      return res.status(400).json({
        success: false,
        message: 'Valid quantity is required (minimum 1)'
      });
    }
    
    const cart = await CartService.updateItem(
      req.user._id,
      itemId,
      quantity
    );
    
    return res.status(200).json({
      success: true,
      message: 'Cart item updated',
      data: cart
    });
  } catch (error) {
    console.error('Update cart item error:', error);
    return res.status(400).json({
      success: false,
      message: error.message
    });
  }
};

// 4. Remove item from cart
const removeFromCart = async (req, res) => {
  try {
    const { itemId } = req.params;
    
    const cart = await CartService.removeItem(req.user._id, itemId);
    
    return res.status(200).json({
      success: true,
      message: 'Item removed from cart',
      data: cart
    });
  } catch (error) {
    console.error('Remove from cart error:', error);
    return res.status(400).json({
      success: false,
      message: error.message
    });
  }
};

// 5. Clear cart (remove all items)
const clearCartController = async (req, res) => {
  try {
    const cart = await CartService.clearCart(req.user._id);
    
    return res.status(200).json({
      success: true,
      message: 'Cart cleared successfully',
      data: cart
    });
  } catch (error) {
    console.error('Clear cart error:', error);
    return res.status(400).json({
      success: false,
      message: error.message
    });
  }
};

// 6. Update shipping cost
const updateShippingController = async (req, res) => {
  try {
    const { shipping } = req.body;
    
    if (shipping === undefined || shipping < 0) {
      return res.status(400).json({
        success: false,
        message: 'Valid shipping cost is required'
      });
    }
    
    const cart = await CartService.updateShipping(
      req.user._id,
      shipping
    );
    
    return res.status(200).json({
      success: true,
      message: 'Shipping cost updated',
      data: cart
    });
  } catch (error) {
    console.error('Update shipping error:', error);
    return res.status(400).json({
      success: false,
      message: error.message
    });
  }
};

// 7. Get cart item count
const getCartItemCount = async (req, res) => {
  try {
    const count = await CartService.getItemCount(req.user._id);
    
    return res.status(200).json({
      success: true,
      count: count
    });
  } catch (error) {
    console.error('Get cart count error:', error);
    return res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

module.exports = {
  getCart: getCartController,
  addToCart,
  updateCartItem,
  removeFromCart,
  clearCart: clearCartController,
  updateShipping: updateShippingController,
  getCartItemCount
};
