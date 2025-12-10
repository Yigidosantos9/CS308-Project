import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
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
} from 'lucide-react';
import { useShop } from '../../context/ShopContext';
import { authService, orderService, addressService } from '../../services/api';

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
  const [newPayment, setNewPayment] = useState({
    cardNumber: '',
    expiry: '',
    cvv: '',
    cardholderName: '',
  });

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
      const formattedOrders = data.map((order) => ({
        id: order.id,
        orderDate: order.orderDate,
        totalPrice: order.totalPrice,
        status: order.status,
        items: order.items || [],
      }));
      setOrders(formattedOrders);
    } catch (err) {
      console.error('Failed to fetch orders', err);
    }
  };

  // Calculate dynamic stats based on actual orders
  const completedOrders = orders.filter(o => o.status === 'DELIVERED').length;
  const totalOrders = orders.length;

  const stats = [
    { label: 'Total Orders', value: String(totalOrders), highlight: true },
    { label: 'Completed', value: String(completedOrders) },
    { label: 'Preparing', value: String(orders.filter(o => o.status === 'PREPARING').length) },
    { label: 'Shipped', value: String(orders.filter(o => o.status === 'SHIPPED').length) },
  ];

  const [addresses, setAddresses] = useState([]);
  const [showAddAddress, setShowAddAddress] = useState(false);
  const [newAddress, setNewAddress] = useState({
    title: '',
    addressLine: '',
    city: '',
    country: '',
    zipCode: '',
  });

  useEffect(() => {
    if (activeTab === 'Addresses' && user?.id) {
      fetchAddresses();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeTab, user]);

  const fetchAddresses = async () => {
    try {
      const data = await addressService.getAddresses();
      setAddresses(data);
    } catch (err) {
      console.error('Failed to fetch addresses', err);
    }
  };

  const handleAddAddress = async (e) => {
    e.preventDefault();
    try {
      await addressService.addAddress(newAddress);
      setShowAddAddress(false);
      setNewAddress({
        title: '',
        addressLine: '',
        city: '',
        country: '',
        zipCode: '',
      });
      fetchAddresses();
    } catch (err) {
      console.error('Failed to add address', err);
    }
  };

  const handleDeleteAddress = async (addressId) => {
    try {
      await addressService.deleteAddress(addressId);
      fetchAddresses();
    } catch (err) {
      console.error('Failed to delete address', err);
    }
  };

  // LOGOUT HANDLER
  const handleLogout = () => {
    // 1) Clear token + user info from localStorage
    authService.logout();

    // 2) Optionally clear cart (so user doesn't see old cart on guest)
    clearCart();

    // 3) Clear global user state
    setUser(null);

    // 4) Redirect to login page
    navigate('/login');
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

  const handleDownloadInvoice = async (orderId, e) => {
    e.stopPropagation(); // Prevent card expansion
    try {
      await orderService.getInvoice(orderId);
    } catch (error) {
      console.error('Failed to download invoice', error);
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
        orders.map((order) => (
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
                <div className="text-right">
                  <p className="font-bold">
                    $
                    {order.totalPrice?.toFixed(2) ||
                      order.totalAmount?.toFixed(2)}
                  </p>
                  <span
                    className={`inline-block rounded-full px-3 py-1 text-xs font-medium ${order.status === 'DELIVERED'
                      ? 'bg-green-100 text-green-800'
                      : order.status === 'PROCESSING'
                        ? 'bg-yellow-100 text-yellow-800'
                        : order.status === 'IN_TRANSIT'
                          ? 'bg-blue-100 text-blue-800'
                          : 'bg-gray-100 text-gray-800'
                      }`}
                  >
                    {order.status}
                  </span>
                </div>
              </div>
            </div>

            {/* Order Details - Expandable */}
            {expandedOrderId === order.id && (
              <div className="border-t border-gray-200 bg-gray-50 p-5">
                <h4 className="font-semibold mb-3">Order Items</h4>
                {order.items && order.items.length > 0 ? (
                  <div className="space-y-3">
                    {order.items.map((item, index) => (
                      <div
                        key={index}
                        className="flex items-center justify-between bg-white rounded-lg p-3 border border-gray-100"
                      >
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 bg-gray-200 rounded-lg flex items-center justify-center">
                            <Package className="h-5 w-5 text-gray-500" />
                          </div>
                          <div>
                            <p className="font-medium">Product #{item.productId}</p>
                            <p className="text-sm text-gray-500">Qty: {item.quantity}</p>
                          </div>
                        </div>
                        <p className="font-medium">
                          ${(item.price || item.unitPrice * item.quantity)?.toFixed(2)}
                        </p>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-gray-500 text-sm">No items available</p>
                )}

                <div className="mt-4 pt-4 border-t border-gray-200 flex justify-end">
                  <button
                    onClick={(e) => handleDownloadInvoice(order.id, e)}
                    className="flex items-center gap-2 rounded-lg bg-gray-900 px-4 py-2 text-sm font-medium text-white transition hover:bg-gray-700"
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
      <div className="grid gap-4 md:grid-cols-2">
        {addresses.map((address) => (
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
              <button className="underline underline-offset-4">Edit</button>
              <button
                onClick={() => handleDeleteAddress(address.id)}
                className="underline underline-offset-4 text-red-600"
              >
                Delete
              </button>
            </div>
          </div>
        ))}

        {!showAddAddress ? (
          <button
            onClick={() => setShowAddAddress(true)}
            className="flex h-full min-h-[140px] flex-col items-center justify-center gap-2 rounded-2xl border border-dashed border-gray-300 bg-white/50 text-sm font-semibold text-gray-700 transition hover:border-black hover:text-black"
          >
            + Add new address
          </button>
        ) : (
          <div className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm">
            <h3 className="mb-4 text-sm font-bold uppercase tracking-wide">
              New Address
            </h3>
            <form onSubmit={handleAddAddress} className="space-y-3">
              <input
                placeholder="Title (e.g. Home)"
                className="w-full rounded-lg border border-gray-200 p-2 text-sm"
                value={newAddress.title}
                onChange={(e) =>
                  setNewAddress({ ...newAddress, title: e.target.value })
                }
                required
              />
              <input
                placeholder="Address Line"
                className="w-full rounded-lg border border-gray-200 p-2 text-sm"
                value={newAddress.addressLine}
                onChange={(e) =>
                  setNewAddress({
                    ...newAddress,
                    addressLine: e.target.value,
                  })
                }
                required
              />
              <div className="grid grid-cols-2 gap-2">
                <input
                  placeholder="City"
                  className="w-full rounded-lg border border-gray-200 p-2 text-sm"
                  value={newAddress.city}
                  onChange={(e) =>
                    setNewAddress({ ...newAddress, city: e.target.value })
                  }
                  required
                />
                <input
                  placeholder="Zip Code"
                  className="w-full rounded-lg border border-gray-200 p-2 text-sm"
                  value={newAddress.zipCode}
                  onChange={(e) =>
                    setNewAddress({
                      ...newAddress,
                      zipCode: e.target.value,
                    })
                  }
                  required
                />
              </div>
              <input
                placeholder="Country"
                className="w-full rounded-lg border border-gray-200 p-2 text-sm"
                value={newAddress.country}
                onChange={(e) =>
                  setNewAddress({ ...newAddress, country: e.target.value })
                }
                required
              />
              <div className="flex gap-2 pt-2">
                <button
                  type="submit"
                  className="flex-1 rounded-lg bg-black py-2 text-sm font-bold text-white"
                >
                  Save
                </button>
                <button
                  type="button"
                  onClick={() => setShowAddAddress(false)}
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
          <div className="flex gap-3 text-sm font-semibold">
            <button className="underline underline-offset-4">Edit</button>
            <button className="underline underline-offset-4">
              Set primary
            </button>
          </div>
        </div>
      ))}

      {/* Add Payment Button or Form */}
      {showAddPayment ? (
        <div className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm">
          <h3 className="mb-3 text-lg font-bold">Add New Card</h3>
          <form
            onSubmit={(e) => {
              e.preventDefault();
              // Detect card brand from first digit
              const firstDigit = newPayment.cardNumber.charAt(0);
              let brand = 'Card';
              if (firstDigit === '4') brand = 'Visa';
              else if (firstDigit === '5') brand = 'Mastercard';
              else if (firstDigit === '3') brand = 'Amex';

              const newCard = {
                brand,
                last4: newPayment.cardNumber.slice(-4),
                expiry: newPayment.expiry,
                primary: payments.length === 0,
              };
              setPayments([...payments, newCard]);
              setShowAddPayment(false);
              setNewPayment({ cardNumber: '', expiry: '', cvv: '', cardholderName: '' });
            }}
            className="space-y-3"
          >
            <input
              type="text"
              placeholder="Cardholder Name"
              className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm"
              value={newPayment.cardholderName}
              onChange={(e) => setNewPayment({ ...newPayment, cardholderName: e.target.value })}
              required
            />
            <input
              type="text"
              placeholder="Card Number"
              className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm"
              value={newPayment.cardNumber}
              onChange={(e) => setNewPayment({ ...newPayment, cardNumber: e.target.value.replace(/\D/g, '').slice(0, 16) })}
              maxLength={16}
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
                  setNewPayment({ ...newPayment, expiry: value });
                }}
                maxLength={5}
                required
              />
              <input
                type="text"
                placeholder="CVV"
                className="w-20 rounded-lg border border-gray-200 px-3 py-2 text-sm"
                value={newPayment.cvv}
                onChange={(e) => setNewPayment({ ...newPayment, cvv: e.target.value.replace(/\D/g, '').slice(0, 4) })}
                maxLength={4}
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
                onClick={() => setShowAddPayment(false)}
                className="flex-1 rounded-lg border border-gray-200 py-2 text-sm font-bold"
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      ) : (
        <button
          onClick={() => setShowAddPayment(true)}
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
        return <AddressesContent />;
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
                {formState.firstName
                  ? formState.firstName.charAt(0)
                  : 'U'}
                {formState.lastName
                  ? formState.lastName.charAt(0)
                  : ''}
              </div>
              <div>
                <p className="text-sm uppercase tracking-[0.2em] text-white/70">
                  User profile
                </p>
                <p className="text-2xl font-black">
                  {formState.firstName || 'User'} {formState.lastName}
                </p>
                <p className="text-sm text-white/70">
                  RAWCTRL member • Istanbul
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
                Spend: $1.2k
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
                <button className="flex w-full items-center justify-between rounded-lg border border-gray-200 px-3 py-2 hover:border-black">
                  <span>Chat with stylist</span>
                  <ArrowIcon />
                </button>
                <button className="flex w-full items-center justify-between rounded-lg border border-gray-200 px-3 py-2 hover:border-black">
                  <span>Book a fitting</span>
                  <ArrowIcon />
                </button>
              </div>
            </div>

            {/* LOGOUT BUTTON */}
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
