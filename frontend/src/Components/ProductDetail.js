// frontend/src/pages/ProductDetail.js
import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { authService } from '../Components/auth';
import productService from './productService';
import './ProductDetail.css';

const ProductDetail = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  
  const isAuthenticated = authService.isAuthenticated();
  const currentUser = authService.getCurrentUser();
  
  // State for product
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [quantity, setQuantity] = useState(1);
  const [selectedImage, setSelectedImage] = useState(0);

  // Fetch product details
  useEffect(() => {
    fetchProduct();
  }, [id]);

  // Function to get product image
  const getProductImage = (productName, categoryName) => {
    const imageMap = {
      'apple': 'https://images.unsplash.com/photo-1568702846914-96b305d2aaeb?w=800&h=600&fit=crop',
      'banana': 'https://images.unsplash.com/photo-1571771894821-ce9b6c11b08e?w=800&h=600&fit=crop',
      'orange': 'https://images.unsplash.com/photo-1547514701-42782101795e?w=800&h=600&fit=crop',
      'tomato': 'https://images.unsplash.com/photo-1592924357228-91a4daadcfea?w=800&h=600&fit=crop',
      'carrot': 'https://images.unsplash.com/photo-1582515073490-39981397c445?w=800&h=600&fit=crop',
      'broccoli': 'https://images.unsplash.com/photo-1459411552884-841db9b3cc2a?w=800&h=600&fit=crop',
      'chicken breast': 'https://images.unsplash.com/photo-1604503468506-a8da13d82791?w=800&h=600&fit=crop',
      'beef': 'https://images.unsplash.com/photo-1607623814075-e51df1bdc82f?w=800&h=600&fit=crop',
      'cheese': 'https://images.unsplash.com/photo-1486297678162-eb2a19b0a32d?w=800&h=600&fit=crop',
      'milk': 'https://images.unsplash.com/photo-1550583721-58731aebf5c5?w=800&h=600&fit=crop'
    };
    
    const lowerName = productName.toLowerCase();
    for (const [key, image] of Object.entries(imageMap)) {
      if (lowerName.includes(key)) {
        return image;
      }
    }
    
    // Fallback images based on category
    const categoryImages = {
      'FRUIT': 'https://images.unsplash.com/photo-1610832958506-aa56368176cf?w=800&h=600&fit=crop',
      'Vegetables': 'https://images.unsplash.com/photo-1597362925123-77861d3fbac7?w=800&h=600&fit=crop',
      'Meat': 'https://images.unsplash.com/photo-1607623814075-e51df1bdc82f?w=800&h=600&fit=crop',
      'Chicken': 'https://images.unsplash.com/photo-1604503468506-a8da13d82791?w=800&h=600&fit=crop',
      'Cheese': 'https://images.unsplash.com/photo-1486297678162-eb2a19b0a32d?w=800&h=600&fit=crop'
    };
    
    return categoryImages[categoryName] || 'https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?w=800&h=600&fit=crop&q=80';
  };

  // Mock product images for gallery
  const getProductImages = (product) => {
    const mainImage = getProductImage(product.name, product.category?.name);
    return [
      mainImage,
      'https://images.unsplash.com/photo-1578916171728-46686eac8d58?w=800&h=600&fit=crop',
      'https://images.unsplash.com/photo-1567306226416-28f0efdc88ce?w=800&h=600&fit=crop',
      'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=800&h=600&fit=crop'
    ];
  };

  const fetchProduct = async () => {
    setLoading(true);
    setError('');
    
    try {
      const result = await productService.getProductById(id);
      
      if (result.success && result.data) {
        const productData = result.data;
        // Add images to product
        setProduct({
          ...productData,
          images: getProductImages(productData)
        });
      } else {
        setError(result.message || 'Product not found');
      }
    } catch (error) {
      console.error('Error fetching product:', error);
      setError('Unable to load product. Please try again later.');
    } finally {
      setLoading(false);
    }
  };

  // Format price
  const formatPrice = (price) => {
    return `$${parseFloat(price).toFixed(2)}`;
  };

  // Format date
  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  // Handle quantity change
  const handleQuantityChange = (change) => {
    const newQuantity = quantity + change;
    if (newQuantity >= 1 && newQuantity <= (product?.stock || 10)) {
      setQuantity(newQuantity);
    }
  };

  // Handle add to cart
  const handleAddToCart = () => {
    if (!isAuthenticated) {
      navigate('/login');
      return;
    }
    
    // Add to cart logic here
    alert(`Added ${quantity} ${product.name}(s) to cart!`);
  };

  // Handle buy now
  const handleBuyNow = () => {
    if (!isAuthenticated) {
      navigate('/login');
      return;
    }
    
    // Redirect to checkout
    alert(`Proceeding to checkout with ${quantity} ${product.name}(s)`);
  };

  const handleLogout = () => {
    authService.logout();
    navigate('/');
  };

  if (loading) {
    return (
      <div className="product-detail-page">
        <div className="loading-overlay">
          <div className="loading-spinner"></div>
          <p>Loading product...</p>
        </div>
      </div>
    );
  }

  if (error || !product) {
    return (
      <div className="product-detail-page">
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
            </div>
            <div className="navbar-auth">
              {isAuthenticated ? (
                <>
                  <span className="welcome-text">Welcome, {currentUser?.name}!</span>
                  <button onClick={handleLogout} className="auth-btn logout-btn">
                    Logout
                  </button>
                </>
              ) : (
                <>
                  <Link to="/login" className="auth-btn login-btn">Login</Link>
                  <Link to="/register" className="auth-btn register-btn">Register</Link>
                </>
              )}
            </div>
          </div>
        </nav>
        
        <main className="product-detail-main">
          <div className="error-state">
            <div className="error-icon">😕</div>
            <h2>Product Not Found</h2>
            <p>{error || 'The product you are looking for does not exist or has been removed.'}</p>
            <div className="error-actions">
              <Link to="/products" className="back-to-products-btn">
                ← Back to Products
              </Link>
              <Link to="/" className="go-home-btn">
                Go to Homepage
              </Link>
            </div>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="product-detail-page">
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
            <Link to="/deals" className="nav-link">Deals</Link>
          </div>

          <div className="navbar-auth">
            {isAuthenticated ? (
              <>
                <span className="welcome-text">
                  Welcome, {currentUser?.name || 'User'}!
                </span>
                <Link to="/cart" className="auth-btn cart-btn">
                  <span className="btn-icon">🛒</span>
                  Cart
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

      {/* Breadcrumb Navigation */}
      <div className="breadcrumb">
        <div className="breadcrumb-container">
          <Link to="/" className="breadcrumb-link">Home</Link>
          <span className="breadcrumb-separator">/</span>
          <Link to="/products" className="breadcrumb-link">Products</Link>
          <span className="breadcrumb-separator">/</span>
          {product.category && (
            <>
              <Link to={`/products/category/${product.category._id}`} className="breadcrumb-link">
                {product.category.name}
              </Link>
              <span className="breadcrumb-separator">/</span>
            </>
          )}
          <span className="breadcrumb-current">{product.name}</span>
        </div>
      </div>

      {/* Main Content */}
      <main className="product-detail-main">
        <div className="product-detail-container">
          {/* Product Images Gallery */}
          <div className="product-images-section">
            <div className="main-image-container">
              <img
                src={product.images[selectedImage]}
                alt={product.name}
                className="main-product-image"
              />
              {product.status === 'out_of_stock' && (
                <div className="out-of-stock-overlay">
                  <span>Out of Stock</span>
                </div>
              )}
            </div>
            
            <div className="thumbnail-gallery">
              {product.images.map((image, index) => (
                <button
                  key={index}
                  onClick={() => setSelectedImage(index)}
                  className={`thumbnail-btn ${selectedImage === index ? 'active' : ''}`}
                >
                  <img
                    src={image}
                    alt={`${product.name} ${index + 1}`}
                    className="thumbnail-image"
                  />
                </button>
              ))}
            </div>
          </div>

          {/* Product Details */}
          <div className="product-details-section">
            <div className="product-header">
              <h1 className="product-title">{product.name}</h1>
              <div className="product-meta">
                <span className="product-sku">SKU: {product._id?.substring(0, 8).toUpperCase()}</span>
                <span className="product-status">
                  Status: <span className={`status-${product.status}`}>
                    {product.status === 'active' ? 'In Stock' : 
                     product.status === 'out_of_stock' ? 'Out of Stock' : 'Inactive'}
                  </span>
                </span>
              </div>
            </div>

            <div className="product-price-section">
              <div className="price-container">
                <span className="current-price">{formatPrice(product.price)}</span>
                {product.originalPrice && product.originalPrice > product.price && (
                  <>
                    <span className="original-price">{formatPrice(product.originalPrice)}</span>
                    <span className="discount-badge">
                      Save {((product.originalPrice - product.price) / product.originalPrice * 100).toFixed(0)}%
                    </span>
                  </>
                )}
              </div>
              <div className="rating-container">
                <div className="stars">
                  {'⭐'.repeat(4)}
                  <span className="half-star">⭐</span>
                </div>
                <span className="rating-text">4.5 (128 reviews)</span>
              </div>
            </div>

            <div className="product-description-section">
              <h3 className="section-title">Description</h3>
              <p className="product-description">{product.description || 'No description available.'}</p>
              
              <div className="product-specs">
                <div className="spec-item">
                  <span className="spec-label">Category:</span>
                  <span className="spec-value">
                    {product.category?.name ? (
                      <Link to={`/products/category/${product.category._id}`} className="category-link">
                        {product.category.name}
                      </Link>
                    ) : 'Uncategorized'}
                  </span>
                </div>
                <div className="spec-item">
                  <span className="spec-label">Stock:</span>
                  <span className={`spec-value ${product.stock <= 5 ? 'low-stock' : ''}`}>
                    {product.stock || 0} units available
                  </span>
                </div>
                <div className="spec-item">
                  <span className="spec-label">Added on:</span>
                  <span className="spec-value">{formatDate(product.createdAt)}</span>
                </div>
                {product.updatedAt && (
                  <div className="spec-item">
                    <span className="spec-label">Last updated:</span>
                    <span className="spec-value">{formatDate(product.updatedAt)}</span>
                  </div>
                )}
              </div>
            </div>

            {/* Quantity and Actions */}
            <div className="product-actions-section">
              <div className="quantity-selector">
                <label htmlFor="quantity" className="quantity-label">Quantity:</label>
                <div className="quantity-controls">
                  <button 
                    onClick={() => handleQuantityChange(-1)}
                    disabled={quantity <= 1}
                    className="quantity-btn minus-btn"
                  >
                    −
                  </button>
                  <input
                    type="number"
                    id="quantity"
                    value={quantity}
                    onChange={(e) => {
                      const value = parseInt(e.target.value);
                      if (value >= 1 && value <= (product.stock || 10)) {
                        setQuantity(value);
                      }
                    }}
                    min="1"
                    max={product.stock || 10}
                    className="quantity-input"
                  />
                  <button 
                    onClick={() => handleQuantityChange(1)}
                    disabled={quantity >= (product.stock || 10)}
                    className="quantity-btn plus-btn"
                  >
                    +
                  </button>
                </div>
                <span className="stock-info">
                  {product.stock || 0} units available
                </span>
              </div>

              <div className="action-buttons">
                <button
                  onClick={handleAddToCart}
                  disabled={product.status !== 'active'}
                  className="add-to-cart-btn"
                >
                  <span className="btn-icon">🛒</span>
                  Add to Cart
                </button>
                <button
                  onClick={handleBuyNow}
                  disabled={product.status !== 'active'}
                  className="buy-now-btn"
                >
                  Buy Now
                </button>
              </div>

              <div className="total-price">
                Total: <span className="total-amount">
                  {formatPrice(product.price * quantity)}
                </span>
              </div>
            </div>

            {/* Shipping Info */}
            <div className="shipping-info">
              <div className="shipping-item">
                <span className="shipping-icon">🚚</span>
                <div className="shipping-details">
                  <strong>Free Shipping</strong>
                  <p>On orders over $50. Delivery in 2-3 business days.</p>
                </div>
              </div>
              <div className="shipping-item">
                <span className="shipping-icon">↩️</span>
                <div className="shipping-details">
                  <strong>30-Day Returns</strong>
                  <p>Easy returns within 30 days of purchase.</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Related Products (You can implement this later) */}
        <div className="related-products-section">
          <h2 className="section-title">You May Also Like</h2>
          <div className="related-products-placeholder">
            <p>Related products will be displayed here.</p>
            <Link to="/products" className="browse-more-btn">
              Browse More Products →
            </Link>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="product-detail-footer">
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
            <Link to="/about" className="footer-link">About Us</Link>
            <Link to="/contact" className="footer-link">Contact</Link>
          </div>
          <div className="footer-section">
            <h4 className="footer-subtitle">Account</h4>
            {isAuthenticated ? (
              <>
                <Link to="/profile" className="footer-link">My Profile</Link>
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

export default ProductDetail;
