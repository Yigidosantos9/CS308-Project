import axios from 'axios';

const API_BASE_URL = 'http://localhost:8080/api';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

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
  }
};

// UPDATED: Matches CartController.java exactly
export const cartService = {
  // POST /cart/add?userId=...&productId=...&quantity=...
  addToCart: async (userId, productId, quantity) => {
    return await api.post(`/cart/add`, null, {
      params: { userId, productId, quantity }
    });
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
  }
};

export default api;