import api from './api';

export const productService = {
  getAllProducts: async (filters = {}) => {
    try {
      console.log('📦 Fetching products with filters:', filters);
      
      const params = new URLSearchParams();
      if (filters.page) params.append('page', filters.page);
      if (filters.limit) params.append('limit', filters.limit);
      if (filters.category) params.append('category', filters.category);
      if (filters.search) params.append('q', filters.search);
      
      const url = `/products?${params.toString()}`;
      const response = await api.get(url);
      
      console.log('✅ Products fetched successfully:', response.data);
      return {
        success: true,
        data: response.data.data || {},
        message: 'Products loaded successfully'
      };
    } catch (error) {
      console.error('❌ Error fetching products:', error);
      return {
        success: false,
        data: {},
        message: error.response?.data?.message || 'Failed to load products'
      };
    }
  },

  // Get products by category ID
  getProductsByCategory: async (categoryId, page = 1, limit = 10) => {
    try {
      console.log('📦 Fetching products for category:', categoryId);
      const response = await api.get(`/products/category/${categoryId}?page=${page}&limit=${limit}`);
      
      return {
        success: true,
        data: response.data.data || {},
        message: 'Products loaded successfully'
      };
    } catch (error) {
      console.error('❌ Error fetching products by category:', error);
      return {
        success: false,
        data: {},
        message: error.response?.data?.message || 'Failed to load products'
      };
    }
  },

  // Get single product by ID
  getProductById: async (productId) => {
    try {
      const response = await api.get(`/products/${productId}`);
      return {
        success: true,
        data: response.data.data || {},
        message: 'Product loaded successfully'
      };
    } catch (error) {
      console.error('❌ Error fetching product:', error);
      return {
        success: false,
        data: null,
        message: error.response?.data?.message || 'Failed to load product'
      };
    }
  },

  // Search products
  searchProducts: async (searchTerm, page = 1, limit = 10) => {
    try {
      const response = await api.get(`/products/search?q=${searchTerm}&page=${page}&limit=${limit}`);
      return {
        success: true,
        data: response.data.data || {},
        message: 'Search results loaded'
      };
    } catch (error) {
      console.error('❌ Error searching products:', error);
      return {
        success: false,
        data: {},
        message: error.response?.data?.message || 'Failed to search products'
      };
    }
  }
};

export default productService;