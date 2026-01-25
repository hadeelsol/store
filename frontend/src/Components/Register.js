import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { authService } from '../Components/auth'; // Import authService
import './Auth.css'; 
const Register = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
    agreeTerms: false
  });
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [errors, setErrors] = useState({});
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  // Password requirements
  const passwordRequirements = [
    { id: 1, text: 'At least 6 characters', met: (pass) => pass.length >= 6 },
    { id: 2, text: 'Contains uppercase letter', met: (pass) => /[A-Z]/.test(pass) },
    { id: 3, text: 'Contains lowercase letter', met: (pass) => /[a-z]/.test(pass) },
    { id: 4, text: 'Contains number', met: (pass) => /\d/.test(pass) },
  ];

  const validateField = (name, value) => {
    const newErrors = { ...errors };
    
    switch (name) {
      case 'name':
        if (!value.trim()) {
          newErrors.name = 'Name is required';
        } else if (value.trim().length < 2) {
          newErrors.name = 'Name must be at least 2 characters';
        } else {
          delete newErrors.name;
        }
        break;
        
      case 'email':
        if (!value.trim()) {
          newErrors.email = 'Email is required';
        } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) {
          newErrors.email = 'Invalid email format';
        } else {
          delete newErrors.email;
        }
        break;
        
      case 'password':
        if (!value) {
          newErrors.password = 'Password is required';
        } else if (value.length < 6) {
          newErrors.password = 'Password must be at least 6 characters';
        } else {
          delete newErrors.password;
        }
        
        // Validate confirm password if it exists
        if (formData.confirmPassword && value !== formData.confirmPassword) {
          newErrors.confirmPassword = 'Passwords do not match';
        } else {
          delete newErrors.confirmPassword;
        }
        break;
        
      case 'confirmPassword':
        if (!value) {
          newErrors.confirmPassword = 'Please confirm your password';
        } else if (value !== formData.password) {
          newErrors.confirmPassword = 'Passwords do not match';
        } else {
          delete newErrors.confirmPassword;
        }
        break;
        
      default:
        break;
    }
    
    setErrors(newErrors);
  };

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    const newValue = type === 'checkbox' ? checked : value;
    
    setFormData(prev => ({
      ...prev,
      [name]: newValue
    }));
    
    // Validate field
    if (type !== 'checkbox') {
      validateField(name, newValue);
    }
    
    // Clear success message
    if (success) setSuccess('');
  };

  const validateForm = () => {
    const newErrors = {};
    
    if (!formData.name.trim()) {
      newErrors.name = 'Name is required';
    }
    
    if (!formData.email.trim()) {
      newErrors.email = 'Email is required';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = 'Invalid email format';
    }
    
    if (!formData.password) {
      newErrors.password = 'Password is required';
    } else if (formData.password.length < 6) {
      newErrors.password = 'Password must be at least 6 characters';
    }
    
    if (!formData.confirmPassword) {
      newErrors.confirmPassword = 'Please confirm your password';
    } else if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = 'Passwords do not match';
    }
    
    if (!formData.agreeTerms) {
      newErrors.agreeTerms = 'You must agree to the terms and conditions';
    }
    
    return newErrors;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSuccess('');
    
    const newErrors = validateForm();
    
    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }
    
    setErrors({});
    setLoading(true);

    try {
      // Prepare data for backend
      const registrationData = {
        name: formData.name,
        email: formData.email,
        password: formData.password
      };

      console.log('🔍 Starting registration with data:', { 
        ...registrationData, 
        password: '***' 
      });

      // Use authService instead of direct axios call
      const response = await authService.register(registrationData);

      console.log('✅ Registration successful:', response);
      
      setSuccess('Account created successfully! Redirecting...');
      
      // Auto login after successful registration
      if (response.token) {
        localStorage.setItem('token', response.token);
        localStorage.setItem('user', JSON.stringify(response.data.user));
        console.log('🔑 Token stored in localStorage');
      }
      
      // Redirect after 2 seconds
      setTimeout(() => {
        navigate('/');
      }, 2000);
      
    } catch (err) {
      console.error('❌ Registration error:', err);
      
      let errorMsg = err.message || 'Registration failed';
      
      if (errorMsg.toLowerCase().includes('email')) {
        setErrors({ email: errorMsg });
      } else if (errorMsg.toLowerCase().includes('network')) {
        setErrors({ 
          general: `Network Error: ${errorMsg}\n\nMake sure:\n1. Backend is running\n2. Check backend console for errors` 
        });
      } else {
        setErrors({ general: errorMsg });
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-page">
      <div className="auth-container">
        <div className="auth-logo-container">
          <div className="auth-logo">
            <span className="auth-logo-icon">👤</span>
          </div>
          <h1 className="auth-title">Create Account</h1>
        </div>
        
        {/* Error message */}
        {errors.general && (
          <div className="auth-error-message">
            <strong>Error:</strong> {errors.general}
          </div>
        )}
        
        {/* Success message */}
        {success && (
          <div className="auth-success-message">
            ✅ {success}
          </div>
        )}

        {/* Registration Form */}
        <form onSubmit={handleSubmit} className="auth-form">
          {/* Name input */}
          <div className="auth-form-group">
            <label htmlFor="name" className="auth-form-label">
              Full Name
            </label>
            <input
              type="text"
              id="name"
              name="name"
              value={formData.name}
              onChange={handleChange}
              className={`auth-form-input ${errors.name ? 'error' : ''}`}
              placeholder="John Doe"
              disabled={loading}
            />
            <div className="auth-focus-line"></div>
            {errors.name && <span className="auth-field-error">{errors.name}</span>}
          </div>
          
          {/* Email input */}
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
              className={`auth-form-input ${errors.email ? 'error' : ''}`}
              placeholder="you@example.com"
              disabled={loading}
            />
            <div className="auth-focus-line"></div>
            {errors.email && <span className="auth-field-error">{errors.email}</span>}
          </div>
          
          {/* Password input */}
          <div className="auth-form-group">
            <label htmlFor="password" className="auth-form-label">
              Password
            </label>
            <div className="password-input-container">
              <input
                type={showPassword ? 'text' : 'password'}
                id="password"
                name="password"
                value={formData.password}
                onChange={handleChange}
                className={`auth-form-input ${errors.password ? 'error' : ''}`}
                placeholder="••••••••"
                disabled={loading}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="password-toggle-btn"
                disabled={loading}
              >
                {showPassword ? '🙈' : '👁️'}
              </button>
            </div>
            <div className="auth-focus-line"></div>
            {errors.password && <span className="auth-field-error">{errors.password}</span>}
            
            {/* Password requirements */}
            <div className="password-requirements">
              <p className="requirements-title">Password must contain:</p>
              {passwordRequirements.map(req => (
                <div 
                  key={req.id} 
                  className={`requirement ${req.met(formData.password) ? 'met' : 'not-met'}`}
                >
                  <span className="requirement-icon">
                    {req.met(formData.password) ? '✓' : '○'}
                  </span>
                  <span className="requirement-text">{req.text}</span>
                </div>
              ))}
            </div>
          </div>
          
          {/* Confirm Password input */}
          <div className="auth-form-group">
            <label htmlFor="confirmPassword" className="auth-form-label">
              Confirm Password
            </label>
            <div className="password-input-container">
              <input
                type={showConfirmPassword ? 'text' : 'password'}
                id="confirmPassword"
                name="confirmPassword"
                value={formData.confirmPassword}
                onChange={handleChange}
                className={`auth-form-input ${errors.confirmPassword ? 'error' : ''}`}
                placeholder="••••••••"
                disabled={loading}
              />
              <button
                type="button"
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                className="password-toggle-btn"
                disabled={loading}
              >
                {showConfirmPassword ? '🙈' : '👁️'}
              </button>
            </div>
            <div className="auth-focus-line"></div>
            {errors.confirmPassword && <span className="auth-field-error">{errors.confirmPassword}</span>}
          </div>
          
          {/* Terms checkbox */}
          <div className="auth-checkbox-group">
            <input
              type="checkbox"
              id="agreeTerms"
              name="agreeTerms"
              checked={formData.agreeTerms}
              onChange={handleChange}
              className={`auth-checkbox ${errors.agreeTerms ? 'error' : ''}`}
              disabled={loading}
            />
            <label htmlFor="agreeTerms" className="auth-checkbox-label">
              I agree to the{' '}
              <Link to="/terms" className="auth-link">
                Terms of Service
              </Link>{' '}
              and{' '}
              <Link to="/privacy" className="auth-link">
                Privacy Policy
              </Link>
            </label>
          </div>
          {errors.agreeTerms && <span className="auth-field-error">{errors.agreeTerms}</span>}
          
          {/* Register button */}
          <button
            type="submit"
            disabled={loading || !formData.agreeTerms}
            className="auth-button"
          >
            {loading ? (
              <>
                <span className="auth-loading-spinner"></span>
                Creating Account...
              </>
            ) : (
              'Create Account'
            )}
          </button>
          
          {/* Login link */}
          <div className="auth-login-link">
            Already have an account?{' '}
            <Link to="/login" className="auth-link">
              Sign in
            </Link>
          </div>
        </form>

        {/* Footer */}
        <div className="auth-footer">
          <p>© {new Date().getFullYear()} All rights reserved.</p>
        </div>
      </div>
      
    </div>
  );
};

export default Register;