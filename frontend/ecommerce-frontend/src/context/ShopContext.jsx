import { createContext, useState, useContext, useEffect } from 'react';
import PropTypes from 'prop-types';
import { cartService } from '../services/api';

const ShopContext = createContext();

export const ShopProvider = ({ children }) => {
  const [cart, setCart] = useState([]);
  // Defaulting to User ID 1 as per your DataLoader example
  const [user, setUser] = useState({ id: 1, name: "Test User" }); 

  useEffect(() => {
    if (user?.id) {
      loadCart(user.id);
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
    // Frontend guard: do not even attempt to add out-of-stock items
    if (product.stock === 0) {
      alert("This product is out of stock and cannot be added to the cart.");
      return;
    }

    try {
      // Call backend first; rely on cart snapshot from server
      await cartService.addToCart(user.id, product.id, 1);
      await loadCart(user.id);
    } catch (err) {
      console.error("Failed to add to cart API:", err);

      const apiError = err?.response?.data;
      if (apiError?.error === "out_of_stock") {
        alert("This product is out of stock and cannot be added to the cart.");
      } else {
        alert("Failed to add to cart. Please try again.");
      }

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
    <ShopContext.Provider value={{ cart, user, addToCart, removeFromCart, setUser }}>
      {children}
    </ShopContext.Provider>
  );
};

ShopProvider.propTypes = {
  children: PropTypes.node.isRequired,
};

export const useShop = () => useContext(ShopContext);