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
  login: async (email, password, guestUserId) => {
    try {
      console.log('Attempting login to:', `${API_BASE_URL}/auth/login`);
      const response = await api.post('/auth/login', { email, password }, {
        params: guestUserId ? { guestUserId } : undefined,
      });
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

  getUserById: async (userId) => {
    try {
      const response = await api.get(`/auth/user/${userId}`);
      return response.data;
    } catch (error) {
      console.error(`Error fetching user ${userId}:`, error);
      return null;
    }
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
  },
  // Get recent approved reviews for home page
  getRecentReviews: async () => {
    try {
      const response = await api.get('/reviews/recent');
      return response.data;
    } catch (error) {
      console.error('Error fetching recent reviews:', error);
      return [];
    }
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
    const response = await api.post(`/cart/merge`, null, {
      params: { guestUserId, userId }
    });
    return response.data;
  },

  // DELETE /cart/clear?userId=...
  clearCart: async (userId) => {
    return await api.delete(`/cart/clear`, {
      params: { userId }
    });
  },

  // Update quantity - uses addToCart with delta quantity
  updateQuantity: async (userId, productId, quantity, size) => {
    const params = { userId, productId, quantity };
    if (size) {
      params.size = size;
    }
    return await api.post(`/cart/add`, null, { params });
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
        totalPrice: orderData.totalPrice,
        buyerName: orderData.buyerName,
        buyerAddress: orderData.buyerAddress,
        paymentMethod: orderData.paymentMethod
      });
      return response.data;
    } catch (error) {
      console.error("Error creating order:", error);
      throw error;
    }
  },

  // Existing: download invoice as a file (used on Profile page)
  getInvoice: async (orderId, buyerName, buyerAddress, paymentMethod) => {
    try {
      const response = await api.get(`/orders/${orderId}/invoice`, {
        responseType: 'blob',
        params: {
          ...(buyerName ? { buyerName } : {}),
          ...(buyerAddress ? { buyerAddress } : {}),
          ...(paymentMethod ? { paymentMethod } : {}),
        }
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
  getInvoiceBlob: async (orderId, buyerName, buyerAddress, paymentMethod) => {
    try {
      const response = await api.get(`/orders/${orderId}/invoice`, {
        responseType: 'blob',
        params: {
          ...(buyerName ? { buyerName } : {}),
          ...(buyerAddress ? { buyerAddress } : {}),
          ...(paymentMethod ? { paymentMethod } : {}),
        }
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
  },

  // Customer: Cancel order (only for PROCESSING/PREPARING orders)
  cancelOrder: async (orderId) => {
    try {
      // CHANGE: No query params needed. Gateway reads the token.
      const response = await api.post(`/orders/${orderId}/cancel`);
      return response.data;
    } catch (error) {
      console.error("Error cancelling order:", error);
      const errorMessage = error.response?.data?.error || 'Failed to cancel order';
      throw new Error(errorMessage);
    }
  }
};

// ==================== REFUND SERVICE ====================
export const refundService = {
  /**
   * Request a refund for an order (customer action)
   * @param {number} orderId - The order ID
   * @param {string} reason - The reason for the refund
   */
  requestRefund: async (orderId, reason) => {
    try {
      // CHANGE: Send reason in body. Gateway reads userId from Token.
      const response = await api.post(`/orders/${orderId}/refund`, { reason });
      return response.data;
    } catch (error) {
      console.error("Error requesting refund:", error);
      const errorMessage = error.response?.data?.error || 'Failed to request refund';
      throw new Error(errorMessage);
    }
  },

  /**
   * Check if an order is eligible for refund
   * @param {number} orderId - The order ID
   */
  checkRefundEligibility: async (orderId) => {
    try {
      const response = await api.get(`/orders/${orderId}/refund/eligibility`);
      return response.data;
    } catch (error) {
      console.error("Error checking refund eligibility:", error);
      return { eligible: false, daysRemaining: 0 };
    }
  },

  // ==================== SALES MANAGER ACTIONS ====================

  /**
   * Get all pending refund requests (Sales Manager action)
   */
  getPendingRefundRequests: async () => {
    try {
      const response = await api.get('/sales/refunds/pending');
      return response.data;
    } catch (error) {
      console.error("Error fetching pending refund requests:", error);
      return [];
    }
  },

  /**
   * Get count of pending refund requests (Sales Manager action)
   */
  getPendingRefundCount: async () => {
    try {
      const response = await api.get('/sales/refunds/pending/count');
      return response.data || 0;
    } catch (error) {
      console.error("Error fetching pending refund count:", error);
      return 0;
    }
  },

  /**
   * Approve a refund request (Sales Manager action)
   * @param {number} orderId - The order ID
   */
  approveRefund: async (orderId) => {
    try {
      const response = await api.put(`/sales/refunds/${orderId}/approve`);
      return response.data;
    } catch (error) {
      console.error("Error approving refund:", error);
      throw error;
    }
  },

  // Sales Manager: Reject Refund
  // PUT /api/sales/refunds/{id}/reject
  rejectRefund: async (orderId, reason = null) => {
    try {
      const response = await api.put(`/sales/refunds/${orderId}/reject`, { reason });
      return response.data;
    } catch (error) {
      console.error("Error rejecting refund:", error);
      throw error;
    }
  }
};

// 🔹 UPDATED addressService in api.js
export const addressService = {
  getAddresses: async (userId) => {
    try {
      const response = await api.get('/addresses', {
        params: { userId }, // 🔹 CHANGED
      });
      return response.data;
    } catch (error) {
      console.error("Error fetching addresses:", error);
      throw error;
    }
  },
  addAddress: async (addressData, userId) => {
    try {
      const response = await api.post('/addresses', addressData, {
        params: { userId }, // 🔹 CHANGED
      });
      return response.data;
    } catch (error) {
      console.error("Error adding address:", error);
      throw error;
    }
  },
  updateAddress: async (addressId, addressData, userId) => {
    try {
      const response = await api.put(`/addresses/${addressId}`, addressData, {
        params: { userId }, // 🔹 CHANGED
      });
      return response.data;
    } catch (error) {
      console.error("Error updating address:", error);
      throw error;
    }
  },
  deleteAddress: async (addressId, userId) => {
    try {
      await api.delete(`/addresses/${addressId}`, {
        params: { userId }, // 🔹 CHANGED
      });
    } catch (error) {
      console.error("Error deleting address:", error);
      throw error;
    }
  },
};

// Wishlist Service - requires authentication
export const wishlistService = {
  // GET /api/wishlist - Get current user's wishlist
  getWishlist: async () => {
    try {
      const response = await api.get('/wishlist');
      return response.data;
    } catch (error) {
      console.error("Error fetching wishlist:", error);
      throw error;
    }
  },

  // POST /api/wishlist/add?productId=...&size=...
  addToWishlist: async (productId, size) => {
    try {
      const params = { productId };
      if (size) {
        params.size = size;
      }
      const response = await api.post('/wishlist/add', null, { params });
      return response.data;
    } catch (error) {
      console.error("Error adding to wishlist:", error);
      throw error;
    }
  },

  // DELETE /api/wishlist/remove?productId=...
  removeFromWishlist: async (productId) => {
    try {
      const response = await api.delete('/wishlist/remove', {
        params: { productId }
      });
      return response.data;
    } catch (error) {
      console.error("Error removing from wishlist:", error);
      throw error;
    }
  },
};

export default api;