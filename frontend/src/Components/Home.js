// frontend/src/pages/Home.js
import React, { useState, useEffect, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { authService } from '../Components/auth';
import categoryService from '../Components/categoryService';
import productService from '../Components/productService'; // This is your productService
import './Home.css';

const Home = () => {
  const navigate = useNavigate();
  const isAuthenticated = authService.isAuthenticated();
  const currentUser = authService.getCurrentUser();
  
  // State for categories
  const [categories, setCategories] = useState([]);
  const [loadingCategories, setLoadingCategories] = useState(true);
  const [categoriesError, setCategoriesError] = useState('');
  
  // State for featured products
  const [featuredProducts, setFeaturedProducts] = useState([]);
  const [loadingProducts, setLoadingProducts] = useState(false);
  const [productsError, setProductsError] = useState('');
  
  // Refs for scrolling
  const categoriesContainerRef = useRef(null);

  // Fetch categories and featured products on component mount
  useEffect(() => {
    fetchCategories();
    fetchFeaturedProducts();
  }, []);

  // Function to get category image based on name
  const getCategoryImage = (categoryName) => {
    const imageMap = {
      'FRUIT': 'https://images.unsplash.com/photo-1610832958506-aa56368176cf?w=300&h=200&fit=crop',
      'Fruits': 'https://images.unsplash.com/photo-1610832958506-aa56368176cf?w=300&h=200&fit=crop',
      'Vegetables': 'https://images.unsplash.com/photo-1597362925123-77861d3fbac7?w=300&h=200&fit=crop',
      'Meat': 'https://images.unsplash.com/photo-1607623814075-e51df1bdc82f?w=300&h=200&fit=crop',
      'Chicken': 'https://images.unsplash.com/photo-1604503468506-a8da13d82791?w=300&h=200&fit=crop',
      'Cheese': 'https://images.unsplash.com/photo-1486297678162-eb2a19b0a32d?w=300&h=200&fit=crop',
      'Dairy': 'https://images.unsplash.com/photo-1563636619-e9143da7973b?w=300&h=200&fit=crop',
      'Bakery': 'https://images.unsplash.com/photo-1586201375761-83865001e31c?w=300&h=200&fit=crop'
    };
    
    // Return specific image or fallback
    return imageMap[categoryName] || `https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?w=300&h=200&fit=crop&q=80`;
  };

  const fetchCategories = async () => {
    setLoadingCategories(true);
    setCategoriesError('');
    
    try {
      const result = await categoryService.getActiveCategories();
      
      if (result.success) {
        // Add images to categories
        const categoriesWithImages = result.data.map(category => ({
          ...category,
          image: getCategoryImage(category.name)
        }));
        setCategories(categoriesWithImages);
      } else {
        setCategoriesError(result.message || 'Failed to load categories');
      }
    } catch (error) {
      console.error('Error fetching categories:', error);
      setCategoriesError('Unable to load categories. Please try again later.');
    } finally {
      setLoadingCategories(false);
    }
  };

 // In the fetchFeaturedProducts function, update how you process the products:
const fetchFeaturedProducts = async () => {
  setLoadingProducts(true);
  setProductsError('');
  
  try {
    const result = await productService.getAllProducts({ limit: 8 });
    
    if (result.success) {
      // UPDATED: Check for different response structures
      let products = [];
      
      // Check different possible structures
      if (result.data.products && Array.isArray(result.data.products)) {
        products = result.data.products;
      } else if (result.data.items && Array.isArray(result.data.items)) {
        products = result.data.items;
      } else if (Array.isArray(result.data.data)) {
        products = result.data.data;
      } else if (Array.isArray(result.data)) {
        products = result.data;
      }
      
      // UPDATED: Process images properly
      const productsWithImages = products.map(product => {
        // First, try to get image from product.images array
        let productImage = null;
        
        if (product.images && Array.isArray(product.images) && product.images.length > 0) {
          // Use the first image from the array
          productImage = product.images[0];
          
          // If it's a relative path, prepend the base URL
          if (productImage && !productImage.startsWith('http')) {
            const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000';
            productImage = `${API_URL}${productImage.startsWith('/') ? '' : '/'}${productImage}`;
          }
        }
        
        // If no image found, use fallback
        if (!productImage) {
          productImage = getCategoryImage(product.category?.name);
        }
        
        return {
          ...product,
          image: productImage
        };
      });
      
      setFeaturedProducts(productsWithImages);
      
      if (productsWithImages.length === 0) {
        setProductsError('No products available at the moment.');
      }
    } else {
      setProductsError(result.message || 'Failed to load products');
    }
  } catch (error) {
    console.error('Error fetching products:', error);
    setProductsError('Unable to load featured products.');
  } finally {
    setLoadingProducts(false);
  }
};

  // Handle category click
  const handleCategoryClick = (categoryId) => {
    navigate(`/products?category=${categoryId}`);
  };

  // Handle view all products
  const handleViewAllProducts = () => {
    navigate('/products');
  };

  // Handle view all categories
  const handleViewAllCategories = () => {
    navigate('/categories');
  };

  // Handle product click
  const handleProductClick = (productId) => {
    navigate(`/product/${productId}`);
  };

  // Scroll functions
  const scrollLeft = () => {
    if (categoriesContainerRef.current) {
      categoriesContainerRef.current.scrollBy({
        left: -300,
        behavior: 'smooth'
      });
    }
  };

  const scrollRight = () => {
    if (categoriesContainerRef.current) {
      categoriesContainerRef.current.scrollBy({
        left: 300,
        behavior: 'smooth'
      });
    }
  };

  const handleLogout = () => {
    authService.logout();
    navigate('/');
  };

  return (
    <div className="home-page">
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
            <Link to="/" className="nav-link active">Home</Link>
            <Link to="/products" className="nav-link">Products</Link>
            <Link to="/categories" className="nav-link">Categories</Link>
            <Link to="/deals" className="nav-link">Deals</Link>
            <Link to="/about" className="nav-link">About</Link>
            <Link to="/contact" className="nav-link">Contact</Link>
          </div>

          <div className="navbar-auth">
            {isAuthenticated ? (
              <>
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

      {/* Hero Section */}
      <section className="hero-section">
        <div className="hero-content">
          <h1 className="hero-title">Welcome to NexusMart</h1>
          <p className="hero-subtitle">
            Your one-stop destination for all your shopping needs. 
            Find amazing products at unbeatable prices.
          </p>
          <div className="hero-buttons">
            <Link to="/products" className="hero-btn primary-btn">
              Shop Now
            </Link>
            {!isAuthenticated && (
              <Link to="/register" className="hero-btn secondary-btn">
                Join Now
              </Link>
            )}
          </div>
        </div>
        <div className="hero-image">
          <div className="image-placeholder">
            <span className="image-icon">🛍️</span>
          </div>
        </div>
      </section>

      {/* Categories Section - Horizontal Scroll */}
      <section className="categories-section">
        <div className="section-header">
          <h2 className="section-title">Shop by Category</h2>
          <p className="section-subtitle">
            Browse our wide range of categories
          </p>
        </div>
        
        {loadingCategories ? (
          <div className="loading-categories">
            <div className="loading-spinner"></div>
            <p>Loading categories...</p>
          </div>
        ) : categoriesError ? (
          <div className="categories-error">
            <p>{categoriesError}</p>
            <button onClick={fetchCategories} className="retry-btn">
              Try Again
            </button>
          </div>
        ) : categories.length > 0 ? (
          <div className="categories-container">
            {/* Left Scroll Button */}
            <button className="scroll-btn left-scroll-btn" onClick={scrollLeft}>
              ←
            </button>
            
            {/* Categories Horizontal Scroll */}
            <div className="categories-scroll" ref={categoriesContainerRef}>
              {categories.map((category) => (
                <div 
                  key={category._id} 
                  className="category-card"
                  onClick={() => handleCategoryClick(category._id)}
                  style={{ cursor: 'pointer' }}
                >
                  <div className="category-image-container">
                    <img 
                      src={category.image} 
                      alt={category.name}
                      className="category-image"
                      loading="lazy"
                      onError={(e) => {
                        e.target.src = `https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?w=300&h=200&fit=crop&q=80`;
                      }}
                    />
                    <div className="category-overlay"></div>
                  </div>
                  <div className="category-content">
                    <h3 className="category-title">{category.name}</h3>
                    <p className="category-desc">{category.description}</p>
                    <button className="category-view-btn">
                      View Products →
                    </button>
                  </div>
                </div>
              ))}
            </div>
            
            {/* Right Scroll Button */}
            <button className="scroll-btn right-scroll-btn" onClick={scrollRight}>
              →
            </button>
          </div>
        ) : (
          <div className="no-categories">
            <p>No categories available at the moment.</p>
          </div>
        )}
        
        <div className="view-all-categories">
          <button onClick={handleViewAllCategories} className="view-all-btn">
            View All Categories
          </button>
        </div>
      </section>

      {/* Featured Products Section */}
      <section className="products-section">
        <div className="section-header">
          <h2 className="section-title">Featured Products</h2>
          <p className="section-subtitle">
            Discover our handpicked selection
          </p>
        </div>
        
        {loadingProducts ? (
          <div className="loading-products">
            <div className="loading-spinner"></div>
            <p>Loading products...</p>
          </div>
        ) : productsError && featuredProducts.length === 0 ? (
          <div className="products-error">
            <p>{productsError}</p>
            <button onClick={fetchFeaturedProducts} className="retry-btn">
              Try Again
            </button>
          </div>
        ) : featuredProducts.length > 0 ? (
          <>
            <div className="products-grid">
              {featuredProducts.map((product) => (
                <div 
                  key={product._id} 
                  className="product-card"
                  onClick={() => handleProductClick(product._id)}
                >
                  <div className="product-image-container">
                    <img 
                      src={product.image || 'https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?w=300&h=200&fit=crop&q=80'} 
                      alt={product.name}
                      className="product-image"
                      onError={(e) => {
                        e.target.src = 'https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?w=300&h=200&fit=crop&q=80';
                      }}
                    />
                    {product.discount > 0 && (
                      <span className="product-discount">
                        -{product.discount}%
                      </span>
                    )}
                  </div>
                  <div className="product-content">
                    <h3 className="product-title">{product.name}</h3>
                    <p className="product-category">{product.category?.name || 'Uncategorized'}</p>
                    <div className="product-price">
                      {product.discount > 0 ? (
                        <>
                          <span className="current-price">
                            ${((product.price * (100 - product.discount)) / 100).toFixed(2)}
                          </span>
                          <span className="original-price">${product.price?.toFixed(2) || '0.00'}</span>
                        </>
                      ) : (
                        <span className="current-price">${product.price?.toFixed(2) || '0.00'}</span>
                      )}
                    </div>
                    <p className="product-description">
                      {product.description?.substring(0, 60)}...
                    </p>
                  </div>
                </div>
              ))}
            </div>
            
            <div className="view-all-products">
              <button onClick={handleViewAllProducts} className="view-all-btn">
                View All Products →
              </button>
            </div>
          </>
        ) : (
          <div className="no-products">
            <p>No products available at the moment.</p>
            <button onClick={handleViewAllProducts} className="view-all-btn">
              Browse All Products
            </button>
          </div>
        )}
      </section>

      {/* Features Section */}
      <section className="features-section">
        <h2 className="section-title">Why Choose NexusMart?</h2>
        <div className="features-grid">
          <div className="feature-card">
            <div className="feature-icon">🚚</div>
            <div className="feature-content">
              <h3 className="feature-title">Fast Delivery</h3>
              <p className="feature-desc">
                Get your products delivered to your doorstep in no time
              </p>
            </div>
          </div>
          <div className="feature-card">
            <div className="feature-icon">💰</div>
            <div className="feature-content">
              <h3 className="feature-title">Best Prices</h3>
              <p className="feature-desc">
                Enjoy competitive prices and exclusive deals
              </p>
            </div>
          </div>
          <div className="feature-card">
            <div className="feature-icon">🛡️</div>
            <div className="feature-content">
              <h3 className="feature-title">Secure Shopping</h3>
              <p className="feature-desc">
                Shop with confidence with our secure payment system
              </p>
            </div>
          </div>
          <div className="feature-card">
            <div className="feature-icon">⭐</div>
            <div className="feature-content">
              <h3 className="feature-title">Quality Products</h3>
              <p className="feature-desc">
                Carefully curated selection of high-quality products
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      {!isAuthenticated && (
        <section className="cta-section">
          <div className="cta-content">
            <h2 className="cta-title">Ready to Start Shopping?</h2>
            <p className="cta-text">
              Create an account now and enjoy exclusive benefits
            </p>
            <div className="cta-buttons">
              <Link to="/register" className="cta-btn primary-btn">
                Create Free Account
              </Link>
              <Link to="/login" className="cta-btn secondary-btn">
                Already have an account? Login
              </Link>
            </div>
          </div>
        </section>
      )}

      {/* Footer */}
      <footer className="home-footer">
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

export default Home;