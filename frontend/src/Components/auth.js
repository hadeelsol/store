import axios from 'axios';

const API_URL = '/api'; // Proxy will handle this

const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 10000,
});

// Request interceptor - ADD LOGGING HERE
api.interceptors.request.use(
  (config) => {
    console.log('📤 Making request to:', config.baseURL + config.url);
    console.log('Method:', config.method);
    
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
      console.log('✅ Token added to headers');
    } else {
      console.log('❌ No token found');
    }
    
    return config;
  },
  (error) => {
    console.error('Request error:', error);
    return Promise.reject(error);
  }
);

// Response interceptor
api.interceptors.response.use(
  (response) => {
    console.log('✅ Response received:', {
      status: response.status,
      url: response.config.url,
      data: response.data
    });
    return response;
  },
  (error) => {
    console.error('❌ Response error:', {
      status: error.response?.status,
      statusText: error.response?.statusText,
      url: error.config?.url,
      message: error.message,
      responseData: error.response?.data
    });
    
    if (error.response?.status === 401) {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      
    }
    return Promise.reject(error);
  }
);

export const authService = {
  // Test connection to backend
  testConnection: async () => {
    try {
      console.log('🔌 Testing backend connection...');
      const response = await api.get('/');
      console.log('✅ Backend connection successful:', response.data);
      return {
        success: true,
        message: 'Backend is connected',
        data: response.data
      };
    } catch (error) {
      console.error('❌ Backend connection failed:', error.message);
      return {
        success: false,
        message: error.message
      };
    }
  },

  // Register new user
  register: async (userData) => {
    try {
      console.log('📝 Registering user:', userData.email);
      const response = await api.post('/users/register', userData);
      console.log('✅ Registration successful:', response.data);
      
      if (response.data.token) {
        localStorage.setItem('token', response.data.token);
        localStorage.setItem('user', JSON.stringify(response.data.data.user));
        console.log('🔑 Token stored in localStorage');
      }
      
      return response.data;
    } catch (error) {
      console.error('❌ Registration failed:', {
        status: error.response?.status,
        data: error.response?.data,
        message: error.message
      });
      
      if (error.response?.data?.message) {
        throw new Error(error.response.data.message);
      }
      throw new Error('Registration failed. Please try again.');
    }
  },

  // Login user
  login: async (email, password) => {
    try {
  
    const response = await api.post('/users/login', { 
        email, 
        password 
      });
      
      console.log('✅ Login successful!');
      console.log('Response data:', response.data);
      
      if (response.data.token) {
        localStorage.setItem('token', response.data.token);
        localStorage.setItem('user', JSON.stringify(response.data.data.user));
        console.log('🔑 Token stored in localStorage');
      }
      
      return response.data;
      
    } catch (error) {
      console.error('❌ Login failed:', {
        status: error.response?.status,
        statusText: error.response?.statusText,
        data: error.response?.data,
        url: error.config?.url,
        message: error.message
      });
      
      if (error.code === 'ECONNABORTED') {
        throw new Error('Connection timeout. Server might be slow.');
      }
      
      if (!error.response) {
        throw new Error(`Network error. Cannot connect to backend.`);
      }
      
      if (error.response.status === 401) {
        const backendMsg = error.response?.data?.message || 'Invalid credentials';
        throw new Error(`Login failed: ${backendMsg}`);
      }
    
      
      throw new Error(error.response?.data?.message || `Login failed (Status: ${error.response.status})`);
    }
  },

  getProfile: async () => {
    try {
      const response = await api.get('/users/profile');
      return response.data;
    } catch (error) {
      console.error('Get profile error:', error);
      throw error;
    }
  },

  // Change password
  changePassword: async (currentPassword, newPassword) => {
    try {
      const response = await api.put('/users/change-password', {
        currentPassword,
        newPassword
      });
      return response.data;
    } catch (error) {
      console.error('Change password error:', error);
      throw error;
    }
  },

  // Logout
  logout: () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    window.location.href = '/login';
  },

  // Check if authenticated
  isAuthenticated: () => {
    return !!localStorage.getItem('token');
  },

  // Get current user
  getCurrentUser: () => {
    const user = localStorage.getItem('user');
    return user ? JSON.parse(user) : null;
  },

  // Check if admin
  isAdmin: () => {
    const user = authService.getCurrentUser();
    return user && user.role === 'admin';
  },

  // Test API endpoint directly
  testEndpoint: async (endpoint) => {
    try {
      console.log(`Testing endpoint: ${endpoint}`);
      const response = await api.get(endpoint);
      return {
        success: true,
        data: response.data
      };
    } catch (error) {
      return {
        success: false,
        error: error.message
      };
    }
  }
};

export default authService;
