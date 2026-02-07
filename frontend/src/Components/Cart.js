// frontend/src/pages/Cart.js
import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { authService } from '../Components/auth';

import './Cart.css';

// Image fallbacks
const IMAGE_FALLBACKS = {
  default: 'https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?w=200&h=200&fit=crop',
  fruits: 'https://images.unsplash.com/photo-1610832958506-aa56368176cf?w=200&h=200&fit=crop',
  vegetables: 'https://images.unsplash.com/photo-1597362925123-77861d3fbac7?w=200&h=200&fit=crop',
  meat: 'https://images.unsplash.com/photo-1607623814075-e51df1bdc82f?w=200&h=200&fit=crop',
  chicken: 'https://images.unsplash.com/photo-1604503468506-a8da13d82791?w=200&h=200&fit=crop',
  cheese: 'https://images.unsplash.com/photo-1486297678162-eb2a19b0a32d?w=200&h=200&fit=crop',
  dairy: 'https://images.unsplash.com/photo-1550583721-58731aebf5c5?w=200&h=200&fit=crop'
};

// Function to get proper image URL from backend
const getProductImage = (item) => {
  console.log('🖼️ Getting image for item:', item);
  
  // Priority 1: Check if image exists in item.product.image
  if (item.product?.image) {
    const image = item.product.image;
    console.log('📷 Found image in item.product.image:', image);
    
    // Handle relative URLs
    if (image && !image.startsWith('http')) {
      const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000';
      const fullUrl = `${API_URL}${image.startsWith('/') ? '' : '/'}${image}`;
      console.log('🔄 Converted relative URL to:', fullUrl);
      return fullUrl;
    }
    return image;
  }
  
  // Priority 2: Check if image exists in item.product.images array
  if (item.product?.images && item.product.images.length > 0) {
    const image = item.product.images[0];
    console.log('📷 Found image in item.product.images[0]:', image);
    
    // Handle relative URLs
    if (image && !image.startsWith('http')) {
      const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000';
      const fullUrl = `${API_URL}${image.startsWith('/') ? '' : '/'}${image}`;
      console.log('🔄 Converted relative URL to:', fullUrl);
      return fullUrl;
    }
    return image;
  }
  
  // Priority 3: Check if image exists directly in item.image
  if (item.image) {
    const image = item.image;
    console.log('📷 Found image in item.image:', image);
    
    // Handle relative URLs
    if (image && !image.startsWith('http')) {
      const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000';
      const fullUrl = `${API_URL}${image.startsWith('/') ? '' : '/'}${image}`;
      console.log('🔄 Converted relative URL to:', fullUrl);
      return fullUrl;
    }
    return image;
  }
  
  // Priority 4: Fallback based on category
  const categoryName = item.product?.category?.name?.toLowerCase() || '';
  console.log('🔍 Category for fallback:', categoryName);
  
  if (categoryName.includes('fruit')) {
    console.log('🍎 Using fruits fallback image');
    return IMAGE_FALLBACKS.fruits;
  }
  if (categoryName.includes('vegetable')) {
    console.log('🥕 Using vegetables fallback image');
    return IMAGE_FALLBACKS.vegetables;
  }
  if (categoryName.includes('meat') || categoryName.includes('beef')) {
    console.log('🥩 Using meat fallback image');
    return IMAGE_FALLBACKS.meat;
  }
  if (categoryName.includes('chicken')) {
    console.log('🍗 Using chicken fallback image');
    return IMAGE_FALLBACKS.chicken;
  }
  if (categoryName.includes('cheese')) {
    console.log('🧀 Using cheese fallback image');
    return IMAGE_FALLBACKS.cheese;
  }
  if (categoryName.includes('dairy') || categoryName.includes('milk')) {
    console.log('🥛 Using dairy fallback image');
    return IMAGE_FALLBACKS.dairy;
  }
  
  console.log('⚠️ Using default fallback image');
  return IMAGE_FALLBACKS.default;
};

// Handle image error
const handleImageError = (e) => {
  console.error('❌ Image failed to load:', e.target.src);
  e.target.src = IMAGE_FALLBACKS.default;
  e.target.onerror = null; // Prevent infinite loop
};

