// frontend/src/pages/Products.js
import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation, useParams } from 'react-router-dom';
import { authService } from '../Components/auth';
import categoryService from '../Components/categoryService';
import productService from '../Components/productService';
import cartService from './cartServices';
import './product.css';

const Products = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { categoryId } = useParams();
  
  const isAuthenticated = authService.isAuthenticated();
  const currentUser = authService.getCurrentUser();
  
  // State for products
  const [products, setProducts] = useState([]);
  const [category, setCategory] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [cartCount, setCartCount] = useState(0);
  
  // State for pagination
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalProducts, setTotalProducts] = useState(0);
  const limit = 12;
  
  // State for filters
  const [searchTerm, setSearchTerm] = useState('');
  const [sortBy, setSortBy] = useState('newest');

  // Fetch cart count
  useEffect(() => {
    if (isAuthenticated) {
      fetchCartCount();
    }
  }, [isAuthenticated]);

  // Get category ID from URL
  const getCategoryId = () => {
    if (categoryId) return categoryId;
    
    const searchParams = new URLSearchParams(location.search);
    return searchParams.get('category');
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

  // Add to cart function
  const addToCart = async (product) => {
    if (!isAuthenticated) {
      alert('Please login to add items to cart');
      navigate('/login');
      return;
    }
    
    try {
      await cartService.addToCart(product._id, 1);
      await fetchCartCount();
      alert(`✅ ${product.name} added to cart!`);
    } catch (error) {
      console.error('Error adding to cart:', error);
      alert('Failed to add item to cart. Please try again.');
    }
  };

  // Fetch category details
  const fetchCategoryDetails = async (catId) => {
    if (!catId) return;
    
    try {
      const result = await categoryService.getActiveCategories();
      if (result.success) {
        const foundCategory = result.data.find(cat => cat._id === catId);
        if (foundCategory) {
          setCategory(foundCategory);
        }
      }
    } catch (error) {
      console.error('Error fetching category details:', error);
    }
  };

  // Function to get product image
  const getProductImage = (product) => {
    if (product.images && product.images.length > 0) {
      const imageUrl = product.images[0];
      if (imageUrl && !imageUrl.startsWith('http')) {
        const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000';
        return `${API_URL}${imageUrl.startsWith('/') ? '' : '/'}${imageUrl}`;
      }
      return imageUrl;
    }

    // Fallback image
    return 'https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?w=300&h=200&fit=crop&q=80';
  };

  // Format price
  const formatPrice = (price) => {
    return `$${parseFloat(price).toFixed(2)}`;
  };

  // Fetch products
  const fetchProducts = async (page = 1) => {
    setLoading(true);
    setError('');
    
    try {
      const catId = getCategoryId();
      let result;
      
      if (catId) {
        result = await productService.getProductsByCategory(catId, page, limit);
        await fetchCategoryDetails(catId);
      } else {
        const filters = { page, limit, search: searchTerm };
        result = await productService.getAllProducts(filters);
      }
      
      if (result.success) {
        const data = result.data;
        
        const productsWithImages = (data.products || data.data || []).map(product => ({
          ...product,
          image: getProductImage(product)
        }));
        
        setProducts(productsWithImages);
        setTotalPages(data.totalPages || 1);
        setTotalProducts(data.totalProducts || productsWithImages.length || 0);
        setCurrentPage(data.currentPage || 1);
      } else {
        setError(result.message);
        setProducts([]);
      }
    } catch (error) {
      console.error('Error fetching products:', error);
      setError('Unable to load products. Please try again later.');
      setProducts([]);
    } finally {
      setLoading(false);
    }
  };

  // Handle search
  const handleSearch = (e) => {
    e.preventDefault();
    setCurrentPage(1);
    fetchProducts(1);
  };

  // Handle product click
  const handleProductClick = (productId) => {
    navigate(`/product/${productId}`);
  };

  // Initial fetch
  useEffect(() => {
    fetchProducts(currentPage);
  }, [categoryId, location.search]);

  const handleLogout = () => {
    authService.logout();
    navigate('/');
  };

  return (
    <div className="products-page">
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
            <Link to="/products" className="nav-link active">Products</Link>
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

      {/* Main Content */}
      <main className="products-main">
        {/* Header Section */}
        <header className="products-header">
          {category && categoryId ? (
            <div className="category-banner">
              <div className="category-info">
                <h1 className="category-title">{category.name}</h1>
                <p className="category-description">
                  {category.description || 'Browse products in this category'}
                </p>
                <p className="products-count">
                  {totalProducts > 0 
                    ? `${totalProducts} products available` 
                    : 'No products available'}
                </p>
              </div>
            </div>
          ) : (
            <div className="page-header">
              <h1 className="page-title">
                {categoryId ? `Category Products` : 'All Products'}
              </h1>
              <p className="page-subtitle">
                {categoryId 
                  ? 'Browse products in this category' 
                  : 'Browse our wide selection of products'}
              </p>
            </div>
          )}

          {/* Filters and Search */}
          <div className="filters-section">
            <form onSubmit={handleSearch} className="search-form">
              <div className="search-input-group">
                <input
                  type="text"
                  placeholder="Search products..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="search-input"
                />
                <button type="submit" className="search-btn">
                  <span className="search-icon">🔍</span>
                  Search
                </button>
              </div>
            </form>
          </div>
        </header>

        {/* Products Content */}
        <div className="products-content">
          {loading ? (
            <div className="loading-state">
              <div className="loading-spinner"></div>
              <p>Loading products...</p>
            </div>
          ) : error ? (
            <div className="error-state">
              <div className="error-icon">⚠️</div>
              <p>{error}</p>
              <button onClick={() => fetchProducts(currentPage)} className="retry-btn">
                Try Again
              </button>
            </div>
          ) : products.length > 0 ? (
            <>
              {/* Products Grid */}
              <div className="products-grid">
                {products.map((product) => (
                  <div key={product._id} className="product-card">
                    <div 
                      className="product-image-container"
                      onClick={() => handleProductClick(product._id)}
                      style={{ cursor: 'pointer' }}
                    >
                      <img 
                        src={product.image} 
                        alt={product.name}
                        className="product-image"
                        loading="lazy"
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
                      <h3 
                        className="product-name"
                        onClick={() => handleProductClick(product._id)}
                        style={{ cursor: 'pointer' }}
                      >
                        {product.name}
                      </h3>
                      
                      <p className="product-description">
                        {product.description?.substring(0, 60) || 'No description available'}...
                      </p>
                      
                      <div className="product-meta">
                        <span className="product-category">
                          {product.category?.name || 'Uncategorized'}
                        </span>
                      </div>
                      
                      <div className="product-price-row">
                        <div className="product-price">
                          {product.discount > 0 ? (
                            <>
                              <span className="current-price">
                                ${((product.price * (100 - product.discount)) / 100).toFixed(2)}
                              </span>
                              <span className="original-price">
                                ${product.price?.toFixed(2) || '0.00'}
                              </span>
                            </>
                          ) : (
                            <span className="current-price">
                              ${product.price?.toFixed(2) || '0.00'}
                            </span>
                          )}
                        </div>
                      </div>
                      
                      {/* Add to Cart Button */}
                      <div className="product-actions">
                        {isAuthenticated ? (
                          <button 
                            className="add-to-cart-btn"
                            onClick={(e) => {
                              e.stopPropagation();
                              addToCart(product);
                            }}
                          >
                            🛒 Add to Cart
                          </button>
                        ) : (
                          <button 
                            className="add-to-cart-btn login-required"
                            onClick={(e) => {
                              e.stopPropagation();
                              alert('Please login to add items to cart');
                              navigate('/login');
                            }}
                          >
                            🔒 Login to Buy
                          </button>
                        )}
                        
                        <button 
                          className="view-details-btn"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleProductClick(product._id);
                          }}
                        >
                          View Details →
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {/* Results Info */}
              <div className="results-info">
                <p>
                  Showing {(currentPage - 1) * limit + 1} to {Math.min(currentPage * limit, totalProducts)} 
                  {' '}of {totalProducts} products
                  {category && ` in ${category.name}`}
                </p>
              </div>
            </>
          ) : (
            <div className="no-products">
              <div className="no-products-icon">😕</div>
              <h3>No products found</h3>
              <p>
                {searchTerm 
                  ? `No products match "${searchTerm}". Try a different search term.`
                  : category
                    ? `No products available in ${category.name} category.`
                    : 'No products are available at the moment.'
                }
              </p>
              <div className="no-products-actions">
                <Link to="/categories" className="back-to-categories-btn">
                  ← Browse Categories
                </Link>
                {searchTerm && (
                  <button 
                    onClick={() => setSearchTerm('')}
                    className="clear-filters-btn"
                  >
                    Clear Search
                  </button>
                )}
              </div>
            </div>
          )}
        </div>
      </main>

      {/* Footer */}
      <footer className="products-footer">
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
        </div>
        <div className="footer-bottom">
          <p>&copy; {new Date().getFullYear()} NexusMart. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
};

export default Products;
