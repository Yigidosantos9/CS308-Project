import { useShop } from '../../context/ShopContext';
import { Trash2, Plus, Minus } from 'lucide-react';
import { Link } from 'react-router-dom';

const Cart = () => {
  const { cart, removeFromCart, updateQuantity } = useShop();

  // Calculate Prices (product prices are VAT included)
  const VAT_RATE = 0.18; // 18% VAT
  const total = cart.reduce((acc, item) => acc + item.price * item.quantity, 0);
  const subtotal = total / (1 + VAT_RATE); // Price without VAT
  const vatAmount = total - subtotal; // VAT amount

  // Calculate total quantity per product (across all sizes)
  const getTotalProductQuantity = (productId) => {
    return cart
      .filter(item => item.id === productId)
      .reduce((sum, item) => sum + (item.quantity || 1), 0);
  };

  // Get remaining stock for a product
  const getRemainingStock = (item) => {
    const totalInCart = getTotalProductQuantity(item.id);
    const currentItemQty = item.quantity || 1;
    // Remaining = stock - (total in cart - this item's quantity)
    return item.stock - (totalInCart - currentItemQty);
  };

  const handleQuantityChange = (item, delta) => {
    const newQuantity = (item.quantity || 1) + delta;
    const totalOtherSizes = getTotalProductQuantity(item.id) - (item.quantity || 1);
    const maxAllowed = item.stock - totalOtherSizes;

    // Check stock limit across all sizes
    if (newQuantity > maxAllowed) {
      return; // Can't exceed stock
    }
    updateQuantity(item.id, newQuantity, item.size, item.stock);
  };

  return (
    <div className="min-h-screen bg-[#F5F5F5] py-12 px-4 md:px-12">
      <div className="container mx-auto max-w-6xl">

        {/* Main Split Layout */}
        <div className="flex flex-col lg:flex-row gap-12 relative">

          {/* LEFT SIDE: Cart Items */}
          <div className="flex-1 pr-0 lg:pr-12 border-r-0 lg:border-r border-gray-300 min-h-[500px]">
            {cart.length === 0 ? (
              <div className="text-center mt-20">
                <h2 className="text-2xl font-bold mb-4">Your cart is empty.</h2>
                <Link to="/shop" className="text-blue-500 underline">Go to Shop</Link>
              </div>
            ) : (
              <div className="flex flex-col gap-8">
                {cart.map((item, index) => {
                  const remainingStock = getRemainingStock(item);
                  const canIncrease = remainingStock > 0;

                  return (
                    <div key={`${item.id}-${item.size}-${index}`} className="flex gap-6 items-start">

                      {/* Product Image */}
                      <div className="w-24 h-32 bg-gray-100 rounded-lg flex items-center justify-center overflow-hidden flex-shrink-0">
                        <img
                          src={item.images && item.images.length > 0 ? item.images[0].url : "https://placehold.co/600x800/f5f5f5/a3a3a3?text=No+Image"}
                          alt={item.name}
                          className="object-cover w-full h-full"
                        />
                      </div>

                      {/* Product Info */}
                      <div className="flex-grow pt-2">
                        <Link to={`/product/${item.id}`}>
                          <h3 className="font-bold text-lg text-black leading-tight mb-2 hover:underline cursor-pointer">
                            {item.name}
                          </h3>
                        </Link>
                        <p className="text-gray-600 text-sm uppercase tracking-wide mb-1">
                          SIZE: {item.size || 'N/A'}
                        </p>

                        {/* Quantity Controls */}
                        <div className="flex items-center gap-3 mb-4">
                          <span className="text-gray-600 text-sm">Qty:</span>
                          <div className="flex items-center border border-gray-300 rounded-lg">
                            <button
                              onClick={() => handleQuantityChange(item, -1)}
                              disabled={(item.quantity || 1) <= 1}
                              className="p-2 hover:bg-gray-100 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
                            >
                              <Minus size={14} />
                            </button>
                            <span className="px-3 font-semibold text-black min-w-[32px] text-center">
                              {item.quantity || 1}
                            </span>
                            <button
                              onClick={() => handleQuantityChange(item, 1)}
                              disabled={!canIncrease}
                              className="p-2 hover:bg-gray-100 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
                            >
                              <Plus size={14} />
                            </button>
                          </div>
                          <span className={`text-xs ${remainingStock <= 0 ? 'text-red-500' : 'text-gray-400'}`}>
                            ({remainingStock > 0 ? `${remainingStock} more available` : 'max reached'})
                          </span>
                        </div>

                        {/* Remove Button */}
                        <button
                          onClick={() => removeFromCart(item.id, item.size)}
                          className="text-xs text-red-500 hover:text-red-700 flex items-center gap-1"
                        >
                          <Trash2 size={14} /> Remove
                        </button>
                      </div>

                      {/* Price */}
                      <div className="pt-2 text-right">
                        <p className="font-bold text-lg">{(item.price * (item.quantity || 1)).toFixed(2)} $</p>
                        {(item.quantity || 1) > 1 && (
                          <p className="text-gray-500 text-xs">{item.quantity} × {item.price.toFixed(2)} $</p>
                        )}
                      </div>
                    </div>
                  ))}
              </div>
            )}
          </div>

          {/* RIGHT SIDE: Order Info (Sticky) */}
          <div className="w-full lg:w-[400px] flex-shrink-0">
            <div className="bg-[#9CA3AF] p-8 rounded-xl shadow-sm sticky top-24 text-white">

              {/* Header */}
              <div className="border-b border-white/30 pb-4 mb-6">
                <h2 className="text-2xl font-bold">Order Info</h2>
              </div>

              {/* Summary Rows */}
              <div className="space-y-4 mb-8">
                <div className="flex justify-between text-lg font-medium text-gray-100">
                  <span>SUBTOTAL:</span>
                  <span>{subtotal.toFixed(2)} $</span>
                </div>
                <div className="flex justify-between text-lg font-medium text-gray-100">
                  <span>VAT (18%):</span>
                  <span>{vatAmount.toFixed(2)} $</span>
                </div>
                <div className="border-t border-white/30 pt-4 flex justify-between text-lg font-bold text-white">
                  <span>TOTAL:</span>
                  <span>{total.toFixed(2)} $</span>
                </div>
              </div>

              {/* Purchase Button */}
              <Link to="/checkout" className="block w-full">
                <button className="w-full bg-[#4299E1] hover:bg-[#3182CE] text-white font-bold py-3 px-6 rounded-md transition-colors uppercase tracking-wide text-sm shadow-md">
                  PURCHASE
                </button>
              </Link>

            </div>
          </div>

        </div>
      </div>
    </div>
  );
};

export default Cart;