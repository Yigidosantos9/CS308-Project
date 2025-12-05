// frontend/src/services/api.js
import axios from 'axios';

const API_BASE_URL = 'http://localhost:8080/api';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Attach Authorization header automatically if token exists
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('authToken');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// ---------- PRODUCT SERVICE ----------

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
      console.error('Error fetching products:', error);
      throw error;
    }
  },

  // Used by AdminDashboard Products tab
  deleteProduct: async (id) => {
    try {
      await api.delete(`/products/${id}`);
    } catch (error) {
      console.error(`Error deleting product ${id}:`, error);
      throw error;
    }
  },
};

// ---------- AUTH SERVICE ----------

export const authService = {
  login: async (email, password) => {
    try {
      console.log('Attempting login to:', `${API_BASE_URL}/auth/login`);
      const response = await api.post('/auth/login', { email, password });

      if (response.data?.token) {
        localStorage.setItem('authToken', response.data.token);
      }
      if (response.data?.user) {
        // Optional: if backend returns user object, store it
        localStorage.setItem('user', JSON.stringify(response.data.user));
      }

      return response.data;
    } catch (error) {
      console.error('Login error details:', {
        message: error.message,
        response: error.response?.data,
        status: error.response?.status,
        code: error.code,
        config: error.config,
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
        config: error.config,
      });
      throw error;
    }
  },

  // Optional helper to verify token with backend, used by ShopContext
  verifyToken: async (token) => {
    try {
      const response = await api.post('/auth/verify-token', { token });
      return response.data; // expected to be user object / SecurityContext info
    } catch (error) {
      console.error('Token verification failed:', error);
      throw error;
    }
  },

  logout: () => {
    localStorage.removeItem('authToken');
    localStorage.removeItem('user');
  },

  getToken: () => {
    return localStorage.getItem('authToken');
  },

  isAuthenticated: () => {
    return !!localStorage.getItem('authToken');
  },
};

// ---------- REVIEW SERVICE ----------

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

  addReview: async (reviewData) => {
    return await api.post('/reviews', reviewData);
  },
};

// ---------- CART SERVICE (via gateway /api/cart) ----------

export const cartService = {
  // POST /api/cart/add?userId=...&productId=...&quantity=...
  addToCart: async (userId, productId, quantity = 1) => {
    return await api.post('/cart/add', null, {
      params: { userId, productId, quantity },
    });
  },

  // GET /api/cart?userId=...
  getCart: async (userId) => {
    const response = await api.get('/cart', {
      params: { userId },
    });
    return response.data;
  },

  // DELETE /api/cart/remove?userId=...&productId=...
  removeFromCart: async (userId, productId) => {
    return await api.delete('/cart/remove', {
      params: { userId, productId },
    });
  },

  // (available in backend if needed later)
  // updateCartItemQuantity: async (userId, productId, quantity) => {
  //   const response = await api.put('/cart/update', null, {
  //     params: { userId, productId, quantity },
  //   });
  //   return response.data;
  // },
};

// ---------- ORDER SERVICE ----------

export const orderService = {
  // GET /api/orders  (user inferred from token)
  getOrders: async () => {
    try {
      const response = await api.get('/orders');
      return response.data;
    } catch (error) {
      console.error('Error fetching orders:', error);
      throw error;
    }
  },

  // POST /api/orders (place order from current cart)
  placeOrder: async () => {
    try {
      const response = await api.post('/orders');
      return response.data;
    } catch (error) {
      console.error('Error placing order:', error);
      throw error;
    }
  },
};

export default api;
