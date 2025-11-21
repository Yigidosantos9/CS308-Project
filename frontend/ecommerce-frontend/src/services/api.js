import axios from 'axios';

const API_BASE_URL = 'http://localhost:8080/api';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

export const productService = {
  // Matches ProductController.java: @GetMapping("/{id}")
  getProductById: async (id) => {
    try {
      const response = await api.get(`/products/${id}`);
      return response.data;
    } catch (error) {
      console.error(`Error fetching product ${id}:`, error);
      throw error;
    }
  },

  // Matches ProductController.java: @GetMapping with ProductFilterRequest
  // Supported params: q, category, gender, color, sort
  getProducts: async (filter = {}) => {
    try {
      // Remove undefined/null keys to keep URL clean
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

// New: Matches ReviewController.java
export const reviewService = {
  // @GetMapping("/product/{productId}")
  getProductReviews: async (productId) => {
    try {
      const response = await api.get(`/reviews/product/${productId}`);
      return response.data;
    } catch (error) {
      console.error(`Error fetching reviews for product ${productId}:`, error);
      return []; // Return empty array on error to prevent UI crash
    }
  },

  // @PostMapping
  addReview: async (reviewData) => {
    return await api.post('/reviews', reviewData);
  }
};

export const cartService = {
  addToCart: async (userId, productId, quantity) => {
    return await api.post(`/cart/add`, null, {
      params: { userId, productId, quantity }
    });
  }
};

export default api;