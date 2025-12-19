
import React from 'react';
import { Link } from 'react-router-dom';
import { Instagram, Music, ArrowUp, MessageSquare } from 'lucide-react';

// Note: Using a generic 'Music' or 'MessageSquare' icon as a fallback if 'Tiktok' is unavailable 
// in certain lucide builds, but version 0.562.0 definitely includes 'Tiktok'.
import { Tiktok } from 'lucide-react';

const Footer: React.FC = () => {
  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <footer className="bg-[#1A1A1A] text-white py-16 relative">
      <div className="container mx-auto px-4 grid grid-cols-1 md:grid-cols-3 gap-12">
        <div>
          <h2 className="text-2xl font-bold text-pink-500 mb-6 italic tracking-tight">BatLuxe Beauty</h2>
          <p className="text-gray-400 mb-8 leading-relaxed font-light">
            Glow In Your Own Luxury. We provide premium beauty products curated for your unique style and aesthetic.
          </p>
          <div className="flex space-x-4">
            <a 
              href="https://www.instagram.com/batluxebeautyuk?igsh=MThxdTV4ZXB2cDd3aw%3D%3D&utm_source=qr" 
              target="_blank" 
              rel="noopener noreferrer"
              className="w-12 h-12 bg-pink-500 rounded-full flex items-center justify-center hover:bg-pink-600 transition-all hover:scale-110 shadow-lg shadow-pink-500/20"
              aria-label="Instagram"
            >
              <Instagram size={24} />
            </a>
            <a 
              href="https://www.tiktok.com/@batluxebeautyuk?_r=1&_t=ZN-91Z0W4zfwTW" 
              target="_blank" 
              rel="noopener noreferrer"
              className="w-12 h-12 bg-white text-black rounded-full flex items-center justify-center hover:bg-pink-50 transition-all hover:scale-110 shadow-lg shadow-white/10"
              aria-label="TikTok"
            >
              <svg 
                viewBox="0 0 24 24" 
                width="24" 
                height="24" 
                stroke="currentColor" 
                strokeWidth="2.5" 
                fill="none" 
                strokeLinecap="round" 
                strokeLinejoin="round"
              >
                <path d="M9 12a4 4 0 1 0 4 4V4a5 5 0 0 0 5 5"></path>
              </svg>
            </a>
          </div>
        </div>

        <div>
          <h3 className="text-lg font-bold mb-6 uppercase tracking-widest text-pink-400">Quick Links</h3>
          <ul className="space-y-4 text-gray-400 font-medium">
            <li><Link to="/" className="hover:text-pink-500 transition-colors">Home</Link></li>
            <li><Link to="/shop" className="hover:text-pink-500 transition-colors">Shop</Link></li>
            <li><Link to="/about" className="hover:text-pink-500 transition-colors">About Us</Link></li>
            <li><Link to="/contact" className="hover:text-pink-500 transition-colors">Contact</Link></li>
          </ul>
        </div>

        <div>
          <h3 className="text-lg font-bold mb-6 uppercase tracking-widest text-pink-400">Customer Service</h3>
          <ul className="space-y-4 text-gray-400 font-medium">
            <li><Link to="/shipping" className="hover:text-pink-500 transition-colors">Shipping & Returns</Link></li>
            <li><Link to="/privacy" className="hover:text-pink-500 transition-colors">Privacy Policy</Link></li>
            <li><Link to="/terms" className="hover:text-pink-500 transition-colors">Terms & Conditions</Link></li>
            <li><Link to="/faqs" className="hover:text-pink-500 transition-colors">FAQ</Link></li>
          </ul>
        </div>
      </div>

      <div className="container mx-auto px-4 mt-16 pt-8 border-t border-gray-800 text-center text-gray-500">
        <p className="text-sm">© 2025 BatLuxe Beauty. All rights reserved. <span className="text-pink-900 mx-2">|</span> Curated Luxury.</p>
      </div>

      <button 
        onClick={scrollToTop}
        className="fixed bottom-8 right-8 w-14 h-14 bg-pink-500 text-white rounded-full flex items-center justify-center shadow-2xl hover:bg-pink-600 transition-all z-40 hover:-translate-y-2 active:scale-90"
      >
        <ArrowUp size={28} />
      </button>
    </footer>
  );
};

export default Footer;
