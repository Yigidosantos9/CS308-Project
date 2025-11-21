import { Link } from 'react-router-dom';
import { Search, ShoppingBag, User, Menu } from 'lucide-react';
import { useState } from 'react';

const Navbar = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const navLinks = [
    { name: 'NEW!', path: '/shop?category=new', isRed: true },
    { name: 'JEANS', path: '/shop?category=jeans', isRed: false },
    { name: 'SWEATSHIRTS', path: '/shop?category=sweatshirts', isRed: false },
    { name: 'ACCESSORIES', path: '/shop?category=accessories', isRed: false },
  ];

  return (
    <nav className="bg-[#F5F5F5] py-6 px-8 sticky top-0 z-50">
      <div className="container mx-auto flex justify-between items-center">
        
        {/* 1. Logo */}
        <Link to="/" className="text-4xl font-black tracking-tighter uppercase">
          RAWCTRL
        </Link>

        {/* 2. Desktop Navigation (Hidden on Mobile) */}
        <div className="hidden md:flex gap-8 font-medium text-sm tracking-wide">
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
          <button className="hover:opacity-60 transition-opacity">
            <Search className="w-6 h-6" />
          </button>
          <Link to="/cart" className="hover:opacity-60 transition-opacity">
            <ShoppingBag className="w-6 h-6" />
          </Link>
          <Link to="/profile" className="hidden sm:block hover:opacity-60 transition-opacity">
            <User className="w-6 h-6" />
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
        </div>
      )}
    </nav>
  );
};

export default Navbar;