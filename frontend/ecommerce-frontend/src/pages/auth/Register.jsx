import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { authService } from '../../services/api';

const countries = [
  'Argentina', 'Australia', 'Austria', 'Belgium', 'Brazil', 'Canada', 'Chile',
  'Czech Republic', 'Denmark', 'Finland', 'France', 'Germany', 'Greece', 'India',
  'Ireland', 'Italy', 'Japan', 'Mexico', 'Netherlands', 'New Zealand', 'Norway',
  'Poland', 'Portugal', 'Saudi Arabia', 'Singapore', 'South Africa', 'South Korea',
  'Spain', 'Sweden', 'Switzerland', 'Turkey', 'United Arab Emirates', 'United Kingdom', 'United States',
];

const Register = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    password: '',
    phoneNumber: '',
    birthDate: '',
    taxId: '',
  });

  // Address modal state
  const [showAddressModal, setShowAddressModal] = useState(false);
  const [addressData, setAddressData] = useState({
    title: '',
    addressLine: '',
    city: '',
    country: '',
    zipCode: '',
  });
  const [savedAddress, setSavedAddress] = useState(null);

  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    const { id, value } = e.target;
    // Map form field names to API field names
    const fieldMap = {
      name: 'firstName',
      surname: 'lastName',
      phone: 'phoneNumber'
    };
    const apiFieldName = fieldMap[id] || id;

    setFormData(prev => ({
      ...prev,
      [apiFieldName]: value
    }));
    setError(''); // Clear error on input change
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      // Format address as string if saved
      const homeAddressStr = savedAddress
        ? `${savedAddress.title}: ${savedAddress.addressLine}, ${savedAddress.city}, ${savedAddress.country} ${savedAddress.zipCode}`
        : null;

      // Prepare data matching CreateUserRequest structure
      const userData = {
        firstName: formData.firstName,
        lastName: formData.lastName,
        email: formData.email,
        password: formData.password,
        phoneNumber: formData.phoneNumber,
        birthDate: formData.birthDate || null,
        taxId: formData.taxId,
        homeAddress: homeAddressStr
      };

      const response = await authService.register(userData);

      // Save structured address to localStorage for sync after login
      if (savedAddress) {
        localStorage.setItem('pendingRegistrationAddress', JSON.stringify(savedAddress));
      }

      // After successful registration, redirect to login
      navigate('/login', { state: { message: 'Registration successful! Please log in.' } });
    } catch (err) {
      console.error('Register form error:', err);
      setError('Registration failed.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      {/* Reduced min-h to 900px to balance it with the Login page while fitting content */}
      <div className="flex flex-col md:flex-row min-h-[900px]">

        {/* LEFT SIDE - FORM */}
        <div className="w-full md:w-1/2 flex flex-col justify-center px-8 md:px-24 lg:px-32 bg-[#F5F5F5] py-20">

          {/* Header Tabs */}
          {/* Reduced margin to mb-12 to keep the header closer to the form */}
          <div className="flex items-center gap-4 mb-12">
            <Link to="/login" className="text-3xl font-bold text-gray-400 hover:text-black transition-colors underline decoration-2 underline-offset-8 decoration-transparent hover:decoration-gray-400">
              LOG IN
            </Link>
            <span className="text-3xl font-light text-gray-400">|</span>
            <h1 className="text-3xl font-bold tracking-tight">SIGN UP</h1>
          </div>

          {/* Error Message */}
          {error && (
            <div className="mb-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded-lg">
              {error}
            </div>
          )}

          {/* Form */}
          {/* Reduced gap to 6 so fields aren't too far apart */}
          <form onSubmit={handleSubmit} className="flex flex-col gap-6 w-full max-w-md">

            {/* Name */}
            <div className="relative group">
              <label
                htmlFor="name"
                className="absolute -top-3 left-4 bg-[#F5F5F5] px-2 text-lg text-black z-10"
              >
                Name
              </label>
              <input
                type="text"
                id="name"
                value={formData.firstName}
                onChange={handleChange}
                required
                className="w-full bg-transparent border border-black rounded-xl px-6 py-4 text-lg outline-none focus:border-black focus:ring-1 focus:ring-black transition-all"
              />
            </div>

            {/* Surname */}
            <div className="relative group">
              <label
                htmlFor="surname"
                className="absolute -top-3 left-4 bg-[#F5F5F5] px-2 text-lg text-black z-10"
              >
                Surname
              </label>
              <input
                type="text"
                id="surname"
                value={formData.lastName}
                onChange={handleChange}
                required
                className="w-full bg-transparent border border-black rounded-xl px-6 py-4 text-lg outline-none focus:border-black focus:ring-1 focus:ring-black transition-all"
              />
            </div>

            {/* Email */}
            <div className="relative group">
              <label
                htmlFor="email"
                className="absolute -top-3 left-4 bg-[#F5F5F5] px-2 text-lg text-black z-10"
              >
                Email
              </label>
              <input
                type="email"
                id="email"
                value={formData.email}
                onChange={handleChange}
                required
                className="w-full bg-transparent border border-black rounded-xl px-6 py-4 text-lg outline-none focus:border-black focus:ring-1 focus:ring-black transition-all"
              />
            </div>

            {/* Password */}
            <div className="relative group">
              <label
                htmlFor="password"
                className="absolute -top-3 left-4 bg-[#F5F5F5] px-2 text-lg text-black z-10"
              >
                Password
              </label>
              <input
                type="password"
                id="password"
                value={formData.password}
                onChange={handleChange}
                required
                minLength={6}
                className="w-full bg-transparent border border-black rounded-xl px-6 py-4 text-lg outline-none focus:border-black focus:ring-1 focus:ring-black transition-all"
              />
            </div>

            {/* Phone Number */}
            <div className="relative group">
              <label
                htmlFor="phone"
                className="absolute -top-3 left-4 bg-[#F5F5F5] px-2 text-lg text-black z-10"
              >
                Phone Number
              </label>
              <input
                type="tel"
                id="phone"
                value={formData.phoneNumber}
                onChange={(e) => {
                  // Only allow digits
                  const value = e.target.value.replace(/\D/g, '');
                  setFormData(prev => ({ ...prev, phoneNumber: value }));
                  setError('');
                }}
                required
                pattern="[0-9]{10,15}"
                title="Please enter a valid phone number"
                className="w-full bg-transparent border border-black rounded-xl px-6 py-4 text-lg outline-none focus:border-black focus:ring-1 focus:ring-black transition-all"
              />
            </div>

            {/* Birth Date */}
            <div className="relative group">
              <label
                htmlFor="birthDate"
                className="absolute -top-3 left-4 bg-[#F5F5F5] px-2 text-lg text-black z-10"
              >
                Birth Date
              </label>
              <input
                type="date"
                id="birthDate"
                value={formData.birthDate}
                onChange={handleChange}
                required
                max={(() => {
                  const today = new Date();
                  today.setFullYear(today.getFullYear() - 16);
                  return today.toISOString().split('T')[0];
                })()} // Must be at least 16 years old
                className="w-full bg-transparent border border-black rounded-xl px-6 py-4 text-lg outline-none focus:border-black focus:ring-1 focus:ring-black transition-all"
              />
              <p className="text-xs text-gray-500 mt-1 ml-2">You must be at least 16 years old to register.</p>
            </div>

            {/* Tax ID (Required) */}
            <div className="relative group">
              <label
                htmlFor="taxId"
                className="absolute -top-3 left-4 bg-[#F5F5F5] px-2 text-lg text-black z-10"
              >
                Tax ID
              </label>
              <input
                type="text"
                id="taxId"
                value={formData.taxId}
                onChange={(e) => {
                  // Only allow digits for Turkish Tax ID (11 digits)
                  const value = e.target.value.replace(/\D/g, '').slice(0, 11);
                  setFormData(prev => ({ ...prev, taxId: value }));
                  setError('');
                }}
                required
                pattern="[0-9]{11}"
                title="Turkish Tax ID should be 11 digits"
                className="w-full bg-transparent border border-black rounded-xl px-6 py-4 text-lg outline-none focus:border-black focus:ring-1 focus:ring-black transition-all"
              />
              <p className="text-xs text-gray-500 mt-1 ml-2">11-digit Turkish Tax ID number</p>
            </div>

            {/* Home Address (Optional - Button to open modal) */}
            <div className="relative group">
              <label className="block text-lg text-black mb-2">
                Home Address (Optional)
              </label>
              {savedAddress ? (
                <div className="w-full bg-green-50 border border-green-300 rounded-xl px-6 py-4 text-sm">
                  <div className="flex justify-between items-start">
                    <div>
                      <p className="font-semibold text-green-800">{savedAddress.title}</p>
                      <p className="text-gray-700">{savedAddress.addressLine}</p>
                      <p className="text-gray-600">{savedAddress.city}, {savedAddress.country} {savedAddress.zipCode}</p>
                    </div>
                    <button
                      type="button"
                      onClick={() => setShowAddressModal(true)}
                      className="text-sm text-black underline"
                    >
                      Edit
                    </button>
                  </div>
                </div>
              ) : (
                <button
                  type="button"
                  onClick={() => setShowAddressModal(true)}
                  className="w-full bg-transparent border border-dashed border-gray-400 rounded-xl px-6 py-4 text-lg text-gray-500 hover:border-black hover:text-black transition-all flex items-center justify-center gap-2"
                >
                  <span className="text-2xl">+</span> Add Address
                </button>
              )}
            </div>

            {/* Action Buttons */}
            <div className="flex items-center gap-8 mt-8">
              <button
                type="submit"
                disabled={loading}
                className="bg-black text-white text-sm font-bold px-8 py-3 rounded-lg hover:bg-gray-800 transition-colors uppercase tracking-wider disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? 'Signing Up...' : 'Sign Up'}
              </button>
            </div>

          </form>
        </div>

        {/* RIGHT SIDE - IMAGE */}
        <div className="hidden md:block w-1/2 relative">
          <img
            src="https://images.unsplash.com/photo-1511556532299-8f662fc26c06?q=80&w=2070&auto=format&fit=crop"
            alt="Fashion Lifestyle"
            className="absolute inset-0 w-full h-full object-cover"
          />
        </div>

      </div>

      {/* Address Modal */}
      {
        showAddressModal && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
            <div className="bg-white rounded-2xl p-8 w-full max-w-md mx-4 shadow-2xl">
              <h2 className="text-xl font-bold mb-6">Add Home Address</h2>
              <div className="space-y-4">
                <input
                  placeholder="Title (e.g. Home, Work)"
                  className="w-full rounded-lg border border-gray-300 p-3 text-sm focus:border-black focus:ring-1 focus:ring-black"
                  value={addressData.title}
                  onChange={(e) => setAddressData(prev => ({ ...prev, title: e.target.value }))}
                />
                <input
                  placeholder="Address Line"
                  className="w-full rounded-lg border border-gray-300 p-3 text-sm focus:border-black focus:ring-1 focus:ring-black"
                  value={addressData.addressLine}
                  onChange={(e) => setAddressData(prev => ({ ...prev, addressLine: e.target.value }))}
                />
                <div className="grid grid-cols-2 gap-3">
                  <input
                    placeholder="City"
                    className="w-full rounded-lg border border-gray-300 p-3 text-sm focus:border-black focus:ring-1 focus:ring-black"
                    value={addressData.city}
                    onChange={(e) => setAddressData(prev => ({ ...prev, city: e.target.value }))}
                  />
                  <input
                    placeholder="Zip Code"
                    className="w-full rounded-lg border border-gray-300 p-3 text-sm focus:border-black focus:ring-1 focus:ring-black"
                    value={addressData.zipCode}
                    onChange={(e) => setAddressData(prev => ({ ...prev, zipCode: e.target.value.replace(/\D/g, '').slice(0, 5) }))}
                    inputMode="numeric"
                    maxLength={5}
                  />
                </div>
                <select
                  className="w-full rounded-lg border border-gray-300 p-3 text-sm bg-white focus:border-black focus:ring-1 focus:ring-black"
                  value={addressData.country}
                  onChange={(e) => setAddressData(prev => ({ ...prev, country: e.target.value }))}
                >
                  <option value="">Select Country</option>
                  {countries.map((c) => (
                    <option key={c} value={c}>{c}</option>
                  ))}
                </select>
                <div className="flex gap-3 pt-4">
                  <button
                    type="button"
                    onClick={() => {
                      if (addressData.title && addressData.addressLine && addressData.city && addressData.country && addressData.zipCode) {
                        setSavedAddress(addressData);
                        setShowAddressModal(false);
                      }
                    }}
                    className="flex-1 bg-black text-white py-3 rounded-lg font-semibold hover:bg-gray-800 transition"
                  >
                    Save
                  </button>
                  <button
                    type="button"
                    onClick={() => setShowAddressModal(false)}
                    className="flex-1 border border-gray-300 py-3 rounded-lg font-semibold hover:bg-gray-100 transition"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            </div>
          </div>
        )
      }
    </>
  );
};

export default Register;