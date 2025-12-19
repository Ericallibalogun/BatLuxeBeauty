
import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';
import { ShieldCheck, AlertCircle, Loader2, Key, Info } from 'lucide-react';

const AdminLogin: React.FC = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { login, user } = useAuth();
  const navigate = useNavigate();

  // Redirect if already authenticated as Admin
  useEffect(() => {
    if (user && String(user.role).toUpperCase() === 'ADMIN') {
      navigate('/admin/dashboard');
    }
  }, [user, navigate]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    
    // Clear session before login to avoid header interference
    localStorage.removeItem('token');

    try {
      const payload = { 
        email: email.trim(), 
        password: password.trim() 
      };

      const response = await api.post('/admin/login', payload);
      const token = response.data.token || response.data.access_token || response.data.data?.token;
      
      if (!token) {
        throw new Error('Authentication succeeded but the server returned an empty session token.');
      }

      login(token);
      setTimeout(() => navigate('/admin/dashboard'), 150);
    } catch (err: any) {
      const status = err.response?.status;
      const data = err.response?.data;
      
      let displayError = 'An unexpected error occurred during portal initialization.';
      
      if (status === 401) {
        displayError = 'Access Denied: The curator identity or security key does not match our records.';
      } else if (data && typeof data === 'object') {
        displayError = data.error || data.message || data.err || JSON.stringify(data);
      } else if (typeof data === 'string') {
        displayError = data;
      } else {
        displayError = err.message || displayError;
      }

      setError(displayError);
      console.error(`Login failed [${status}]:`, data || err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[90vh] flex items-center justify-center p-4 bg-pink-50/30">
      <div className="max-w-5xl w-full bg-white rounded-[3rem] shadow-2xl overflow-hidden flex flex-col md:flex-row min-h-[680px] border border-pink-100/50">
        <div className="flex-1 p-12 md:p-16 flex flex-col justify-center bg-white">
          <div className="mb-10 flex items-center gap-5">
            <div className="w-16 h-16 bg-gray-900 rounded-3xl flex items-center justify-center text-white shadow-2xl shadow-pink-200">
               <ShieldCheck size={36} />
            </div>
            <div className="text-left">
              <h1 className="text-4xl font-black text-gray-900 tracking-tighter italic">Console</h1>
              <p className="text-gray-400 font-black uppercase tracking-[0.4em] text-[10px] mt-1">Authorized Access Only</p>
            </div>
          </div>

          <div className="bg-blue-50/50 border border-blue-100 text-blue-700 p-6 rounded-3xl mb-10 flex items-start space-x-4">
            <Info className="mt-1 flex-shrink-0 text-blue-400" size={20} />
            <div className="text-left">
              <p className="text-xs font-black uppercase tracking-widest mb-1">Security Protocol</p>
              <p className="text-[11px] leading-relaxed font-medium">
                Verify your environment variables (<code className="bg-blue-100 px-1 rounded">ADMIN_EMAIL</code>) are correctly configured in the backend cloud settings.
              </p>
            </div>
          </div>

          {error && (
            <div className="bg-red-50 border-2 border-red-100 text-red-600 p-6 rounded-3xl mb-8 flex items-start gap-4 font-black text-xs uppercase tracking-widest animate-in fade-in slide-in-from-top-2 duration-300">
              <AlertCircle size={22} className="flex-shrink-0 mt-1" />
              <span className="leading-relaxed">{error}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-8">
            <div className="space-y-3">
              <label className="block text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] text-left ml-4">Curator Identity</label>
              <input 
                type="email" 
                autoComplete="email"
                className="w-full px-8 py-6 bg-gray-50 border-none rounded-[2rem] focus:outline-none focus:ring-4 focus:ring-pink-500/10 transition-all shadow-inner text-gray-900 font-bold placeholder:text-gray-300"
                placeholder="curator@batluxe.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>
            <div className="space-y-3">
              <label className="block text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] text-left ml-4">Security Key</label>
              <input 
                type="password" 
                autoComplete="current-password"
                className="w-full px-8 py-6 bg-gray-50 border-none rounded-[2rem] focus:outline-none focus:ring-4 focus:ring-pink-500/10 transition-all shadow-inner text-gray-900 font-bold placeholder:text-gray-300"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </div>
            <button 
              type="submit" 
              disabled={loading}
              className="w-full bg-gray-900 hover:bg-black text-white py-7 rounded-[2rem] font-black shadow-2xl transition-all disabled:opacity-50 text-xl active:scale-95 flex items-center justify-center gap-4 group"
            >
              {loading ? (
                <>
                  <Loader2 className="animate-spin" size={28} />
                  <span className="italic">Verifying Authorization...</span>
                </>
              ) : (
                <>
                  <span>Initialize Console Session</span>
                  <Key className="group-hover:translate-x-1 transition-transform opacity-50" size={24} />
                </>
              )}
            </button>
          </form>

          <div className="mt-14 text-center">
            <Link to="/login" className="text-gray-300 font-black uppercase tracking-[0.3em] text-[10px] hover:text-pink-600 transition-colors">
              Return to Public Portal
            </Link>
          </div>
        </div>

        <div className="hidden md:flex flex-1 bg-cover bg-center p-16 flex-col items-center justify-center text-center text-white relative"
             style={{ backgroundImage: `url('https://images.unsplash.com/photo-1522338242992-e1a54906a8da?q=80&w=2574&auto=format&fit=crop')` }}>
          <div className="absolute inset-0 bg-gray-900/80 backdrop-blur-[6px]"></div>
          <div className="relative z-10 p-12 border border-white/10 rounded-[3rem] backdrop-blur-md">
            <h2 className="text-6xl font-black mb-8 drop-shadow-2xl italic tracking-tighter text-white">System Integrity</h2>
            <p className="text-xl opacity-80 leading-relaxed max-w-sm mx-auto font-light tracking-widest italic text-pink-100 mb-8">
              "Excellence is never an accident; it is the result of high intention and sincere effort."
            </p>
            <div className="w-16 h-1 bg-pink-500 mx-auto rounded-full"></div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminLogin;
