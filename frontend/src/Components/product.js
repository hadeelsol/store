// frontend/src/pages/Products.js
import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation, useParams } from 'react-router-dom';
import { authService } from '../Components/auth';
import categoryService from './categoryService';
import productService from './productService';
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
  
  // State for pagination
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalProducts, setTotalProducts] = useState(0);
  const limit = 12;
  
  // State for filters
  const [searchTerm, setSearchTerm] = useState('');
  const [sortBy, setSortBy] = useState('newest');
  const [priceRange, setPriceRange] = useState({ min: 0, max: 1000 });
// Add this useEffect to debug the data coming from backend
useEffect(() => {
  if (products.length > 0) {
    console.log('DEBUG - Products data from backend:');
    products.forEach((product, index) => {
      console.log(`Product ${index + 1}: ${product.name}`, {
        id: product._id,
        imagesArray: product.images, // Check if this exists
        firstImage: product.images ? product.images[0] : 'No images',
        imageProperty: product.image, // Check this property
        category: product.category?.name
      });
      
      // Test if image URL is accessible
      if (product.images && product.images.length > 0) {
        console.log(`Testing image URL: ${product.images[0]}`);
        // You can try opening this URL in browser
      }
    });
  }
}, [products]);
  // Get category ID from URL
  const getCategoryId = () => {
    if (categoryId) return categoryId;
    
    const searchParams = new URLSearchParams(location.search);
    return searchParams.get('category');
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
      'FRUIT': 'https://images.unsplash.com/photo-1610832958506-aa56368176cf?w=300&h=200&fit=crop',
      'Vegetables': 'https://images.unsplash.com/photo-1597362925123-77861d3fbac7?w=300&h=200&fit=crop',
      'Meat': 'https://images.unsplash.com/photo-1607623814075-e51df1bdc82f?w=300&h=200&fit=crop',
      'Chicken': 'https://images.unsplash.com/photo-1604503468506-a8da13d82791?w=300&h=200&fit=crop',
      'Cheese': 'https://images.unsplash.com/photo-1486297678162-eb2a19b0a32d?w=300&h=200&fit=crop'
    };
    
    return imageMap[categoryName] || `https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?w=300&h=200&fit=crop&q=80`;
  };

  // Function to get product image - UPDATED
  const getProductImage = (product) => {
    console.log('Getting image for product:', {
      name: product.name,
      backendImages: product.images,
      hasImages: product.images && product.images.length > 0
    });

    // Priority 1: Use image from backend if available
    if (product.images && product.images.length > 0) {
      const imageUrl = product.images[0];
      console.log('Using backend image:', imageUrl);
      return imageUrl;
    }

    // Priority 2: Fallback based on product name
    const lowerName = product.name.toLowerCase();
    const imageMap = {
      'apple': 'https://images.unsplash.com/photo-1568702846914-96b305d2aaeb?w=300&h=200&fit=crop',
      'banana': 'https://images.unsplash.com/photo-1571771894821-ce9b6c11b08e?w=300&h=200&fit=crop',
      'bananna': 'https://images.unsplash.com/photo-1571771894821-ce9b6c11b08e?w=300&h=200&fit=crop',
      'orange': 'https://images.unsplash.com/photo-1547514701-42782101795e?w=300&h=200&fit=crop',
      'tomato': 'https://images.unsplash.com/photo-1592924357228-91a4daadcfea?w=300&h=200&fit=crop',
      'carrot': 'https://images.unsplash.com/photo-1582515073490-39981397c445?w=300&h=200&fit=crop',
      'broccoli': 'https://images.unsplash.com/photo-1459411552884-841db9b3cc2a?w=300&h=200&fit=crop',
      'chicken': 'https://images.unsplash.com/photo-1604503468506-a8da13d82791?w=300&h=200&fit=crop',
      'beef': 'https://images.unsplash.com/photo-1607623814075-e51df1bdc82f?w=300&h=200&fit=crop',
      'cheese': 'https://images.unsplash.com/photo-1486297678162-eb2a19b0a32d?w=300&h=200&fit=crop',
      'milk': 'https://images.unsplash.com/photo-1550583721-58731aebf5c5?w=300&h=200&fit=crop',
      'hallom': 'https://images.unsplash.com/photo-1486297678162-eb2a19b0a32d?w=300&h=200&fit=crop'
    };

    for (const [key, image] of Object.entries(imageMap)) {
      if (lowerName.includes(key)) {
        console.log('Using fallback image for:', key);
        return image;
      }
    }

    // Priority 3: Use category-based fallback
    if (product.category && product.category.name) {
      const categoryImages = {
        'FRUIT': 'https://images.unsplash.com/photo-1610832958506-aa56368176cf?w=300&h=200&fit=crop',
        'Vegetables': 'https://images.unsplash.com/photo-1597362925123-77861d3fbac7?w=300&h=200&fit=crop',
        'Meat': 'https://images.unsplash.com/photo-1607623814075-e51df1bdc82f?w=300&h=200&fit=crop',
        'Chicken': 'https://images.unsplash.com/photo-1604503468506-a8da13d82791?w=300&h=200&fit=crop',
        'Cheese': 'https://images.unsplash.com/photo-1486297678162-eb2a19b0a32d?w=300&h=200&fit=crop'
      };
      
      const categoryImage = categoryImages[product.category.name];
      if (categoryImage) {
        console.log('Using category fallback image:', product.category.name);
        return categoryImage;
      }
    }

    // Priority 4: Default fallback
    console.log('Using default fallback image');
    return 'https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?w=300&h=200&fit=crop&q=80';
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
      month: 'short',
      day: 'numeric'
    });
  };

  // Fetch products - UPDATED
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
        // Fetch all products with filters
        const filters = {
          page,
          limit,
          category: catId,
          search: searchTerm
        };
        result = await productService.getAllProducts(filters);
      }
      
      if (result.success) {
        const data = result.data;
        
        // UPDATED: Add images to products
        const productsWithImages = data.products?.map(product => ({
          ...product,
          // Use getProductImage function with the entire product object
          image: getProductImage(product)
        })) || [];
        
        setProducts(productsWithImages);
        setTotalPages(data.totalPages || 1);
        setTotalProducts(data.totalProducts || 0);
        setCurrentPage(data.currentPage || 1);

        // Debug log
        console.log('Products loaded with images:', productsWithImages);
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
    // Implement sorting logic here
  };

  // Handle page change
  const handlePageChange = (page) => {
    setCurrentPage(page);
    fetchProducts(page);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Initial fetch
  useEffect(() => {
    fetchProducts(currentPage);
  }, [location.search, categoryId]);

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
          {category ? (
            <div className="category-banner">
              <div className="category-info">
                <h1 className="category-title">{category.name}</h1>
                <p className="category-description">{category.description}</p>
                <p className="products-count">{totalProducts} products available</p>
              </div>
              <div className="category-image-wrapper">
                <img 
                  src={category.image} 
                  alt={category.name}
                  className="category-banner-image"
                />
              </div>
            </div>
          ) : (
            <div className="page-header">
              <h1 className="page-title">All Products</h1>
              <p className="page-subtitle">
                Browse our wide selection of products
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
              {/* Products Grid */}
              <div className="products-grid">
                {products.map((product) => (
                  <div key={product._id} className="product-card">
                    <Link to={`/product/${product._id}`} className="product-link">
                      <div className="product-image-container">
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
                      </div>
                      <div className="product-content">
                        <h3 className="product-name">{product.name}</h3>
                        <p className="product-description">
                          {product.description?.substring(0, 60)}...
                        </p>
                        <div className="product-meta">
                          <span className="product-category">
                            {product.category?.name || 'Uncategorized'}
                          </span>
                          <span className="product-date">
                            {formatDate(product.createdAt)}
                          </span>
                        </div>
                        <div className="product-footer">
                          <span className="product-price">
                            {formatPrice(product.price)}
                          </span>
                          <span className="product-stock">
                            Stock: {product.quantity || 'N/A'}
                          </span>
                        </div>
                      </div>
                    </Link>
                    <button className="add-to-cart-btn">
                      <span className="cart-icon">🛒</span>
                      Add to Cart
                    </button>
                  </div>
                ))}
              </div>

              {/* Pagination */}
              {totalPages > 1 && (
                <div className="pagination">
                  <button
                    onClick={() => handlePageChange(currentPage - 1)}
                    disabled={currentPage === 1}
                    className="pagination-btn prev-btn"
                  >
                    ← Previous
                  </button>
                  
                  <div className="page-numbers">
                    {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                      let pageNum;
                      if (totalPages <= 5) {
                        pageNum = i + 1;
                      } else if (currentPage <= 3) {
                        pageNum = i + 1;
                      } else if (currentPage >= totalPages - 2) {
                        pageNum = totalPages - 4 + i;
                      } else {
                        pageNum = currentPage - 2 + i;
                      }
                      
                      return (
                        <button
                          key={pageNum}
                          onClick={() => handlePageChange(pageNum)}
                          className={`page-btn ${currentPage === pageNum ? 'active' : ''}`}
                        >
                          {pageNum}
                        </button>
                      );
                    })}
                    
                    {totalPages > 5 && currentPage < totalPages - 2 && (
                      <>
                        <span className="page-dots">...</span>
                        <button
                          onClick={() => handlePageChange(totalPages)}
                          className={`page-btn ${currentPage === totalPages ? 'active' : ''}`}
                        >
                          {totalPages}
                        </button>
                      </>
                    )}
                  </div>
                  
                  <button
                    onClick={() => handlePageChange(currentPage + 1)}
                    disabled={currentPage === totalPages}
                    className="pagination-btn next-btn"
                  >
                    Next →
                  </button>
                </div>
              )}

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
                  : 'No products are available in this category.'
                }
              </p>
              <div className="no-products-actions">
                <Link to="/categories" className="back-to-categories-btn">
                  ← Browse Categories
                </Link>
                <button 
                  onClick={() => setSearchTerm('')}
                  className="clear-filters-btn"
                >
                  Clear Filters
                </button>
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