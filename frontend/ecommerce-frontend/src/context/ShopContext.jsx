import { createContext, useState, useContext, useEffect } from 'react';
import PropTypes from 'prop-types';
import api, { cartService } from '../services/api';

const ShopContext = createContext();

export const ShopProvider = ({ children }) => {
  const [cart, setCart] = useState([]);
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // On app load: check auth and restore user from token
  useEffect(() => {
    checkAuth();
  }, []);

  const checkAuth = async () => {
    const token = localStorage.getItem('authToken');
    if (token) {
      try {
        const response = await api.post('/auth/verify-token', { token });
        // Assume backend returns something like:
        // { userId, firstName, lastName, email, ... }
        setUser(response.data);
      } catch (error) {
        console.error('Token verification failed:', error);
        localStorage.removeItem('authToken');
        setUser(null);
      }
    } else {
      setUser(null);
    }
    setLoading(false);
  };

  // Whenever user changes, (re)load cart from backend or clear it
  useEffect(() => {
    if (user?.userId) {
      loadCart(user.userId);
    } else {
      setCart([]);
    }
  }, [user]);

  const loadCart = async (userId) => {
    if (!userId) return;

    try {
      const cartData = await cartService.getCart(userId);
      if (cartData && Array.isArray(cartData.items)) {
        const formattedCart = cartData.items.map((item) => ({
          ...item.product,
          quantity: item.quantity,
          // Backend CartItem doesn't have size, so we default for display
          selectedSize: 'M',
        }));
        setCart(formattedCart);
      } else {
        setCart([]);
      }
    } catch (err) {
      console.error('Failed to load cart:', err);
      // If backend fails, keep current cart (or clear if you prefer)
    }
  };

  const addToCart = async (product) => {
    // Frontend guard: do not attempt to add out-of-stock items
    if (product.stock === 0) {
      const error = new Error('Product is out of stock');
      error.code = 'out_of_stock';
      throw error;
    }

    // Guest mode: no backend cart, keep local-only cart
    if (!user || !user.userId) {
      setCart((prev) => {
        const existingIndex = prev.findIndex((item) => item.id === product.id);
        if (existingIndex !== -1) {
          const copy = [...prev];
          copy[existingIndex] = {
            ...copy[existingIndex],
            quantity: (copy[existingIndex].quantity || 0) + 1,
          };
          return copy;
        }
        return [
          ...prev,
          {
            ...product,
            quantity: 1,
            selectedSize: product.selectedSize || 'M',
          },
        ];
      });
      return;
    }

    // Authenticated: sync with backend
    try {
      await cartService.addToCart(user.userId, product.id, 1);
      await loadCart(user.userId);
    } catch (err) {
      console.error('Failed to add to cart API:', err);
      // Rethrow so page components can show proper error messages
      throw err;
    }
  };

  const removeFromCart = async (productId) => {
    // Optimistic local update
    setCart((prev) => prev.filter((item) => item.id !== productId));

    // Guest mode: nothing to do on backend
    if (!user || !user.userId) {
      return;
    }

    try {
      await cartService.removeFromCart(user.userId, productId);
      await loadCart(user.userId);
    } catch (err) {
      console.error('Failed to remove from cart API:', err);
      // Reload from backend to be safe
      await loadCart(user.userId);
      throw err;
    }
  };

  return (
    <ShopContext.Provider
      value={{
        cart,
        user,
        loading,
        addToCart,
        removeFromCart,
        setUser,
        checkAuth,
        loadCart,
      }}
    >
      {children}
    </ShopContext.Provider>
  );
};

ShopProvider.propTypes = {
  children: PropTypes.node.isRequired,
};

export const useShop = () => useContext(ShopContext);
