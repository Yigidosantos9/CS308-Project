import axios from 'axios';

// Ensure this matches your Spring Boot port (default is usually 8080)
const API_BASE_URL = 'http://localhost:8080/api';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Product Endpoints
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

  // Matches ProductController.java: @GetMapping
  getProducts: async (filter = {}) => {
    try {
      const response = await api.get('/products', { params: filter });
      return response.data;
    } catch (error) {
      console.error("Error fetching products:", error);
      throw error;
    }
  },
};

// Cart Endpoints
// Note: You provided ProductService.addToCart, but the Controller snippet 
// didn't show a mapping for it. I am adding this anticipated endpoint based on standard patterns.
export const cartService = {
  addToCart: async (userId, productId, quantity) => {
    try {
      // Assuming a CartController exists or will exist at /cart/add
      const response = await api.post(`/cart/add`, null, {
        params: { userId, productId, quantity }
      });
      return response.data;
    } catch (error) {
      console.error("Error adding to cart:", error);
      throw error;
    }
  }
};

export default api;