const Cart = () => {
  const navigate = useNavigate();
  const isAuthenticated = authService.isAuthenticated();
  const currentUser = authService.getCurrentUser();
  
  // Cart state
  const [cart, setCart] = useState({
    items: [],
    subtotal: 0,
    shipping: 0,
    tax: 0,
    total: 0
  });
  
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [updating, setUpdating] = useState({});
  const [promoCode, setPromoCode] = useState('');
  const [discount, setDiscount] = useState(0);
  const [selectedItems, setSelectedItems] = useState(new Set());

  // Calculate cart summary
  const cartCount = cart.items?.reduce((total, item) => total + item.quantity, 0) || 0;
  const discountAmount = cart.subtotal * (discount / 100);
  const grandTotal = cart.total - discountAmount;

  // Fetch cart data from backend
  useEffect(() => {
    if (!isAuthenticated) {
      navigate('/login');
      return;
    }
    
    fetchCart();
  }, [isAuthenticated, navigate]);

  const fetchCart = async () => {
    setLoading(true);
    setError('');
    
    try {
      console.log('🛒 Fetching cart data...');
      const token = localStorage.getItem('token');
      
      if (!token) {
        throw new Error('No authentication token found');
      }
      
      console.log('🔑 Token exists:', token.substring(0, 20) + '...');
      
      const response = await fetch('/api/cart', {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      
      console.log('📥 Cart response status:', response.status);
      
      if (!response.ok) {
        const errorText = await response.text();
        console.error('❌ Cart fetch error:', errorText);
        throw new Error(`HTTP error! status: ${response.status}, message: ${errorText}`);
      }
      
      const result = await response.json();
      console.log('✅ Cart data received:', result);
      
      if (result.success) {
        const cartData = result.data || { items: [], subtotal: 0, shipping: 0, tax: 0, total: 0 };
        console.log('📊 Cart items:', cartData.items);
        
        setCart(cartData);
        
        // Initialize selected items
        const itemIds = cartData.items?.map(item => item._id) || [];
        setSelectedItems(new Set(itemIds));
        
        // Log image URLs for debugging
        cartData.items?.forEach((item, index) => {
          console.log(`📸 Item ${index} image info:`, {
            name: item.product?.name,
            image: item.product?.image,
            images: item.product?.images,
            category: item.product?.category?.name
          });
          const imageUrl = getProductImage(item);
          console.log(`🖼️ Item ${index} final image URL:`, imageUrl);
        });
      } else {
        console.error('❌ Cart fetch failed:', result.message);
        setError(result.message || 'Failed to load cart');
      }
    } catch (error) {
      console.error('❌ Error fetching cart:', error);
      setError(`Unable to load cart: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  // Add item to cart
  const addToCart = async (productId, quantity = 1) => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch('/api/cart/add', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ productId, quantity })
      });
      
      const result = await response.json();
      
      if (result.success) {
        setCart(result.data);
        fetchCart(); // Refresh cart
        return { success: true };
      } else {
        return { success: false, message: result.message };
      }
    } catch (error) {
      console.error('Error adding to cart:', error);
      return { success: false, message: 'Failed to add item to cart' };
    }
  };

  // Update item quantity
  const updateQuantity = async (itemId, newQuantity) => {
    if (newQuantity < 1) {
      removeFromCart(itemId);
      return;
    }
    
    setUpdating(prev => ({ ...prev, [itemId]: true }));
    
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`/api/cart/item/${itemId}`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ quantity: newQuantity })
      });
      
      const result = await response.json();
      
      if (result.success) {
        setCart(result.data);
      } else {
        alert(result.message || 'Failed to update quantity');
      }
    } catch (error) {
      console.error('Error updating quantity:', error);
      alert('Failed to update quantity');
    } finally {
      setUpdating(prev => ({ ...prev, [itemId]: false }));
    }
  };

  // Remove item from cart
  const removeFromCart = async (itemId) => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`/api/cart/item/${itemId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      
      const result = await response.json();
      
      if (result.success) {
        setCart(result.data);
        // Remove from selected items
        setSelectedItems(prev => {
          const newSet = new Set(prev);
          newSet.delete(itemId);
          return newSet;
        });
      } else {
        alert(result.message || 'Failed to remove item');
      }
    } catch (error) {
      console.error('Error removing from cart:', error);
      alert('Failed to remove item from cart');
    }
  };

  // Clear entire cart
  const clearCart = async () => {
    if (!window.confirm('Are you sure you want to clear your cart?')) {
      return;
    }
    
    try {
      const token = localStorage.getItem('token');
      const response = await fetch('/api/cart/clear', {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      
      const result = await response.json();
      
      if (result.success) {
        setCart({ items: [], subtotal: 0, shipping: 0, tax: 0, total: 0 });
        setSelectedItems(new Set());
        alert('Cart cleared successfully');
      } else {
        alert(result.message || 'Failed to clear cart');
      }
    } catch (error) {
      console.error('Error clearing cart:', error);
      alert('Failed to clear cart');
    }
  };

  // Toggle item selection
  const toggleItemSelection = (itemId) => {
    setSelectedItems(prev => {
      const newSet = new Set(prev);
      if (newSet.has(itemId)) {
        newSet.delete(itemId);
      } else {
        newSet.add(itemId);
      }
      return newSet;
    });
  };

  // Select all items
  const selectAllItems = () => {
    if (selectedItems.size === cart.items?.length) {
      setSelectedItems(new Set());
    } else {
      const allItemIds = cart.items?.map(item => item._id) || [];
      setSelectedItems(new Set(allItemIds));
    }
  };

  // Remove selected items
  const removeSelectedItems = () => {
    const selectedIds = Array.from(selectedItems);
    if (selectedIds.length === 0) return;
    
    if (!window.confirm(`Remove ${selectedIds.length} item(s) from cart?`)) {
      return;
    }
    
    selectedIds.forEach(itemId => {
      removeFromCart(itemId);
    });
  };

  // Calculate selected items total
  const selectedTotal = cart.items
    ?.filter(item => selectedItems.has(item._id))
    ?.reduce((total, item) => {
      const itemTotal = (item.price || 0) * (item.quantity || 1);
      return total + itemTotal;
    }, 0) || 0;

  // Apply promo code
  const applyPromoCode = () => {
    if (!promoCode.trim()) {
      alert('Please enter a promo code');
      return;
    }
    
    const validCodes = {
      'SAVE10': 10,
      'WELCOME20': 20,
      'FREESHIP': 0 // Free shipping
    };
    
    if (validCodes[promoCode.toUpperCase()]) {
      const discountPercent = validCodes[promoCode.toUpperCase()];
      setDiscount(discountPercent);
      if (discountPercent === 0) {
        alert('🎉 Free shipping applied!');
      } else {
        alert(`✅ Promo code applied! ${discountPercent}% discount added.`);
      }
    } else {
      alert('Invalid promo code');
    }
  };

  // Handle checkout
  const handleCheckout = () => {
    if (cart.items?.length === 0) {
      alert('Your cart is empty!');
      return;
    }
    
    navigate('/checkout');
  };

  // Format price
  const formatPrice = (price) => {
    if (!price && price !== 0) return '$0.00';
    return `$${parseFloat(price).toFixed(2)}`;
  };

  const handleLogout = () => {
    authService.logout();
    navigate('/');
  };

  if (!isAuthenticated) {
    return null;
  }

  return (
    <div className="cart-page">
      {/* Navigation Bar */}
      <nav className="navbar">
        <div className="navbar-container">
          <div className="navbar-logo">
            <Link to="/" className="logo-link">
              <span className="logo-icon">🛒</span>
              <span className="logo-text">NexusMart</span>
            </Link>
          </div>

          <div className="navbar-links">
            <Link to="/" className="nav-link">Home</Link>
            <Link to="/products" className="nav-link">Products</Link>
            <Link to="/categories" className="nav-link">Categories</Link>
            <Link to="/cart" className="nav-link active">Cart ({cartCount})</Link>
          </div>

          <div className="navbar-auth">
            {isAuthenticated ? (
              <>
                <span className="welcome-text">
                  Welcome, {currentUser?.name || 'User'}!
                </span>
                
                <Link to="/orders" className="auth-btn orders-btn">
                  <span className="btn-icon">📦</span>
                  My Orders
                </Link>
                
                <button onClick={handleLogout} className="auth-btn logout-btn">
                  <span className="btn-icon">🚪</span>
                  Logout
                </button>
              </>
            ) : (
              <>
                <Link to="/login" className="auth-btn login-btn">
                  <span className="btn-icon">🔐</span>
                  Login
                </Link>
                <Link to="/register" className="auth-btn register-btn">
                  <span className="btn-icon">📝</span>
                  Register
                </Link>
              </>
            )}
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <main className="cart-main">
        {/* Page Header */}
        <div className="page-header">
          <h1 className="page-title">Shopping Cart</h1>
          <p className="page-subtitle">
            Review and manage your items before checkout
          </p>
        </div>

        {/* Cart Content */}
        <div className="cart-content">
          {loading ? (
            <div className="loading-state">
              <div className="loading-spinner"></div>
              <p>Loading your cart...</p>
            </div>
          ) : error ? (
            <div className="error-state">
              <div className="error-icon">⚠️</div>
              <h3>Unable to Load Cart</h3>
              <p>{error}</p>
              <button onClick={fetchCart} className="retry-btn">
                Try Again
              </button>
            </div>
          ) : cart.items?.length > 0 ? (
            <div className="cart-layout">
              {/* Cart Items Section */}
              <div className="cart-items-section">
                {/* Cart Header */}
                <div className="cart-header">
                  <div className="cart-header-left">
                    <input
                      type="checkbox"
                      id="select-all"
                      checked={cart.items?.length > 0 && selectedItems.size === cart.items.length}
                      onChange={selectAllItems}
                      className="select-all-checkbox"
                    />
                    <label htmlFor="select-all" className="select-all-label">
                      Select All ({selectedItems.size}/{cart.items?.length || 0})
                    </label>
                  </div>
                  <div className="cart-header-right">
                    <button 
                      onClick={removeSelectedItems}
                      disabled={selectedItems.size === 0}
                      className="remove-selected-btn"
                    >
                      Remove Selected
                    </button>
                    <button 
                      onClick={clearCart}
                      className="clear-cart-btn"
                    >
                      Clear Cart
                    </button>
                  </div>
                </div>

                {/* Cart Items List */}
                <div className="cart-items-list">
                  {cart.items?.map((item) => {
                    const imageUrl = getProductImage(item);
                    console.log(`🖼️ Rendering item "${item.product?.name}" with image:`, imageUrl);
                    
                    return (
                      <div key={item._id} className="cart-item-card">
                        <div className="cart-item-left">
                          <input
                            type="checkbox"
                            checked={selectedItems.has(item._id)}
                            onChange={() => toggleItemSelection(item._id)}
                            className="item-checkbox"
                          />
                          
                          <div className="cart-item-image">
                            <img 
                              src={imageUrl} 
                              alt={item.product?.name || 'Product'}
                              onError={handleImageError}
                              onLoad={() => console.log(`✅ Image loaded for ${item.product?.name}`)}
                            />
                          </div>
                          
                          <div className="cart-item-info">
                            <h4 className="item-name">
                              {item.product?.name || 'Product'}
                            </h4>
                            <p className="item-category">
                              {item.product?.category?.name || 'General'}
                            </p>
                            {item.product?.description && (
                              <p className="item-description">
                                {item.product.description.substring(0, 100)}...
                              </p>
                            )}
                          </div>
                        </div>

                        <div className="cart-item-right">
                          <div className="item-price-section">
                            <span className="item-current-price">
                              {formatPrice(item.price || 0)}
                            </span>
                            <span className="item-price-label">per item</span>
                          </div>

                          <div className="quantity-controls">
                            <button
                              onClick={() => updateQuantity(item._id, (item.quantity || 1) - 1)}
                              disabled={updating[item._id] || (item.quantity || 1) <= 1}
                              className="quantity-btn minus-btn"
                            >
                              −
                            </button>
                            <span className="quantity-display">
                              {item.quantity || 1}
                            </span>
                            <button
                              onClick={() => updateQuantity(item._id, (item.quantity || 1) + 1)}
                              disabled={updating[item._id]}
                              className="quantity-btn plus-btn"
                            >
                              +
                            </button>
                          </div>

                          <div className="item-subtotal">
                            <span className="subtotal-label">Subtotal:</span>
                            <span className="subtotal-amount">
                              {formatPrice((item.price || 0) * (item.quantity || 1))}
                            </span>
                          </div>

                          <button
                            onClick={() => removeFromCart(item._id)}
                            className="remove-item-btn"
                          >
                            🗑️ Remove
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Order Summary Section */}
              <div className="order-summary-section">
                <div className="order-summary-card">
                  <h3 className="summary-title">Order Summary</h3>
                  
                  <div className="summary-items">
                    <div className="summary-row">
                      <span>Subtotal ({cartCount} items):</span>
                      <span>{formatPrice(cart.subtotal)}</span>
                    </div>
                    <div className="summary-row">
                      <span>Shipping:</span>
                      <span>
                        {cart.shipping === 0 ? (
                          <span className="free-shipping">FREE</span>
                        ) : (
                          formatPrice(cart.shipping)
                        )}
                      </span>
                    </div>
                    <div className="summary-row">
                      <span>Tax:</span>
                      <span>{formatPrice(cart.tax)}</span>
                    </div>
                    
                    {discount > 0 && (
                      <div className="summary-row discount-row">
                        <span>Discount ({discount}%):</span>
                        <span className="discount-amount">-{formatPrice(discountAmount)}</span>
                      </div>
                    )}
                    
                    {cart.subtotal < 50 && (
                      <div className="free-shipping-note">
                        🚚 Add {formatPrice(50 - cart.subtotal)} more for FREE shipping!
                      </div>
                    )}
                    
                    <div className="summary-divider"></div>
                    
                    <div className="summary-total">
                      <span>Total:</span>
                      <span className="total-amount">{formatPrice(grandTotal)}</span>
                    </div>
                    
                    {selectedTotal > 0 && (
                      <div className="selected-items-total">
                        <small>
                          Selected items: {formatPrice(selectedTotal)}
                        </small>
                      </div>
                    )}
                  </div>

                  <div className="summary-actions">
                    <button
                      onClick={handleCheckout}
                      disabled={cart.items?.length === 0}
                      className="checkout-btn"
                    >
                      🛒 Proceed to Checkout
                    </button>
                    
                    <Link to="/products" className="continue-shopping-btn">
                      ← Continue Shopping
                    </Link>
                  </div>

                  {/* Payment Methods */}
                  <div className="payment-methods">
                    <h4>Accepted Payment Methods</h4>
                    <div className="payment-icons">
                      <span className="payment-icon" title="Cash">💰</span>
                    </div>
                  </div>
                </div>

             
              </div>
            </div>
          ) : (
            <div className="empty-cart">
              <div className="empty-cart-icon">🛒</div>
              <h3>Your cart is empty</h3>
              <p>Looks like you haven't added any items to your cart yet.</p>
              <div className="empty-cart-actions">
                <Link to="/products" className="btn shop-now-btn">
                  Start Shopping →
                </Link>
                <Link to="/" className="btn home-btn">
                  ← Back to Home
                </Link>
              </div>
            </div>
          )}
        </div>
      </main>

      {/* Footer */}
      <footer className="cart-footer">
        <div className="footer-content">
          <div className="footer-section">
            <h3 className="footer-title">NexusMart</h3>
            <p className="footer-text">
              Your trusted online shopping destination
            </p>
          </div>
          <div className="footer-section">
            <h4 className="footer-subtitle">Quick Links</h4>
            <Link to="/" className="footer-link">Home</Link>
            <Link to="/products" className="footer-link">Products</Link>
            <Link to="/categories" className="footer-link">Categories</Link>
            <Link to="/cart" className="footer-link">My Cart ({cartCount})</Link>
          </div>
          <div className="footer-section">
            <h4 className="footer-subtitle">Shopping Help</h4>
            <Link to="/shipping" className="footer-link">Shipping Info</Link>
            <Link to="/returns" className="footer-link">Returns & Exchanges</Link>
            <Link to="/faq" className="footer-link">FAQ</Link>
            <Link to="/contact" className="footer-link">Contact Support</Link>
          </div>
        </div>
        <div className="footer-bottom">
          <p>&copy; {new Date().getFullYear()} NexusMart. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
};

export default Cart;
