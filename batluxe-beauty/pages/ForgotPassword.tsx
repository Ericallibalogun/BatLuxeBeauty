import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../services/api';
import { Mail, ArrowLeft, CheckCircle2, AlertCircle, Loader2 } from 'lucide-react';

const ForgotPassword: React.FC = () => {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSuccess(false);

    try {
      await api.post('/auth/forgot-password', { email: email.trim() });
      setSuccess(true);
    } catch (err: any) {
      const data = err.response?.data;
      let displayError = 'Failed to send reset email. Please try again.';
      
      if (data && typeof data === 'object') {
        displayError = data.error || data.message || data.err || displayError;
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
      <div className="max-w-2xl w-full bg-white rounded-[3rem] shadow-2xl overflow-hidden p-12 md:p-16 border border-pink-100 animate-in fade-in duration-500">
        <div className="text-center mb-12">
          <div className="w-20 h-20 bg-pink-50 rounded-full flex items-center justify-center mx-auto mb-6">
            <Mail size={32} className="text-pink-500" />
          </div>
          <h1 className="text-4xl font-black text-gray-900 mb-4 tracking-tighter italic">
            Reset Your <span className="text-pink-500">Password</span>
          </h1>
          <p className="text-gray-400 text-lg font-medium italic">
            Enter your email address and we'll send you a reset link.
          </p>
        </div>

        {success ? (
          <div className="text-center space-y-8">
            <div className="w-16 h-16 bg-green-50 rounded-full flex items-center justify-center mx-auto">
              <CheckCircle2 size={32} className="text-green-500" />
            </div>
            <div>
              <h2 className="text-2xl font-black text-gray-900 mb-4 italic">Check Your Email</h2>
              <p className="text-gray-600 font-medium leading-relaxed mb-8">
                If an account with <strong>{email}</strong> exists, we've sent you a password reset link.
              </p>
              <div className="bg-blue-50 border border-blue-100 text-blue-700 p-6 rounded-2xl text-left">
                <p className="text-sm font-bold mb-2">Didn't receive the email?</p>
                <ul className="text-sm space-y-1 font-medium">
                  <li>• Check your spam/junk folder</li>
                  <li>• Make sure you entered the correct email</li>
                  <li>• Wait a few minutes for delivery</li>
                </ul>
              </div>
            </div>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <button
                onClick={() => {
                  setSuccess(false);
                  setEmail('');
                }}
                className="px-8 py-4 bg-gray-100 text-gray-700 rounded-2xl font-black text-sm uppercase tracking-widest hover:bg-gray-200 transition-all"
              >
                Send Another Email
              </button>
              <Link
                to="/login"
                className="px-8 py-4 bg-gray-900 text-white rounded-2xl font-black text-sm uppercase tracking-widest hover:bg-pink-600 transition-all text-center"
              >
                Back to Login
              </Link>
            </div>
          </div>
        ) : (
          <>
            {error && (
              <div className="bg-red-50 border border-red-200 text-red-600 p-6 rounded-2xl mb-8 flex items-start gap-4">
                <AlertCircle size={20} className="flex-shrink-0 mt-0.5" />
                <span className="text-sm font-bold">{error}</span>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-8 text-left">
              <div className="space-y-3">
                <label className="block text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] ml-2">
                  Email Address
                </label>
                <input 
                  type="email" 
                  className="w-full px-8 py-5 bg-gray-50 border-none rounded-2xl focus:outline-none focus:ring-2 focus:ring-pink-500 transition-all shadow-inner text-gray-900 font-bold placeholder:text-gray-300"
                  placeholder="name@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
              </div>
              
              <button 
                type="submit" 
                disabled={loading}
                className="w-full bg-gray-900 hover:bg-pink-600 text-white py-6 rounded-2xl font-black shadow-2xl transition-all disabled:opacity-50 text-xs uppercase tracking-[0.3em] active:scale-95 flex items-center justify-center gap-3"
              >
                {loading ? (
                  <>
                    <Loader2 className="animate-spin" size={20} />
                    Sending Reset Link...
                  </>
                ) : (
                  'Send Reset Link'
                )}
              </button>
            </form>

            <div className="mt-8 text-center">
              <Link 
                to="/login" 
                className="text-gray-500 font-bold text-sm hover:text-pink-600 transition-colors flex items-center justify-center gap-2"
              >
                <ArrowLeft size={16} />
                Back to Login
              </Link>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default ForgotPassword;