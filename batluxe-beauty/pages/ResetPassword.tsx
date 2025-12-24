import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import api from '../services/api';
import { Key, ArrowLeft, CheckCircle2, AlertCircle, Loader2, Eye, EyeOff } from 'lucide-react';

const ResetPassword: React.FC = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [token, setToken] = useState('');

  useEffect(() => {
    const resetToken = searchParams.get('token');
    if (!resetToken) {
      setError('Invalid or missing reset token. Please request a new password reset.');
      return;
    }
    setToken(resetToken);
  }, [searchParams]);

  const validatePassword = (password: string): string[] => {
    const errors: string[] = [];
    if (password.length < 8) {
      errors.push('Password must be at least 8 characters long');
    }
    if (!/(?=.*[a-z])/.test(password)) {
      errors.push('Password must contain at least one lowercase letter');
    }
    if (!/(?=.*[A-Z])/.test(password)) {
      errors.push('Password must contain at least one uppercase letter');
    }
    if (!/(?=.*\d)/.test(password)) {
      errors.push('Password must contain at least one number');
    }
    return errors;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    // Validate passwords match
    if (password !== confirmPassword) {
      setError('Passwords do not match.');
      setLoading(false);
      return;
    }

    // Validate password requirements
    const passwordErrors = validatePassword(password);
    if (passwordErrors.length > 0) {
      setError(passwordErrors.join('. '));
      setLoading(false);
      return;
    }

    try {
      await api.post('/auth/reset-password', {
        token: token,
        password: password
      });
      setSuccess(true);
      
      // Redirect to login after 3 seconds
      setTimeout(() => {
        navigate('/login');
      }, 3000);
    } catch (err: any) {
      const data = err.response?.data;
      let displayError = 'Failed to reset password. Please try again.';
      
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

  if (!token && !error) {
    return (
      <div className="min-h-[90vh] flex items-center justify-center p-4 bg-pink-50">
        <div className="text-center">
          <Loader2 className="w-12 h-12 text-pink-500 animate-spin mx-auto mb-4" />
          <p className="text-gray-600 font-medium">Loading reset form...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-[90vh] flex items-center justify-center p-4 bg-pink-50">
      <div className="max-w-2xl w-full bg-white rounded-[3rem] shadow-2xl overflow-hidden p-12 md:p-16 border border-pink-100 animate-in fade-in duration-500">
        <div className="text-center mb-12">
          <div className="w-20 h-20 bg-pink-50 rounded-full flex items-center justify-center mx-auto mb-6">
            <Key size={32} className="text-pink-500" />
          </div>
          <h1 className="text-4xl font-black text-gray-900 mb-4 tracking-tighter italic">
            Create New <span className="text-pink-500">Password</span>
          </h1>
          <p className="text-gray-400 text-lg font-medium italic">
            Enter your new password below.
          </p>
        </div>

        {success ? (
          <div className="text-center space-y-8">
            <div className="w-16 h-16 bg-green-50 rounded-full flex items-center justify-center mx-auto">
              <CheckCircle2 size={32} className="text-green-500" />
            </div>
            <div>
              <h2 className="text-2xl font-black text-gray-900 mb-4 italic">Password Reset Successfully!</h2>
              <p className="text-gray-600 font-medium leading-relaxed mb-8">
                Your password has been updated. You will be redirected to the login page in a few seconds.
              </p>
            </div>
            <Link
              to="/login"
              className="inline-block px-8 py-4 bg-gray-900 text-white rounded-2xl font-black text-sm uppercase tracking-widest hover:bg-pink-600 transition-all"
            >
              Go to Login Now
            </Link>
          </div>
        ) : (
          <>
            {error && (
              <div className="bg-red-50 border border-red-200 text-red-600 p-6 rounded-2xl mb-8 flex items-start gap-4">
                <AlertCircle size={20} className="flex-shrink-0 mt-0.5" />
                <div className="text-left">
                  <p className="text-sm font-bold mb-2">Password Reset Failed</p>
                  <p className="text-sm">{error}</p>
                  {error.includes('token') && (
                    <Link to="/forgot-password" className="text-pink-600 hover:underline text-sm font-bold mt-2 inline-block">
                      Request a new reset link
                    </Link>
                  )}
                </div>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-8 text-left">
              <div className="space-y-3">
                <label className="block text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] ml-2">
                  New Password
                </label>
                <div className="relative">
                  <input 
                    type={showPassword ? 'text' : 'password'}
                    className="w-full px-8 py-5 pr-14 bg-gray-50 border-none rounded-2xl focus:outline-none focus:ring-2 focus:ring-pink-500 transition-all shadow-inner text-gray-900 font-bold placeholder:text-gray-300"
                    placeholder="••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-4 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                  >
                    {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                  </button>
                </div>
              </div>

              <div className="space-y-3">
                <label className="block text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] ml-2">
                  Confirm New Password
                </label>
                <div className="relative">
                  <input 
                    type={showConfirmPassword ? 'text' : 'password'}
                    className="w-full px-8 py-5 pr-14 bg-gray-50 border-none rounded-2xl focus:outline-none focus:ring-2 focus:ring-pink-500 transition-all shadow-inner text-gray-900 font-bold placeholder:text-gray-300"
                    placeholder="••••••••"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className="absolute right-4 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                  >
                    {showConfirmPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                  </button>
                </div>
              </div>

              <div className="bg-blue-50 border border-blue-100 text-blue-700 p-6 rounded-2xl">
                <p className="text-sm font-bold mb-2">Password Requirements:</p>
                <ul className="text-sm space-y-1 font-medium">
                  <li className={password.length >= 8 ? 'text-green-600' : ''}>
                    • At least 8 characters long
                  </li>
                  <li className={/(?=.*[a-z])/.test(password) ? 'text-green-600' : ''}>
                    • One lowercase letter
                  </li>
                  <li className={/(?=.*[A-Z])/.test(password) ? 'text-green-600' : ''}>
                    • One uppercase letter
                  </li>
                  <li className={/(?=.*\d)/.test(password) ? 'text-green-600' : ''}>
                    • One number
                  </li>
                </ul>
              </div>
              
              <button 
                type="submit" 
                disabled={loading || !token}
                className="w-full bg-gray-900 hover:bg-pink-600 text-white py-6 rounded-2xl font-black shadow-2xl transition-all disabled:opacity-50 text-xs uppercase tracking-[0.3em] active:scale-95 flex items-center justify-center gap-3"
              >
                {loading ? (
                  <>
                    <Loader2 className="animate-spin" size={20} />
                    Updating Password...
                  </>
                ) : (
                  'Update Password'
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

export default ResetPassword;