import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  MapPin,
  ShieldCheck,
  CreditCard,
  Package,
  Bell,
  CheckCircle,
  Lock,
  Mail,
  Phone,
  Calendar,
  LogOut,
  FileText,
  ChevronDown,
  RotateCcw,
  Clock,
  XCircle,
  AlertCircle,
} from 'lucide-react';
import { useShop } from '../../context/ShopContext';
import { authService, orderService, addressService, productService, refundService } from '../../services/api';

const countries = [
  'Argentina',
  'Australia',
  'Austria',
  'Belgium',
  'Brazil',
  'Canada',
  'Chile',
  'Czech Republic',
  'Denmark',
  'Finland',
  'France',
  'Germany',
  'Greece',
  'India',
  'Ireland',
  'Italy',
  'Japan',
  'Mexico',
  'Netherlands',
  'New Zealand',
  'Norway',
  'Poland',
  'Portugal',
  'Saudi Arabia',
  'Singapore',
  'South Africa',
  'South Korea',
  'Spain',
  'Sweden',
  'Switzerland',
  'Turkey',
  'United Arab Emirates',
  'United Kingdom',
  'United States',
];

const tabs = [
  'Profile',
  'Orders',
  'Addresses',
  'Payment Methods',
  'Security / Password',
  'Notifications / Preferences',
];

