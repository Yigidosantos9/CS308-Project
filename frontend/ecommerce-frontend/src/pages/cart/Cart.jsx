import { useState } from 'react';
import { useShop } from '../../context/ShopContext';
import { Trash2 } from 'lucide-react';
import { Link } from 'react-router-dom';
import { orderService } from '../../services/api';

const Cart = () => {
  const { cart, removeFromCart, user, loadCart } = useShop();
  const [placingOrder, setPlacingOrder] = useState(false);
  const [orderError, setOrderError] = useState('');
  const [orderSuccess, setOrderSuccess] = useState(null);

  // Calculate Total Price
  const total = cart.reduce((acc, item) => acc + item.price * (item.quantity || 1), 0);

  const handleRemove = async (productId) => {
    try {
      await removeFromCart(productId);
    } catch (err) {
      console.error('Failed to remove item from cart', err);
      // Optional: show UI error
    }
  };

  const handlePurchase = async () => {
    setOrderError('');
    setOrderSuccess(null);

    if (!user || !user.userId) {
      setOrderError('Please log in to complete your purchase.');
      return;
    }

    if (cart.length === 0) {
      setOrderError('Your cart is empty.');
      return;
    }

    try {
      setPlacingOrder(true);
      const order = await orderService.createOrder();
      setOrderSuccess(order);

      // Backend clears the cart after order creation; reload it
      await loadCart(user.userId);
    } catch (err) {
      console.error('Failed to place order', err);
      const backendMessage =
        err.response?.data?.message ||
        (typeof err.response?.data === 'string' ? err.response.data : null);
      setOrderError(backendMessage || 'Failed to complete purchase. Please try again.');
    } finally {
      setPlacingOrder(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#F5F5F5] py-12 px-4 md:px-12">
      <div className="container mx-auto max-w-6xl">
        <div className="flex flex-col lg:flex-row gap-12 relative">
          {/* LEFT: Cart Items */}
          <div className="flex-1 pr-0 lg:pr-12 border-r-0 lg:border-r border-gray-300 min-h-[500px]">
            {cart.length === 0 ? (
              <div className="text-center mt-20">
                <h2 className="text-2xl font-bold mb-4">Your cart is empty.</h2>
                <Link to="/shop" className="text-blue-500 underline">
                  Go to Shop
                </Link>
              </div>
            ) : (
              <div className="flex flex-col gap-8">
                {cart.map((item, index) => (
                  <div
                    key={`${item.id}-${item.selectedSize ?? 'M'}-${index}`}
                    className="flex gap-6 items-start"
                  >
                    <div className="w-24 h-32 bg-gray-200 flex-shrink-0 overflow-hidden rounded-sm">
                      <img
                        src={item.images?.[0]?.url || 'https://via.placeholder.com/150'}
                        alt={item.name}
                        className="w-full h-full object-cover"
                      />
                    </div>

                    <div className="flex-grow pt-2">
                      <h3 className="font-bold text-lg text-black leading-tight mb-2">
                        {item.name}
                      </h3>
                      <p className="text-gray-600 text-sm uppercase tracking-wide mb-4">
                        BEDEN: {item.selectedSize || 'M'}
                      </p>

                      <button
                        onClick={() => handleRemove(item.id)}
                        className="text-xs text-red-500 hover:text-red-700 flex items-center gap-1"
                      >
                        <Trash2 size={14} /> Remove
                      </button>
                    </div>

                    <div className="pt-2 text-right">
                      <p className="font-bold text-lg">
                        {item.price.toFixed(2)} TL
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* RIGHT: Order Info */}
          <div className="w-full lg:w-[400px] flex-shrink-0">
            <div className="bg-[#9CA3AF] p-8 rounded-xl shadow-sm sticky top-24 text-white">
              <div className="border-b border-white/30 pb-4 mb-6">
                <h2 className="text-2xl font-bold">Order Info</h2>
              </div>

              <div className="space-y-4 mb-4">
                <div className="flex justify-between text-lg font-medium text-gray-100">
                  <span>SUBTOTAL:</span>
                  <span>{total.toFixed(2)} TL</span>
                </div>
                <div className="flex justify-between text-lg font-bold text-white">
                  <span>TOTAL:</span>
                  <span>{total.toFixed(2)} TL</span>
                </div>
              </div>

              {orderError && (
                <div className="mb-3 rounded-md bg-red-50/80 px-3 py-2 text-xs font-semibold text-red-800">
                  {orderError}
                </div>
              )}
              {orderSuccess && (
                <div className="mb-3 rounded-md bg-green-50/80 px-3 py-2 text-xs font-semibold text-green-800">
                  Order #{orderSuccess.id} created successfully!
                </div>
              )}

              <button
                onClick={handlePurchase}
                disabled={placingOrder || cart.length === 0}
                className={`w-full font-bold py-3 px-6 rounded-md uppercase tracking-wide text-sm shadow-md transition-colors
                  ${
                    placingOrder || cart.length === 0
                      ? 'bg-gray-500 cursor-not-allowed'
                      : 'bg-[#4299E1] hover:bg-[#3182CE]'
                  }`}
              >
                {placingOrder ? 'Processing...' : 'Purchase'}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Cart;
