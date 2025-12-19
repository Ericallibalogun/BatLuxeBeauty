
import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import api from '../services/api';

const Signup: React.FC = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone_number: '',
    password: ''
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      await api.post('/signup', formData);
      navigate('/login');
    } catch (err: any) {
      const rawMsg = err.response?.data?.message || err.response?.data?.error || 'Registration failed. Email might already be in use.';
      setError(typeof rawMsg === 'object' ? JSON.stringify(rawMsg) : String(rawMsg));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[90vh] flex items-center justify-center p-4 bg-pink-50">
      <div className="max-w-5xl w-full bg-white rounded-[2.5rem] shadow-2xl overflow-hidden flex flex-col md:flex-row min-h-[700px] border border-pink-100">
        <div className="flex-1 p-16 flex flex-col justify-center">
          <div className="mb-10 text-left">
            <h1 className="text-5xl font-bold text-gray-900 mb-4 tracking-tight">Join <span className="text-pink-500">BatLuxe</span></h1>
            <p className="text-gray-500 text-lg">Create your gateway to premium beauty.</p>
          </div>

          {error && <div className="bg-red-50 border border-red-200 text-red-600 p-5 rounded-2xl mb-8 text-sm font-bold text-left">{error}</div>}

          <form onSubmit={handleSubmit} className="grid grid-cols-1 gap-6">
            <div className="space-y-2 text-left">
              <label className="block text-xs font-bold text-gray-500 uppercase tracking-widest">Full Name</label>
              <input 
                name="name"
                type="text" 
                className="w-full px-6 py-4 bg-gray-100 border-none rounded-2xl focus:outline-none focus:ring-2 focus:ring-pink-500 transition-all shadow-inner text-gray-900 font-bold placeholder:text-gray-400"
                placeholder="John Doe"
                onChange={handleChange}
                required
              />
            </div>
            <div className="space-y-2 text-left">
              <label className="block text-xs font-bold text-gray-500 uppercase tracking-widest">Email Address</label>
              <input 
                name="email"
                type="email" 
                className="w-full px-6 py-4 bg-gray-100 border-none rounded-2xl focus:outline-none focus:ring-2 focus:ring-pink-500 transition-all shadow-inner text-gray-900 font-bold placeholder:text-gray-400"
                placeholder="john@example.com"
                onChange={handleChange}
                required
              />
            </div>
            <div className="space-y-2 text-left">
              <label className="block text-xs font-bold text-gray-500 uppercase tracking-widest">Phone Number</label>
              <input 
                name="phone_number"
                type="tel" 
                className="w-full px-6 py-4 bg-gray-100 border-none rounded-2xl focus:outline-none focus:ring-2 focus:ring-pink-500 transition-all shadow-inner text-gray-900 font-bold placeholder:text-gray-400"
                placeholder="09012345678"
                onChange={handleChange}
                required
              />
            </div>
            <div className="space-y-2 text-left">
              <label className="block text-xs font-bold text-gray-500 uppercase tracking-widest">Password</label>
              <input 
                name="password"
                type="password" 
                className="w-full px-6 py-4 bg-gray-100 border-none rounded-2xl focus:outline-none focus:ring-2 focus:ring-pink-500 transition-all shadow-inner text-gray-900 font-bold placeholder:text-gray-400"
                placeholder="••••••••"
                onChange={handleChange}
                required
              />
            </div>
            <button 
              type="submit" 
              disabled={loading}
              className="w-full bg-gray-900 hover:bg-pink-600 text-white py-5 rounded-2xl font-bold shadow-2xl transition-all disabled:opacity-50 mt-4 text-lg"
            >
              {loading ? 'Creating...' : 'Initialize Journey'}
            </button>
          </form>

          <div className="mt-12 text-center">
            <p className="text-gray-500 font-medium">
              Already curated? <Link to="/login" className="text-pink-600 font-bold hover:underline">Sign in instead</Link>
            </p>
          </div>
        </div>

        <div className="hidden md:flex flex-1 bg-cover bg-center p-16 flex-col items-center justify-center text-center text-white relative"
             style={{ backgroundImage: `url('https://images.unsplash.com/photo-1522338242992-e1a54906a8da?q=80&w=2574&auto=format&fit=crop')` }}>
          <div className="absolute inset-0 bg-pink-900/40 backdrop-blur-[2px]"></div>
          <div className="relative z-10">
            <h2 className="text-5xl font-bold mb-6 drop-shadow-2xl italic">Exclusive Access</h2>
            <p className="text-xl opacity-90 leading-relaxed max-w-sm mx-auto font-light tracking-wide">
              Unlock the secrets of premium skincare and luxury cosmetics curated specifically for your aesthetic.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Signup;
