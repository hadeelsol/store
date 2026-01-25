import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { authService } from '../Components/auth';
import './Auth.css'; // Use the unified CSS

const Login = () => {
  const navigate = useNavigate();
  
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    rememberMe: false
  });
  
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    checkBackendStatus();
  }, []);

  const checkBackendStatus = async () => {
    try {
      const response = await fetch('/');
      if (response.ok) {
        console.log('✅ Backend is connected and running');
      }
    } catch (error) {
      console.error('Connection failed:', error);
    }
  };

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    setError('');
    setLoading(true);

    if (!formData.email || !formData.password) {
      setError('Please fill in all fields');
      setLoading(false);
      return;
    }

    try {
      await authService.login(formData.email, formData.password);
      document.querySelector('.auth-container').classList.add('success');
      setTimeout(() => {
        navigate('/');
      }, 600);
      
    } catch (err) {
      console.error('Login error:', err);
      setError(err.message || 'Login failed. Please check your credentials.');
    
      document.querySelector('.auth-container').classList.add('shake');
      setTimeout(() => {
        document.querySelector('.auth-container').classList.remove('shake');
      }, 500);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-page">
      <div className="auth-container">
        <div className="auth-logo-container">
          <div className="auth-logo">
            <span className="auth-logo-icon">🔐</span>
          </div>
          <h1 className="auth-title">Welcome Back</h1>
          <p className="auth-subtitle">Sign in to your account</p>
        </div>
        
        {error && (
          <div className="auth-error-message">
            <strong>Error:</strong> {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="auth-form">
          <div className="auth-form-group">
            <label htmlFor="email" className="auth-form-label">
              Email Address
            </label>
            <input
              type="email"
              id="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              required
              className="auth-form-input"
              placeholder="you@example.com"
              disabled={loading}
            />
          </div>
          
          <div className="auth-form-group">
            <label htmlFor="password" className="auth-form-label">
              Password
            </label>
            <div className="password-input-container">
              <input
                type="password"
                id="password"
                name="password"
                value={formData.password}
                onChange={handleChange}
                required
                className="auth-form-input"
                placeholder="••••••••"
                disabled={loading}
              />
            </div>
          </div>
          
          <div className="auth-form-options">
            <div className="auth-remember-me">
              <input
                type="checkbox"
                id="rememberMe"
                name="rememberMe"
                checked={formData.rememberMe}
                onChange={handleChange}
                className="auth-checkbox"
                disabled={loading}
              />
              <label htmlFor="rememberMe">Remember me</label>
            </div>
            <Link to="/forgot-password" className="auth-forgot-password">
              Forgot password?
            </Link>
          </div>
          
          <button
            type="submit"
            disabled={loading}
            className="auth-button"
          >
            {loading ? (
              <>
                <span className="auth-loading-spinner"></span>
                Signing in...
              </>
            ) : 'Sign In'}
          </button>
          
          <div className="auth-switch-link">
            Don't have an account?{' '}
            <Link to="/register">
              Create an account
            </Link>
          </div>
        </form>

        <div className="auth-footer">
          <p>© {new Date().getFullYear()} All rights reserved.</p>
        </div>
      </div>
    </div>
  );
};

export default Login;
