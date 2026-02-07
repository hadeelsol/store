// frontend/src/Components/cartService.js
const API_URL = process.env.REACT_APP_API_URL || '/api';

const cartService = {
  // Get user's cart
  getCart: async () => {
    const token = localStorage.getItem('token');
    if (!token) {
      throw new Error('No authentication token found. Please login.');
    }
    
    try {
      const response = await fetch(`${API_URL}/cart`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      
      if (!response.ok) {
        if (response.status === 401) {
          localStorage.removeItem('token');
          throw new Error('Session expired. Please login again.');
        }
        const error = await response.text();
        throw new Error(`Failed to fetch cart: ${error}`);
      }
      
      return await response.json();
    } catch (error) {
      console.error('❌ Error in getCart:', error);
      throw error;
    }
  },

  // Add item to cart
  addToCart: async (productId, quantity = 1) => {
    const token = localStorage.getItem('token');
    if (!token) {
      throw new Error('No authentication token found. Please login.');
    }
    
    try {
      const response = await fetch(`${API_URL}/cart/add`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ productId, quantity })
      });
      
      if (!response.ok) {
        if (response.status === 401) {
          localStorage.removeItem('token');
          throw new Error('Session expired. Please login again.');
        }
        const error = await response.text();
        throw new Error(`Failed to add to cart: ${error}`);
      }
      
      return await response.json();
    } catch (error) {
      console.error('❌ Error in addToCart:', error);
      throw error;
    }
  },

  // Update cart item quantity
  updateCartItem: async (itemId, quantity) => {
    const token = localStorage.getItem('token');
    if (!token) {
      throw new Error('No authentication token found. Please login.');
    }
    
    if (quantity < 1) {
      throw new Error('Quantity must be at least 1');
    }
    
    try {
      const response = await fetch(`${API_URL}/cart/item/${itemId}`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ quantity })
      });
      
      if (!response.ok) {
        if (response.status === 401) {
          localStorage.removeItem('token');
          throw new Error('Session expired. Please login again.');
        }
        const error = await response.text();
        throw new Error(`Failed to update cart: ${error}`);
      }
      
      return await response.json();
    } catch (error) {
      console.error('❌ Error in updateCartItem:', error);
      throw error;
    }
  },

  // Remove item from cart
  removeFromCart: async (itemId) => {
    const token = localStorage.getItem('token');
    if (!token) {
      throw new Error('No authentication token found. Please login.');
    }
    
    try {
      const response = await fetch(`${API_URL}/cart/item/${itemId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      
      if (!response.ok) {
        if (response.status === 401) {
          localStorage.removeItem('token');
          throw new Error('Session expired. Please login again.');
        }
        const error = await response.text();
        throw new Error(`Failed to remove from cart: ${error}`);
      }
      
      return await response.json();
    } catch (error) {
      console.error('❌ Error in removeFromCart:', error);
      throw error;
    }
  },

  // Clear cart
  clearCart: async () => {
    const token = localStorage.getItem('token');
    if (!token) {
      throw new Error('No authentication token found. Please login.');
    }
    
    try {
      const response = await fetch(`${API_URL}/cart/clear`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      
      if (!response.ok) {
        if (response.status === 401) {
          localStorage.removeItem('token');
          throw new Error('Session expired. Please login again.');
        }
        const error = await response.text();
        throw new Error(`Failed to clear cart: ${error}`);
      }
      
      return await response.json();
    } catch (error) {
      console.error('❌ Error in clearCart:', error);
      throw error;
    }
  },

  // Get cart count
  getCartCount: async () => {
    const token = localStorage.getItem('token');
    if (!token) {
      console.log('⚠️ No token found, returning 0 for cart count');
      return 0;
    }
    
    try {
      const response = await fetch(`${API_URL}/cart/count`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      
      if (!response.ok) {
        // Don't throw error for count, just return 0
        console.warn(`⚠️ Failed to get cart count: ${response.status}`);
        return 0;
      }
      
      const result = await response.json();
      return result.count || result.data?.count || 0;
    } catch (error) {
      console.warn('⚠️ Error fetching cart count:', error.message);
      return 0;
    }
  },

  // Update shipping cost
  updateShipping: async (shippingCost) => {
    const token = localStorage.getItem('token');
    if (!token) {
      throw new Error('No authentication token found. Please login.');
    }
    
    try {
      const response = await fetch(`${API_URL}/cart/shipping`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ shipping: shippingCost })
      });
      
      if (!response.ok) {
        if (response.status === 401) {
          localStorage.removeItem('token');
          throw new Error('Session expired. Please login again.');
        }
        const error = await response.text();
        throw new Error(`Failed to update shipping: ${error}`);
      }
      
      return await response.json();
    } catch (error) {
      console.error('❌ Error in updateShipping:', error);
      throw error;
    }
  },

  // Get cart summary (subtotal, shipping, tax, total)
  getCartSummary: async () => {
    const token = localStorage.getItem('token');
    if (!token) {
      throw new Error('No authentication token found. Please login.');
    }
    
    try {
      const response = await fetch(`${API_URL}/cart/summary`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      
      if (!response.ok) {
        if (response.status === 401) {
          localStorage.removeItem('token');
          throw new Error('Session expired. Please login again.');
        }
        const error = await response.text();
        throw new Error(`Failed to get cart summary: ${error}`);
      }
      
      return await response.json();
    } catch (error) {
      console.error('❌ Error in getCartSummary:', error);
      throw error;
    }
  },

  // Apply promo code
  applyPromoCode: async (promoCode) => {
    const token = localStorage.getItem('token');
    if (!token) {
      throw new Error('No authentication token found. Please login.');
    }
    
    try {
      const response = await fetch(`${API_URL}/cart/promo`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ promoCode })
      });
      
      if (!response.ok) {
        if (response.status === 401) {
          localStorage.removeItem('token');
          throw new Error('Session expired. Please login again.');
        }
        const error = await response.text();
        throw new Error(`Failed to apply promo code: ${error}`);
      }
      
      return await response.json();
    } catch (error) {
      console.error('❌ Error in applyPromoCode:', error);
      throw error;
    }
  },

  // Check if item is in cart (frontend-only utility)
  isInCart: (productId, cart) => {
    if (!cart || !cart.items || !Array.isArray(cart.items)) return false;
    
    return cart.items.some(item => 
      item.product?._id === productId || 
      item.productId === productId
    );
  },

  // Get item quantity (frontend-only utility)
  getItemQuantity: (productId, cart) => {
    if (!cart || !cart.items || !Array.isArray(cart.items)) return 0;
    
    const item = cart.items.find(item => 
      item.product?._id === productId || 
      item.productId === productId
    );
    
    return item ? item.quantity : 0;
  },

  // Calculate cart total items (frontend-only utility)
  calculateCartCount: (cart) => {
    if (!cart || !cart.items || !Array.isArray(cart.items)) return 0;
    
    return cart.items.reduce((total, item) => total + (item.quantity || 1), 0);
  },

  // Calculate cart total price (frontend-only utility)
  calculateCartTotal: (cart) => {
    if (!cart || !cart.items || !Array.isArray(cart.items)) return 0;
    
    return cart.items.reduce((total, item) => {
      const price = item.discount > 0 
        ? (item.price || 0) * (100 - (item.discount || 0)) / 100
        : item.price || 0;
      return total + (price * (item.quantity || 1));
    }, 0);
  },

  // Format price (frontend-only utility)
  formatPrice: (price) => {
    if (!price && price !== 0) return '$0.00';
    return `$${parseFloat(price).toFixed(2)}`;
  }
};

export default cartService;
