import { createContext, useState, useContext, useEffect } from 'react';
import PropTypes from 'prop-types';
import api, { cartService } from '../services/api';

const ShopContext = createContext();

// Generate or retrieve guest user ID for anonymous cart
const getGuestUserId = () => {
  let guestId = localStorage.getItem('guestUserId');
  if (!guestId) {
    // Generate a negative ID to distinguish from real users
    guestId = -Math.floor(Math.random() * 1000000 + 1);
    localStorage.setItem('guestUserId', guestId.toString());
  }
  return parseInt(guestId, 10);
};

export const ShopProvider = ({ children }) => {
  const [cart, setCart] = useState([]);
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isMerging, setIsMerging] = useState(false);
  const [toast, setToast] = useState({
    show: false,
    message: '',
    type: 'success',
  });

  const saveGuestSnapshot = (items) => {
    try {
      localStorage.setItem(
        'guestCartSnapshot',
        JSON.stringify(
          items.map((item) => ({
            id: item.id,
            quantity: item.quantity,
            size: item.size || item.selectedSize || null,
          }))
        )
      );
    } catch (e) {
      console.warn('Failed to persist guest cart snapshot', e);
    }
  };

  const loadGuestSnapshot = () => {
    try {
      const raw = localStorage.getItem('guestCartSnapshot');
      return raw ? JSON.parse(raw) : [];
    } catch {
      return [];
    }
  };

  const clearGuestSnapshot = () => {
    localStorage.removeItem('guestCartSnapshot');
  };

  // Show toast notification
  const showToast = (message, type = 'success') => {
    setToast({ show: true, message, type });
    setTimeout(() => {
      setToast({ show: false, message: '', type: 'success' });
    }, 2500);
  };

  useEffect(() => {
    checkAuth();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const checkAuth = async () => {
    const token = localStorage.getItem('authToken');
    const storedUserData = localStorage.getItem('userData');

    // 🔒 If there is NO token, force logged-out state
    if (!token) {
      if (storedUserData) {
        localStorage.removeItem('userData');
      }
      setUser(null);
      setLoading(false);
      return;
    }

    // Optional: show stored user instantly while verifying token
    if (storedUserData) {
      try {
        const parsedUser = JSON.parse(storedUserData);
        setUser(parsedUser);
      } catch (e) {
        console.error('Failed to parse stored user data:', e);
        localStorage.removeItem('userData');
      }
    }

    try {
      const response = await api.post('/auth/verify-token', { token });
      const userData = response.data;
      setUser(userData);

      // Update stored user data
      localStorage.setItem('userData', JSON.stringify(userData));

      // Merge guest cart with user cart if guest had items
      const guestId = localStorage.getItem('guestUserId');
      if (guestId) {
        try {
          setIsMerging(true);
          const mergedCart = await cartService.mergeCarts(parseInt(guestId, 10), userData.userId);
          // If merge returns cart data, hydrate immediately to avoid flicker/empty state
          if (mergedCart?.items) {
            const formattedCart = mergedCart.items.map((item) => ({
              ...item.product,
              quantity: item.quantity,
              size: item.size,
            }));
            setCart(formattedCart);
          }
          localStorage.removeItem('guestUserId'); // Clear guest ID after merge
        } catch (mergeErr) {
          console.log('Cart merge skipped or failed:', mergeErr);
        } finally {
          setIsMerging(false);
        }
      }

      // Explicitly load cart AFTER potential merge to ensure we get the updated state
      // This fixes the race condition where the initial useEffect might fetch an empty cart before merge completes
      const loadedCart = await loadCart(userData.userId);

      // Fallback: if user cart is still empty but we have a guest snapshot, re-add items
      const snapshot = loadGuestSnapshot();
      if (snapshot.length > 0 && loadedCart.length === 0) {
        for (const item of snapshot) {
          try {
            await cartService.addToCart(userData.userId, item.id, item.quantity, item.size);
          } catch (e) {
            console.warn('Failed to re-add snapshot item after login', e);
          }
        }
        await loadCart(userData.userId);
        clearGuestSnapshot();
      }

      // If cart finally has items, clear any leftover snapshot
      if ((loadedCart && loadedCart.length > 0) || cart.length > 0) {
        clearGuestSnapshot();
      }

    } catch (error) {
      console.error('Token verification failed:', error);

      // If token is invalid/expired → really log out
      if (error.response?.status === 401) {
        localStorage.removeItem('authToken');
        localStorage.removeItem('userData');
        setUser(null);
      }
    } finally {
      setLoading(false);
    }
  };

  // Get the current effective user ID (real user or guest)
  const getEffectiveUserId = () => {
    if (user?.userId) {
      return user.userId;
    }
    return getGuestUserId();
  };

  useEffect(() => {
    // Load cart for current user (logged in or guest)
    if (isMerging) return;
    loadCart(getEffectiveUserId());
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user, isMerging]);

  const loadCart = async (userId) => {
    try {
      const cartData = await cartService.getCart(userId);
      if (cartData && cartData.items) {
        const formattedCart = cartData.items.map((item) => ({
          ...item.product,
          quantity: item.quantity,
          size: item.size, // Get size from backend cart item
        }));
        setCart(formattedCart);
        if (!user?.userId) {
          saveGuestSnapshot(formattedCart);
        }
        return formattedCart;
      } else {
        setCart([]);
        if (!user?.userId) {
          clearGuestSnapshot();
        }
        return [];
      }
    } catch (err) {
      console.error('Failed to load cart:', err);
      setCart([]);
      return [];
    }
  };

  const addToCart = async (product, quantity = 1) => {
    // Frontend guard: do not even attempt to add out-of-stock items
    if (product.stock === 0) {
      showToast('This product is out of stock!', 'error');
      return;
    }

    const effectiveUserId = getEffectiveUserId();

    try {
      // Call backend first; rely on cart snapshot from server
      // Pass quantity and selectedSize if available
      await cartService.addToCart(effectiveUserId, product.id, quantity, product.selectedSize);
      await loadCart(effectiveUserId);
      if (!user?.userId) {
        saveGuestSnapshot(cart);
      }
      showToast(`Added ${quantity > 1 ? quantity + ' items' : ''} to cart! ✓`, 'success');
    } catch (err) {
      console.error('Failed to add to cart API:', err);

      const apiError = err?.response?.data;
      if (apiError?.error === 'out_of_stock') {
        showToast('This product is out of stock!', 'error');
      } else {
        showToast('Failed to add to cart. Please try again.', 'error');
      }

      await loadCart(effectiveUserId);
    }
  };

  const removeFromCart = async (productId) => {
    const effectiveUserId = getEffectiveUserId();
    try {
      setCart((prev) => prev.filter((item) => item.id !== productId));
      await cartService.removeFromCart(effectiveUserId, productId);
      await loadCart(effectiveUserId);
      showToast('Removed from cart', 'success');
    } catch (err) {
      console.error('Failed to remove from cart API:', err);
    }
  };

  const clearCart = async () => {
    const effectiveUserId = getEffectiveUserId();
    try {
      await cartService.clearCart(effectiveUserId);
      setCart([]);
      showToast('Cart cleared', 'success');
    } catch (err) {
      console.error('Failed to clear cart:', err);
      setCart([]); // Clear locally anyway
    }
  };

  // Update quantity with stock check
  const updateQuantity = async (productId, newQuantity, size, stock) => {
    if (newQuantity < 1) {
      return; // Don't allow less than 1
    }
    if (newQuantity > stock) {
      showToast(`Only ${stock} items in stock!`, 'error');
      return;
    }

    const effectiveUserId = getEffectiveUserId();
    const currentItem = cart.find(item => item.id === productId && item.size === size);
    const currentQty = currentItem?.quantity || 0;
    const delta = newQuantity - currentQty;

    if (delta === 0) return;

    try {
      await cartService.updateQuantity(effectiveUserId, productId, delta, size);
      await loadCart(effectiveUserId);
    } catch (err) {
      console.error('Failed to update quantity:', err);
      const apiError = err?.response?.data;
      if (apiError?.error === 'out_of_stock') {
        showToast('Not enough stock available!', 'error');
      } else {
        showToast('Failed to update quantity', 'error');
      }
      await loadCart(effectiveUserId);
    }
  };

  // Logout function
  const logout = () => {
    localStorage.removeItem('authToken');
    localStorage.removeItem('userData');
    setUser(null);
    setCart([]);
  };

  return (
    <ShopContext.Provider
      value={{
        cart,
        user,
        addToCart,
        removeFromCart,
        clearCart,
        updateQuantity,
        setUser,
        checkAuth,
        logout,
        loading,
        toast,
      }}
    >
      {children}

      {/* Toast Notification */}
      {toast.show && (
        <div
          className={`fixed bottom-6 right-6 z-[9999] px-6 py-4 rounded-lg shadow-2xl transform transition-all duration-300 ${toast.type === 'success'
            ? 'bg-green-600 text-white'
            : 'bg-red-600 text-white'
            }`}
          style={{ animation: 'slideUp 0.3s ease-out' }}
        >
          <div className="flex items-center gap-3">
            {toast.type === 'success' ? (
              <svg
                className="w-6 h-6"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M5 13l4 4L19 7"
                />
              </svg>
            ) : (
              <svg
                className="w-6 h-6"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
            )}
            <span className="font-semibold">{toast.message}</span>
          </div>
        </div>
      )}

      {/* Animation styles */}
      <style>{`
        @keyframes slideUp {
          from {
            opacity: 0;
            transform: translateY(20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
      `}</style>
    </ShopContext.Provider>
  );
};

ShopProvider.propTypes = {
  children: PropTypes.node.isRequired,
};

export const useShop = () => useContext(ShopContext);
