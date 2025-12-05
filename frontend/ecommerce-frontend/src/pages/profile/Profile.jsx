import { useState, useEffect } from 'react';
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
  Home,
  Globe,
  BadgeCheck,
} from 'lucide-react';
import { useShop } from '../../context/ShopContext';
import { orderService } from '../../services/api';

const tabs = [
  'Profile',
  'Orders',
  'Addresses',
  'Payment Methods',
  'Security / Password',
  'Notifications / Preferences',
];

const Profile = () => {
  const { user, checkAuth, loading } = useShop();
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

  useEffect(() => {
    // Refresh user details from the backend when the page mounts
    checkAuth();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (user) {
      const formattedBirthDate = user.birthDate
        ? new Date(user.birthDate).toISOString().split('T')[0]
        : '';

      setFormState(prev => ({
        ...prev,
        firstName: user.firstName || '',
        lastName: user.lastName || '',
        email: user.email || '',
        phone: user.phoneNumber || '',
        birthDate: formattedBirthDate,
      }));
    }
  }, [user]);

  const [saved, setSaved] = useState(false);

  const stats = [
    { label: 'Completed Orders', value: '12', highlight: true },
    { label: 'Open Returns', value: '1' },
    { label: 'Loyalty Points', value: '840' },
    { label: 'Wishlist Items', value: '7' },
  ];

  // ...

  const [orders, setOrders] = useState([]);

  useEffect(() => {
    if (activeTab === 'Orders' && user?.userId) {
      fetchOrders();
    }
  }, [activeTab, user]);

  const fetchOrders = async () => {
    try {
      const data = await orderService.getOrders();
      // Transform data to match UI if needed
      // Backend returns: { id, orderDate, status, totalAmount, items: [...] }
      // UI expects: { id, date, total, status, items: count, eta }

      const formattedOrders = data.map(order => ({
        id: `RC-${order.id}`,
        date: new Date(order.orderDate).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }),
        total: `$${order.totalAmount.toFixed(2)}`,
        status: order.status,
        items: order.items.length,
        eta: order.status === 'DELIVERED' ? 'Delivered' : 'Processing'
      }));
      setOrders(formattedOrders);
    } catch (err) {
      console.error("Failed to fetch orders", err);
    }
  };

  const addresses = [
    {
      title: 'Home',
      detail: 'Acibadem Mah., No:12/4, Kadikoy, Istanbul, 34718',
      isDefault: true,
    },
    {
      title: 'Office',
      detail: 'Buyukdere Cad. 145/2, Levent, Istanbul, 34394',
      isDefault: false,
    },
  ];

  const payments = [
    { brand: 'Visa', last4: '4242', expiry: '04/27', primary: true },
    { brand: 'Mastercard', last4: '9900', expiry: '11/26', primary: false },
  ];

  const toggles = [
    { label: 'Order status push notifications', enabled: true },
    { label: 'Product launch & drops', enabled: true },
    { label: 'Weekly style digest', enabled: false },
    { label: 'SMS alerts', enabled: false },
  ];

  const handleChange = (field, value) => {
    setFormState((prev) => ({ ...prev, [field]: value }));
    setSaved(false);
  };

  const handleSave = () => {
    setSaved(true);
    setTimeout(() => setSaved(false), 2200);
  };

  const Badge = ({ children }) => (
    <span className="inline-flex items-center gap-2 rounded-full bg-white/80 px-3 py-1 text-xs font-semibold uppercase tracking-wide text-black shadow-sm">
      <BadgeCheck className="h-3.5 w-3.5" />
      {children}
    </span>
  );

  const ProfileContent = () => (
    <div className="space-y-8">
      <div className="grid gap-6 lg:grid-cols-2">
        <div className="rounded-2xl bg-white p-6 shadow-sm">
          <h3 className="mb-4 text-lg font-bold uppercase tracking-wide">Contact</h3>
          <div className="grid gap-4 sm:grid-cols-2">
            <LabelInput
              label="First name"
              value={formState.firstName}
              onChange={(e) => handleChange('firstName', e.target.value)}
            />
            <LabelInput
              label="Last name"
              value={formState.lastName}
              onChange={(e) => handleChange('lastName', e.target.value)}
            />
            <LabelInput
              label="Email"
              type="email"
              icon={<Mail className="h-4 w-4 text-gray-400" />}
              value={formState.email}
              onChange={(e) => handleChange('email', e.target.value)}
            />
            <LabelInput
              label="Phone"
              type="tel"
              icon={<Phone className="h-4 w-4 text-gray-400" />}
              value={formState.phone}
              onChange={(e) => handleChange('phone', e.target.value)}
            />
          </div>
          <div className="mt-4 grid gap-4 sm:grid-cols-2">
            <LabelInput
              label="City"
              icon={<Home className="h-4 w-4 text-gray-400" />}
              value={formState.city}
              onChange={(e) => handleChange('city', e.target.value)}
            />
            <LabelInput
              label="Country"
              icon={<Globe className="h-4 w-4 text-gray-400" />}
              value={formState.country}
              onChange={(e) => handleChange('country', e.target.value)}
            />
          </div>
        </div>

        <div className="rounded-2xl bg-white p-6 shadow-sm">
          <h3 className="mb-4 text-lg font-bold uppercase tracking-wide">Personal</h3>
          <div className="grid gap-4 sm:grid-cols-2">
            <LabelInput
              label="Date of birth"
              type="date"
              icon={<Calendar className="h-4 w-4 text-gray-400" />}
              value={formState.birthDate}
              onChange={(e) => handleChange('birthDate', e.target.value)}
            />
            <div className="flex flex-col gap-2">
              <span className="text-sm font-semibold uppercase tracking-wide text-gray-500">
                Membership
              </span>
              <div className="flex items-center justify-between rounded-xl border border-gray-200 px-4 py-3">
                <div>
                  <p className="text-sm font-bold">RAWCTRL Black</p>
                  <p className="text-xs text-gray-500">Priority support & 2-day delivery</p>
                </div>
                <ShieldCheck className="h-5 w-5 text-gray-800" />
              </div>
            </div>
          </div>

          <div className="mt-6 flex flex-wrap items-center gap-3">
            <Badge>Member since 2023</Badge>
            <Badge>Preferred size M</Badge>
            <Badge>Style: Minimal</Badge>
          </div>
        </div>
      </div>

      <div className="flex items-center justify-between gap-4 rounded-2xl bg-black px-6 py-5 text-white shadow-md">
        <div className="space-y-1">
          <p className="text-sm uppercase tracking-wider text-white/70">RAWCTRL Care</p>
          <p className="text-lg font-semibold">Free tailoring & priority support for members.</p>
        </div>
        <button
          onClick={handleSave}
          className="rounded-full bg-white px-5 py-2 text-sm font-bold uppercase tracking-wide text-black transition hover:opacity-90"
        >
          Save profile
        </button>
      </div>

      {saved && (
        <div className="flex items-center gap-2 rounded-xl border border-green-200 bg-green-50 px-4 py-3 text-sm font-semibold text-green-700">
          <CheckCircle className="h-4 w-4" />
          Changes saved for this session.
        </div>
      )}
    </div>
  );

  const OrdersContent = () => (
    <div className="space-y-4">
      {orders.map((order) => (
        <div
          key={order.id}
          className="flex flex-col gap-3 rounded-2xl border border-gray-200 bg-white px-5 py-4 shadow-sm sm:flex-row sm:items-center sm:justify-between"
        >
          <div>
            <p className="text-xs uppercase tracking-wide text-gray-500">{order.date}</p>
            <p className="text-lg font-bold">Order {order.id}</p>
            <p className="text-sm text-gray-600">{order.items} items • {order.total}</p>
          </div>
          <div className="flex flex-col items-start gap-2 sm:items-end">
            <span className="rounded-full bg-black px-3 py-1 text-xs font-semibold uppercase tracking-wide text-white">
              {order.status}
            </span>
            <p className="text-xs text-gray-500">{order.eta}</p>
            <button className="text-sm font-semibold underline underline-offset-4">
              View details
            </button>
          </div>
        </div>
      ))}
      <div className="flex items-center gap-3 rounded-2xl border border-dashed border-gray-300 px-5 py-4 text-sm text-gray-600">
        <Package className="h-5 w-5 text-gray-700" />
        Track upcoming deliveries and returns from here.
      </div>
    </div>
  );

  const AddressesContent = () => (
    <div className="grid gap-4 md:grid-cols-2">
      {addresses.map((address) => (
        <div key={address.title} className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <MapPin className="h-4 w-4" />
              <p className="text-sm font-semibold uppercase tracking-wide">{address.title}</p>
            </div>
            {address.isDefault && (
              <span className="rounded-full bg-black px-3 py-1 text-[11px] font-semibold uppercase tracking-wide text-white">
                Default
              </span>
            )}
          </div>
          <p className="mt-3 text-sm text-gray-700 leading-relaxed">{address.detail}</p>
          <div className="mt-4 flex gap-3 text-sm font-semibold text-black">
            <button className="underline underline-offset-4">Edit</button>
            <button className="underline underline-offset-4">Set default</button>
          </div>
        </div>
      ))}
      <button className="flex h-full min-h-[140px] flex-col items-center justify-center gap-2 rounded-2xl border border-dashed border-gray-300 bg-white/50 text-sm font-semibold text-gray-700 transition hover:border-black hover:text-black">
        + Add new address
      </button>
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
              <p className="text-sm font-semibold uppercase tracking-wide">{card.brand}</p>
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
            <button className="underline underline-offset-4">Set primary</button>
          </div>
        </div>
      ))}
      <button className="flex h-full min-h-[160px] flex-col items-center justify-center gap-2 rounded-2xl border border-dashed border-gray-300 bg-white/50 text-sm font-semibold text-gray-700 transition hover:border-black hover:text-black">
        + Add payment method
      </button>
    </div>
  );

  const SecurityContent = () => (
    <div className="grid gap-6 lg:grid-cols-2">
      <div className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm">
        <h3 className="mb-3 text-lg font-bold uppercase tracking-wide">Security checklist</h3>
        <ul className="space-y-2 text-sm text-gray-700">
          <li className="flex items-center gap-2">
            <CheckCircle className="h-4 w-4 text-green-600" /> Strong password set
          </li>
          <li className="flex items-center gap-2">
            <Lock className="h-4 w-4 text-green-600" /> 2FA enabled via email
          </li>
          <li className="flex items-center gap-2">
            <ShieldCheck className="h-4 w-4 text-green-600" /> Trusted devices: 3
          </li>
        </ul>
      </div>

      <div className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm">
        <h3 className="mb-3 text-lg font-bold uppercase tracking-wide">Update password</h3>
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
        <div key={toggle.label} className="flex items-center justify-between border-b border-gray-100 pb-3 last:border-none last:pb-0">
          <p className="text-sm font-semibold text-gray-800">{toggle.label}</p>
          <label className="relative inline-flex cursor-pointer items-center">
            <input type="checkbox" className="peer sr-only" defaultChecked={toggle.enabled} />
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
        return <PaymentContent />;
      case 'Security / Password':
        return <SecurityContent />;
      case 'Notifications / Preferences':
        return <NotificationsContent />;
      default:
        return null;
    }
  };

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#F5F5F5] text-sm font-semibold">
        Loading your profile...
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#F5F5F5] pb-24 pt-12">
      <div className="container mx-auto max-w-6xl px-4 md:px-10">
        <div className="mb-8 rounded-3xl bg-gradient-to-r from-black via-gray-900 to-gray-700 p-6 text-white shadow-lg">
          <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
            <div className="flex items-center gap-4">
              <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-white text-xl font-bold text-black shadow">
                {formState.firstName.charAt(0)}
                {formState.lastName.charAt(0)}
              </div>
              <div>
                <p className="text-sm uppercase tracking-[0.2em] text-white/70">User profile</p>
                <p className="text-2xl font-black">{formState.firstName} {formState.lastName}</p>
                <p className="text-sm text-white/70">RAWCTRL member • Istanbul</p>
              </div>
            </div>
            <div className="flex flex-wrap items-center gap-3">
              <Badge>RAWCTRL Black</Badge>
              <Badge>Priority shipping</Badge>
              <Badge>Spend: $1.2k</Badge>
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
                    {activeTab === tab && <span className="h-1.5 w-1.5 rounded-full bg-white" />}
                  </button>
                ))}
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3 rounded-2xl border border-black/10 bg-white p-4 shadow-sm">
              {stats.map((stat) => (
                <div
                  key={stat.label}
                  className={`rounded-xl p-3 ${stat.highlight ? 'bg-black text-white' : 'bg-gray-50'}`}
                >
                  <p className="text-xs uppercase tracking-[0.2em] text-gray-500/90">{stat.label}</p>
                  <p className="text-xl font-black">{stat.value}</p>
                </div>
              ))}
            </div>

            <div className="rounded-2xl border border-black/10 bg-white p-4 shadow-sm">
              <h3 className="text-xs font-bold uppercase tracking-[0.2em] text-gray-500">Support</h3>
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
          </div>

          <div className="space-y-6">
            {renderContent()}
          </div>
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
  <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M9 5l7 7-7 7" />
  </svg>
);

export default Profile;
