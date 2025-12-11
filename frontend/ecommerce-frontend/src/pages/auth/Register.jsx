import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { authService } from '../../services/api';

const Register = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    password: '',
    phoneNumber: '',
    birthDate: ''
  });
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
      // Prepare data matching CreateUserRequest structure
      const userData = {
        firstName: formData.firstName,
        lastName: formData.lastName,
        email: formData.email,
        password: formData.password,
        phoneNumber: formData.phoneNumber,
        birthDate: formData.birthDate || null
      };

      const response = await authService.register(userData);
      // After successful registration, redirect to login
      navigate('/login', { state: { message: 'Registration successful! Please log in.' } });
    } catch (err) {
      console.error('Register form error:', err);
      let errorMessage = 'Registration failed. Please try again.';

      if (err.code === 'ERR_NETWORK' || err.message?.includes('Network Error')) {
        errorMessage = 'Cannot connect to server. Please ensure the gateway API is running on port 8080.';
      } else if (err.response?.data) {
        errorMessage = typeof err.response.data === 'string'
          ? err.response.data
          : err.response.data.message || JSON.stringify(err.response.data);
      } else if (err.message) {
        errorMessage = err.message;
      }

      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  return (
    // Reduced min-h to 900px to balance it with the Login page while fitting content
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

          {/* Action Buttons */}
          <div className="flex items-center gap-8 mt-8">
            <button
              type="submit"
              disabled={loading}
              className="bg-black text-white text-sm font-bold px-8 py-3 rounded-lg hover:bg-gray-800 transition-colors uppercase tracking-wider disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? 'Signing Up...' : 'Sign Up'}
            </button>
            <a href="#" className="text-gray-400 text-sm hover:text-black transition-colors">
              Forgot Password?
            </a>
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
  );
};

export default Register;