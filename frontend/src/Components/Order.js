// frontend/src/pages/Orders.js
import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { authService } from '../Components/auth';
import orderService from './OrderService';
import './Order.css';

const Orders = () => {
  const navigate = useNavigate();
  const isAuthenticated = authService.isAuthenticated();
  const currentUser = authService.getCurrentUser();
  
  // State for orders
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [activeTab, setActiveTab] = useState('all');
  
  // Shopping cart state
  const [cart, setCart] = useState(() => {
    const savedCart = localStorage.getItem('nexusmart_cart');
    return savedCart ? JSON.parse(savedCart) : [];
  });
  
  // Filtered orders based on active tab
  const filteredOrders = orders.filter(order => {
    if (activeTab === 'all') return true;
    if (activeTab === 'pending') return ['pending', 'confirmed', 'preparing'].includes(order.status);
    if (activeTab === 'delivered') return order.status === 'delivered';
    if (activeTab === 'cancelled') return order.status === 'cancelled';
    return true;
  });

  // Cart badge count
  const cartCount = cart.reduce((total, item) => total + (item.quantity || 1), 0);

  // Fetch orders on component mount
  useEffect(() => {
    if (!isAuthenticated) {
      navigate('/login');
      return;
    }
    
    fetchOrders();
  }, [isAuthenticated, navigate]);

  const fetchOrders = async () => {
  setLoading(true);
  setError('');
  
  try {
    console.log('🔄 Fetching orders for user...');
    const result = await orderService.getMyOrders();
    
    console.log('Order fetch result:', result);
    
    if (result.success) {
      console.log('✅ Orders fetched:', result.data);
      setOrders(result.data || []);
    } else {
      setError(result.message || 'Failed to load orders');
      
      // If authentication failed, redirect to login
      if (result.message.includes('login') || result.message.includes('session')) {
        setTimeout(() => {
          authService.logout();
          navigate('/login');
        }, 2000);
      }
    }
  } catch (error) {
    console.error('❌ Error fetching orders:', error);
    setError('Unable to load orders. Please try again later.');
  } finally {
    setLoading(false);
  }
};
  // Format price
  const formatPrice = (price) => {
    if (!price && price !== 0) return '$0.00';
    return `$${parseFloat(price).toFixed(2)}`;
  };

  // Format date
  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  // Get status badge color
  const getStatusColor = (status) => {
    switch (status) {
      case 'pending': return 'status-pending';
      case 'confirmed': return 'status-confirmed';
      case 'preparing': return 'status-preparing';
      case 'delivered': return 'status-delivered';
      case 'cancelled': return 'status-cancelled';
      default: return 'status-default';
    }
  };

  // Get status text
  const getStatusText = (status) => {
    switch (status) {
      case 'pending': return 'Pending';
      case 'confirmed': return 'Confirmed';
      case 'preparing': return 'Preparing';
      case 'delivered': return 'Delivered';
      case 'cancelled': return 'Cancelled';
      default: return status.charAt(0).toUpperCase() + status.slice(1);
    }
  };

  // Get status icon
  const getStatusIcon = (status) => {
    switch (status) {
      case 'pending': return '⏳';
      case 'confirmed': return '✅';
      case 'preparing': return '👨‍🍳';
      case 'delivered': return '🚚';
      case 'cancelled': return '❌';
      default: return '📦';
    }
  };

  // Calculate order total
  const calculateOrderTotal = (order) => {
    if (order.totalAmount !== undefined && order.totalAmount !== null) {
      return order.totalAmount;
    }
    
    // Calculate from items if total not provided
    if (order.items && Array.isArray(order.items)) {
      return order.items.reduce((total, item) => {
        const price = item.product?.price || item.price || 0;
        const quantity = item.quantity || 1;
        return total + (price * quantity);
      }, 0);
    }
    
    return 0;
  };

  // Handle reorder - SIMPLIFIED VERSION
  const handleReorder = (order) => {
    if (!order.items || !Array.isArray(order.items)) {
      alert('Cannot reorder - order items not available');
      return;
    }
    
    const newCart = [...cart];
    let itemsAdded = 0;
    
    order.items.forEach(item => {
      const productData = item.product || item;
      
      // Only add if we have basic product info
      if (productData && productData._id) {
        const existingItem = newCart.find(cartItem => cartItem._id === productData._id);
        
        if (existingItem) {
          existingItem.quantity = (existingItem.quantity || 1) + (item.quantity || 1);
        } else {
          newCart.push({
            _id: productData._id,
            name: productData.name || `Product ${productData._id}`,
            price: productData.price || 0,
            quantity: item.quantity || 1
          });
        }
        itemsAdded++;
      }
    });
    
    if (itemsAdded > 0) {
      setCart(newCart);
      localStorage.setItem('nexusmart_cart', JSON.stringify(newCart));
      alert(`Added ${itemsAdded} item(s) to cart!`);
      navigate('/cart');
    } else {
      alert('No valid items to reorder');
    }
  };

  const handleLogout = () => {
    authService.logout();
    navigate('/');
  };

  if (!isAuthenticated) {
    return null; // Will redirect in useEffect
  }

  return (
    <div className="orders-page">
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
            <Link to="/orders" className="nav-link active">My Orders</Link>
          </div>

          <div className="navbar-auth">
            {isAuthenticated ? (
              <>
                {/* Cart Icon */}
                <div className="cart-wrapper">
                  <Link to="/cart" className="cart-icon">
                    🛒
                    {cartCount > 0 && (
                      <span className="cart-count-badge">{cartCount}</span>
                    )}
                  </Link>
                </div>

                <span className="welcome-text">
                  Welcome, {currentUser?.name || 'User'}!
                </span>
                
                <Link to="/profile" className="auth-btn profile-btn">
                  <span className="btn-icon">👤</span>
                  Profile
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
      <main className="orders-main">
        {/* Page Header */}
        <div className="page-header">
          <h1 className="page-title">My Orders</h1>
          <p className="page-subtitle">
            Track and manage all your orders in one place
          </p>
        </div>

        {/* Orders Content */}
        <div className="orders-content">
          {/* Tabs */}
          <div className="orders-tabs">
            <button 
              className={`tab-btn ${activeTab === 'all' ? 'active' : ''}`}
              onClick={() => setActiveTab('all')}
            >
              All Orders ({orders.length})
            </button>
            <button 
              className={`tab-btn ${activeTab === 'pending' ? 'active' : ''}`}
              onClick={() => setActiveTab('pending')}
            >
              Pending ({orders.filter(o => ['pending', 'confirmed', 'preparing'].includes(o.status)).length})
            </button>
            <button 
              className={`tab-btn ${activeTab === 'delivered' ? 'active' : ''}`}
              onClick={() => setActiveTab('delivered')}
            >
              Delivered ({orders.filter(o => o.status === 'delivered').length})
            </button>
            <button 
              className={`tab-btn ${activeTab === 'cancelled' ? 'active' : ''}`}
              onClick={() => setActiveTab('cancelled')}
            >
              Cancelled ({orders.filter(o => o.status === 'cancelled').length})
            </button>
          </div>

          {/* Loading State */}
          {loading ? (
            <div className="loading-state">
              <div className="loading-spinner"></div>
              <p>Loading your orders...</p>
            </div>
          ) : error ? (
            <div className="error-state">
              <div className="error-icon">⚠️</div>
              <h3>Unable to Load Orders</h3>
              <p>{error}</p>
              <button onClick={fetchOrders} className="retry-btn">
                Try Again
              </button>
            </div>
          ) : filteredOrders.length > 0 ? (
            <div className="orders-list">
              {filteredOrders.map((order) => (
                <div key={order._id} className="order-card">
                  {/* Order Header */}
                  <div className="order-header">
                    <div className="order-info">
                      <div className="order-id">
                        <span className="label">Order ID:</span>
                        <span className="value">
                          {order.orderNumber || `ORD-${order._id.substring(0, 8).toUpperCase()}`}
                        </span>
                      </div>
                      <div className="order-date">
                        <span className="label">Order Date:</span>
                        <span className="value">{formatDate(order.createdAt)}</span>
                      </div>
                    </div>
                    <div className="order-status">
                      <span className={`status-badge ${getStatusColor(order.status)}`}>
                        <span className="status-icon">{getStatusIcon(order.status)}</span>
                        {getStatusText(order.status)}
                      </span>
                    </div>
                  </div>

                  {/* Order Items */}
                  <div className="order-items">
                    <h4 className="items-title">Order Items</h4>
                    <div className="items-list">
                      {(order.items || []).map((item, index) => (
                        <div key={index} className="order-item">
                          <div className="item-info">
                            <span className="item-name">
                              {item.product?.name || item.name || `Item ${index + 1}`}
                            </span>
                            <span className="item-quantity">× {item.quantity || 1}</span>
                          </div>
                          <div className="item-price">
                            {formatPrice(item.product?.price || item.price || 0)}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Order Footer */}
                  <div className="order-footer">
                    <div className="order-total">
                      <span className="total-label">Total:</span>
                      <span className="total-amount">
                        {formatPrice(calculateOrderTotal(order))}
                      </span>
                    </div>
                    <div className="order-actions">
                      {/* Only show reorder for delivered orders */}
                      {order.status === 'delivered' && (
                        <button 
                          className="btn reorder-btn"
                          onClick={() => handleReorder(order)}
                        >
                          Reorder
                        </button>
                      )}
                      {/* Note: Cancel button removed because API doesn't support it for regular users */}
                    </div>
                  </div>

                  {/* Order Details */}
                  <div className="order-details">
                    <div className="detail-row">
                      <span className="detail-label">Delivery Address:</span>
                      <span className="detail-value">{order.deliveryAddress || 'Not specified'}</span>
                    </div>
                    <div className="detail-row">
                      <span className="detail-label">Phone Number:</span>
                      <span className="detail-value">{order.customerPhone || 'Not specified'}</span>
                    </div>
                    {order.customerNotes && (
                      <div className="detail-row">
                        <span className="detail-label">Notes:</span>
                        <span className="detail-value">{order.customerNotes}</span>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="no-orders">
              <div className="no-orders-icon">📦</div>
              <h3>No Orders Found</h3>
              <p>
                {activeTab === 'all' 
                  ? "You haven't placed any orders yet."
                  : `You don't have any ${activeTab} orders.`
                }
              </p>
              <div className="no-orders-actions">
                <Link to="/products" className="btn shop-now-btn">
                  Start Shopping →
                </Link>
                {activeTab !== 'all' && (
                  <button 
                    onClick={() => setActiveTab('all')}
                    className="btn view-all-btn"
                  >
                    View All Orders
                  </button>
                )}
              </div>
            </div>
          )}
        </div>
      </main>

      {/* Footer */}
      <footer className="orders-footer">
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
            <Link to="/orders" className="footer-link">My Orders</Link>
          </div>
          <div className="footer-section">
            <h4 className="footer-subtitle">Account</h4>
            {isAuthenticated ? (
              <>
                <Link to="/profile" className="footer-link">My Profile</Link>
                <Link to="/cart" className="footer-link">My Cart ({cartCount})</Link>
                <Link to="/orders" className="footer-link">My Orders</Link>
                <button onClick={handleLogout} className="footer-link logout-link">
                  Logout
                </button>
              </>
            ) : (
              <>
                <Link to="/login" className="footer-link">Login</Link>
                <Link to="/register" className="footer-link">Register</Link>
                <Link to="/forgot-password" className="footer-link">Forgot Password</Link>
              </>
            )}
          </div>
        </div>
        <div className="footer-bottom">
          <p>&copy; {new Date().getFullYear()} NexusMart. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
};

export default Orders;
