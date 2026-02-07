// frontend/src/pages/ProductDetail.js
import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { authService } from '../Components/auth';
import productService from '../Components/productService';
import cartService from './cartServices';
import './ProductDetail.css';

const ProductDetail = () => {
  const navigate = useNavigate();
  const { productId } = useParams();
  
  const isAuthenticated = authService.isAuthenticated();
  const currentUser = authService.getCurrentUser();
  
  // State for product
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [quantity, setQuantity] = useState(1);
  const [selectedImage, setSelectedImage] = useState(0);
  const [cartCount, setCartCount] = useState(0);
  const [addingToCart, setAddingToCart] = useState(false);

  // Fetch product details
  useEffect(() => {
    if (productId) {
      fetchProduct();
      if (isAuthenticated) {
        fetchCartCount();
      }
    } else {
      setError('Product ID is missing from the URL');
      setLoading(false);
    }
  }, [productId, isAuthenticated]);

  const fetchProduct = async () => {
    setLoading(true);
    setError('');
    
    try {
      const result = await productService.getProductById(productId);
      
      if (result.success && result.data) {
        const productData = result.data;
        
        // Generate images for product
        const productImages = getProductImages(productData);
        
        setProduct({
          ...productData,
          images: productImages
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

  const fetchCartCount = async () => {
    if (!isAuthenticated) return;
    
    try {
      const count = await cartService.getCartCount();
      setCartCount(count);
    } catch (error) {
      console.error('Error fetching cart count:', error);
    }
  };

  // Function to get product image URL
  const getProductImages = (product) => {
    const images = [];
    
    // Add main image from product data
    if (product.images && product.images.length > 0) {
      const mainImage = product.images[0];
      if (mainImage && !mainImage.startsWith('http')) {
        const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000';
        images.push(`${API_URL}${mainImage.startsWith('/') ? '' : '/'}${mainImage}`);
      } else if (mainImage) {
        images.push(mainImage);
      }
    }
    
    // Fallback images based on category
    const fallbackImages = [
      'https://images.unsplash.com/photo-1568702846914-96b305d2aaeb?w=800&h=600&fit=crop',
      'https://images.unsplash.com/photo-1578916171728-46686eac8d58?w=800&h=600&fit=crop',
      'https://images.unsplash.com/photo-1567306226416-28f0efdc88ce?w=800&h=600&fit=crop'
    ];
    
    // If no product images, use fallback
    if (images.length === 0) {
      images.push(...fallbackImages);
    }
    
    return images;
  };

  // Format price
  const formatPrice = (price) => {
    if (!price && price !== 0) return '$0.00';
    return `$${parseFloat(price).toFixed(2)}`;
  };

  // Handle quantity change
  const handleQuantityChange = (change) => {
    const newQuantity = quantity + change;
    if (newQuantity >= 1 && newQuantity <= (product?.quantity || 10)) {
      setQuantity(newQuantity);
    }
  };

  // Handle add to cart
  const handleAddToCart = async () => {
    if (!isAuthenticated) {
      alert('Please login to add items to cart');
      navigate('/login');
      return;
    }
    
    if (!product) {
      alert('Product information is not available');
      return;
    }
    
    setAddingToCart(true);
    
    try {
      await cartService.addToCart(product._id, quantity);
      
      // Update cart count
      await fetchCartCount();
      
      alert(`✅ Added ${quantity} ${product.name}(s) to cart!`);
    } catch (error) {
      console.error('Error adding to cart:', error);
      alert(`Failed to add to cart: ${error.message}`);
    } finally {
      setAddingToCart(false);
    }
  };

  // Handle buy now
  const handleBuyNow = async () => {
    if (!isAuthenticated) {
      navigate('/login');
      return;
    }
    
    try {
      await handleAddToCart();
      navigate('/cart');
    } catch (error) {
      console.error('Error in buy now:', error);
    }
  };

  const handleLogout = () => {
    authService.logout();
    navigate('/');
  };

  // Calculate discounted price
  const calculateDiscountedPrice = () => {
    if (!product) return 0;
    if (product.discount && product.discount > 0) {
      return product.price * (100 - product.discount) / 100;
    }
    return product.price;
  };

  if (loading) {
    return (
      <div className="loading-container">
        <div className="loading-spinner"></div>
        <p>Loading product details...</p>
      </div>
    );
  }

  if (error || !product) {
    return (
      <div className="error-page">
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
        
        <div className="error-content">
          <div className="error-icon">😕</div>
          <h2>Product Not Found</h2>
          <p>{error || 'The product you are looking for does not exist or has been removed.'}</p>
          <div className="error-actions">
            <Link to="/products" className="btn back-to-products">
              ← Back to Products
            </Link>
            <Link to="/" className="btn go-home">
              Go to Homepage
            </Link>
          </div>
        </div>
      </div>
    );
  }

  const discountedPrice = calculateDiscountedPrice();

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
            <Link to="/cart" className="nav-link">Cart ({cartCount})</Link>
          </div>

          <div className="navbar-auth">
            {isAuthenticated ? (
              <>
                <span className="welcome-text">
                  Welcome, {currentUser?.name || 'User'}!
                </span>
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
              <Link to={`/products?category=${product.category._id}`} className="breadcrumb-link">
                {product.category.name || 'Category'}
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
                onError={(e) => {
                  e.target.src = 'https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?w=800&h=600&fit=crop&q=80';
                }}
              />
              {product.status === 'out_of_stock' && (
                <div className="out-of-stock-overlay">
                  <span>Out of Stock</span>
                </div>
              )}
              {product.discount > 0 && (
                <div className="discount-badge-large">
                  -{product.discount}% OFF
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
                    onError={(e) => {
                      e.target.src = 'https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?w=200&h=150&fit=crop&q=80';
                    }}
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
                <span className="product-status">
                  Status: <span className={`status-${product.status || 'active'}`}>
                    {product.status === 'active' ? 'In Stock' : 'Out of Stock'}
                  </span>
                </span>
                {product.category && (
                  <span className="product-category-badge">
                    {product.category.name}
                  </span>
                )}
              </div>
            </div>

            <div className="product-price-section">
              <div className="price-container">
                <span className="current-price">{formatPrice(discountedPrice)}</span>
                {product.discount > 0 && (
                  <>
                    <span className="original-price">{formatPrice(product.price)}</span>
                    <span className="discount-badge">
                      Save {product.discount}%
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
              <p className="product-description">
                {product.description || 'No description available for this product.'}
              </p>
              
              <div className="product-specs">
                <div className="spec-item">
                  <span className="spec-label">Category:</span>
                  <span className="spec-value">
                    {product.category?.name || 'Uncategorized'}
                  </span>
                </div>
                <div className="spec-item">
                  <span className="spec-label">Stock:</span>
                  <span className={`spec-value ${product.quantity <= 5 ? 'low-stock' : ''}`}>
                    {product.quantity || 0} available
                  </span>
                </div>
                <div className="spec-item">
                  <span className="spec-label">SKU:</span>
                  <span className="spec-value">
                    {product._id?.substring(0, 8).toUpperCase() || 'N/A'}
                  </span>
                </div>
              </div>
            </div>

            {/* Quantity and Actions */}
            <div className="product-actions-section">
              <div className="quantity-selector">
                <label htmlFor="quantity" className="quantity-label">Quantity:</label>
                <div className="quantity-controls">
                  <button 
                    onClick={() => handleQuantityChange(-1)}
                    disabled={quantity <= 1 || product.status !== 'active'}
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
                      if (value >= 1 && value <= (product.quantity || 10)) {
                        setQuantity(value);
                      }
                    }}
                    min="1"
                    max={product.quantity || 10}
                    className="quantity-input"
                    disabled={product.status !== 'active'}
                  />
                  <button 
                    onClick={() => handleQuantityChange(1)}
                    disabled={quantity >= (product.quantity || 10) || product.status !== 'active'}
                    className="quantity-btn plus-btn"
                  >
                    +
                  </button>
                </div>
                <span className="stock-info">
                  {product.quantity || 0} units available
                </span>
              </div>

              <div className="action-buttons">
                <button
                  onClick={handleAddToCart}
                  disabled={product.status !== 'active' || addingToCart}
                  className="add-to-cart-btn"
                >
                  {addingToCart ? 'Adding...' : (
                    <>
                      <span className="btn-icon">🛒</span>
                      Add to Cart
                    </>
                  )}
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
                  {formatPrice(discountedPrice * quantity)}
                </span>
              </div>
            </div>

            {/* Shipping Info */}
            <div className="shipping-info">
              <div className="shipping-item">
                <span className="shipping-icon">🚚</span>
                <div className="shipping-details">
                  <strong>Free Shipping</strong>
                  <p>On orders over $50. Delivery in 1-3 business days.</p>
                </div>
              </div>
              <div className="shipping-item">
                <span className="shipping-icon">↩️</span>
                <div className="shipping-details">
                  <strong>Easy Returns</strong>
                  <p>30-day return policy. No questions asked.</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Related Products Section */}
        <div className="related-products-section">
          <h2 className="section-title">You May Also Like</h2>
          <div className="related-products-note">
            <p>Browse similar products in our store.</p>
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
          </div>
          <div className="footer-section">
            <h4 className="footer-subtitle">Help</h4>
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

export default ProductDetail;