const Profile = () => {
  const navigate = useNavigate();
  const { user, setUser, clearCart } = useShop();

  const [activeTab, setActiveTab] = useState('Profile');
  const [formState, setFormState] = useState({
    firstName: user?.firstName || '',
    lastName: user?.lastName || '',
    email: user?.email || '',
    phone: user?.phoneNumber || '',
    birthDate: user?.birthDate || '',
    city: user?.city || 'Istanbul',
    country: user?.country || 'Turkey',
  });

  // Payment Methods state
  const [payments, setPayments] = useState([]);
  const [showAddPayment, setShowAddPayment] = useState(false);
  const [editingPaymentIndex, setEditingPaymentIndex] = useState(null);
  const [newPayment, setNewPayment] = useState({
    cardNumber: '',
    expiry: '',
    cvv: '',
    cardholderName: '',
  });
  const [paymentError, setPaymentError] = useState('');

  // ==================== REFUND STATE ====================
  const [refundModalOpen, setRefundModalOpen] = useState(false);
  const [selectedOrderForRefund, setSelectedOrderForRefund] = useState(null);
  const [refundReason, setRefundReason] = useState('');
  const [refundLoading, setRefundLoading] = useState(false);
  const [refundError, setRefundError] = useState('');
  const [refundSuccess, setRefundSuccess] = useState('');

  // ==================== CANCEL ORDER STATE ====================
  const [cancelModalOpen, setCancelModalOpen] = useState(false);
  const [selectedOrderForCancel, setSelectedOrderForCancel] = useState(null);
  const [cancelLoading, setCancelLoading] = useState(false);
  const [cancelError, setCancelError] = useState('');
  const [cancelSuccess, setCancelSuccess] = useState('');

  const formatCardNumber = (num) => {
    const digits = (num || '').replace(/\D/g, '').slice(0, 16);
    return (digits.match(/.{1,4}/g) || []).join(' ').trim();
  };

  // 🔹 Per-user payments key helper
  const getPaymentsStorageKey = () =>
    user?.userId ? `payments_${user.userId}` : 'payments_guest';

  // 🔹 Load payment methods for the CURRENT user only
  useEffect(() => {
    if (!user?.userId) {
      setPayments([]);
      setShowAddPayment(false);
      setEditingPaymentIndex(null);
      setPaymentError('');
      setNewPayment({
        cardNumber: '',
        expiry: '',
        cvv: '',
        cardholderName: '',
      });
      return;
    }

    const key = getPaymentsStorageKey();
    const stored = localStorage.getItem(key);
    if (stored) {
      try {
        setPayments(JSON.parse(stored));
      } catch (e) {
        console.error('Failed to parse payments from storage', e);
        setPayments([]);
      }
    } else {
      setPayments([]);
    }

    // Reset form UI when user changes
    setShowAddPayment(false);
    setEditingPaymentIndex(null);
    setPaymentError('');
    setNewPayment({
      cardNumber: '',
      expiry: '',
      cvv: '',
      cardholderName: '',
    });
  }, [user?.userId]);

  // 🔹 Persist payment methods per user
  const persistPayments = (nextPayments) => {
    setPayments(nextPayments);
    const key = getPaymentsStorageKey();
    if (key) {
      localStorage.setItem(key, JSON.stringify(nextPayments));
    }
  };

  const validateExpiry = (expiry) => {
    if (!expiry || expiry.length < 4) {
      return { valid: false, message: 'Please enter expiry as MM/YY.' };
    }

    const [mm, yy] = expiry.split('/');
    if (!mm || !yy || mm.length !== 2 || yy.length !== 2) {
      return { valid: false, message: 'Please enter expiry as MM/YY.' };
    }

    const month = parseInt(mm, 10);
    const year = parseInt(yy, 10);
    if (Number.isNaN(month) || Number.isNaN(year) || month < 1 || month > 12) {
      return { valid: false, message: 'Enter a real month between 01 and 12.' };
    }

    const now = new Date();
    const currentYear = now.getFullYear();
    const currentMonth = now.getMonth() + 1;
    const fullYear = 2000 + year;
    const maxAllowedYear = currentYear + 20;

    if (fullYear > maxAllowedYear) {
      return { valid: false, message: 'Expiry year is too far in the future.' };
    }

    if (fullYear < currentYear || (fullYear === currentYear && month < currentMonth)) {
      return { valid: false, message: 'Card is expired. Use a future date.' };
    }

    return { valid: true };
  };

  const toggles = [
    { label: 'Email Notifications', enabled: true },
    { label: 'SMS Notifications', enabled: false },
    { label: 'Order Updates', enabled: true },
    { label: 'Promotional Offers', enabled: true },
  ];

  useEffect(() => {
    if (user) {
      setFormState((prev) => ({
        ...prev,
        firstName: user.firstName || '',
        lastName: user.lastName || '',
        email: user.email || '',
        phone: user.phoneNumber || '',
        birthDate: user.birthDate || '',
      }));
    }
  }, [user]);

  const [orders, setOrders] = useState([]);

  // Fetch orders when profile loads to calculate stats
  useEffect(() => {
    if (user?.userId) {
      fetchOrders();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user]);

  const fetchOrders = async () => {
    try {
      const data = await orderService.getOrders(user.userId);

      // Simple in-memory cache so we don't refetch the same product many times
      const productCache = {};

      const ordersWithProductNames = await Promise.all(
        (data || []).map(async (order) => {
          const itemsWithNames = await Promise.all(
            (order.items || []).map(async (item) => {
              if (!item?.productId) return item;

              if (!productCache[item.productId]) {
                try {
                  const product = await productService.getProductById(item.productId);
                  productCache[item.productId] =
                    product?.name || `Product #${item.productId}`;
                } catch (e) {
                  console.error('Failed to fetch product for order item', e);
                  productCache[item.productId] = `Product #${item.productId}`;
                }
              }

              return {
                ...item,
                productName: productCache[item.productId],
              };
            })
          );

          return {
            id: order.id,
            orderDate: order.orderDate,
            totalPrice: order.totalPrice,
            status: order.status,
            items: itemsWithNames,
            // Refund fields
            refundStatus: order.refundStatus || 'NONE',
            refundRequestedAt: order.refundRequestedAt,
            refundReason: order.refundReason,
            refundRejectionReason: order.refundRejectionReason,
            deliveredAt: order.deliveredAt,
          };
        })
      );

      setOrders(ordersWithProductNames);
    } catch (err) {
      console.error('Failed to fetch orders', err);
    }
  };

  // Calculate dynamic stats based on actual orders
  const statusCounts = orders.reduce(
    (acc, order) => {
      const status = (order.status || '').toUpperCase();
      if (status === 'DELIVERED') acc.completed += 1;
      else if (status === 'PREPARING') acc.preparing += 1;
      else if (status === 'SHIPPED' || status === 'IN_TRANSIT') acc.shipped += 1;
      else if (status === 'REFUNDED') acc.refunded += 1;
      return acc;
    },
    { completed: 0, preparing: 0, shipped: 0, refunded: 0 }
  );

  const stats = [
    { label: 'Total Orders', value: String(orders.length), highlight: true },
    { label: 'Delivered', value: String(statusCounts.completed) },
    { label: 'Preparing', value: String(statusCounts.preparing) },
    { label: 'In Transit', value: String(statusCounts.shipped) },
  ];

  const [addresses, setAddresses] = useState([]);
  const [showAddAddress] = useState(true);
  const [editingAddressId, setEditingAddressId] = useState(null);
  const [newAddress, setNewAddress] = useState({
    title: '',
    addressLine: '',
    city: '',
    country: '',
    zipCode: '',
  });
  const [addressError, setAddressError] = useState('');

  const handleAddressChange = (field, value) => {
    let cleaned = value;
    if (field === 'city' || field === 'country') {
      cleaned = value.replace(/[^\p{L}\s'.-]/gu, '');
    } else if (field === 'zipCode') {
      cleaned = value.replace(/\D/g, '').slice(0, 5);
    } else if (field === 'addressLine') {
      cleaned = value.replace(/[^\p{L}0-9\s'.,#-]/gu, '');
    }
    setNewAddress((prev) => ({ ...prev, [field]: cleaned }));
    if (addressError) setAddressError('');
  };

  useEffect(() => {
    if (activeTab === 'Addresses' && user?.userId) {
      fetchAddresses();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeTab, user]);

  const fetchAddresses = async () => {
    try {
      const data = await addressService.getAddresses(user.userId);
      setAddresses(data || []);
    } catch (err) {
      console.error('Failed to fetch addresses', err);
    }
  };

  const handleAddAddress = async (e) => {
    e.preventDefault();

    const validateAddress = (addr) => {
      const trimmed = {
        title: (addr.title || '').trim(),
        addressLine: (addr.addressLine || '').trim(),
        city: (addr.city || '').trim(),
        country: (addr.country || '').trim(),
        zipCode: (addr.zipCode || '').trim(),
      };

      const addrHasLetters = /[A-Za-z]/.test(trimmed.addressLine);
      const addrHasTwoLetters = (trimmed.addressLine.match(/[A-Za-z]/g) || []).length >= 2;
      const nameRegex = /^[\p{L}][\p{L}\s'.-]{1,}$/u;

      if (!trimmed.title || trimmed.title.length < 2) {
        return 'Please enter a title (min 2 characters).';
      }
      if (!trimmed.addressLine || trimmed.addressLine.length < 5 || !addrHasLetters || !addrHasTwoLetters) {
        return 'Address line must include at least two letters and be 5+ characters.';
      }
      if (!trimmed.city || trimmed.city.length < 3 || !nameRegex.test(trimmed.city)) {
        return 'Enter a valid city (letters only, min 3 chars).';
      }
      if (!trimmed.country || !nameRegex.test(trimmed.country)) {
        return 'Select a valid country.';
      }
      if (!trimmed.zipCode || !/^[0-9]{5}$/.test(trimmed.zipCode)) {
        return 'Zip code must be 5 digits.';
      }
      return '';
    };

    const validationMsg = validateAddress(newAddress);
    if (validationMsg) {
      setAddressError(validationMsg);
      return;
    }
    setAddressError('');

    try {
      const cleanAddress = {
        title: newAddress.title.trim(),
        addressLine: newAddress.addressLine.trim(),
        city: newAddress.city.trim(),
        country: newAddress.country.trim(),
        zipCode: newAddress.zipCode.trim(),
      };

      if (!user?.userId) {
        console.error('No userId available when saving address');
        return;
      }

      if (editingAddressId) {
        await addressService.updateAddress(editingAddressId, cleanAddress, user.userId);
      } else {
        await addressService.addAddress(cleanAddress, user.userId);
      }

      setEditingAddressId(null);
      setNewAddress({
        title: '',
        addressLine: '',
        city: '',
        country: '',
        zipCode: '',
      });

      await fetchAddresses();
    } catch (err) {
      console.error('Failed to add address', err);
    }
  };

  const handleDeleteAddress = async (addressId) => {
    try {
      await addressService.deleteAddress(addressId, user?.userId);
      fetchAddresses();
    } catch (err) {
      console.error('Failed to delete address', err);
    }
  };

  const startEditingAddress = (address) => {
    setEditingAddressId(address.id);
    setNewAddress({
      title: address.title || '',
      addressLine: address.addressLine || '',
      city: address.city || '',
      country: address.country || '',
      zipCode: address.zipCode || '',
    });
  };

  const resetAddressForm = () => {
    setEditingAddressId(null);
    setNewAddress({
      title: '',
      addressLine: '',
      city: '',
      country: '',
      zipCode: '',
    });
  };

  // LOGOUT HANDLER
  const handleLogout = () => {
    authService.logout();
    clearCart();
    setUser(null);
    navigate('/login');
  };

  // ==================== REFUND HANDLERS ====================

  const openRefundModal = (order) => {
    setSelectedOrderForRefund(order);
    setRefundReason('');
    setRefundError('');
    setRefundSuccess('');
    setRefundModalOpen(true);
  };

  const closeRefundModal = () => {
    setRefundModalOpen(false);
    setSelectedOrderForRefund(null);
    setRefundReason('');
    setRefundError('');
    setRefundSuccess('');
  };

  const handleRefundSubmit = async (e) => {
    e.preventDefault();

    if (!refundReason || refundReason.trim().length < 10) {
      setRefundError('Please provide a reason with at least 10 characters.');
      return;
    }

    setRefundLoading(true);
    setRefundError('');

    try {
      await refundService.requestRefund(selectedOrderForRefund.id, refundReason.trim());
      setRefundSuccess('Refund request submitted successfully! We will review it shortly.');

      // Refresh orders to show updated status
      await fetchOrders();

      // Close modal after a short delay
      setTimeout(() => {
        closeRefundModal();
      }, 2000);
    } catch (err) {
      setRefundError(err.message || 'Failed to submit refund request. Please try again.');
    } finally {
      setRefundLoading(false);
    }
  };

  // ==================== CANCEL ORDER FUNCTIONS ====================
  const openCancelModal = (order) => {
    setSelectedOrderForCancel(order);
    setCancelError('');
    setCancelSuccess('');
    setCancelModalOpen(true);
  };

  const closeCancelModal = () => {
    setCancelModalOpen(false);
    setSelectedOrderForCancel(null);
    setCancelError('');
    setCancelSuccess('');
  };

  const handleCancelOrder = async () => {
    setCancelLoading(true);
    setCancelError('');

    try {
      await orderService.cancelOrder(selectedOrderForCancel.id);
      setCancelSuccess('Order cancelled successfully!');

      // Refresh orders to show updated status
      await fetchOrders();

      // Close modal after a short delay
      setTimeout(() => {
        closeCancelModal();
      }, 2000);
    } catch (err) {
      setCancelError(err.message || 'Failed to cancel order. Please try again.');
    } finally {
      setCancelLoading(false);
    }
  };

  // Check if order can be cancelled (only PROCESSING or PREPARING)
  const canCancelOrder = (order) => {
    if (!order) return false;
    return order.status === 'PROCESSING' || order.status === 'PREPARING';
  };

  // Check if order is eligible for refund
  const isOrderEligibleForRefund = (order) => {
    if (!order) return false;
    if (order.status !== 'DELIVERED') return false;
    if (order.refundStatus && order.refundStatus !== 'NONE') return false;

    // Check 30-day window
    const deliveryDate = order.deliveredAt ? new Date(order.deliveredAt) : new Date(order.orderDate);
    const daysSinceDelivery = Math.floor((Date.now() - deliveryDate.getTime()) / (1000 * 60 * 60 * 24));
    return daysSinceDelivery <= 30;
  };

  // Get days remaining for refund
  const getDaysRemainingForRefund = (order) => {
    if (!order || order.status !== 'DELIVERED') return 0;
    const deliveryDate = order.deliveredAt ? new Date(order.deliveredAt) : new Date(order.orderDate);
    const daysSinceDelivery = Math.floor((Date.now() - deliveryDate.getTime()) / (1000 * 60 * 60 * 24));
    return Math.max(0, 30 - daysSinceDelivery);
  };

  // Get refund status badge
  const getRefundStatusBadge = (refundStatus, orderStatus) => {
    // If the main status is already REFUNDED, we don't need to show an "Approved" badge
    if (orderStatus === 'REFUNDED') {
      return null;
    }

    switch (refundStatus) {
      case 'PENDING':
        return (
          <span className="inline-flex items-center gap-1 rounded-full bg-yellow-100 px-2 py-0.5 text-xs font-medium text-yellow-800">
            <Clock className="h-3 w-3" />
            Refund Requested
          </span>
        );
      case 'APPROVED':
        // This will only show if the order hasn't transitioned to the 'REFUNDED' status yet
        return (
          <span className="inline-flex items-center gap-1 rounded-full bg-green-100 px-2 py-0.5 text-xs font-medium text-green-800">
            <CheckCircle className="h-3 w-3" />
            Refund Approved
          </span>
        );
      case 'REJECTED':
        return (
          <span className="inline-flex items-center gap-1 rounded-full bg-red-100 px-2 py-0.5 text-xs font-medium text-red-800">
            <XCircle className="h-3 w-3" />
            Refund Rejected
          </span>
        );
      default:
        return null;
    }
  };
  const ProfileContent = () => (
    <div className="space-y-6">
      <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
        <h3 className="mb-4 text-lg font-bold">Personal Information</h3>
        <div className="grid gap-4 md:grid-cols-2">
          <LabelInput
            label="First Name"
            icon={<Mail className="h-4 w-4" />}
            value={formState.firstName}
            readOnly
          />
          <LabelInput
            label="Last Name"
            icon={<Mail className="h-4 w-4" />}
            value={formState.lastName}
            readOnly
          />
          <LabelInput
            label="Email"
            icon={<Mail className="h-4 w-4" />}
            value={formState.email}
            readOnly
          />
          <LabelInput
            label="Phone"
            icon={<Phone className="h-4 w-4" />}
            value={formState.phone || 'Not set'}
            readOnly
          />
          <LabelInput
            label="Birth Date"
            icon={<Calendar className="h-4 w-4" />}
            value={formState.birthDate || 'Not set'}
            readOnly
          />
        </div>
      </div>
      <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
        <h3 className="mb-4 text-lg font-bold">Account Statistics</h3>
        <div className="grid gap-4 md:grid-cols-4">
          {stats.map((stat, idx) => (
            <div
              key={idx}
              className={`rounded-xl p-4 ${stat.highlight ? 'bg-black text-white' : 'bg-gray-100'
                }`}
            >
              <p className="text-2xl font-bold">{stat.value}</p>
              <p className="text-sm opacity-70">{stat.label}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );

  const handleDownloadInvoice = async (order, e) => {
    if (e) {
      e.stopPropagation();
      e.preventDefault();
    }
    console.log('Download invoice clicked', order?.id);
    try {
      await orderService.getInvoice(
        order.id,
        order.buyerName,
        order.buyerAddress,
        order.paymentMethod
      );
    } catch (error) {
      console.error('Failed to download invoice', error);
      alert('Failed to download invoice. Please try again.');
    }
  };

  const [expandedOrderId, setExpandedOrderId] = useState(null);

  const toggleOrderExpand = (orderId) => {
    setExpandedOrderId(expandedOrderId === orderId ? null : orderId);
  };

  const OrdersContent = () => (
    <div className="space-y-4">
      {orders.length === 0 ? (
        <div className="rounded-2xl border border-gray-200 bg-white p-8 text-center shadow-sm">
          <Package className="mx-auto h-12 w-12 text-gray-400" />
          <p className="mt-4 text-gray-600">No orders yet</p>
        </div>
      ) : (
        [...orders].sort((a, b) => new Date(b.orderDate) - new Date(a.orderDate)).map((order) => (
          <div
            key={order.id}
            className="rounded-2xl border border-gray-200 bg-white shadow-sm overflow-hidden"
          >
            {/* Order Header - Clickable */}
            <div
              className="p-5 cursor-pointer hover:bg-gray-50 transition"
              onClick={() => toggleOrderExpand(order.id)}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <ChevronDown
                    className={`h-5 w-5 text-gray-400 transition-transform ${expandedOrderId === order.id ? 'rotate-180' : ''
                      }`}
                  />
                  <div>
                    <p className="font-bold">Order #{order.id}</p>
                    <p className="text-sm text-gray-500">
                      {new Date(order.orderDate).toLocaleDateString()}
                    </p>
                  </div>
                </div>
                <div className="text-right flex flex-col items-end gap-1">
                  <p className="font-bold">
                    $
                    {order.totalPrice?.toFixed(2) ||
                      order.totalAmount?.toFixed(2)}
                  </p>
                  <div className="flex items-center gap-2">
                    <span
                      className={`inline-block rounded-full px-3 py-1 text-xs font-medium ${order.status === 'DELIVERED'
                        ? 'bg-green-100 text-green-800'
                        : order.status === 'PROCESSING' || order.status === 'PREPARING'
                          ? 'bg-yellow-100 text-yellow-800'
                          : order.status === 'IN_TRANSIT'
                            ? 'bg-blue-100 text-blue-800'
                            : order.status === 'REFUNDED'
                              ? 'bg-purple-100 text-purple-800'
                              : order.status === 'CANCELLED'
                                ? 'bg-red-100 text-red-800'
                                : 'bg-gray-100 text-gray-800'
                        }`}
                    >
                      {order.status}
                    </span>
                    {order.refundStatus && order.refundStatus !== 'NONE' && getRefundStatusBadge(order.refundStatus, order.status)}
                  </div>
                </div>
              </div>
            </div>

            {expandedOrderId === order.id && (
              <div className="border-t border-gray-200 bg-gray-50 p-5">
                <h4 className="font-semibold mb-3">Order Items</h4>
                {order.items && order.items.length > 0 ? (
                  <div className="space-y-3">
                    {order.items.map((item, index) => {
                      const itemName =
                        item.productName ||
                        item.name ||
                        item.product?.name ||
                        `Product #${item.productId}`;

                      const lineTotal =
                        item.price ??
                        (item.unitPrice && item.quantity
                          ? item.unitPrice * item.quantity
                          : 0);

                      return (
                        <div
                          key={index}
                          className="flex items-center justify-between bg-white rounded-lg p-3 border border-gray-100 cursor-pointer hover:bg-gray-50 transition"
                          onClick={() => navigate(`/product/${item.productId}`)}
                        >
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 bg-gray-200 rounded-lg flex items-center justify-center">
                              <Package className="h-5 w-5 text-gray-500" />
                            </div>
                            <div>
                              <p className="font-medium hover:underline">{itemName}</p>
                              <p className="text-sm text-gray-500">
                                Qty: {item.quantity}
                              </p>
                            </div>
                          </div>
                          <p className="font-medium">
                            ${lineTotal.toFixed(2)}
                          </p>
                        </div>
                      );
                    })}
                  </div>
                ) : (
                  <p className="text-gray-500 text-sm">No items available</p>
                )}

                {/* Refund Information */}
                {order.refundStatus && order.refundStatus !== 'NONE' && (
                  <div className="mt-4 p-4 rounded-lg bg-white border border-gray-200">
                    <h5 className="font-semibold text-sm mb-2 flex items-center gap-2">
                      <RotateCcw className="h-4 w-4" />
                      Refund Information
                    </h5>
                    {order.refundReason && (
                      <p className="text-sm text-gray-600 mb-1">
                        <span className="font-medium">Reason:</span> {order.refundReason}
                      </p>
                    )}
                    {order.refundRequestedAt && (
                      <p className="text-sm text-gray-500">
                        Requested: {new Date(order.refundRequestedAt).toLocaleDateString()}
                      </p>
                    )}
                    {order.refundStatus === 'REJECTED' && order.refundRejectionReason && (
                      <p className="text-sm text-red-600 mt-2">
                        <span className="font-medium">Rejection reason:</span> {order.refundRejectionReason}
                      </p>
                    )}
                  </div>
                )}

                <div className="mt-4 pt-4 border-t border-gray-200 flex justify-between items-center">
                  {/* Action Buttons - Cancel for non-delivered, Refund for delivered */}
                  <div className="flex gap-2">
                    {/* Cancel Button - Only show for PROCESSING/PREPARING orders */}
                    {canCancelOrder(order) && (
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          openCancelModal(order);
                        }}
                        className="flex items-center gap-2 rounded-lg bg-orange-50 border border-orange-200 px-4 py-2 text-sm font-medium text-orange-700 transition hover:bg-orange-100"
                      >
                        <XCircle className="h-4 w-4" />
                        Cancel Order
                      </button>
                    )}

                    {/* Refund Button - Only show if eligible (delivered within 30 days) */}
                    {isOrderEligibleForRefund(order) && (
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          openRefundModal(order);
                        }}
                        className="flex items-center gap-2 rounded-lg bg-red-50 border border-red-200 px-4 py-2 text-sm font-medium text-red-700 transition hover:bg-red-100"
                      >
                        <RotateCcw className="h-4 w-4" />
                        Request Refund
                        <span className="text-xs text-red-500">
                          ({getDaysRemainingForRefund(order)} days left)
                        </span>
                      </button>
                    )}
                    {order.status === 'DELIVERED' && !isOrderEligibleForRefund(order) && order.refundStatus === 'NONE' && (
                      <p className="text-sm text-gray-500 flex items-center gap-1">
                        <AlertCircle className="h-4 w-4" />
                        Refund window expired
                      </p>
                    )}
                  </div>

                  <button
                    type="button"
                    onClick={(e) => handleDownloadInvoice(order, e)}
                    className="relative z-20 pointer-events-auto flex items-center gap-2 rounded-lg bg-gray-900 px-4 py-2 text-sm font-medium text-white transition hover:bg-gray-700"
                  >
                    <FileText className="h-4 w-4" />
                    Download Invoice
                  </button>
                </div>
              </div>
            )}
          </div>
        ))
      )}

    </div>
  );

  const AddressesContent = () => (
    <div className="space-y-6">
      {/* Display Home Address from Registration */}
      {user?.homeAddress && (
        <div className="rounded-2xl border-2 border-green-200 bg-green-50 p-5 shadow-sm">
          <div className="flex items-center gap-2 mb-2">
            <MapPin className="h-4 w-4 text-green-600" />
            <p className="text-sm font-semibold uppercase tracking-wide text-green-800">
              Registration Home Address
            </p>
          </div>
          <p className="text-sm text-gray-700 leading-relaxed whitespace-pre-wrap">
            {user.homeAddress}
          </p>
        </div>
      )}
      <div className="grid gap-4 md:grid-cols-2">
        {addresses.map((address) => (
          editingAddressId === address.id ? (
            <div
              key={address.id}
              className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm"
            >
              <h3 className="mb-4 text-sm font-bold uppercase tracking-wide">
                Edit Address
              </h3>
              <form onSubmit={handleAddAddress} className="space-y-3">
                {addressError && (
                  <p className="text-sm text-red-600">{addressError}</p>
                )}
                <input
                  placeholder="Title (e.g. Home)"
                  className="w-full rounded-lg border border-gray-200 p-2 text-sm"
                  value={newAddress.title}
                  onChange={(e) => handleAddressChange('title', e.target.value)}
                  autoComplete="off"
                  required
                />
                <input
                  placeholder="Address Line"
                  className="w-full rounded-lg border border-gray-200 p-2 text-sm"
                  value={newAddress.addressLine}
                  onChange={(e) =>
                    handleAddressChange('addressLine', e.target.value)
                  }
                  autoComplete="off"
                  required
                />
                <div className="grid grid-cols-2 gap-2">
                  <input
                    placeholder="City"
                    className="w-full rounded-lg border border-gray-200 p-2 text-sm"
                    value={newAddress.city}
                    onChange={(e) =>
                      handleAddressChange('city', e.target.value)
                    }
                    autoComplete="off"
                    required
                  />
                  <input
                    placeholder="Zip Code"
                    className="w-full rounded-lg border border-gray-200 p-2 text-sm"
                    value={newAddress.zipCode}
                    onChange={(e) =>
                      handleAddressChange(
                        'zipCode',
                        e.target.value.replace(/\D/g, '').slice(0, 5)
                      )
                    }
                    inputMode="numeric"
                    pattern="[0-9]{5}"
                    minLength={5}
                    maxLength={5}
                    autoComplete="off"
                    required
                  />
                </div>
                <select
                  className="w-full rounded-lg border border-gray-200 p-2 text-sm bg-white"
                  value={newAddress.country}
                  onChange={(e) => handleAddressChange('country', e.target.value)}
                  required
                >
                  <option value="">Select Country</option>
                  {countries.map((c) => (
                    <option key={c} value={c}>{c}</option>
                  ))}
                </select>
                <div className="flex gap-2 pt-2">
                  <button
                    type="submit"
                    className="flex-1 rounded-lg bg-black py-2 text-sm font-bold text-white"
                  >
                    Update
                  </button>
                  <button
                    type="button"
                    onClick={resetAddressForm}
                    className="flex-1 rounded-lg border border-gray-200 py-2 text-sm font-bold"
                  >
                    Cancel
                  </button>
                </div>
              </form>
            </div>
          ) : (
            <div
              key={address.id}
              className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm"
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <MapPin className="h-4 w-4" />
                  <p className="text-sm font-semibold uppercase tracking-wide">
                    {address.title}
                  </p>
                </div>
              </div>
              <p className="mt-3 text-sm text-gray-700 leading-relaxed">
                {address.addressLine}
                <br />
                {address.city}, {address.country} {address.zipCode}
              </p>
              <div className="mt-4 flex gap-3 text-sm font-semibold text-black">
                <button
                  onClick={() => startEditingAddress(address)}
                  className="underline underline-offset-4"
                >
                  Edit
                </button>
                <button
                  onClick={() => handleDeleteAddress(address.id)}
                  className="underline underline-offset-4 text-red-600"
                >
                  Delete
                </button>
              </div>
            </div>
          )
        ))}

        {showAddAddress && !editingAddressId && (
          <div className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm">
            <h3 className="mb-4 text-sm font-bold uppercase tracking-wide">
              New Address
            </h3>
            <form onSubmit={handleAddAddress} className="space-y-3">
              {addressError && (
                <p className="text-sm text-red-600">{addressError}</p>
              )}
              <input
                placeholder="Title (e.g. Home)"
                className="w-full rounded-lg border border-gray-200 p-2 text-sm"
                value={newAddress.title}
                onChange={(e) => handleAddressChange('title', e.target.value)}
                autoComplete="off"
                required
              />
              <input
                placeholder="Address Line"
                className="w-full rounded-lg border border-gray-200 p-2 text-sm"
                value={newAddress.addressLine}
                onChange={(e) =>
                  handleAddressChange('addressLine', e.target.value)
                }
                autoComplete="off"
                required
              />
              <div className="grid grid-cols-2 gap-2">
                <input
                  placeholder="City"
                  className="w-full rounded-lg border border-gray-200 p-2 text-sm"
                  value={newAddress.city}
                  onChange={(e) =>
                    handleAddressChange('city', e.target.value)
                  }
                  autoComplete="off"
                  required
                />
                <input
                  placeholder="Zip Code"
                  className="w-full rounded-lg border border-gray-200 p-2 text-sm"
                  value={newAddress.zipCode}
                  onChange={(e) =>
                    handleAddressChange(
                      'zipCode',
                      e.target.value.replace(/\D/g, '').slice(0, 5)
                    )
                  }
                  inputMode="numeric"
                  pattern="[0-9]{5}"
                  minLength={5}
                  maxLength={5}
                  autoComplete="off"
                  required
                />
              </div>
              <select
                className="w-full rounded-lg border border-gray-200 p-2 text-sm bg-white"
                value={newAddress.country}
                onChange={(e) => handleAddressChange('country', e.target.value)}
                required
              >
                <option value="">Select Country</option>
                {countries.map((c) => (
                  <option key={c} value={c}>{c}</option>
                ))}
              </select>
              <div className="flex gap-2 pt-2">
                <button
                  type="submit"
                  className="flex-1 rounded-lg bg-black py-2 text-sm font-bold text-white"
                >
                  Save
                </button>
                <button
                  type="button"
                  onClick={resetAddressForm}
                  className="flex-1 rounded-lg border border-gray-200 py-2 text-sm font-bold"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        )}
      </div>
    </div>
  );

  const PaymentContent = () => (
    <div className="grid gap-4 md:grid-cols-2">
      {payments.map((card) => (
        <div
          key={card.last4}
          className="flex flex-col gap-3 rounded-2xl border border-gray-200 bg-white p-5 shadow-sm"
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <CreditCard className="h-5 w-5" />
              <p className="text-sm font-semibold uppercase tracking-wide">
                {card.brand}
              </p>
            </div>
            {card.primary && (
              <span className="rounded-full bg-black px-3 py-1 text-[11px] font-semibold uppercase tracking-wide text-white">
                Primary
              </span>
            )}
          </div>
          <p className="text-lg font-bold tracking-[0.2em]">{`**** ${card.last4}`}</p>
          <p className="text-sm text-gray-600">Expires {card.expiry}</p>
          <p className="text-xs text-gray-500 truncate">
            Name: {card.cardholderName || '—'}
          </p>
          <div className="flex gap-3 text-sm font-semibold">
            <button
              onClick={() => {
                setShowAddPayment(true);
                setEditingPaymentIndex(
                  payments.findIndex((p) => p.last4 === card.last4)
                );
                setPaymentError('');
                setNewPayment({
                  cardNumber: card.fullNumber || '',
                  expiry: card.expiry || '',
                  cvv: card.cvv || '',
                  cardholderName: card.cardholderName || '',
                });
              }}
              className="underline underline-offset-4"
            >
              Edit
            </button>
            <button
              onClick={() => {
                persistPayments(
                  payments.map((p) => ({
                    ...p,
                    primary: p.last4 === card.last4,
                  }))
                );
              }}
              className="underline underline-offset-4"
            >
              Set primary
            </button>
          </div>
        </div>
      ))}

      {showAddPayment ? (
        <div className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm">
          <h3 className="mb-3 text-lg font-bold">
            {editingPaymentIndex !== null ? 'Edit Card' : 'Add New Card'}
          </h3>
          <div className="mb-4 rounded-2xl bg-gradient-to-r from-[#111] via-[#1f1f1f] to-[#2b2b2b] p-4 text-white shadow-lg border border-black/40">
            <div className="flex items-center justify-between">
              <p className="text-sm font-semibold uppercase tracking-wide text-gray-200">RAWCTRL Card</p>
              <CreditCard className="h-5 w-5 text-gray-200" />
            </div>
            <p className="mt-6 text-lg font-mono tracking-[0.3em]">
              {formatCardNumber(newPayment.cardNumber) || '**** **** **** ****'}
            </p>
            <div className="mt-4 flex items-center justify-between text-sm">
              <div>
                <p className="opacity-70 text-xs text-gray-300">Cardholder</p>
                <p className="font-semibold">
                  {newPayment.cardholderName || 'Name Surname'}
                </p>
              </div>
              <div className="text-right">
                <p className="opacity-70 text-xs text-gray-300">Expires</p>
                <p className="font-semibold">
                  {newPayment.expiry || 'MM/YY'}
                </p>
              </div>
            </div>
          </div>
          <form
            onSubmit={(e) => {
              e.preventDefault();
              const expiryCheck = validateExpiry(newPayment.expiry);
              if (!expiryCheck.valid) {
                setPaymentError(expiryCheck.message);
                return;
              }
              setPaymentError('');

              const firstDigit = newPayment.cardNumber.charAt(0);
              let brand = 'Card';
              if (firstDigit === '4') brand = 'Visa';
              else if (firstDigit === '5') brand = 'Mastercard';
              else if (firstDigit === '3') brand = 'Amex';

              if (editingPaymentIndex !== null) {
                const updated = payments.map((p, idx) => {
                  if (idx !== editingPaymentIndex) return p;
                  return {
                    ...p,
                    brand: newPayment.cardNumber ? brand : p.brand,
                    last4: newPayment.cardNumber
                      ? newPayment.cardNumber.slice(-4)
                      : p.last4,
                    fullNumber: newPayment.cardNumber || p.fullNumber || '',
                    expiry: newPayment.expiry || p.expiry,
                    cvv: newPayment.cvv || p.cvv || '',
                    cardholderName:
                      newPayment.cardholderName || p.cardholderName || '',
                  };
                });
                persistPayments(updated);
              } else {
                const newCard = {
                  brand,
                  last4: newPayment.cardNumber.slice(-4),
                  fullNumber: newPayment.cardNumber,
                  expiry: newPayment.expiry,
                  cvv: newPayment.cvv,
                  cardholderName: newPayment.cardholderName,
                  primary: payments.length === 0,
                };
                persistPayments([...payments, newCard]);
              }

              setShowAddPayment(false);
              setEditingPaymentIndex(null);
              setPaymentError('');
              setNewPayment({
                cardNumber: '',
                expiry: '',
                cvv: '',
                cardholderName: '',
              });
            }}
            className="space-y-3"
          >
            <input
              type="text"
              placeholder="Cardholder Name"
              className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm"
              value={newPayment.cardholderName}
              onChange={(e) =>
                setNewPayment({
                  ...newPayment,
                  cardholderName: e.target.value,
                })
              }
              required
            />
            <input
              type="text"
              placeholder="Card Number"
              className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm"
              value={formatCardNumber(newPayment.cardNumber)}
              onChange={(e) => {
                const digits = e.target.value.replace(/\D/g, '').slice(0, 16);
                setNewPayment({
                  ...newPayment,
                  cardNumber: digits,
                });
              }}
              maxLength={19}
              required
            />
            <div className="flex gap-3">
              <input
                type="text"
                placeholder="MM/YY"
                className="flex-1 rounded-lg border border-gray-200 px-3 py-2 text-sm"
                value={newPayment.expiry}
                onChange={(e) => {
                  let value = e.target.value.replace(/\D/g, '');
                  if (value.length >= 2) {
                    value = value.slice(0, 2) + '/' + value.slice(2, 4);
                  }
                  setPaymentError('');
                  setNewPayment({ ...newPayment, expiry: value });
                }}
                maxLength={5}
                required
              />
              <input
                placeholder="CVV"
                inputMode="numeric"
                type="password"
                className="w-20 rounded-lg border border-gray-200 px-3 py-2 text-sm"
                value={newPayment.cvv}
                onChange={(e) =>
                  setNewPayment({
                    ...newPayment,
                    cvv: e.target.value.replace(/\D/g, '').slice(0, 3),
                  })
                }
                maxLength={3}
                required
              />
            </div>
            <div className="flex gap-2 pt-2">
              <button
                type="submit"
                className="flex-1 rounded-lg bg-black py-2 text-sm font-bold text-white"
              >
                Save Card
              </button>
              <button
                type="button"
                onClick={() => {
                  setShowAddPayment(false);
                  setEditingPaymentIndex(null);
                  setPaymentError('');
                  setNewPayment({
                    cardNumber: '',
                    expiry: '',
                    cvv: '',
                    cardholderName: '',
                  });
                }}
                className="flex-1 rounded-lg border border-gray-200 py-2 text-sm font-bold"
              >
                Cancel
              </button>
            </div>
            {paymentError && (
              <p className="text-sm text-red-500">{paymentError}</p>
            )}
          </form>
        </div>
      ) : (
        <button
          onClick={() => {
            setPaymentError('');
            setShowAddPayment(true);
          }}
          className="flex h-full min-h-[160px] flex-col items-center justify-center gap-2 rounded-2xl border border-dashed border-gray-300 bg-white/50 text-sm font-semibold text-gray-700 transition hover:border-black hover:text-black"
        >
          + Add payment method
        </button>
      )}
    </div>
  );

  const SecurityContent = () => (
    <div className="grid gap-6 lg:grid-cols-2">
      <div className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm">
        <h3 className="mb-3 text-lg font-bold uppercase tracking-wide">
          Security checklist
        </h3>
        <ul className="space-y-2 text-sm text-gray-700">
          <li className="flex items-center gap-2">
            <CheckCircle className="h-4 w-4 text-green-600" /> Strong password
            set
          </li>
          <li className="flex items-center gap-2">
            <Lock className="h-4 w-4 text-green-600" /> 2FA enabled via email
          </li>
          <li className="flex items-center gap-2">
            <ShieldCheck className="h-4 w-4 text-green-600" /> Trusted devices:
            3
          </li>
        </ul>
      </div>

      <div className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm">
        <h3 className="mb-3 text-lg font-bold uppercase tracking-wide">
          Update password
        </h3>
        <div className="space-y-3">
          <LabelInput label="Current password" type="password" />
          <LabelInput label="New password" type="password" />
          <LabelInput label="Confirm new password" type="password" />
          <button className="mt-1 w-full rounded-xl bg-black py-3 text-sm font-bold uppercase tracking-wide text-white transition hover:opacity-90">
            Save new password
          </button>
        </div>
      </div>
    </div>
  );

  const NotificationsContent = () => (
    <div className="space-y-3 rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
      <h3 className="text-lg font-bold uppercase tracking-wide">Preferences</h3>
      {toggles.map((toggle) => (
        <div
          key={toggle.label}
          className="flex items-center justify-between border-b border-gray-100 pb-3 last:border-none last:pb-0"
        >
          <p className="text-sm font-semibold text-gray-800">
            {toggle.label}
          </p>
          <label className="relative inline-flex cursor-pointer items-center">
            <input
              type="checkbox"
              className="peer sr-only"
              defaultChecked={toggle.enabled}
            />
            <div className="h-6 w-11 rounded-full bg-gray-300 transition peer-checked:bg-black" />
            <span className="absolute left-1 top-1 h-4 w-4 rounded-full bg-white shadow transition peer-checked:translate-x-5" />
          </label>
        </div>
      ))}
      <div className="mt-3 flex items-center gap-2 text-sm text-gray-500">
        <Bell className="h-4 w-4" />
        Update how we reach you with drops and status updates.
      </div>
    </div>
  );

  const renderContent = () => {
    switch (activeTab) {
      case 'Profile':
        return <ProfileContent />;
      case 'Orders':
        return <OrdersContent />;
      case 'Addresses':
        return AddressesContent();
      case 'Payment Methods':
        return PaymentContent();
      case 'Security / Password':
        return <SecurityContent />;
      case 'Notifications / Preferences':
        return <NotificationsContent />;
      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-[#F5F5F5] pb-24 pt-12">
      <div className="container mx-auto max-w-6xl px-4 md:px-10">
        <div className="mb-8 rounded-3xl bg-gradient-to-r from-black via-gray-900 to-gray-700 p-6 text-white shadow-lg">
          <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
            <div className="flex items-center gap-4">
              <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-white text-xl font-bold text-black shadow">
                {formState.firstName ? formState.firstName.charAt(0) : 'U'}
                {formState.lastName ? formState.lastName.charAt(0) : ''}
              </div>
              <div>
                <p className="text-sm uppercase tracking-[0.2em] text-white/70">
                  User profile
                </p>
                <p className="text-2xl font-black">
                  {formState.firstName || 'User'} {formState.lastName}
                </p>
                <p className="text-sm text-white/70">
                  RAWCTRL member
                </p>
              </div>
            </div>
            <div className="flex flex-wrap items-center gap-3">
              <span className="rounded-full bg-white/20 px-3 py-1 text-sm font-medium text-white">
                RAWCTRL Black
              </span>
              <span className="rounded-full bg-white/20 px-3 py-1 text-sm font-medium text-white">
                Priority shipping
              </span>
              <span className="rounded-full bg-white/20 px-3 py-1 text-sm font-medium text-white">
                Spend: ${orders.reduce((sum, order) => sum + (order.totalPrice || 0), 0).toFixed(0)}
              </span>
            </div>
          </div>
        </div>

        <div className="grid gap-6 md:grid-cols-[240px,1fr]">
          <div className="flex flex-col gap-6">
            <div className="rounded-2xl border border-black/10 bg-white p-4 shadow-sm">
              <h2 className="mb-4 text-xs font-bold uppercase tracking-[0.2em] text-gray-500">
                Navigation
              </h2>
              <div className="flex flex-col gap-2">
                {tabs.map((tab) => (
                  <button
                    key={tab}
                    onClick={() => setActiveTab(tab)}
                    className={`flex items-center justify-between rounded-xl px-3 py-2 text-sm font-semibold transition ${activeTab === tab
                      ? 'bg-black text-white shadow'
                      : 'text-gray-700 hover:bg-gray-100'
                      }`}
                  >
                    <span>{tab}</span>
                    {activeTab === tab && (
                      <span className="h-1.5 w-1.5 rounded-full bg-white" />
                    )}
                  </button>
                ))}
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3 rounded-2xl border border-black/10 bg-white p-4 shadow-sm">
              {stats.map((stat) => (
                <div
                  key={stat.label}
                  className={`rounded-xl p-3 ${stat.highlight ? 'bg-black text-white' : 'bg-gray-50'
                    }`}
                >
                  <p className="text-xs uppercase tracking-[0.2em] text-gray-500/90">
                    {stat.label}
                  </p>
                  <p className="text-xl font-black">{stat.value}</p>
                </div>
              ))}
            </div>

            <div className="rounded-2xl border border-black/10 bg-white p-4 shadow-sm">
              <h3 className="text-xs font-bold uppercase tracking-[0.2em] text-gray-500">
                Support
              </h3>
              <div className="mt-3 space-y-2 text-sm font-semibold text-black">
                <Link
                  to="/support"
                  className="flex w-full items-center justify-between rounded-lg border border-gray-200 px-3 py-2 hover:border-black"
                >
                  <span>Chat with stylist</span>
                  <ArrowIcon />
                </Link>
                <button className="flex w-full items-center justify-between rounded-lg border border-gray-200 px-3 py-2 hover:border-black">
                  <span>Book a fitting</span>
                  <ArrowIcon />
                </button>
              </div>
            </div>

            <button
              onClick={handleLogout}
              className="group flex w-full items-center justify-between rounded-2xl border border-red-100 bg-red-50 p-4 text-sm font-bold text-red-600 transition hover:border-red-200 hover:bg-red-100 hover:shadow-sm"
            >
              <span>Log out</span>
              <LogOut className="h-4 w-4 transition-transform group-hover:translate-x-1" />
            </button>
          </div>

          <div className="space-y-6">{renderContent()}</div>
        </div>
      </div>

      {/* Refund Modal - Outside of OrdersContent to prevent re-render focus loss */}
      {refundModalOpen && selectedOrderForRefund && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
          <div className="bg-white rounded-2xl shadow-xl max-w-md w-full mx-4 overflow-hidden">
            <div className="p-6 border-b border-gray-200">
              <h3 className="text-lg font-bold flex items-center gap-2">
                <RotateCcw className="h-5 w-5 text-red-500" />
                Request Refund
              </h3>
              <p className="text-sm text-gray-500 mt-1">
                Order #{selectedOrderForRefund.id}
              </p>
            </div>

            <form onSubmit={handleRefundSubmit} className="p-6 space-y-4">
              {refundError && (
                <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-sm text-red-700">
                  {refundError}
                </div>
              )}

              {refundSuccess && (
                <div className="p-3 bg-green-50 border border-green-200 rounded-lg text-sm text-green-700">
                  {refundSuccess}
                </div>
              )}

              <div>
                <p className="text-sm text-gray-600 mb-3">
                  Order Total: <span className="font-bold">${selectedOrderForRefund.totalPrice?.toFixed(2)}</span>
                </p>
                <p className="text-sm text-gray-500 mb-3">
                  Days remaining to request refund: <span className="font-medium">{getDaysRemainingForRefund(selectedOrderForRefund)}</span>
                </p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Reason for refund *
                </label>
                <textarea
                  value={refundReason}
                  onChange={(e) => setRefundReason(e.target.value)}
                  placeholder="Please explain why you want a refund (minimum 10 characters)..."
                  className="w-full rounded-lg border border-gray-300 p-3 text-sm focus:border-black focus:outline-none min-h-[100px]"
                  required
                  minLength={10}
                  maxLength={1000}
                />
                <p className="text-xs text-gray-400 mt-1">
                  {refundReason.length}/1000 characters
                </p>
              </div>

              <div className="flex gap-3 pt-2">
                <button
                  type="button"
                  onClick={closeRefundModal}
                  className="flex-1 rounded-lg border border-gray-300 py-2.5 text-sm font-medium text-gray-700 hover:bg-gray-50 transition"
                  disabled={refundLoading}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 rounded-lg bg-red-600 py-2.5 text-sm font-medium text-white hover:bg-red-700 transition disabled:opacity-50"
                  disabled={refundLoading || refundSuccess}
                >
                  {refundLoading ? 'Submitting...' : 'Submit Request'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Cancel Order Modal */}
      {cancelModalOpen && selectedOrderForCancel && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
          <div className="bg-white rounded-2xl shadow-xl max-w-md w-full mx-4 overflow-hidden">
            <div className="p-6 border-b border-gray-200">
              <h3 className="text-lg font-bold flex items-center gap-2">
                <XCircle className="h-5 w-5 text-orange-500" />
                Cancel Order
              </h3>
              <p className="text-sm text-gray-500 mt-1">
                Order #{selectedOrderForCancel.id}
              </p>
            </div>

            <div className="p-6 space-y-4">
              {cancelError && (
                <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-sm text-red-700">
                  {cancelError}
                </div>
              )}

              {cancelSuccess && (
                <div className="p-3 bg-green-50 border border-green-200 rounded-lg text-sm text-green-700">
                  {cancelSuccess}
                </div>
              )}

              <div>
                <p className="text-sm text-gray-600 mb-3">
                  Order Total: <span className="font-bold">${selectedOrderForCancel.totalPrice?.toFixed(2)}</span>
                </p>
                <p className="text-sm text-gray-600 mb-3">
                  Status: <span className="font-medium">{selectedOrderForCancel.status}</span>
                </p>
              </div>

              <div className="bg-orange-50 border border-orange-200 rounded-lg p-3">
                <p className="text-sm text-orange-800">
                  <strong>Warning:</strong> This action cannot be undone. Your order will be cancelled and you will receive a full refund.
                </p>
              </div>

              <div className="flex gap-3 pt-2">
                <button
                  type="button"
                  onClick={closeCancelModal}
                  className="flex-1 rounded-lg border border-gray-300 py-2.5 text-sm font-medium text-gray-700 hover:bg-gray-50 transition"
                  disabled={cancelLoading}
                >
                  Keep Order
                </button>
                <button
                  type="button"
                  onClick={handleCancelOrder}
                  className="flex-1 rounded-lg bg-orange-600 py-2.5 text-sm font-medium text-white hover:bg-orange-700 transition disabled:opacity-50"
                  disabled={cancelLoading || cancelSuccess}
                >
                  {cancelLoading ? 'Cancelling...' : 'Cancel Order'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

const LabelInput = ({ label, icon, ...props }) => (
  <label className="flex flex-col gap-2 text-sm font-semibold text-gray-800">
    <span className="uppercase tracking-wide text-gray-500">{label}</span>
    <div className="flex items-center gap-2 rounded-xl border border-gray-200 bg-white px-3 py-2 focus-within:border-black">
      {icon}
      <input
        className="w-full bg-transparent text-sm outline-none"
        {...props}
      />
    </div>
  </label>
);

const ArrowIcon = () => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    className="h-4 w-4"
    fill="none"
    viewBox="0 0 24 24"
    stroke="currentColor"
  >
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth="1.5"
      d="M9 5l7 7-7 7"
    />
  </svg>
);

export default Profile;
