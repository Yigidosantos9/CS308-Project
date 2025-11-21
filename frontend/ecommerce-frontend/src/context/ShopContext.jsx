import { createContext, useState, useContext } from 'react';
import PropTypes from 'prop-types';

const ShopContext = createContext();

export const ShopProvider = ({ children }) => {
  const [cart, setCart] = useState([]);
  const [user, setUser] = useState(null);

  // Add item to cart
  const addToCart = (product) => {
    setCart((prev) => {
      const existing = prev.find((item) => item.id === product.id && item.selectedSize === product.selectedSize);
      if (existing) {
        return prev.map((item) =>
          item.id === product.id && item.selectedSize === product.selectedSize
            ? { ...item, quantity: item.quantity + 1 } 
            : item
        );
      }
      return [...prev, { ...product, quantity: 1 }];
    });
    // Optional: Add a tiny alert or console log to confirm it works
    console.log("Added to cart:", product);
  };

  // Remove item from cart
  const removeFromCart = (productId, size) => {
    setCart((prev) => prev.filter((item) => !(item.id === productId && item.selectedSize === size)));
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