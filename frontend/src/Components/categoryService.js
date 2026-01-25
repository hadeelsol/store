// frontend/src/services/categoryService.js
import api from './api'; // Your existing axios instance

export const categoryService = {
  // Get all active categories
  getActiveCategories: async () => {
    try {
      console.log('📋 Fetching active categories...');
      
      // TRY DIFFERENT ENDPOINTS:
      const endpoints = [
        '/categories/active',  // First try
        '/api/categories/active', // With /api prefix
        'http://localhost:5000/api/categories/active' // Full URL
      ];
      
      let response;
      let lastError;
      
      for (const endpoint of endpoints) {
        try {
          console.log('Trying endpoint:', endpoint);
          response = await api.get(endpoint);
          console.log('✅ Categories fetched successfully from:', endpoint);
          console.log('Response data:', response.data);
          break;
        } catch (error) {
          lastError = error;
          console.log('❌ Failed with endpoint:', endpoint, error.message);
        }
      }
      
      if (!response) {
        throw lastError || new Error('All endpoints failed');
      }
      
      return {
        success: true,
        data: response.data.data?.categories || response.data.categories || [],
        message: 'Categories loaded successfully'
      };
    } catch (error) {
      console.error('❌ Error fetching categories:', {
        message: error.message,
        response: error.response?.data,
        status: error.response?.status,
        url: error.config?.url
      });
      
      // Return empty array instead of throwing
      return {
        success: false,
        data: [],
        message: error.response?.data?.message || 'Failed to load categories'
      };
    }
  },

  // Get all categories (admin only)
  getAllCategories: async () => {
    try {
      const response = await api.get('/categories');
      return {
        success: true,
        data: response.data.data.categories || []
      };
    } catch (error) {
      console.error('Error fetching all categories:', error);
      return {
        success: false,
        data: [],
        message: error.response?.data?.message || 'Failed to load categories'
      };
    }
  }
};

export default categoryService;