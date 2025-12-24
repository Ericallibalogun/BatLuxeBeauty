
import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';

const Login: React.FC = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { login, user } = useAuth();
  const navigate = useNavigate();

  // If user is already authenticated, don't show login - go to Home
  useEffect(() => {
    if (user) {
      navigate('/');
    }
  }, [user, navigate]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      const response = await api.post('/login', { email, password });
      login(response.data.token);
      navigate('/');
    } catch (err: any) {
      const data = err.response?.data;
      const status = err.response?.status;
      
      let displayError = 'Login failed. Please try again.';
      if (status === 401) {
        displayError = 'Invalid email or password.';
      } else if (data && typeof data === 'object') {
        displayError = data.error || data.message || data.err || JSON.stringify(data);
      } else if (typeof data === 'string') {
        displayError = data;
      }
      setError(displayError);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[90vh] flex items-center justify-center p-4 bg-pink-50">
      <div className="max-w-5xl w-full bg-white rounded-[3rem] shadow-2xl overflow-hidden flex flex-col md:flex-row min-h-[650px] border border-pink-100 animate-in fade-in duration-500">
        <div className="flex-1 p-12 md:p-16 flex flex-col justify-center">
          <div className="mb-12 text-left">
            <h1 className="text-5xl font-black text-gray-900 mb-4 tracking-tighter italic">Welcome <span className="text-pink-500">Back</span></h1>
            <p className="text-gray-400 text-lg font-medium italic">Your beauty journey continues here.</p>
          </div>

          {error && (
            <div className="bg-red-50 border border-red-200 text-red-600 p-6 rounded-2xl mb-8 text-xs font-black uppercase tracking-widest text-left">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-8 text-left">
            <div className="space-y-3">
              <label className="block text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] ml-2">Email Address</label>
              <input 
                type="email" 
                className="w-full px-8 py-5 bg-gray-50 border-none rounded-2xl focus:outline-none focus:ring-2 focus:ring-pink-500 transition-all shadow-inner text-gray-900 font-bold placeholder:text-gray-300"
                placeholder="name@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>
            <div className="space-y-3">
              <label className="block text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] ml-2">Password</label>
              <input 
                type="password" 
                className="w-full px-8 py-5 bg-gray-50 border-none rounded-2xl focus:outline-none focus:ring-2 focus:ring-pink-500 transition-all shadow-inner text-gray-900 font-bold placeholder:text-gray-400"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </div>
            <button 
              type="submit" 
              disabled={loading}
              className="w-full bg-gray-900 hover:bg-pink-600 text-white py-6 rounded-2xl font-black shadow-2xl transition-all disabled:opacity-50 text-xs uppercase tracking-[0.3em] active:scale-95"
            >
              {loading ? 'Authenticating Protocols...' : 'Authorize Access'}
            </button>
          </form>

          <div className="mt-8 text-center">
            <Link to="/forgot-password" className="text-pink-600 font-bold text-sm hover:underline">
              Forgot Password?
            </Link>
          </div>

          <div className="mt-6 text-center">
            <p className="text-gray-400 font-bold text-sm">
              New to BatLuxe? <Link to="/signup" className="text-pink-600 font-black hover:underline ml-2">Register Identity</Link>
            </p>
          </div>
        </div>

        <div className="hidden md:flex flex-1 bg-cover bg-center p-16 flex-col items-center justify-center text-center text-white relative"
             style={{ backgroundImage: `url('https://images.unsplash.com/photo-1522338242992-e1a54906a8da?q=80&w=2574&auto=format&fit=crop')` }}>
          <div className="absolute inset-0 bg-pink-900/40 backdrop-blur-[2px]"></div>
          <div className="relative z-10 p-10 border border-white/20 rounded-[2rem] backdrop-blur-md">
            <h2 className="text-5xl font-black mb-6 drop-shadow-2xl italic tracking-tighter">Luxury Redefined</h2>
            <p className="text-xl opacity-90 leading-relaxed max-w-sm mx-auto font-light tracking-wide italic">
              "Beauty is not about being flawless, it's about being fearless."
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;
