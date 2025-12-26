import { Link, useNavigate, useLocation } from 'react-router-dom';
import { Search, ShoppingBag, User, Menu, X, Heart } from 'lucide-react';
import { useState, useEffect } from 'react';

import { useShop } from '../../context/ShopContext';

const Navbar = () => {
  const { user, cart } = useShop();
  const navigate = useNavigate();
  const location = useLocation(); // Added useLocation

  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  // FIX: Reset search UI when navigating to a new page
  useEffect(() => {
    setIsSearchOpen(false);
    setSearchQuery('');
    setIsMenuOpen(false);
  }, [location.pathname]);

  // Calculate total items in cart
  const cartItemCount = cart.reduce((total, item) => total + (item.quantity || 1), 0);

  const navLinks = [
    { name: 'JEANS', path: '/shop?category=jeans', isRed: false },
    { name: 'TSHIRT', path: '/shop?category=tshirt', isRed: false },
    { name: 'DRESS', path: '/shop?category=dress', isRed: false },
  ];

  const handleSearch = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/shop?q=${encodeURIComponent(searchQuery.trim())}`);
      setIsSearchOpen(false);
      setSearchQuery('');
    }
  };

  return (
    <nav className="bg-[#F5F5F5] py-6 px-8 sticky top-0 z-50 shadow-sm">
      <div className="container mx-auto flex justify-between items-center">

        {/* 1. Logo */}
        <Link to="/" className="text-4xl font-black tracking-tighter uppercase bg-black text-white px-3 py-1">
          RAWCTRL
        </Link>

        {/* 2. Desktop Navigation (Hidden on Mobile) */}
        <div className="hidden md:flex gap-12 font-semibold text-lg tracking-wide">
          {navLinks.map((link) => (
            <Link
              key={link.name}
              to={link.path}
              className={`hover:opacity-60 transition-opacity ${link.isRed ? 'text-red-500 font-bold' : 'text-black'}`}
            >
              {link.name}
            </Link>
          ))}
        </div>

        {/* 3. Icons */}
        <div className="flex items-center gap-5">
          {/* Search Button/Input */}
          {isSearchOpen ? (
            <form onSubmit={handleSearch} className="flex items-center gap-2">
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search products..."
                autoFocus
                className="w-40 md:w-64 px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-black"
              />
              <button type="submit" className="hover:opacity-60 transition-opacity">
                <Search className="w-5 h-5" />
              </button>
              <button type="button" onClick={() => { setIsSearchOpen(false); setSearchQuery(''); }} className="hover:opacity-60 transition-opacity">
                <X className="w-5 h-5" />
              </button>
            </form>
          ) : (
            <button onClick={() => setIsSearchOpen(true)} className="hover:opacity-60 transition-opacity">
              <Search className="w-6 h-6" />
            </button>
          )}

          {/* Wishlist - Hidden for Product Manager and Sales Manager */}
          {user?.userType !== 'PRODUCT_MANAGER' && user?.userType !== 'SALES_MANAGER' && (
            <Link to="/wishlist" className="hover:opacity-60 transition-opacity">
              <Heart className="w-6 h-6" />
            </Link>
          )}

          {/* Cart - Hidden for Product Manager and Sales Manager */}
          {user?.userType !== 'PRODUCT_MANAGER' && user?.userType !== 'SALES_MANAGER' && (
            <Link to="/cart" className="relative hover:opacity-60 transition-opacity">
              <ShoppingBag className="w-6 h-6" />
              {cartItemCount > 0 && (
                <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs font-bold rounded-full w-5 h-5 flex items-center justify-center">
                  {cartItemCount > 99 ? '99+' : cartItemCount}
                </span>
              )}
            </Link>
          )}

          {/* User Profile Link - PM/Sales Manager goes to dashboard, others to profile */}
          <Link
            to={user ? (
              user.userType === 'PRODUCT_MANAGER' ? "/pm-dashboard" :
                user.userType === 'SALES_MANAGER' ? "/sales-dashboard" :
                  "/profile"
            ) : "/login"}
            className="hidden sm:flex items-center gap-2 hover:opacity-60 transition-opacity"
          >
            {user ? (
              <>
                <span className="text-sm font-medium max-w-[120px] truncate">
                  {user.firstName || user.email?.split('@')[0] || 'Profile'}
                </span>
                <User className="w-6 h-6" />
              </>
            ) : (
              <User className="w-6 h-6" />
            )}
          </Link>

          {/* Mobile Menu Button */}
          <button
            className="md:hidden"
            onClick={() => setIsMenuOpen(!isMenuOpen)}
          >
            <Menu className="w-6 h-6" />
          </button>
        </div>
      </div>

      {/* Mobile Menu Dropdown */}
      {isMenuOpen && (
        <div className="md:hidden absolute top-full left-0 w-full bg-white shadow-lg py-4 px-8 flex flex-col gap-4">
          {navLinks.map((link) => (
            <Link
              key={link.name}
              to={link.path}
              onClick={() => setIsMenuOpen(false)}
              className={`text-lg ${link.isRed ? 'text-red-500 font-bold' : 'text-black'}`}
            >
              {link.name}
            </Link>
          ))}
          <Link
            to={user ? (
              user.userType === 'PRODUCT_MANAGER' ? "/pm-dashboard" :
                user.userType === 'SALES_MANAGER' ? "/sales-dashboard" :
                  "/profile"
            ) : "/login"}
            onClick={() => setIsMenuOpen(false)}
            className="flex items-center gap-2 text-lg font-semibold text-black"
          >
            <User className="w-5 h-5" />
            {(user?.userType === 'PRODUCT_MANAGER' || user?.userType === 'SALES_MANAGER') ? 'Dashboard' : 'Profile'}
          </Link>
        </div>
      )}
    </nav>
  );
};

export default Navbar;