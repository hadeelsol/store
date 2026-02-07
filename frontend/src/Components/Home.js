// frontend/src/Components/Home.js
import React, { useState, useEffect, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import authService from '../Components/auth';
import categoryService from '../Components/categoryService';
import productService from '../Components/productService';
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
  
  // Shopping cart state - Now using BACKEND CART
  const [cart, setCart] = useState([]);
  const [cartCount, setCartCount] = useState(0);
  const [loadingCart, setLoadingCart] = useState(false);
  
  // Refs for scrolling
  const categoriesContainerRef = useRef(null);

  // Fetch categories and featured products on component mount
  useEffect(() => {
    fetchCategories();
    fetchFeaturedProducts();
    if (isAuthenticated) {
      fetchCartData();
    }
  }, [isAuthenticated]);

  // Function to fetch cart data from backend
  const fetchCartData = async () => {
    if (!isAuthenticated) return;
    
    setLoadingCart(true);
    try {
      const token = localStorage.getItem('token');
      const response = await fetch('/api/cart', {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      
      if (response.ok) {
        const result = await response.json();
        if (result.success && result.data) {
          // Transform backend cart items to match frontend format
          const cartItems = result.data.items?.map(item => ({
            _id: item.product?._id || item.productId,
            name: item.product?.name || 'Product',
            price: item.price || 0,
            quantity: item.quantity || 1,
            image: item.product?.image || 'https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?w=300&h=200&fit=crop&q=80',
            discount: item.product?.discount || 0
          })) || [];
          
          setCart(cartItems);
          
          // Calculate total count
          const totalCount = cartItems.reduce((total, item) => total + (item.quantity || 1), 0);
          setCartCount(totalCount);
        }
      }
    } catch (error) {
      console.error('Error fetching cart:', error);
    } finally {
      setLoadingCart(false);
    }
  };

  // Also fetch just the cart count (for navbar)
  const fetchCartCount = async () => {
    if (!isAuthenticated) return;
    
    try {
      const token = localStorage.getItem('token');
      const response = await fetch('/api/cart/count', {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      
      if (response.ok) {
        const result = await response.json();
        if (result.success) {
          setCartCount(result.count || 0);
        }
      }
    } catch (error) {
      console.error('Error fetching cart count:', error);
    }
  };

  const getCategoryImage = (categoryName) => {
    if (!categoryName) return `https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?w=300&h=200&fit=crop&q=80`;
    
    const categoryImageMap = {
      'FRUITS': 'https://images.unsplash.com/photo-1610832958506-aa56368176cf?w=300&h=200&fit=crop',
      'Fruits': 'https://images.unsplash.com/photo-1610832958506-aa56368176cf?w=300&h=200&fit=crop',
      'CHEESE': 'https://images.unsplash.com/photo-1486297678162-eb2a19b0a32d?w=300&h=200&fit=crop',
      'cheese': 'https://images.unsplash.com/photo-1486297678162-eb2a19b0a32d?w=300&h=200&fit=crop',
      'VEGETABLES': 'https://images.unsplash.com/photo-1597362925123-77861d3fbac7?w=300&h=200&fit=crop',
      'vegetables': 'https://images.unsplash.com/photo-1597362925123-77861d3fbac7?w=300&h=200&fit=crop',
      'CHICKEN': 'https://images.unsplash.com/photo-1604503468506-a8da13d82791?w=300&h=200&fit=crop',
      'chicken': 'https://images.unsplash.com/photo-1604503468506-a8da13d82791?w=300&h=200&fit=crop',
      'MEAT': 'https://images.unsplash.com/photo-1607623814075-e51df1bdc82f?w=300&h=200&fit=crop',
      'meat': 'https://images.unsplash.com/photo-1607623814075-e51df1bdc82f?w=300&h=200&fit=crop',
    };
    
    if (categoryImageMap[categoryName]) {
      return categoryImageMap[categoryName];
    }
    
    const lowerName = categoryName.toLowerCase();
    if (categoryImageMap[lowerName]) {
      return categoryImageMap[lowerName];
    }
    
    const upperName = categoryName.toUpperCase();
    if (categoryImageMap[upperName]) {
      return categoryImageMap[upperName];
    }
    
    return `https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?w=300&h=200&fit=crop&q=80`;
  };

  const fetchCategories = async () => {
    setLoadingCategories(true);
    setCategoriesError('');
    
    try {
      const result = await categoryService.getActiveCategories();
      
      if (result.success) {
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

  const fetchFeaturedProducts = async () => {
    setLoadingProducts(true);
    setProductsError('');
    
    try {
      const result = await productService.getAllProducts({ limit: 4 });
      
      if (result.success) {
        let products = [];
        
        if (result.data.products && Array.isArray(result.data.products)) {
          products = result.data.products;
        } else if (result.data.items && Array.isArray(result.data.items)) {
          products = result.data.items;
        } else if (Array.isArray(result.data.data)) {
          products = result.data.data;
        } else if (Array.isArray(result.data)) {
          products = result.data;
        }
        
        const productsWithImages = products.map(product => {
          let productImage = null;
          
          if (product.images && Array.isArray(product.images) && product.images.length > 0) {
            productImage = product.images[0];
            
            if (productImage && !productImage.startsWith('http')) {
              const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000';
              productImage = `${API_URL}${productImage.startsWith('/') ? '' : '/'}${productImage}`;
            }
          }
          
          if (!productImage) {
            productImage = getCategoryImage(product.category?.name);
          }
          
          return {
            ...product,
            image: productImage || 'https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?w=300&h=200&fit=crop&q=80'
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

  // SHOPPING CART FUNCTIONS - UPDATED TO USE BACKEND
  const addToCart = async (product) => {
    if (!isAuthenticated) {
      alert('Please login to add items to cart');
      navigate('/login');
      return;
    }
    
    try {
      const token = localStorage.getItem('token');
      const response = await fetch('/api/cart/add', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ 
          productId: product._id, 
          quantity: 1 
        })
      });
      
      const result = await response.json();
      
      if (result.success) {
        // Update local cart state for immediate UI update
        setCart(prevCart => {
          const existingItem = prevCart.find(item => item._id === product._id);
          
          if (existingItem) {
            return prevCart.map(item =>
              item._id === product._id
                ? { ...item, quantity: (item.quantity || 1) + 1 }
                : item
            );
          } else {
            return [...prevCart, { 
              ...product, 
              quantity: 1,
              image: product.image || 'https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?w=300&h=200&fit=crop&q=80'
            }];
          }
        });
        
        // Update cart count
        setCartCount(prev => prev + 1);
        
        alert(`✅ ${product.name} added to cart!`);
      } else {
        alert(result.message || 'Failed to add to cart');
      }
    } catch (error) {
      console.error('Error adding to cart:', error);
      alert('Failed to add item to cart. Please try again.');
    }
  };

  const updateCartQuantity = async (productId, newQuantity) => {
    if (!isAuthenticated) return;
    
    if (newQuantity < 1) {
      // Remove item if quantity is 0
      removeFromCart(productId);
      return;
    }
    
    try {
      const token = localStorage.getItem('token');
      
      // First find the cart item ID
      const cartResponse = await fetch('/api/cart', {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      
      if (cartResponse.ok) {
        const cartResult = await cartResponse.json();
        if (cartResult.success) {
          const cartItem = cartResult.data.items?.find(item => 
            item.product?._id === productId || item.productId === productId
          );
          
          if (cartItem && cartItem._id) {
            // Update quantity on backend
            await fetch(`/api/cart/item/${cartItem._id}`, {
              method: 'PUT',
              headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
              },
              body: JSON.stringify({ quantity: newQuantity })
            });
            
            // Update local state
            setCart(prevCart =>
              prevCart.map(item =>
                item._id === productId
                  ? { ...item, quantity: newQuantity }
                  : item
              )
            );
          }
        }
      }
    } catch (error) {
      console.error('Error updating cart:', error);
    }
  };

  const removeFromCart = async (productId) => {
    if (!isAuthenticated) return;
    
    try {
      const token = localStorage.getItem('token');
      
      // First find the cart item ID
      const cartResponse = await fetch('/api/cart', {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      
      if (cartResponse.ok) {
        const cartResult = await cartResponse.json();
        if (cartResult.success) {
          const cartItem = cartResult.data.items?.find(item => 
            item.product?._id === productId || item.productId === productId
          );
          
          if (cartItem && cartItem._id) {
            // Remove from backend
            await fetch(`/api/cart/item/${cartItem._id}`, {
              method: 'DELETE',
              headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
              }
            });
            
            // Update local state
            const itemToRemove = cart.find(item => item._id === productId);
            const quantityToRemove = itemToRemove?.quantity || 1;
            
            setCart(prevCart => prevCart.filter(item => item._id !== productId));
            setCartCount(prev => Math.max(0, prev - quantityToRemove));
          }
        }
      }
    } catch (error) {
      console.error('Error removing from cart:', error);
    }
  };

  const handleCategoryClick = (categoryId) => {
    navigate(`/products?category=${categoryId}`);
  };

  const handleViewAllProducts = () => {
    navigate('/products');
  };

  const handleViewAllCategories = () => {
    navigate('/categories');
  };

  const handleProductClick = (productId) => {
    navigate(`/product/${productId}`);
  };

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

  const handleCheckout = () => {
    if (!isAuthenticated) {
      alert('Please login to proceed to checkout');
      navigate('/login');
      return;
    }
    
    if (cart.length === 0) {
      alert('Your cart is empty! Add some products first.');
      return;
    }
    
    navigate('/checkout');
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
                        <button 
                          onClick={handleCheckout}
                          className="checkout-btn-small"
                        >
                          Checkout →
                        </button>
                      </div>
                    </div>
                  )}
                </div>

                <span className="welcome-text">
                  Welcome, {currentUser?.name || 'User'}!
                </span>
                
                {authService.isAdmin() ? (
                  <Link to="/admin/dashboard" className="auth-btn admin-btn">
                    <span className="btn-icon">⚙️</span>
                    Admin Panel
                  </Link>
                ) : (
                  <Link to="/orders" className="auth-btn orders-btn">
                    <span className="btn-icon">📦</span>
                    My Orders
                  </Link>
                )}
                
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
            {isAuthenticated && cartCount > 0 && (
              <button 
                onClick={handleCheckout}
                className="hero-btn checkout-hero-btn"
              >
                🛒 Checkout ({cartCount} items)
              </button>
            )}
          </div>
        </div>
        <div className="hero-image">
          <div className="image-placeholder">
            <span className="image-icon">🛍️</span>
          </div>
        </div>
      </section>

      {/* Categories Section */}
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
            <button className="scroll-btn left-scroll-btn" onClick={scrollLeft}>
              ←
            </button>
            
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

      {/* Featured Products Section - UPDATED WITH BACKEND CART */}
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
              {featuredProducts.map((product) => {
                const isInCart = cart.some(item => item._id === product._id);
                const cartItem = cart.find(item => item._id === product._id);
                
                return (
                  <div 
                    key={product._id} 
                    className="product-card"
                  >
                    <div 
                      className="product-image-container"
                      onClick={() => handleProductClick(product._id)}
                      style={{ cursor: 'pointer' }}
                    >
                      <img 
                        src={product.image} 
                        alt={product.name}
                        className="product-image"
                        onError={(e) => {
                          console.log('Product image error:', product.name);
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
                        className="product-title"
                        onClick={() => handleProductClick(product._id)}
                        style={{ cursor: 'pointer' }}
                      >
                        {product.name}
                      </h3>
                      <p className="product-category">
                        {product.category?.name || 'Uncategorized'}
                      </p>
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
                      <p className="product-description">
                        {product.description?.substring(0, 60)}...
                      </p>
                      
                      {/* ADD TO CART BUTTONS */}
                      <div className="product-actions">
                        {isAuthenticated ? (
                          isInCart ? (
                            <div className="cart-controls">
                              <button 
                                className="cart-action-btn minus"
                                onClick={() => {
                                  const newQuantity = (cartItem.quantity || 1) - 1;
                                  if (newQuantity <= 0) {
                                    removeFromCart(product._id);
                                  } else {
                                    updateCartQuantity(product._id, newQuantity);
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
                                onClick={() => addToCart(product)}
                              >
                                +
                              </button>
                            </div>
                          ) : (
                            <button 
                              className="add-to-cart-btn"
                              onClick={() => addToCart(product)}
                            >
                              🛒 Add to Cart
                            </button>
                          )
                        ) : (
                          <button 
                            className="add-to-cart-btn login-required"
                            onClick={() => {
                              alert('Please login to add items to cart');
                              navigate('/login');
                            }}
                          >
                            🔒 Login to Buy
                          </button>
                        )}
                        
                        <button 
                          className="view-details-btn"
                          onClick={() => handleProductClick(product._id)}
                        >
                          View Details →
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
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

      {/* Quick Cart Summary (for logged in users) */}
      {isAuthenticated && cart.length > 0 && (
        <section className="cart-summary-section">
          <div className="cart-summary-card">
            <div className="cart-summary-content">
              <h3>🛒 Your Cart ({cartCount} items)</h3>
              <div className="cart-summary-total">
                <span>Total:</span>
                <span className="total-amount">
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
            <div className="cart-summary-actions">
              <Link to="/cart" className="btn view-cart-btn">
                View Cart
              </Link>
              <button onClick={handleCheckout} className="btn checkout-btn-main">
                Proceed to Checkout →
              </button>
            </div>
          </div>
        </section>
      )}

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

export default Home;
