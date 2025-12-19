
import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';
import { useWishlist } from '../context/WishlistContext';
/* Added Clock to the imported icons from lucide-react */
import { User, LogOut, ShieldCheck, ChevronDown, UserCircle, ShoppingCart, Heart, Settings, Clock } from 'lucide-react';

const Header: React.FC = () => {
  const { user, logout } = useAuth();
  const { count: cartCount } = useCart();
  const { count: wishlistCount } = useWishlist();
  const navigate = useNavigate();
  const [dropdownOpen, setDropdownOpen] = useState(false);

  return (
    <header className="bg-white/80 backdrop-blur-lg shadow-sm sticky top-0 z-50">
      <div className="container mx-auto px-4 h-20 flex items-center justify-between">
        <Link to="/" className="text-2xl font-black text-pink-600 italic tracking-tighter">
          BatLuxe <span className="text-gray-900 not-italic">Beauty</span>
        </Link>

        <nav className="hidden md:flex items-center space-x-8">
          <Link to="/" className="text-gray-600 hover:text-pink-600 font-bold transition-colors">Home</Link>
          <Link to="/shop" className="text-gray-600 hover:text-pink-600 font-bold transition-colors">Shop</Link>
          <Link to="/about" className="text-gray-600 hover:text-pink-600 font-bold transition-colors">About</Link>
          <Link to="/contact" className="text-gray-600 hover:text-pink-600 font-bold transition-colors">Contact</Link>
        </nav>

        <div className="flex items-center space-x-5">
          {/* Wishlist Icon */}
          <Link to="/wishlist" className="relative group">
            <Heart size={24} className="text-gray-700 group-hover:text-pink-600 transition-colors" />
            {wishlistCount > 0 && (
              <span className="absolute -top-2 -right-2 bg-pink-500 text-white text-[10px] font-black w-5 h-5 flex items-center justify-center rounded-full shadow-lg animate-bounce">
                {wishlistCount}
              </span>
            )}
          </Link>

          {/* Cart Icon */}
          <Link to="/cart" className="relative group">
            <ShoppingCart size={24} className="text-gray-700 group-hover:text-pink-600 transition-colors" />
            {cartCount > 0 && (
              <span className="absolute -top-2 -right-2 bg-gray-900 text-white text-[10px] font-black w-5 h-5 flex items-center justify-center rounded-full shadow-lg">
                {cartCount}
              </span>
            )}
          </Link>

          {/* User Profile */}
          <div className="relative">
            <button 
              onClick={() => setDropdownOpen(!dropdownOpen)}
              className="flex items-center space-x-2 text-gray-700 hover:text-pink-600 focus:outline-none bg-gray-50 border border-gray-100 p-1.5 rounded-full transition-all hover:shadow-md"
            >
              <UserCircle size={28} />
              <ChevronDown size={14} className={`transform transition-transform ${dropdownOpen ? 'rotate-180' : ''}`} />
            </button>

            {dropdownOpen && (
              <div className="absolute right-0 mt-3 w-64 bg-white border border-pink-50 rounded-2xl shadow-2xl py-3 z-50 animate-in fade-in slide-in-from-top-2 duration-200">
                {!user ? (
                  <>
                    <Link to="/login" onClick={() => setDropdownOpen(false)} className="flex items-center px-6 py-3 text-gray-700 hover:bg-pink-50 font-bold">
                      <User size={18} className="mr-4" /> Sign In
                    </Link>
                    <Link to="/signup" onClick={() => setDropdownOpen(false)} className="flex items-center px-6 py-3 text-gray-700 hover:bg-pink-50 font-bold">
                      <UserCircle size={18} className="mr-4" /> Register
                    </Link>
                    <div className="border-t border-gray-50 my-2"></div>
                    <Link to="/admin-login" onClick={() => setDropdownOpen(false)} className="flex items-center px-6 py-3 text-gray-400 hover:bg-gray-50 font-bold text-sm">
                      <ShieldCheck size={18} className="mr-4" /> Administration
                    </Link>
                  </>
                ) : (
                  <>
                    <div className="px-6 py-3 border-b border-gray-50 mb-2">
                      <p className="text-[10px] font-black text-pink-500 uppercase tracking-widest text-left">Patron Profile</p>
                      <p className="font-bold text-gray-900 truncate mt-1 text-left">{user.email}</p>
                    </div>
                    <Link to="/profile" onClick={() => setDropdownOpen(false)} className="flex items-center px-6 py-3 text-gray-700 hover:bg-pink-50 font-bold">
                      <Clock size={18} className="mr-4" /> My Dashboard
                    </Link>
                    <Link to="/account-settings" onClick={() => setDropdownOpen(false)} className="flex items-center px-6 py-3 text-gray-700 hover:bg-pink-50 font-bold">
                      <Settings size={18} className="mr-4" /> Account Protocols
                    </Link>
                    <Link to="/wishlist" onClick={() => setDropdownOpen(false)} className="flex items-center px-6 py-3 text-gray-700 hover:bg-pink-50 font-bold">
                      <Heart size={18} className="mr-4" /> My Wishlist
                    </Link>
                    {String(user.role).toUpperCase() === 'ADMIN' && (
                      <Link to="/admin/dashboard" onClick={() => setDropdownOpen(false)} className="flex items-center px-6 py-3 text-pink-600 font-black hover:bg-pink-50">
                        <ShieldCheck size={18} className="mr-4" /> Console Access
                      </Link>
                    )}
                    <div className="border-t border-gray-50 my-2"></div>
                    <button 
                      onClick={() => { logout(); setDropdownOpen(false); navigate('/'); }}
                      className="flex w-full items-center px-6 py-3 text-red-600 hover:bg-red-50 text-left font-bold"
                    >
                      <LogOut size={18} className="mr-4" /> End Session
                    </button>
                  </>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;
