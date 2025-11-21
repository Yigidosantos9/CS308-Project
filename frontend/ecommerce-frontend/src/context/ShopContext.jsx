import { createContext, useState, useContext, useEffect } from 'react';
import PropTypes from 'prop-types';
import { cartService } from '../services/api';

const ShopContext = createContext();

export const ShopProvider = ({ children }) => {
  const [cart, setCart] = useState([]);
  const [user, setUser] = useState({ id: 1, name: "Test User" }); // Temporary Mock User for API testing

  // Load Cart from Backend on Mount
  useEffect(() => {
    if (user?.id) {
      loadCart(user.id);
    }
  }, [user]);

  const loadCart = async (userId) => {
    try {
      const cartData = await cartService.getCart(userId);
      // Backend returns { items: [...] }, we map it to our frontend structure if needed
      // Assuming backend CartItem has { product: {...}, quantity: ... }
      if (cartData && cartData.items) {
        // Flatten structure for easier UI usage if necessary, or keep as is. 
        // Here we adapt backend "items" to our simple UI list
        const formattedCart = cartData.items.map(item => ({
          ...item.product,
          quantity: item.quantity,
          selectedSize: "M" // Backend cart snippet didn't show size support yet, defaulting to M
        }));
        setCart(formattedCart);
      }
    } catch (err) {
      console.error("Failed to load cart:", err);
    }
  };

  const addToCart = async (product) => {
    try {
      // Optimistic UI Update (Show it immediately)
      setCart((prev) => [...prev, { ...product, quantity: 1 }]);

      // Call Backend
      await cartService.addToCart(user.id, product.id, 1);
      
      // Reload to ensure sync
      await loadCart(user.id);
    } catch (err) {
      console.error("Failed to add to cart API:", err);
      // Revert if failed (optional implementation)
    }
  };

  const removeFromCart = async (productId) => {
    try {
      // Optimistic UI Update
      setCart((prev) => prev.filter((item) => item.id !== productId));

      // Call Backend
      await cartService.removeFromCart(user.id, productId);
      
      // Reload sync
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