// frontend/src/pages/OrderService.js
import axios from 'axios';
import { authService } from '../Components/auth';

const API_URL = process.env.REACT_APP_API_URL || '/api';

// Create axios instance with default config
const apiClient = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 10000,
});

// Add request interceptor to include auth token
apiClient.interceptors.request.use(
  (config) => {
    console.log('📤 OrderService: Making request to:', config.url);
    
    // Get token from localStorage directly (since your authService doesn't have getToken())
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
      console.log('✅ Token added to headers');
    } else {
      console.log('❌ No token found in localStorage');
    }
    
    return config;
  },
  (error) => {
    console.error('❌ OrderService request error:', error);
    return Promise.reject(error);
  }
);

// Add response interceptor to handle errors globally
apiClient.interceptors.response.use(
  (response) => {
    console.log('✅ OrderService response:', {
      status: response.status,
      url: response.config.url,
      data: response.data
    });
    return response;
  },
  (error) => {
    console.error('❌ OrderService response error:', {
      status: error.response?.status,
      url: error.config?.url,
      message: error.message,
      responseData: error.response?.data
    });
    
    if (error.response?.status === 401) {
      console.log('⚠️ Authentication failed, logging out...');
      authService.logout();
      
      // Only redirect if we're not already on login page
      if (!window.location.pathname.includes('/login')) {
        window.location.href = '/login';
      }
    }
    
    return Promise.reject(error);
  }
);

const orderService = {
  // Get all orders for the current user
  async getMyOrders() {
    try {
      console.log('🔄 Fetching user orders...');
      
      // Check authentication first
      if (!authService.isAuthenticated()) {
        console.log('❌ User not authenticated');
        return {
          success: false,
          message: 'Please login to view orders',
          data: []
        };
      }
      
      const response = await apiClient.get('/orders/my-orders');
      console.log('✅ Orders fetched successfully');
      
      // Handle different response structures
      let orders = [];
      if (response.data.orders) {
        orders = response.data.orders;
      } else if (response.data.data) {
        orders = response.data.data;
      } else if (Array.isArray(response.data)) {
        orders = response.data;
      }
      
      return {
        success: true,
        data: orders,
        message: 'Orders fetched successfully'
      };
    } catch (error) {
      console.error('❌ Error fetching orders:', {
        status: error.response?.status,
        message: error.response?.data?.message || error.message,
        data: error.response?.data
      });
      
      let errorMessage = 'Failed to fetch orders';
      if (error.response?.status === 401) {
        errorMessage = 'Your session has expired. Please login again.';
        authService.logout();
      } else if (error.response?.data?.message) {
        errorMessage = error.response.data.message;
      } else if (error.message.includes('timeout')) {
        errorMessage = 'Request timeout. Please try again.';
      } else if (error.message.includes('Network Error')) {
        errorMessage = 'Cannot connect to server. Please check your internet connection.';
      }
      
      return {
        success: false,
        message: errorMessage,
        error: error.response?.data || error,
        data: []
      };
    }
  },

  // Get single order by ID
  async getOrderById(orderId) {
    try {
      console.log(`🔄 Fetching order ${orderId}...`);
      const response = await apiClient.get(`/orders/${orderId}`);
      
      return {
        success: true,
        data: response.data.order || response.data,
        message: 'Order fetched successfully'
      };
    } catch (error) {
      console.error(`❌ Error fetching order ${orderId}:`, error);
      return {
        success: false,
        message: error.response?.data?.message || 'Failed to fetch order',
        error: error.response?.data || error
      };
    }
  },

  // Create a new order
  async createOrder(orderData) {
    try {
      console.log('🛒 Creating new order:', orderData);
      const response = await apiClient.post('/orders', orderData);
      return {
        success: true,
        data: response.data.order || response.data,
        message: 'Order created successfully'
      };
    } catch (error) {
      console.error('❌ Error creating order:', error);
      return {
        success: false,
        message: error.response?.data?.message || 'Failed to create order',
        error: error.response?.data || error
      };
    }
  },

  // Update order status (for admin or specific actions)
  async updateOrderStatus(orderId, status) {
    try {
      const response = await apiClient.patch(`/orders/${orderId}/status`, { status });
      return {
        success: true,
        data: response.data.order || response.data,
        message: 'Order status updated successfully'
      };
    } catch (error) {
      console.error('❌ Error updating order status:', error);
      return {
        success: false,
        message: error.response?.data?.message || 'Failed to update order status',
        error: error.response?.data || error
      };
    }
  },

  // Cancel an order
  async cancelOrder(orderId) {
    try {
      const response = await apiClient.patch(`/orders/${orderId}/cancel`);
      return {
        success: true,
        data: response.data.order || response.data,
        message: 'Order cancelled successfully'
      };
    } catch (error) {
      console.error('❌ Error cancelling order:', error);
      return {
        success: false,
        message: error.response?.data?.message || 'Failed to cancel order',
        error: error.response?.data || error
      };
    }
  },

  // Get order status options (if needed)
  getStatusOptions() {
    return [
      { value: 'pending', label: 'Pending', color: '#f59e0b' },
      { value: 'confirmed', label: 'Confirmed', color: '#3b82f6' },
      { value: 'preparing', label: 'Preparing', color: '#8b5cf6' },
      { value: 'delivered', label: 'Delivered', color: '#10b981' },
      { value: 'cancelled', label: 'Cancelled', color: '#ef4444' }
    ];
  },

  // Format order for display
  formatOrder(order) {
    return {
      id: order._id || order.id,
      orderNumber: order.orderNumber || `ORD-${(order._id || order.id).substring(0, 8).toUpperCase()}`,
      status: order.status || 'pending',
      createdAt: order.createdAt || order.orderDate || new Date().toISOString(),
      items: order.items || [],
      totalAmount: order.totalAmount || 0,
      deliveryAddress: order.deliveryAddress || 'Not specified',
      customerPhone: order.customerPhone || 'Not specified',
      customerNotes: order.customerNotes || '',
      customerName: order.customerName || '',
      paymentMethod: order.paymentMethod || 'cash_on_delivery'
    };
  },

  // Calculate order total from items
  calculateTotalFromItems(items) {
    if (!Array.isArray(items)) return 0;
    return items.reduce((total, item) => {
      const price = item.product?.price || item.price || 0;
      const quantity = item.quantity || 1;
      return total + (price * quantity);
    }, 0);
  },

  // Validate order data before submission
  validateOrderData(orderData) {
    const errors = [];
    
    if (!orderData.items || orderData.items.length === 0) {
      errors.push('Order must contain at least one item');
    }
    
    if (!orderData.deliveryAddress) {
      errors.push('Delivery address is required');
    }
    
    if (!orderData.customerPhone) {
      errors.push('Phone number is required');
    }
    
    return {
      isValid: errors.length === 0,
      errors
    };
  }
};

export default orderService;
