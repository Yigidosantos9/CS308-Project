import axios from 'axios';

const API_BASE_URL = 'http://localhost:8080/api';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add request interceptor to attach auth token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('authToken');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

export const productService = {
  getProductById: async (id) => {
    try {
      const response = await api.get(`/products/${id}`);
      return response.data;
    } catch (error) {
      console.error(`Error fetching product ${id}:`, error);
      throw error;
    }
  },

  getProducts: async (filter = {}) => {
    try {
      const params = Object.fromEntries(
        Object.entries(filter).filter(([_, v]) => v != null && v !== '')
      );
      const response = await api.get('/products', { params });
      return response.data;
    } catch (error) {
      console.error("Error fetching products:", error);
      throw error;
    }
  },
};

export const authService = {
  login: async (email, password) => {
    try {
      console.log('Attempting login to:', `${API_BASE_URL}/auth/login`);
      const response = await api.post('/auth/login', { email, password });
      if (response.data?.token) {
        localStorage.setItem('authToken', response.data.token);
        // Also store user data for persistence
        const userData = {
          userId: response.data.userId,
          email: response.data.email,
          firstName: response.data.firstName,
          lastName: response.data.lastName,
          userType: response.data.userType
        };
        localStorage.setItem('userData', JSON.stringify(userData));
      }
      return response.data;
    } catch (error) {
      console.error('Login error details:', {
        message: error.message,
        response: error.response?.data,
        status: error.response?.status,
        code: error.code,
        config: error.config
      });
      throw error;
    }
  },

  register: async (userData) => {
    try {
      console.log('Attempting registration to:', `${API_BASE_URL}/auth/register`, userData);
      const response = await api.post('/auth/register', userData);
      console.log('Registration response:', response);
      return response.data;
    } catch (error) {
      console.error('Registration error details:', {
        message: error.message,
        response: error.response?.data,
        status: error.response?.status,
        code: error.code,
        config: error.config
      });
      throw error;
    }
  },

  logout: () => {
    localStorage.removeItem('authToken');
    localStorage.removeItem('userData');
    localStorage.removeItem('user');
  },

  getToken: () => {
    return localStorage.getItem('authToken');
  },

  isAuthenticated: () => {
    return !!localStorage.getItem('authToken');
  }
};

export const reviewService = {
  getProductReviews: async (productId) => {
    try {
      const response = await api.get(`/reviews/product/${productId}`);
      return response.data;
    } catch (error) {
      console.error(`Error fetching reviews for product ${productId}:`, error);
      return [];
    }
  },
  getProductReviewStats: async (productId) => {
    try {
      const response = await api.get(`/reviews/product/${productId}/stats`);
      return response.data;
    } catch (error) {
      console.error(`Error fetching review stats for product ${productId}:`, error);
      return { averageRating: 0, reviewCount: 0 };
    }
  },
  addReview: async (reviewData) => {
    const token = localStorage.getItem('authToken');
    return await api.post('/reviews', reviewData, {
      headers: { Authorization: `Bearer ${token}` }
    });
  },
  // PM: Get pending reviews for approval
  getPendingReviews: async () => {
    try {
      const response = await api.get('/reviews/pending');
      return response.data;
    } catch (error) {
      console.error('Error fetching pending reviews:', error);
      return [];
    }
  },
  // PM: Approve a review
  approveReview: async (reviewId) => {
    return await api.put(`/reviews/${reviewId}/approve`);
  },
  // PM: Disapprove/delete a review
  disapproveReview: async (reviewId) => {
    return await api.delete(`/reviews/${reviewId}`);
  }
};

// UPDATED: Matches CartController.java exactly
export const cartService = {
  // POST /cart/add?userId=...&productId=...&quantity=...&size=...
  addToCart: async (userId, productId, quantity, size) => {
    const params = { userId, productId, quantity };
    if (size) {
      params.size = size;
    }
    return await api.post(`/cart/add`, null, { params });
  },

  // GET /cart?userId=...
  getCart: async (userId) => {
    const response = await api.get(`/cart`, {
      params: { userId }
    });
    return response.data;
  },

  // DELETE /cart/remove?userId=...&productId=...
  removeFromCart: async (userId, productId) => {
    return await api.delete(`/cart/remove`, {
      params: { userId, productId }
    });
  },

  // POST /cart/merge?guestUserId=...&userId=...
  mergeCarts: async (guestUserId, userId) => {
    return await api.post(`/cart/merge`, null, {
      params: { guestUserId, userId }
    });
  },

  // DELETE /cart/clear?userId=...
  clearCart: async (userId) => {
    return await api.delete(`/cart/clear`, {
      params: { userId }
    });
  }
};

export const orderService = {
  getOrders: async (userId) => {
    try {
      const response = await api.get('/orders', { params: { userId } });
      return response.data;
    } catch (error) {
      console.error("Error fetching orders:", error);
      throw error;
    }
  },

  createOrder: async (orderData) => {
    try {
      // Send order data in body with userId as query param
      const response = await api.post(`/orders?userId=${orderData.userId}`, {
        items: orderData.items,
        totalPrice: orderData.totalPrice
      });
      return response.data;
    } catch (error) {
      console.error("Error creating order:", error);
      throw error;
    }
  },

  // Existing: download invoice as a file (used on Profile page)
  getInvoice: async (orderId) => {
    try {
      const response = await api.get(`/orders/${orderId}/invoice`, {
        responseType: 'blob'
      });
      // Create download link and trigger download
      const blob = new Blob([response.data], { type: 'application/pdf' });
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `invoice-order-${orderId}.pdf`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.error("Error downloading invoice:", error);
      throw error;
    }
  },

  // NEW: return raw blob so Checkout can render PDF inline in an <iframe>
  getInvoiceBlob: async (orderId) => {
    try {
      const response = await api.get(`/orders/${orderId}/invoice`, {
        responseType: 'blob'
      });
      return response.data; // PDF blob
    } catch (error) {
      console.error("Error fetching invoice blob:", error);
      throw error;
    }
  },

  // Product Manager: Get all orders
  getAllOrders: async () => {
    try {
      const response = await api.get('/orders/all');
      return response.data;
    } catch (error) {
      console.error("Error fetching all orders:", error);
      throw error;
    }
  },

  // Product Manager: Update order status
  updateOrderStatus: async (orderId, status) => {
    try {
      const response = await api.put(`/orders/${orderId}/status`, null, {
        params: { status }
      });
      return response.data;
    } catch (error) {
      console.error("Error updating order status:", error);
      throw error;
    }
  }
};

export const addressService = {
  getAddresses: async () => {
    try {
      const response = await api.get('/addresses');
      return response.data;
    } catch (error) {
      console.error("Error fetching addresses:", error);
      throw error;
    }
  },
  addAddress: async (addressData) => {
    try {
      const response = await api.post('/addresses', addressData);
      return response.data;
    } catch (error) {
      console.error("Error adding address:", error);
      throw error;
    }
  },
  updateAddress: async (addressId, addressData) => {
    try {
      const response = await api.put(`/addresses/${addressId}`, addressData);
      return response.data;
    } catch (error) {
      console.error("Error updating address:", error);
      throw error;
    }
  },
  deleteAddress: async (addressId) => {
    try {
      await api.delete(`/addresses/${addressId}`);
    } catch (error) {
      console.error("Error deleting address:", error);
      throw error;
    }
  }
};

export default api;
