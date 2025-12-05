// frontend/src/context/ShopContext.jsx
import { createContext, useState, useContext, useEffect } from 'react';
import PropTypes from 'prop-types';
import api, { cartService } from '../services/api';

const ShopContext = createContext();

export const ShopProvider = ({ children }) => {
  const [cart, setCart] = useState([]);
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true); // if you ever want to use this in UI

  useEffect(() => {
    checkAuth();
  }, []);

  const checkAuth = async () => {
    const token = localStorage.getItem('authToken');
    if (token) {
      try {
        // If you prefer: const userData = await authService.verifyToken(token);
        const response = await api.post('/auth/verify-token', { token });
        setUser(response.data);
      } catch (error) {
        console.error('Token verification failed:', error);
        localStorage.removeItem('authToken');
        localStorage.removeItem('user');
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
    if (!userId) return;

    try {
      const cartData = await cartService.getCart(userId);

      if (cartData && Array.isArray(cartData.items)) {
        const formattedCart = cartData.items.map((item) => ({
          ...item.product,
          quantity: item.quantity,
          // Backend has no size info; default to M for now.
          selectedSize: 'M',
        }));
        setCart(formattedCart);
      } else {
        setCart([]);
      }
    } catch (err) {
      // Common case: new user with no cart yet -> backend may throw "Cart not found"
      console.error('Failed to load cart:', err);
      setCart([]);
    }
  };

  const addToCart = async (product) => {
    // 1) Require login (for now)
    if (!user?.userId) {
      alert('Please log in to add items to your cart.');
      return;
    }

    // 2) Frontend stock guard (if backend product has stock field)
    if (product.stock === 0) {
      alert('This product is out of stock and cannot be added to the cart.');
      return;
    }

    try {
      await cartService.addToCart(user.userId, product.id, 1);
      await loadCart(user.userId);
    } catch (err) {
      console.error('Failed to add to cart API:', err);

      const apiError = err?.response?.data;

      // This is guessy; adjust based on your GlobalExceptionHandler shape.
      const message =
        apiError?.message ||
        apiError?.error ||
        'Failed to add to cart. Please try again.';

      alert(message);

      // Re-sync cart snapshot from server
      await loadCart(user.userId);
    }
  };

  const removeFromCart = async (productId) => {
    if (!user?.userId) {
      // If you ever support guest carts in frontend-only state, handle that here.
      setCart((prev) => prev.filter((item) => item.id !== productId));
      return;
    }

    try {
      // Optimistic update
      setCart((prev) => prev.filter((item) => item.id !== productId));
      await cartService.removeFromCart(user.userId, productId);
      await loadCart(user.userId);
    } catch (err) {
      console.error('Failed to remove from cart API:', err);
      // Re-sync in case optimistic update was wrong
      await loadCart(user.userId);
    }
  };

  return (
    <ShopContext.Provider
      value={{ cart, user, addToCart, removeFromCart, setUser, checkAuth, loading }}
    >
      {children}
    </ShopContext.Provider>
  );
};

ShopProvider.propTypes = {
  children: PropTypes.node.isRequired,
};

export const useShop = () => useContext(ShopContext);
