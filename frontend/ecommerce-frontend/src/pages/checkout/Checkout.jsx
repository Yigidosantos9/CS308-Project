import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useShop } from '../../context/ShopContext';
import { orderService } from '../../services/api';
import { CreditCard, MapPin, Check } from 'lucide-react';

const Checkout = () => {
    const { cart, user, clearCart } = useShop();
    const navigate = useNavigate();
    const [loading, setLoading] = useState(false);
    const [orderComplete, setOrderComplete] = useState(false);
    const [orderId, setOrderId] = useState(null);

    const total = cart.reduce((acc, item) => acc + item.price * item.quantity, 0);

    const handlePlaceOrder = async () => {
        if (!user) {
            navigate('/login');
            return;
        }

        setLoading(true);
        try {
            // Create order
            const orderData = {
                userId: user.userId,
                items: cart.map(item => ({
                    productId: item.productId,
                    quantity: item.quantity,
                    price: item.price,
                    size: item.size
                })),
                totalPrice: total
            };

            const response = await orderService.createOrder(orderData);
            setOrderId(response.id);
            setOrderComplete(true);

            // Clear cart after successful order
            if (clearCart) {
                clearCart();
            }
        } catch (error) {
            console.error('Order failed:', error);
            alert('Order failed. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    if (orderComplete) {
        return (
            <div className="min-h-screen bg-[#F5F5F5] py-12 px-4 flex items-center justify-center">
                <div className="bg-white rounded-2xl p-8 shadow-lg text-center max-w-md">
                    <div className="w-16 h-16 bg-green-500 rounded-full flex items-center justify-center mx-auto mb-6">
                        <Check className="w-8 h-8 text-white" />
                    </div>
                    <h2 className="text-2xl font-bold mb-2">Order Placed Successfully!</h2>
                    <p className="text-gray-600 mb-4">Order #{orderId}</p>
                    <p className="text-gray-500 mb-6">Thank you for your purchase. You will receive a confirmation email shortly.</p>
                    <button
                        onClick={() => navigate('/profile')}
                        className="bg-black text-white px-6 py-3 rounded-lg font-medium hover:bg-gray-800 transition"
                    >
                        View My Orders
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-[#F5F5F5] py-12 px-4 md:px-12">
            <div className="container mx-auto max-w-4xl">
                <h1 className="text-3xl font-bold mb-8">Checkout</h1>

                <div className="grid md:grid-cols-2 gap-8">
                    {/* Order Summary */}
                    <div className="bg-white rounded-2xl p-6 shadow-sm">
                        <h2 className="text-xl font-bold mb-4">Order Summary</h2>
                        <div className="space-y-4 mb-6">
                            {cart.map((item, idx) => (
                                <div key={idx} className="flex justify-between items-center border-b pb-3">
                                    <div>
                                        <p className="font-medium">{item.name}</p>
                                        <p className="text-sm text-gray-500">Size: {item.size} • Qty: {item.quantity}</p>
                                    </div>
                                    <p className="font-bold">{(item.price * item.quantity).toFixed(2)} TL</p>
                                </div>
                            ))}
                        </div>
                        <div className="border-t pt-4">
                            <div className="flex justify-between text-lg font-bold">
                                <span>Total</span>
                                <span>{total.toFixed(2)} TL</span>
                            </div>
                        </div>
                    </div>

                    {/* Payment & Address */}
                    <div className="space-y-6">
                        <div className="bg-white rounded-2xl p-6 shadow-sm">
                            <div className="flex items-center gap-2 mb-4">
                                <MapPin className="w-5 h-5" />
                                <h2 className="text-xl font-bold">Shipping Address</h2>
                            </div>
                            <p className="text-gray-600">Default address will be used. You can manage addresses in your profile.</p>
                        </div>

                        <div className="bg-white rounded-2xl p-6 shadow-sm">
                            <div className="flex items-center gap-2 mb-4">
                                <CreditCard className="w-5 h-5" />
                                <h2 className="text-xl font-bold">Payment</h2>
                            </div>
                            <p className="text-gray-600 mb-4">Mock payment - no real transaction will occur.</p>
                            <div className="bg-gray-100 p-4 rounded-lg">
                                <p className="text-sm text-gray-500">Card: **** **** **** 4242</p>
                            </div>
                        </div>

                        <button
                            onClick={handlePlaceOrder}
                            disabled={loading || cart.length === 0}
                            className="w-full bg-[#4299E1] hover:bg-[#3182CE] disabled:bg-gray-400 text-white font-bold py-4 px-6 rounded-xl transition-colors uppercase tracking-wide shadow-md"
                        >
                            {loading ? 'Processing...' : 'Place Order'}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Checkout;
