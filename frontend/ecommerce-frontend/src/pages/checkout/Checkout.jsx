import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useShop } from '../../context/ShopContext';
import { orderService, addressService } from '../../services/api';
import { CreditCard, MapPin, Check } from 'lucide-react';

const Checkout = () => {
    const { cart, user, clearCart } = useShop();
    const navigate = useNavigate();
    const [loading, setLoading] = useState(false);
    const [orderComplete, setOrderComplete] = useState(false);
    const [orderId, setOrderId] = useState(null);
    const [addresses, setAddresses] = useState([]);
    const [selectedAddressId, setSelectedAddressId] = useState(null);
    const [payments, setPayments] = useState([]);
    const [selectedPaymentIndex, setSelectedPaymentIndex] = useState(0);

    // 🔹 NEW: validation errors for address & payment
    const [addressError, setAddressError] = useState('');
    const [paymentError, setPaymentError] = useState('');

    // Invoice state (inline preview)
    const [invoiceUrl, setInvoiceUrl] = useState(null);
    const [invoiceLoading, setInvoiceLoading] = useState(false);
    const [invoiceError, setInvoiceError] = useState('');

    // 🔹 NEW: per-user payments storage key
    const getPaymentsStorageKey = () =>
        user?.userId ? `payments_${user.userId}` : 'payments_guest';

    useEffect(() => {
        if (!user) {
            navigate('/login');
            return;
        }
        if (!orderComplete && cart.length === 0) {
            navigate('/cart', { replace: true });
            return;
        }

        const fetchAddresses = async () => {
            try {
                // 🔹 UPDATED: pass userId to match addressService API
                const data = await addressService.getAddresses(user.userId);
                setAddresses(data || []);
                if (data && data.length > 0) {
                    setSelectedAddressId(data[0].id);
                }
            } catch (e) {
                console.error('Failed to load addresses', e);
            }
        };
        fetchAddresses();

        // 🔹 UPDATED: Load payment methods from localStorage scoped to current user
        const key = getPaymentsStorageKey();
        const stored = localStorage.getItem(key);
        if (stored) {
            try {
                const parsed = JSON.parse(stored);
                setPayments(parsed);
                if (parsed.length > 0) {
                    const primaryIndex = parsed.findIndex((p) => p.primary);
                    setSelectedPaymentIndex(primaryIndex >= 0 ? primaryIndex : 0);
                } else {
                    setSelectedPaymentIndex(0);
                }
            } catch (e) {
                console.error('Failed to parse payments', e);
                setPayments([]);
                setSelectedPaymentIndex(0);
            }
        } else {
            setPayments([]);
            setSelectedPaymentIndex(0);
        }
    }, [user, navigate, cart, orderComplete]);

    // Clean up invoice URL when component unmounts or order changes
    useEffect(() => {
        return () => {
            if (invoiceUrl) {
                URL.revokeObjectURL(invoiceUrl);
            }
        };
    }, [invoiceUrl]);

    const total = cart.reduce((acc, item) => {
        const effectivePrice = item.discountedPrice && item.discountRate > 0
            ? item.discountedPrice
            : item.price;
        return acc + effectivePrice * item.quantity;
    }, 0);

    const handlePlaceOrder = async () => {
        if (!user) {
            navigate('/login');
            return;
        }

        const selectedPayment = payments[selectedPaymentIndex];
        const paymentDisplay = selectedPayment
            ? `${selectedPayment.brand || 'Card'} •••• ${selectedPayment.last4 || ''}`.trim()
            : '';
        const buyerName = `${user.firstName || ''} ${user.lastName || ''}`.trim() || user.email || 'Customer';

        const selectedAddress = addresses.find((addr) => addr.id === selectedAddressId);
        const buyerAddress = selectedAddress
            ? `${selectedAddress.title || ''} ${selectedAddress.addressLine || ''}, ${selectedAddress.city || ''}, ${selectedAddress.country || ''} ${selectedAddress.zipCode || ''}`.trim()
            : '';

        // 🔹 Reset validation + invoice errors on each attempt
        setAddressError('');
        setPaymentError('');
        setInvoiceError('');

        // 🔹 Ensure address & payment are present and selected
        const hasAddresses = addresses.length > 0;
        const hasPayments = payments.length > 0;
        const hasSelectedAddress = hasAddresses && selectedAddressId !== null;
        const hasSelectedPayment =
            hasPayments &&
            selectedPaymentIndex !== null &&
            selectedPaymentIndex >= 0 &&
            selectedPaymentIndex < payments.length;

        if (!hasSelectedAddress) {
            setAddressError('Please select a shipping address before placing your order.');
            return;
        }

        if (!hasSelectedPayment) {
            setPaymentError('Please select a payment method before placing your order.');
            return;
        }

        setLoading(true);
        try {
            // Create order
            const orderData = {
                userId: user.userId,
                items: cart.map(item => ({
                    productId: item.id,  // Cart items have 'id' from product spread
                    quantity: item.quantity,
                    // Use discounted price if available, otherwise use original price
                    price: item.discountedPrice && item.discountRate > 0
                        ? item.discountedPrice
                        : item.price,
                    size: item.selectedSize || item.size,
                    productName: item.name
                })),
                totalPrice: total,
                buyerName,
                buyerAddress,
                paymentMethod: paymentDisplay
            };

            const response = await orderService.createOrder(orderData);
            const createdOrderId = response.id;
            setOrderId(createdOrderId);
            setOrderComplete(true);

            // Clear cart after successful order
            if (clearCart) {
                clearCart();
            }

            // Fetch invoice PDF as blob and create URL
            try {
                setInvoiceLoading(true);
                const pdfBlob = await orderService.getInvoiceBlob(createdOrderId, buyerName, buyerAddress, paymentDisplay);
                const url = URL.createObjectURL(pdfBlob);
                setInvoiceUrl(url);
            } catch (err) {
                console.error('Failed to load invoice for inline display', err);
                setInvoiceError('Failed to load the invoice preview. You can still download it later from your profile.');
            } finally {
                setInvoiceLoading(false);
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
                <div className="bg-white rounded-2xl p-8 shadow-lg text-center max-w-2xl w-full">
                    <div className="w-16 h-16 bg-green-500 rounded-full flex items-center justify-center mx-auto mb-6">
                        <Check className="w-8 h-8 text-white" />
                    </div>
                    <h2 className="text-2xl font-bold mb-2">Order Placed Successfully!</h2>
                    <p className="text-gray-600 mb-1">Order #{orderId}</p>
                    <p className="text-gray-500 mb-6">
                        Thank you for your purchase. You will receive a confirmation email shortly.
                    </p>

                    <button
                        onClick={() => navigate('/profile')}
                        className="bg-black text-white px-6 py-3 rounded-lg font-medium hover:bg-gray-800 transition mb-6"
                    >
                        View My Orders
                    </button>

                    {/* INLINE INVOICE PREVIEW */}
                    <div className="text-left">
                        <h3 className="text-lg font-semibold mb-3">Invoice</h3>
                        {invoiceLoading && (
                            <div className="flex items-center justify-center h-32 text-gray-500 text-sm">
                                Loading invoice...
                            </div>
                        )}
                        {invoiceError && (
                            <p className="text-sm text-red-500 mb-3">
                                {invoiceError}
                            </p>
                        )}
                        {invoiceUrl && !invoiceLoading && (
                            <div className="border rounded-lg overflow-hidden">
                                <iframe
                                    src={invoiceUrl}
                                    title="Invoice PDF"
                                    className="w-full"
                                    style={{ height: '480px' }}
                                />
                            </div>
                        )}
                        {!invoiceUrl && !invoiceLoading && !invoiceError && (
                            <p className="text-sm text-gray-500">
                                Invoice will be available shortly. You can also view and download it from your profile page under Orders.
                            </p>
                        )}
                    </div>
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
                            {cart.map((item, idx) => {
                                const hasDiscount = item.discountedPrice && item.discountRate > 0;
                                const displayPrice = hasDiscount ? item.discountedPrice : item.price;
                                return (
                                    <div key={idx} className="flex justify-between items-center border-b pb-3">
                                        <div>
                                            <p className="font-medium">{item.name}</p>
                                            <p className="text-sm text-gray-500">
                                                Size: {item.size} • Qty: {item.quantity}
                                            </p>
                                        </div>
                                        <div className="text-right">
                                            {hasDiscount && (
                                                <p className="text-xs text-gray-400 line-through">
                                                    {(item.price * item.quantity).toFixed(2)} $
                                                </p>
                                            )}
                                            <p className={`font-bold ${hasDiscount ? 'text-green-600' : ''}`}>
                                                {(displayPrice * item.quantity).toFixed(2)} $
                                            </p>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                        <div className="border-t pt-4">
                            <div className="flex justify-between text-lg font-bold">
                                <span>Total</span>
                                <span>{total.toFixed(2)} $</span>
                            </div>
                        </div>
                    </div>

                    {/* Payment & Address */}
                    <div className="space-y-6">
                        {/* 🔹 SHIPPING ADDRESS CARD */}
                        <div className="bg-white rounded-2xl p-6 shadow-sm">
                            <div className="flex items-center gap-2 mb-4">
                                <MapPin className="w-5 h-5" />
                                <h2 className="text-xl font-bold">Shipping Address</h2>
                            </div>
                            {addresses.length === 0 ? (
                                // 🔹 SHOW CTA TO GO TO PROFILE WHEN NO ADDRESS
                                <div className="text-gray-600">
                                    <p>No saved addresses. Please add one in your profile.</p>
                                    <button
                                        type="button"
                                        onClick={() => navigate('/profile')}
                                        className="mt-3 inline-flex items-center px-4 py-2 text-sm font-semibold rounded-lg bg-black text-white hover:bg-gray-800 transition"
                                    >
                                        Go to Profile to Add Address
                                    </button>
                                </div>
                            ) : (
                                <div className="space-y-3">
                                    {addresses.map((addr) => (
                                        <label key={addr.id} className="flex items-start gap-3 cursor-pointer">
                                            <input
                                                type="radio"
                                                name="address"
                                                checked={selectedAddressId === addr.id}
                                                onChange={() => {
                                                    setSelectedAddressId(addr.id);
                                                    // 🔹 Clear address error when user picks one
                                                    setAddressError('');
                                                }}
                                                className="mt-1"
                                            />
                                            <div>
                                                <p className="font-semibold">{addr.title}</p>
                                                <p className="text-sm text-gray-600">
                                                    {addr.addressLine}, {addr.city}, {addr.country}{' '}
                                                    {addr.zipCode}
                                                </p>
                                            </div>
                                        </label>
                                    ))}
                                </div>
                            )}
                            {/* 🔹 Show address validation error */}
                            {addressError && (
                                <p className="mt-3 text-sm text-red-500">{addressError}</p>
                            )}
                        </div>

                        {/* 🔹 PAYMENT CARD */}
                        <div className="bg-white rounded-2xl p-6 shadow-sm">
                            <div className="flex items-center gap-2 mb-4">
                                <CreditCard className="w-5 h-5" />
                                <h2 className="text-xl font-bold">Payment</h2>
                            </div>
                            <p className="text-gray-600 mb-4">
                                Select a saved card. Mock payment - no real transaction.
                            </p>
                            {payments.length === 0 ? (
                                // 🔹 SHOW CTA TO GO TO PROFILE WHEN NO CARD
                                <div className="bg-gray-100 p-4 rounded-lg text-sm text-gray-700">
                                    <p>No saved cards. Add one in your profile.</p>
                                    <button
                                        type="button"
                                        onClick={() => navigate('/profile')}
                                        className="mt-3 inline-flex items-center px-4 py-2 text-sm font-semibold rounded-lg bg-black text-white hover:bg-gray-800 transition"
                                    >
                                        Go to Profile to Add Card
                                    </button>
                                </div>
                            ) : (
                                <div className="space-y-2">
                                    {payments.map((card, idx) => (
                                        <label
                                            key={`${card.last4}-${idx}`}
                                            className="flex items-center gap-3 cursor-pointer"
                                        >
                                            <input
                                                type="radio"
                                                name="payment"
                                                checked={selectedPaymentIndex === idx}
                                                onChange={() => {
                                                    setSelectedPaymentIndex(idx);
                                                    // 🔹 Clear payment error when user picks one
                                                    setPaymentError('');
                                                }}
                                            />
                                            <div className="flex flex-col">
                                                <span className="font-semibold">
                                                    {card.brand || 'Card'} •••• {card.last4}
                                                </span>
                                                <span className="text-xs text-gray-500">
                                                    Expires {card.expiry || '--/--'}
                                                </span>
                                            </div>
                                            {card.primary && (
                                                <span className="ml-auto text-xs px-2 py-1 rounded-full bg-black text-white">
                                                    Primary
                                                </span>
                                            )}
                                        </label>
                                    ))}
                                </div>
                            )}
                            {/* 🔹 Show payment validation error */}
                            {paymentError && (
                                <p className="mt-3 text-sm text-red-500">{paymentError}</p>
                            )}
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
