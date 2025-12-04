import { createContext, useState, useContext, useEffect } from 'react';
import PropTypes from 'prop-types';
import api, { cartService } from '../services/api';

const ShopContext = createContext();

export const ShopProvider = ({ children }) => {
  const [cart, setCart] = useState([]);
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    checkAuth();
  }, []);

  const checkAuth = async () => {
    const token = localStorage.getItem('authToken');
    if (token) {
      try {
        // We need to call verify-token. Since authService.verifyToken is not exported or we can't import it easily if it's not in api.js properly, 
        // let's assume we can use api.post directly or add it to authService.
        // Looking at api.js, authService has verifyToken but it takes token as string.
        // Wait, api.js authService.verifyToken implementation:
        // verifyToken: (token) => { ... }
        // But the backend expects the token in the body.

        // Let's use api.post directly to be safe or update api.js. 
        // Actually, let's update api.js first to expose verifyToken properly if needed, 
        // but for now I will assume I can use axios directly or the existing authService if it works.
        // The existing authService.verifyToken in api.js seems to just return localStorage.getItem('authToken')? 
        // No, wait, I read api.js earlier.

        /*
          isAuthenticated: () => {
            return !!localStorage.getItem('authToken');
          }
        */

        // It does NOT have verifyToken that calls the backend. I need to add it to api.js first.
        // But for this step, I will just implement the logic here using the api instance.

        const response = await api.post('/auth/verify-token', { token });
        setUser(response.data);
      } catch (error) {
        console.error("Token verification failed:", error);
        localStorage.removeItem('authToken');
        setUser(null);
      }
    }
    setLoading(false);
  };

  useEffect(() => {
    if (user?.userId) {
      loadCart(user.userId);
    }
  }, [user]);

  const loadCart = async (userId) => {
    try {
      const cartData = await cartService.getCart(userId);
      if (cartData && cartData.items) {
        const formattedCart = cartData.items.map(item => ({
          ...item.product,
          quantity: item.quantity,
          // Backend CartItem doesn't have size, so we default to M for display
          selectedSize: "M"
        }));
        setCart(formattedCart);
      }
    } catch (err) {
      console.error("Failed to load cart:", err);
    }
  };

  const addToCart = async (product) => {
    try {
      // 1. Optimistic Update
      setCart((prev) => [...prev, { ...product, quantity: 1 }]);

      // 2. Call Backend
      await cartService.addToCart(user.id, product.id, 1);

      // 3. Sync
      await loadCart(user.id);
    } catch (err) {
      console.error("Failed to add to cart API:", err);

      // 4. Error Handling
      // If backend says "Not enough stock" (usually 500 in your current code)
      alert("Failed to add to cart. Item might be out of stock.");

      // Revert optimistic update
      await loadCart(user.id);
    }
  };

  const removeFromCart = async (productId) => {
    try {
      setCart((prev) => prev.filter((item) => item.id !== productId));
      await cartService.removeFromCart(user.id, productId);
      await loadCart(user.id);
    } catch (err) {
      console.error("Failed to remove from cart API:", err);
    }
  };

  return (
    <ShopContext.Provider value={{ cart, user, addToCart, removeFromCart, setUser, checkAuth }}>
      {children}
    </ShopContext.Provider>
  );
};

ShopProvider.propTypes = {
  children: PropTypes.node.isRequired,
};

export const useShop = () => useContext(ShopContext);