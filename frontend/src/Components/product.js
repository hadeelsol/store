// frontend/src/pages/Products.js
import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation, useParams } from 'react-router-dom';
import { authService } from '../Components/auth';
import categoryService from '../Components/categoryService';
import productService from '../Components/productService';
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
  
  // Shopping cart state
  const [cart, setCart] = useState(() => {
    // Initialize cart from localStorage
    const savedCart = localStorage.getItem('nexusmart_cart');
    return savedCart ? JSON.parse(savedCart) : [];
  });
  const [cartCount, setCartCount] = useState(0);
  
  // State for pagination
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalProducts, setTotalProducts] = useState(0);
  const limit = 12;
  
  // State for filters
  const [searchTerm, setSearchTerm] = useState('');
  const [sortBy, setSortBy] = useState('newest');

  // Calculate cart count whenever cart changes
  useEffect(() => {
    const count = cart.reduce((total, item) => total + (item.quantity || 1), 0);
    setCartCount(count);
    // Save cart to localStorage
    localStorage.setItem('nexusmart_cart', JSON.stringify(cart));
  }, [cart]);

  // Get category ID from URL
  const getCategoryId = () => {
    if (categoryId) return categoryId;
    
    const searchParams = new URLSearchParams(location.search);
    return searchParams.get('category');
  };

  // SHOPPING CART FUNCTIONS
  const addToCart = (product) => {
    if (!isAuthenticated) {
      alert('Please login to add items to cart');
      navigate('/login');
      return;
    }
    
    setCart(prevCart => {
      const existingItem = prevCart.find(item => item._id === product._id);
      
      if (existingItem) {
        // Increase quantity if item already exists
        return prevCart.map(item =>
          item._id === product._id
            ? { ...item, quantity: (item.quantity || 1) + 1 }
            : item
        );
      } else {
        // Add new item to cart
        return [...prevCart, { ...product, quantity: 1 }];
      }
    });
    
    // Show success message
    alert(`✅ ${product.name} added to cart!`);
  };

  // Fetch category details
  const fetchCategoryDetails = async (catId) => {
    if (!catId) return;
    
    try {
      const result = await categoryService.getActiveCategories();
      if (result.success) {
        const foundCategory = result.data.find(cat => cat._id === catId);
        if (foundCategory) {
          // Add image to category
          setCategory({
            ...foundCategory,
            image: getCategoryImage(foundCategory.name)
          });
        }
      }
    } catch (error) {
      console.error('Error fetching category details:', error);
    }
  };

  // Function to get category image
  const getCategoryImage = (categoryName) => {
    const imageMap = {
      'FRUITS': 'https://images.unsplash.com/photo-1610832958506-aa56368176cf?w=800&h=400&fit=crop',
      'Fruits': 'https://images.unsplash.com/photo-1610832958506-aa56368176cf?w=800&h=400&fit=crop',
      'CHEESE': 'https://images.unsplash.com/photo-1486297678162-eb2a19b0a32d?w=800&h=400&fit=crop',
      'cheese': 'https://images.unsplash.com/photo-1486297678162-eb2a19b0a32d?w=800&h=400&fit=crop',
      'VEGETABLES': 'https://images.unsplash.com/photo-1597362925123-77861d3fbac7?w=800&h=400&fit=crop',
      'vegetables': 'https://images.unsplash.com/photo-1597362925123-77861d3fbac7?w=800&h=400&fit=crop',
      'CHICKEN': 'https://images.unsplash.com/photo-1604503468506-a8da13d82791?w=800&h=400&fit=crop',
      'chicken': 'https://images.unsplash.com/photo-1604503468506-a8da13d82791?w=800&h=400&fit=crop',
      'MEAT': 'https://images.unsplash.com/photo-1607623814075-e51df1bdc82f?w=800&h=400&fit=crop',
      'meat': 'https://images.unsplash.com/photo-1607623814075-e51df1bdc82f?w=800&h=400&fit=crop',
    };
    
    // Try exact match first
    if (imageMap[categoryName]) {
      return imageMap[categoryName];
    }
    
    // Try uppercase
    const upperName = categoryName.toUpperCase();
    if (imageMap[upperName]) {
      return imageMap[upperName];
    }
    
    // Try lowercase
    const lowerName = categoryName.toLowerCase();
    if (imageMap[lowerName]) {
      return imageMap[lowerName];
    }
    
    return `https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?w=800&h=400&fit=crop&q=80`;
  };

  // Function to get product image
  const getProductImage = (product) => {
    // Priority 1: Use image from backend if available
    if (product.images && product.images.length > 0) {
      const imageUrl = product.images[0];
      if (imageUrl && !imageUrl.startsWith('http')) {
        const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000';
        return `${API_URL}${imageUrl.startsWith('/') ? '' : '/'}${imageUrl}`;
      }
      return imageUrl;
    }

    // Priority 2: Fallback based on product name
    const lowerName = product.name.toLowerCase();
    const imageMap = {
      'apple': 'https://images.unsplash.com/photo-1568702846914-96b305d2aaeb?w=300&h=200&fit=crop',
      'banana': 'https://images.unsplash.com/photo-1571771894821-ce9b6c11b08e?w=300&h=200&fit=crop',
      'orange': 'https://images.unsplash.com/photo-1547514701-42782101795e?w=300&h=200&fit=crop',
      'tomato': 'https://images.unsplash.com/photo-1592924357228-91a4daadcfea?w=300&h=200&fit=crop',
      'carrot': 'https://images.unsplash.com/photo-1582515073490-39981397c445?w=300&h=200&fit=crop',
      'broccoli': 'https://images.unsplash.com/photo-1459411552884-841db9b3cc2a?w=300&h=200&fit=crop',
      'chicken': 'https://images.unsplash.com/photo-1604503468506-a8da13d82791?w=300&h=200&fit=crop',
      'beef': 'https://images.unsplash.com/photo-1607623814075-e51df1bdc82f?w=300&h=200&fit=crop',
      'cheese': 'https://images.unsplash.com/photo-1486297678162-eb2a19b0a32d?w=300&h=200&fit=crop',
      'milk': 'https://images.unsplash.com/photo-1550583721-58731aebf5c5?w=300&h=200&fit=crop',
    };

    for (const [key, image] of Object.entries(imageMap)) {
      if (lowerName.includes(key)) {
        return image;
      }
    }

    // Priority 3: Default fallback
    return 'https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?w=300&h=200&fit=crop&q=80';
  };

  // Format price
  const formatPrice = (price) => {
    return `$${parseFloat(price).toFixed(2)}`;
  };

  // Format date
  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  // Fetch products
  const fetchProducts = async (page = 1) => {
    setLoading(true);
    setError('');
    
    try {
      const catId = getCategoryId();
      let result;
      
      if (catId) {
        // Fetch products by category
        result = await productService.getProductsByCategory(catId, page, limit);
        // Also fetch category details
        await fetchCategoryDetails(catId);
      } else {
        // Fetch all products
        const filters = {
          page,
          limit,
          search: searchTerm
        };
        result = await productService.getAllProducts(filters);
      }
      
      if (result.success) {
        const data = result.data;
        
        // Add images to products
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

  // Handle sort change
  const handleSortChange = (e) => {
    setSortBy(e.target.value);
    // You can implement sorting logic here
    console.log('Sort changed to:', e.target.value);
  };

  // Handle page change
  const handlePageChange = (page) => {
    setCurrentPage(page);
    fetchProducts(page);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Handle product click
  const handleProductClick = (productId) => {
    navigate(`/product/${productId}`);
  };

  // Initial fetch
  useEffect(() => {
    console.log('🔄 useEffect triggered - fetching products');
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
            <Link to="/deals" className="nav-link">Deals</Link>
            <Link to="/about" className="nav-link">About</Link>
            <Link to="/contact" className="nav-link">Contact</Link>
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
                  {cartCount > 0 && (
                    <div className="cart-dropdown">
                      <div className="cart-dropdown-header">
                        <span>Cart ({cartCount} items)</span>
                        <Link to="/cart">View Cart</Link>
                      </div>
                      <div className="cart-dropdown-items">
                        {cart.slice(0, 3).map(item => (
                          <div key={item._id} className="cart-dropdown-item">
                            <img src={item.image} alt={item.name} />
                            <div className="cart-item-info">
                              <span className="cart-item-name">{item.name}</span>
                              <span className="cart-item-price">
                                ${item.discount > 0 
                                  ? ((item.price * (100 - item.discount)) / 100).toFixed(2)
                                  : item.price.toFixed(2)
                                } x {item.quantity || 1}
                              </span>
                            </div>
                          </div>
                        ))}
                        {cart.length > 3 && (
                          <div className="cart-dropdown-more">
                            +{cart.length - 3} more items
                          </div>
                        )}
                      </div>
                      <div className="cart-dropdown-footer">
                        <div className="cart-total">
                          <span>Total:</span>
                          <span>
                            $
                            {cart.reduce((total, item) => {
                              const price = item.discount > 0 
                                ? item.price * (100 - item.discount) / 100 
                                : item.price;
                              return total + (price * (item.quantity || 1));
                            }, 0).toFixed(2)}
                          </span>
                        </div>
                      </div>
                    </div>
                  )}
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
              <div className="category-image-wrapper">
                <img 
                  src={category.image} 
                  alt={category.name}
                  className="category-banner-image"
                  onError={(e) => {
                    console.error('Category banner image failed to load');
                    e.target.src = 'https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?w=800&h=400&fit=crop&q=80';
                  }}
                />
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

            <div className="filter-controls">
              <div className="filter-group">
                <label htmlFor="sort" className="filter-label">Sort by:</label>
                <select 
                  id="sort" 
                  value={sortBy} 
                  onChange={handleSortChange}
                  className="filter-select"
                >
                  <option value="newest">Newest</option>
                  <option value="price-low">Price: Low to High</option>
                  <option value="price-high">Price: High to Low</option>
                  <option value="name">Name: A to Z</option>
                </select>
              </div>
            </div>
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
              {/* Products Grid - UPDATED WITH ADD TO CART BUTTONS */}
              <div className="products-grid">
                {products.map((product) => {
                  const isInCart = cart.some(item => item._id === product._id);
                  const cartItem = cart.find(item => item._id === product._id);
                  
                  return (
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
                            console.error('Image failed to load:', product.image);
                            e.target.src = 'https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?w=300&h=200&fit=crop&q=80';
                          }}
                        />
                        <div className="product-overlay"></div>
                        {product.status === 'out_of_stock' && (
                          <div className="out-of-stock-badge">Out of Stock</div>
                        )}
                        {product.status === 'inactive' && (
                          <div className="inactive-badge">Inactive</div>
                        )}
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
                          <span className="product-date">
                            {formatDate(product.createdAt)}
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
                          <span className="product-stock">
                            Stock: {product.quantity || 'N/A'}
                          </span>
                        </div>
                        
                        {/* ADD TO CART BUTTONS - LIKE HOME PAGE */}
                        <div className="product-actions">
                          {isAuthenticated ? (
                            isInCart ? (
                              <div className="cart-controls">
                                <button 
                                  className="cart-action-btn minus"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    if (cartItem.quantity <= 1) {
                                      setCart(cart.filter(item => item._id !== product._id));
                                    } else {
                                      setCart(cart.map(item =>
                                        item._id === product._id
                                          ? { ...item, quantity: item.quantity - 1 }
                                          : item
                                      ));
                                    }
                                  }}
                                >
                                  −
                                </button>
                                <span className="cart-quantity">
                                  {cartItem.quantity} in cart
                                </span>
                                <button 
                                  className="cart-action-btn plus"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    addToCart(product);
                                  }}
                                >
                                  +
                                </button>
                              </div>
                            ) : (
                              <button 
                                className="add-to-cart-btn"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  addToCart(product);
                                }}
                              >
                                🛒 Add to Cart
                              </button>
                            )
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
                  );
                })}
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
            <Link to="/about" className="footer-link">About Us</Link>
            <Link to="/contact" className="footer-link">Contact</Link>
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

export default Products;
