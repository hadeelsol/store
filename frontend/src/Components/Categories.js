// frontend/src/pages/Categories.js
import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import authService from '../Components/auth';
import categoryService from '../Components/categoryService';
import './Categories.css';

const Categories = () => {
  const navigate = useNavigate();
  const isAuthenticated = authService.isAuthenticated();
  const currentUser = authService.getCurrentUser();
  
  // State for categories
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [searchTerm, setSearchTerm] = useState('');

  // Fetch categories on component mount
  useEffect(() => {
    fetchCategories();
  }, []);

  // Function to get category image based on name
  const getCategoryImage = (categoryName) => {
    // Handle the typo "FRIUTS" from your database
    const imageMap = {
      'FRIUTS': 'https://images.unsplash.com/photo-1610832958506-aa56368176cf?w=300&h=200&fit=crop',
      'friuts': 'https://images.unsplash.com/photo-1610832958506-aa56368176cf?w=300&h=200&fit=crop',
      'FRUITS': 'https://images.unsplash.com/photo-1610832958506-aa56368176cf?w=300&h=200&fit=crop',
      'fruits': 'https://images.unsplash.com/photo-1610832958506-aa56368176cf?w=300&h=200&fit=crop',
      
      'CHEESE': 'https://images.unsplash.com/photo-1486297678162-eb2a19b0a32d?w=300&h=200&fit=crop',
      'cheese': 'https://images.unsplash.com/photo-1486297678162-eb2a19b0a32d?w=300&h=200&fit=crop',
      
      'VEGETABLES': 'https://images.unsplash.com/photo-1597362925123-77861d3fbac7?w=300&h=200&fit=crop',
      'vegetables': 'https://images.unsplash.com/photo-1597362925123-77861d3fbac7?w=300&h=200&fit=crop',
      
      'CHICKEN': 'https://images.unsplash.com/photo-1604503468506-a8da13d82791?w=300&h=200&fit=crop',
      'chicken': 'https://images.unsplash.com/photo-1604503468506-a8da13d82791?w=300&h=200&fit=crop',
      
      'MEAT': 'https://images.unsplash.com/photo-1607623814075-e51df1bdc82f?w=300&h=200&fit=crop',
      'meat': 'https://images.unsplash.com/photo-1607623814075-e51df1bdc82f?w=300&h=200&fit=crop',
    };
    
    console.log(`Getting image for category: "${categoryName}"`);
    
    // First try exact match
    if (imageMap[categoryName]) {
      console.log(`Exact match found for "${categoryName}"`);
      return imageMap[categoryName];
    }
    
    // Try lowercase
    const lowerName = categoryName.toLowerCase();
    if (imageMap[lowerName]) {
      console.log(`Lowercase match found for "${categoryName}" -> "${lowerName}"`);
      return imageMap[lowerName];
    }
    
    // Try uppercase
    const upperName = categoryName.toUpperCase();
    if (imageMap[upperName]) {
      console.log(`Uppercase match found for "${categoryName}" -> "${upperName}"`);
      return imageMap[upperName];
    }
    
    console.log(`No match found for "${categoryName}", using fallback`);
    return `https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?w=300&h=200&fit=crop&q=80`;
  };

  const fetchCategories = async () => {
    setLoading(true);
    setError('');
    
    try {
      console.log('Fetching categories from Categories.js...');
      const result = await categoryService.getActiveCategories();
      console.log('Categories API Response in Categories.js:', result);
      
      if (result.success) {
        console.log('Raw categories data:', result.data);
        // Add images to categories with debugging
        const categoriesWithImages = result.data.map(category => {
          console.log(`Processing category: ${category.name} (ID: ${category._id})`);
          const image = getCategoryImage(category.name);
          console.log(`Image for ${category.name}:`, image);
          
          return {
            ...category,
            image: image
          };
        });
        
        console.log('Categories with images:', categoriesWithImages);
        setCategories(categoriesWithImages);
      } else {
        setError(result.message || 'Failed to load categories');
      }
    } catch (error) {
      console.error('Error fetching categories in Categories.js:', error);
      setError('Unable to load categories. Please try again later.');
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    authService.logout();
    navigate('/');
  };

  // Filter categories based on search term
  const filteredCategories = categories.filter(category =>
    category.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (category.description && category.description.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  return (
    <div className="categories-page">
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
            <Link to="/categories" className="nav-link active">Categories</Link>
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

      <main className="categories-main">
        {/* Header Section */}
        <header className="categories-header">
          <h1 className="categories-title">All Categories</h1>
          <p className="categories-subtitle">
            Browse through our wide range of product categories
          </p>
         
          <div className="search-container">
            <div className="search-input-group">
              <span className="search-icon">🔍</span>
              <input
                type="text"
                placeholder="Search categories..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="search-input"
              />
              {searchTerm && (
                <button 
                  onClick={() => setSearchTerm('')}
                  className="clear-search-btn"
                >
                  ✕
                </button>
              )}
            </div>
          </div>
        </header>

        {/* Categories Content */}
        <div className="categories-content">
          {loading ? (
            <div className="loading-state">
              <div className="loading-spinner"></div>
              <p>Loading categories...</p>
            </div>
          ) : error ? (
            <div className="error-state">
              <div className="error-icon">⚠️</div>
              <p>{error}</p>
              <button onClick={fetchCategories} className="retry-btn">
                Try Again
              </button>
            </div>
          ) : (
            <>
              {/* Categories Count */}
              <div className="categories-info">
                <p className="categories-count">
                  Showing {filteredCategories.length} of {categories.length} categories
                  {searchTerm && (
                    <span className="search-term">
                      {' '}for "{searchTerm}"
                    </span>
                  )}
                </p>
              </div>

              {/* Categories Grid */}
              {filteredCategories.length > 0 ? (
                <div className="categories-grid">
                  {filteredCategories.map((category) => (
                    <Link 
                      key={category._id} 
                     to={`/products/category/${category._id}`}
                      className="category-card"
                    >
                      <div className="category-image-container">
                        <img 
                          src={category.image} 
                          alt={category.name}
                          className="category-image"
                          loading="lazy"
                          onError={(e) => {
                            console.log('Image error for category:', category.name, 'Current src:', e.target.src);
                            e.target.src = `https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?w=300&h=200&fit=crop&q=80`;
                          }}
                        />
                        <div className="category-overlay"></div>
                        <div className="category-status">
                          {category.status === 'active' ? 'Active' : 'Inactive'}
                        </div>
                      </div>
                      <div className="category-content">
                        <h3 className="category-title">{category.name}</h3>
                        <p className="category-description">
                          {category.description || 'No description available'}
                        </p>
                        <div className="category-footer">
                          <span className="category-arrow">→</span>
                        </div>
                      </div>
                    </Link>
                  ))}
                </div>
              ) : (
                <div className="no-results">
                  <div className="no-results-icon">😕</div>
                  <h3>No categories found</h3>
                  <p>
                    {searchTerm 
                      ? `No categories match "${searchTerm}". Try a different search term.`
                      : 'No categories are available at the moment.'
                    }
                  </p>
                  {searchTerm && (
                    <button 
                      onClick={() => setSearchTerm('')}
                      className="clear-search-btn large"
                    >
                      Clear Search
                    </button>
                  )}
                </div>
              )}

              {/* Back to Home */}
              <div className="back-to-home">
                <Link to="/" className="back-btn">
                  ← Back to Home
                </Link>
              </div>
            </>
          )}
        </div>
      </main>

      {/* Footer */}
      <footer className="categories-footer">
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

export default Categories;
