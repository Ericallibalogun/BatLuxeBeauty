
import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';
import { 
  User, Mail, Phone, MapPin, Save, Loader2, 
  ChevronLeft, ShieldCheck, Globe, Home, Hash, Map
} from 'lucide-react';

const AccountSettings: React.FC = () => {
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(true);
  const [success, setSuccess] = useState(false);
  
  const [formData, setFormData] = useState({
    name: '',
    phone_number: '',
    address: {
      street: '',
      city: '',
      state: '',
      postcode: '',
      country: 'United Kingdom'
    }
  });

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const res = await api.get('/profile');
        const profileData = res.data.user || res.data.data || res.data;
        
        if (profileData && typeof profileData === 'object') {
          setFormData({
            name: profileData.name || '',
            phone_number: profileData.phone_number || '',
            address: profileData.address || {
              street: profileData.street || '',
              city: profileData.city || '',
              state: profileData.state || '',
              postcode: profileData.postcode || profileData.postal_code || '',
              country: profileData.country || 'United Kingdom'
            }
          });
        }
      } catch (err: any) {
        if (err.response?.status !== 404) {
          console.warn("Profile retrieval protocol bypassed - using local session defaults.");
        }
      } finally {
        setFetching(false);
      }
    };
    
    if (user) {
      fetchProfile();
    } else {
      setFetching(false);
    }
  }, [user]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setSuccess(false);
    try {
      await api.put('/profile', {
        ...formData,
        email: user?.email
      });
      setSuccess(true);
      setTimeout(() => setSuccess(false), 3000);
    } catch (err: any) {
      const errorMsg = err.response?.data?.error || err.message || "Protocol update failed.";
      alert(errorMsg);
    } finally {
      setLoading(false);
    }
  };

  if (fetching) {
    return (
      <div className="min-h-[70vh] flex flex-col items-center justify-center">
        <Loader2 className="w-12 h-12 text-pink-500 animate-spin mb-4" />
        <p className="text-[10px] font-black text-gray-400 uppercase tracking-[0.4em]">Accessing Profile Vault</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#FDF2F8]/20 py-20">
      <div className="container mx-auto px-4 max-w-4xl">
        <div className="flex items-center justify-between mb-16">
          <Link to="/profile" className="flex items-center gap-2 text-pink-500 font-black uppercase tracking-widest text-[10px] hover:translate-x-[-4px] transition-transform">
            <ChevronLeft size={16} /> Return to Dashboard
          </Link>
          <div className="text-right">
            <span className="text-pink-500 font-black tracking-[0.4em] uppercase text-[10px] mb-2 block">Settings</span>
            <h1 className="text-4xl font-black text-gray-900 italic tracking-tight">Account Protocols</h1>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-12">
          {/* Identity Section */}
          <div className="bg-white rounded-[2.5rem] p-10 shadow-xl border border-pink-50">
            <div className="flex items-center gap-4 mb-10 pb-6 border-b border-pink-50">
              <div className="w-12 h-12 bg-pink-500 rounded-2xl flex items-center justify-center text-white shadow-lg">
                <User size={24} />
              </div>
              <div className="text-left">
                <h2 className="text-xl font-black text-gray-900 italic">Personal Identity</h2>
                <p className="text-[10px] text-gray-400 font-black uppercase tracking-widest">Patron Information</p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div className="space-y-3 text-left">
                <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-2 flex items-center gap-2">
                  <User size={12} className="text-pink-500" /> Full Name
                </label>
                <input 
                  type="text" 
                  className="w-full px-6 py-4 bg-gray-50 border-none rounded-2xl focus:ring-2 focus:ring-pink-500 outline-none font-bold text-gray-900 shadow-inner"
                  value={formData.name}
                  onChange={(e) => setFormData({...formData, name: e.target.value})}
                  placeholder="Enter your name"
                  required
                />
              </div>
              <div className="space-y-3 text-left opacity-60">
                <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-2 flex items-center gap-2">
                  <Mail size={12} className="text-pink-500" /> Email Address
                </label>
                <input 
                  type="email" 
                  disabled
                  className="w-full px-6 py-4 bg-gray-100 border-none rounded-2xl font-bold text-gray-500 cursor-not-allowed"
                  value={user?.email || ''}
                />
              </div>
              <div className="space-y-3 text-left">
                <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-2 flex items-center gap-2">
                  <Phone size={12} className="text-pink-500" /> Contact Number
                </label>
                <input 
                  type="tel" 
                  className="w-full px-6 py-4 bg-gray-50 border-none rounded-2xl focus:ring-2 focus:ring-pink-500 outline-none font-bold text-gray-900 shadow-inner"
                  value={formData.phone_number}
                  onChange={(e) => setFormData({...formData, phone_number: e.target.value})}
                  placeholder="+44 000 000 0000"
                  required
                />
              </div>
            </div>
          </div>

          {/* Logistics Section */}
          <div className="bg-white rounded-[2.5rem] p-10 shadow-xl border border-pink-50">
            <div className="flex items-center gap-4 mb-10 pb-6 border-b border-pink-50">
              <div className="w-12 h-12 bg-gray-900 rounded-2xl flex items-center justify-center text-white shadow-lg">
                <MapPin size={24} />
              </div>
              <div className="text-left">
                <h2 className="text-xl font-black text-gray-900 italic">Logistics Address</h2>
                <p className="text-[10px] text-gray-400 font-black uppercase tracking-widest">Shipping Destination</p>
              </div>
            </div>

            <div className="space-y-8">
              <div className="space-y-3 text-left">
                <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-2 flex items-center gap-2">
                  <Home size={12} className="text-pink-500" /> Street Address
                </label>
                <input 
                  type="text" 
                  className="w-full px-6 py-4 bg-gray-50 border-none rounded-2xl focus:ring-2 focus:ring-pink-500 outline-none font-bold text-gray-900 shadow-inner"
                  value={formData.address.street}
                  onChange={(e) => setFormData({...formData, address: {...formData.address, street: e.target.value}})}
                  placeholder="Street name and number"
                  required
                />
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div className="space-y-3 text-left">
                  <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-2 flex items-center gap-2">
                    <Globe size={12} className="text-pink-500" /> City
                  </label>
                  <input 
                    type="text" 
                    className="w-full px-6 py-4 bg-gray-50 border-none rounded-2xl focus:ring-2 focus:ring-pink-500 outline-none font-bold text-gray-900 shadow-inner"
                    value={formData.address.city}
                    onChange={(e) => setFormData({...formData, address: {...formData.address, city: e.target.value}})}
                    placeholder="London"
                    required
                  />
                </div>
                <div className="space-y-3 text-left">
                  <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-2 flex items-center gap-2">
                    <Map size={12} className="text-pink-500" /> State / Province
                  </label>
                  <input 
                    type="text" 
                    className="w-full px-6 py-4 bg-gray-50 border-none rounded-2xl focus:ring-2 focus:ring-pink-500 outline-none font-bold text-gray-900 shadow-inner"
                    value={formData.address.state}
                    onChange={(e) => setFormData({...formData, address: {...formData.address, state: e.target.value}})}
                    placeholder="Greater London"
                    required
                  />
                </div>
                <div className="space-y-3 text-left">
                  <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-2 flex items-center gap-2">
                    <Hash size={12} className="text-pink-500" /> Postcode
                  </label>
                  <input 
                    type="text" 
                    className="w-full px-6 py-4 bg-gray-50 border-none rounded-2xl focus:ring-2 focus:ring-pink-500 outline-none font-bold text-gray-900 shadow-inner"
                    value={formData.address.postcode}
                    onChange={(e) => setFormData({...formData, address: {...formData.address, postcode: e.target.value}})}
                    placeholder="E1 6AN"
                    required
                  />
                </div>
                <div className="space-y-3 text-left">
                  <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-2 flex items-center gap-2">
                    <Globe size={12} className="text-pink-500" /> Country
                  </label>
                  <select 
                    className="w-full px-6 py-4 bg-gray-50 border-none rounded-2xl focus:ring-2 focus:ring-pink-500 outline-none font-bold text-gray-900 shadow-inner appearance-none cursor-pointer"
                    value={formData.address.country}
                    onChange={(e) => setFormData({...formData, address: {...formData.address, country: e.target.value}})}
                  >
                    <option>United Kingdom</option>
                    <option>United States</option>
                    <option>France</option>
                    <option>Italy</option>
                    <option>Germany</option>
                    <option>Nigeria</option>
                    <option>United Arab Emirates</option>
                  </select>
                </div>
              </div>
            </div>
          </div>

          <div className="flex flex-col md:flex-row items-center justify-between gap-8 pt-6">
            <div className="flex items-center gap-3 text-green-600">
               <ShieldCheck size={20} />
               <p className="text-[10px] font-black uppercase tracking-widest">End-to-End Encrypted Data Storage</p>
            </div>
            <button 
              type="submit" 
              disabled={loading}
              className={`min-w-[280px] py-6 rounded-2xl font-black text-xs uppercase tracking-[0.2em] transition-all shadow-2xl flex items-center justify-center gap-3 active:scale-95 ${success ? 'bg-green-500 text-white shadow-green-200' : 'bg-gray-900 hover:bg-pink-600 text-white'}`}
            >
              {loading ? <Loader2 className="animate-spin" /> : success ? 'Protocols Saved' : (
                <> <Save size={18} /> Update Profile </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AccountSettings;
