// frontend/src/pages/Checkout.js
import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { authService } from '../Components/auth';
import cartService from './cartServices';
import './Checkout.css';

const Checkout = () => {
  const navigate = useNavigate();
  const isAuthenticated = authService.isAuthenticated();
  const currentUser = authService.getCurrentUser();
  
  const [cart, setCart] = useState({ 
    items: [], 
    subtotal: 0, 
    shipping: 0, 
    tax: 0, 
    total: 0 
  });
  const [loading, setLoading] = useState(true);
  const [placingOrder, setPlacingOrder] = useState(false);
  const [orderPlaced, setOrderPlaced] = useState(false);
  const [orderDetails, setOrderDetails] = useState(null);
  
  // Form state
  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    phone: '',
    address: '',
    city: '',
    notes: ''
  });

  // Validation errors
  const [errors, setErrors] = useState({});

  // Fetch cart data on component mount
  useEffect(() => {
    if (!isAuthenticated) {
      navigate('/login');
      return;
    }
    
    fetchCart();
  }, [isAuthenticated, navigate]);

  // Fetch cart from backend
  const fetchCart = async () => {
    setLoading(true);
    
    try {
      const result = await cartService.getCart();
      
      if (result.success) {
        setCart(result.data);
        
        // Pre-fill form with user data
        if (currentUser) {
          setFormData(prev => ({
            ...prev,
            fullName: currentUser.name || '',
            email: currentUser.email || ''
          }));
        }
      } else {
        alert('Failed to load cart: ' + result.message);
        navigate('/cart');
      }
    } catch (error) {
      console.error('Error fetching cart:', error);
      alert('Failed to load cart. Please try again.');
      navigate('/cart');
    } finally {
      setLoading(false);
    }
  };

  // Handle input changes
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ 
      ...prev, 
      [name]: value 
    }));
    
    // Clear error for this field
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  // Validate form
  const validateForm = () => {
    const newErrors = {};
    
    if (!formData.fullName.trim()) newErrors.fullName = 'Full name is required';
    if (!formData.phone.trim()) newErrors.phone = 'Phone number is required';
    if (!formData.address.trim()) newErrors.address = 'Address is required';
    if (!formData.city.trim()) newErrors.city = 'City is required';
    
    // Basic phone validation
    if (formData.phone && !/^[\d\s\-\+\(\)]{10,}$/.test(formData.phone)) {
      newErrors.phone = 'Please enter a valid phone number (10+ digits)';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Handle place order
  const handlePlaceOrder = async () => {
    if (cart.items?.length === 0) {
      alert('Your cart is empty!');
      return;
    }
    
    if (!validateForm()) {
      alert('Please fix the errors in the form');
      return;
    }
    
    setPlacingOrder(true);
    
    try {
      const token = localStorage.getItem('token');
      
      // Prepare order data matching backend expectations
      const orderData = {
        deliveryAddress: `${formData.address}, ${formData.city}`.trim(),
        customerPhone: formData.phone,
        customerNotes: formData.notes || '',
        customerName: formData.fullName,
        customerEmail: formData.email || currentUser?.email || ''
      };
      
      console.log('Sending order data:', orderData);
      
      // Send order to backend
      const response = await fetch('/api/orders', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(orderData)
      });
      
      if (!response.ok) {
        throw new Error(`Server error: ${response.status}`);
      }
      
      const result = await response.json();
      
      if (result.success) {
        // Clear cart after successful order
        try {
          await cartService.clearCart();
        } catch (clearError) {
          console.error('Could not clear cart:', clearError);
        }
        
        // Store order details for success page
        setOrderDetails(result.data);
        setOrderPlaced(true);
      } else {
        alert(`Failed to place order: ${result.message || 'Unknown error'}`);
      }
    } catch (error) {
      console.error('Error placing order:', error);
      alert(`Failed to place order. Please try again. Error: ${error.message}`);
    } finally {
      setPlacingOrder(false);
    }
  };

  // Format price
  const formatPrice = (price) => {
    if (!price && price !== 0) return '$0.00';
    return `$${parseFloat(price).toFixed(2)}`;
  };

  // Calculate cart count
  const cartCount = cart.items?.reduce((total, item) => total + (item.quantity || 1), 0) || 0;

  if (!isAuthenticated) {
    return null;
  }

  if (loading) {
    return (
      <div className="loading-container">
        <div className="loading-spinner"></div>
        <p>Loading checkout...</p>
      </div>
    );
  }

  if (orderPlaced) {
    return (
      <div className="checkout-page">
        <nav className="navbar">
          <div className="navbar-container">
            <div className="navbar-logo">
              <Link to="/" className="logo-link">
                <span className="logo-icon">🛒</span>
                <span className="logo-text">NexusMart</span>
              </Link>
            </div>
          </div>
        </nav>

        <div className="order-success-page">
          <div className="order-success-card">
            <div className="success-icon">🎉</div>
            <h1>Order Placed Successfully!</h1>
            <p className="success-message">
              Thank you for your purchase. Your order has been confirmed.
            </p>
            
            {orderDetails && (
              <div className="order-details-summary">
                <div className="detail-row">
                  <span>Order Number:</span>
                  <strong>{orderDetails.orderNumber || `ORD-${orderDetails._id?.substring(0, 8).toUpperCase()}`}</strong>
                </div>
                <div className="detail-row">
                  <span>Total Amount:</span>
                  <strong>{formatPrice(orderDetails.totalAmount)}</strong>
                </div>
                <div className="detail-row">
                  <span>Payment Method:</span>
                  <span>Cash on Delivery</span>
                </div>
                <div className="detail-row">
                  <span>Delivery Address:</span>
                  <span>{orderDetails.deliveryAddress}</span>
                </div>
              </div>
            )}
            
            <p className="confirmation-note">
              You will receive an order confirmation email shortly.
              You can track your order in the "My Orders" section.
            </p>
            
            <div className="success-actions">
              <Link to="/orders" className="btn view-orders-btn">
                View My Orders
              </Link>
              <Link to="/products" className="btn continue-shopping-btn">
                Continue Shopping
              </Link>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="checkout-page">
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
            <Link to="/cart" className="nav-link">Cart ({cartCount})</Link>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <main className="checkout-main">
        <div className="page-header">
          <h1 className="page-title">Checkout</h1>
          <p className="page-subtitle">Complete your purchase</p>
        </div>

        <div className="checkout-content">
          <div className="checkout-layout">
            {/* Left Column: Shipping & Payment */}
            <div className="checkout-left">
              {/* Shipping Information */}
              <div className="checkout-section">
                <h2 className="section-title">
                  <span className="section-icon">🚚</span>
                  Shipping Information
                </h2>
                
                <div className="form-group">
                  <label htmlFor="fullName" className="form-label">
                    Full Name <span className="required">*</span>
                  </label>
                  <input
                    type="text"
                    id="fullName"
                    name="fullName"
                    value={formData.fullName}
                    onChange={handleInputChange}
                    placeholder="Enter your full name"
                    className={`form-input ${errors.fullName ? 'error' : ''}`}
                    required
                  />
                  {errors.fullName && <span className="error-text">{errors.fullName}</span>}
                </div>

                <div className="form-group">
                  <label htmlFor="email" className="form-label">Email</label>
                  <input
                    type="email"
                    id="email"
                    name="email"
                    value={formData.email}
                    onChange={handleInputChange}
                    placeholder="Enter your email"
                    className="form-input"
                  />
                </div>

                <div className="form-group">
                  <label htmlFor="phone" className="form-label">
                    Phone Number <span className="required">*</span>
                  </label>
                  <input
                    type="tel"
                    id="phone"
                    name="phone"
                    value={formData.phone}
                    onChange={handleInputChange}
                    placeholder="Enter your phone number"
                    className={`form-input ${errors.phone ? 'error' : ''}`}
                    required
                  />
                  {errors.phone && <span className="error-text">{errors.phone}</span>}
                </div>

                <div className="form-group">
                  <label htmlFor="address" className="form-label">
                    Address <span className="required">*</span>
                  </label>
                  <textarea
                    id="address"
                    name="address"
                    value={formData.address}
                    onChange={handleInputChange}
                    placeholder="Enter your full address (Street, Area)"
                    rows="3"
                    className={`form-input ${errors.address ? 'error' : ''}`}
                    required
                  />
                  {errors.address && <span className="error-text">{errors.address}</span>}
                </div>

                <div className="form-group">
                  <label htmlFor="city" className="form-label">
                    City <span className="required">*</span>
                  </label>
                  <input
                    type="text"
                    id="city"
                    name="city"
                    value={formData.city}
                    onChange={handleInputChange}
                    placeholder="Enter your city"
                    className={`form-input ${errors.city ? 'error' : ''}`}
                    required
                  />
                  {errors.city && <span className="error-text">{errors.city}</span>}
                </div>

                <div className="form-group">
                  <label htmlFor="notes" className="form-label">Delivery Notes (Optional)</label>
                  <textarea
                    id="notes"
                    name="notes"
                    value={formData.notes}
                    onChange={handleInputChange}
                    placeholder="Any special instructions for delivery"
                    rows="2"
                    className="form-input"
                  />
                </div>
              </div>

              {/* Payment Method */}
              <div className="checkout-section">
                <h2 className="section-title">
                  <span className="section-icon">💰</span>
                  Payment Method
                </h2>
                
                <div className="payment-methods">
                  <div className="payment-option selected">
                    <div className="payment-label">
                      <span className="payment-icon">💰</span>
                      <div className="payment-info">
                        <span className="payment-name">Cash on Delivery</span>
                        <span className="payment-desc">Pay when you receive your order</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Right Column: Order Summary */}
            <div className="checkout-right">
              <div className="order-summary-card">
                <h2 className="summary-title">
                  <span className="summary-icon">📦</span>
                  Order Summary
                </h2>

                {/* Order Items */}
                <div className="order-items-section">
                  <h3 className="items-title">Items ({cartCount})</h3>
                  <div className="order-items-list">
                    {cart.items?.map((item, index) => (
                      <div key={index} className="order-item">
                        <div className="item-info">
                          <span className="item-name">
                            {item.product?.name || 'Product'} × {item.quantity || 1}
                          </span>
                          <span className="item-price">
                            {formatPrice((item.price || item.product?.price || 0) * (item.quantity || 1))}
                          </span>
                        </div>
                        <div className="item-unit-price">
                          {formatPrice(item.price || item.product?.price || 0)} each
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Price Breakdown */}
                <div className="price-breakdown">
                  <div className="price-row">
                    <span>Subtotal:</span>
                    <span>{formatPrice(cart.subtotal)}</span>
                  </div>
                  <div className="price-row">
                    <span>Shipping:</span>
                    <span>
                      {cart.shipping === 0 ? (
                        <span className="free-shipping">FREE</span>
                      ) : (
                        formatPrice(cart.shipping)
                      )}
                    </span>
                  </div>
                  <div className="price-row">
                    <span>Tax:</span>
                    <span>{formatPrice(cart.tax)}</span>
                  </div>
                  
                  <div className="price-divider"></div>
                  
                  <div className="price-row total-row">
                    <span>Total:</span>
                    <span className="total-amount">{formatPrice(cart.total)}</span>
                  </div>
                </div>

                {/* Place Order Button */}
                <button
                  onClick={handlePlaceOrder}
                  disabled={placingOrder || cart.items?.length === 0}
                  className="place-order-btn"
                >
                  {placingOrder ? (
                    <>
                      <span className="spinner"></span>
                      Processing...
                    </>
                  ) : (
                    'Place Order'
                  )}
                </button>

                {/* Back to Cart Link */}
                <Link to="/cart" className="back-to-cart-link">
                  ← Back to Cart
                </Link>
              </div>
            </div>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="checkout-footer">
        <div className="footer-content">
          <div className="footer-section">
            <h3 className="footer-title">NexusMart</h3>
            <p className="footer-text">
              Your trusted online shopping destination
            </p>
          </div>
          <div className="footer-section">
            <h4 className="footer-subtitle">Need Help?</h4>
            <Link to="/contact" className="footer-link">Contact Support</Link>
            <Link to="/faq" className="footer-link">FAQ</Link>
            <Link to="/shipping" className="footer-link">Shipping Info</Link>
          </div>
        </div>
        <div className="footer-bottom">
          <p>&copy; {new Date().getFullYear()} NexusMart. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
};

export default Checkout;
