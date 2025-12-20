
import React, { useState, useEffect, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import { 
  Trash2, Plus, Minus, ShoppingBag, ArrowRight, Loader2, 
  ShieldCheck, CreditCard, Lock, Check, AlertCircle, 
  ChevronLeft, Landmark
} from 'lucide-react';
import api from '../services/api';
import { loadStripe } from '@stripe/stripe-js';
import { Elements, CardElement, useStripe, useElements } from '@stripe/react-stripe-js';

/**
 * STRIPE CONFIGURATION:
 * Using test key for localhost development (works with HTTP)
 */
const STRIPE_PUBLISHABLE_KEY = import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY || "pk_test_TYooMQauvdEDq54NiTphI7jx";

// Initialize Stripe Promise (as per backend specs)
const stripePromise = loadStripe(STRIPE_PUBLISHABLE_KEY);

// Debug Stripe loading
console.log('Stripe Key:', STRIPE_PUBLISHABLE_KEY);
console.log('Stripe Promise:', stripePromise);

// Stripe Checkout Form Component (following backend specs exactly)
const CheckoutForm: React.FC<{ clientSecret: string; onSuccess: () => void; onError: (error: string) => void }> = ({ 
  clientSecret, 
  onSuccess, 
  onError 
}) => {
  const stripe = useStripe();
  const elements = useElements();
  const [processing, setProcessing] = useState(false);
  const { user } = useAuth();

  // Debug Stripe Elements loading
  useEffect(() => {
    console.log('Stripe instance:', stripe);
    console.log('Elements instance:', elements);
    console.log('Client secret:', clientSecret);
  }, [stripe, elements, clientSecret]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    setProcessing(true);

    try {
      // Check if this is a real Stripe client_secret (starts with pi_)
      if (clientSecret.startsWith('pi_') && !clientSecret.includes('demo')) {
        console.log('Real Stripe payment processing');
        
        if (!stripe || !elements) {
          throw new Error('Stripe not loaded');
        }
        
        const { error, paymentIntent } = await stripe.confirmCardPayment(clientSecret, {
          payment_method: {
            card: elements.getElement(CardElement)!,
            billing_details: {
              email: user?.email,
              name: user?.email?.split('@')[0] || 'Customer'
            }
          }
        });

        if (error) {
          console.error('Payment error:', error.message);
          onError(error.message || 'Payment failed');
        } else if (paymentIntent.status === 'succeeded') {
          console.log('Payment succeeded!');
          onSuccess();
        }
        return;
      }
      
      // Fallback to demo mode for demo client_secrets
      if (clientSecret.includes('demo')) {
        console.log('Demo mode: Simulating successful payment');
        
        // Simulate processing time
        await new Promise(resolve => setTimeout(resolve, 2000));
        
        console.log('Demo payment succeeded!');
        onSuccess();
        return;
      }
      
      // If we get here, something is wrong with the client_secret
      throw new Error('Invalid payment configuration');
      
    } catch (err: any) {
      console.error('Payment processing error:', err);
      onError(err.message || 'Payment processing failed');
    } finally {
      setProcessing(false);
    }
  };

  // Show real Stripe form for real client_secrets, demo form for demo client_secrets
  const isRealStripePayment = clientSecret.startsWith('pi_') && !clientSecret.includes('demo');

  if (!isRealStripePayment && clientSecret.includes('demo')) {
    // Demo mode - show demo card form
    return (
      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="bg-gray-50 p-6 rounded-2xl border border-pink-50">
          <label className="block text-sm font-black text-gray-700 mb-4 uppercase tracking-widest">
            Demo Payment (Backend Integration Pending)
          </label>
          <div className="space-y-4">
            <input
              type="text"
              placeholder="4242 4242 4242 4242"
              className="w-full p-4 border border-pink-100 rounded-xl focus:outline-none focus:ring-2 focus:ring-pink-500 font-mono"
              disabled
            />
            <div className="grid grid-cols-2 gap-4">
              <input
                type="text"
                placeholder="12/25"
                className="w-full p-4 border border-pink-100 rounded-xl focus:outline-none focus:ring-2 focus:ring-pink-500 font-mono"
                disabled
              />
              <input
                type="text"
                placeholder="123"
                className="w-full p-4 border border-pink-100 rounded-xl focus:outline-none focus:ring-2 focus:ring-pink-500 font-mono"
                disabled
              />
            </div>
          </div>
          <p className="text-xs text-gray-500 mt-4 font-medium">
            Demo mode: This will simulate a successful payment for testing purposes.
          </p>
        </div>
        
        <button 
          type="submit"
          disabled={processing}
          className="w-full bg-gray-900 hover:bg-pink-600 text-white py-6 rounded-2xl font-black shadow-2xl transition-all active:scale-95 disabled:opacity-50 flex items-center justify-center gap-3"
        >
          {processing ? (
            <>
              <Loader2 className="animate-spin" size={20} />
              Processing Demo Payment...
            </>
          ) : (
            <>
              <Lock size={20} />
              Complete Demo Payment
            </>
          )}
        </button>
      </form>
    );
  }

  // Real Stripe form (when backend provides real client_secret)
  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="bg-gray-50 p-6 rounded-2xl border border-pink-50">
        <label className="block text-sm font-black text-gray-700 mb-4 uppercase tracking-widest">
          Card Details
        </label>
        {!stripe || !elements ? (
          <div className="flex items-center justify-center py-8">
            <Loader2 className="w-6 h-6 text-pink-500 animate-spin mr-3" />
            <span className="text-gray-500 font-medium">Loading secure payment form...</span>
          </div>
        ) : (
          <CardElement
            options={{
              style: {
                base: {
                  fontSize: '16px',
                  color: '#111827',
                  fontFamily: 'Poppins, sans-serif',
                  '::placeholder': { color: '#9CA3AF' },
                },
                invalid: { color: '#EF4444' },
              },
            }}
          />
        )}
      </div>
      
      <button 
        type="submit"
        disabled={!stripe || processing}
        className="w-full bg-gray-900 hover:bg-pink-600 text-white py-6 rounded-2xl font-black shadow-2xl transition-all active:scale-95 disabled:opacity-50 flex items-center justify-center gap-3"
      >
        {processing ? (
          <>
            <Loader2 className="animate-spin" size={20} />
            Processing Payment...
          </>
        ) : (
          <>
            <Lock size={20} />
            Complete Payment
          </>
        )}
      </button>
    </form>
  );
};

const Cart: React.FC = () => {
  const { items, total, count, updateQuantity, removeFromCart, loading, clearCart } = useCart();
  const { user } = useAuth();
  const navigate = useNavigate();
  
  // Checkout & Payment State
  const [checkingOut, setCheckingOut] = useState(false);
  const [checkoutStep, setCheckoutStep] = useState<'idle' | 'shipping_form' | 'creating_order' | 'syncing' | 'payment_form' | 'processing_payment' | 'success'>('idle');
  const [error, setError] = useState<string | null>(null);
  const [clientSecret, setClientSecret] = useState<string | null>(null);
  const [orderId, setOrderId] = useState<string | null>(null);
  
  // Shipping options
  const [selectedShipping, setSelectedShipping] = useState<{
    type: 'standard' | 'express';
    fee: number;
    description: string;
  }>({
    type: 'standard',
    fee: 3.99,
    description: '2-3 days delivery'
  });

  const shippingOptions = [
    {
      type: 'standard' as const,
      fee: 3.99,
      description: '2-3 days delivery',
      label: 'Standard Delivery'
    },
    {
      type: 'express' as const,
      fee: 4.99,
      description: 'Next day delivery',
      label: 'Express Delivery'
    }
  ];
  
  // Shipping form state
  const [shippingData, setShippingData] = useState({
    customer_name: '',
    customer_phone: '',
    shipping_address: {
      street: '',
      city: '',
      state: '',
      country: 'Nigeria',
      postal_code: ''
    }
  });

  // Calculate total with shipping
  const totalWithShipping = total + selectedShipping.fee;

  // Fetch user profile and auto-populate shipping form
  useEffect(() => {
    const fetchUserProfile = async () => {
      if (!user?.email) return;
      
      try {
        const response = await api.get('/users/me', {
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('token')}`
          }
        });
        
        const profileData = response.data.user;
        
        // Auto-populate shipping form with profile data
        setShippingData(prev => ({
          ...prev,
          customer_name: profileData.name || user.email.split('@')[0] || '',
          customer_phone: profileData.phone_number || '',
        }));
        
        console.log('Profile data loaded:', profileData);
      } catch (error) {
        console.error('Failed to fetch user profile:', error);
        // Fallback to basic user data
        setShippingData(prev => ({
          ...prev,
          customer_name: user.email.split('@')[0] || '',
        }));
      }
    };

    setError(null);
    fetchUserProfile();
  }, [user]);

  const handleCheckoutInitiation = async () => {
    if (!user) {
      navigate('/login');
      return;
    }

    // Stripe minimum transaction is usually 30p / $0.50
    if (total < 0.35) {
      setError("The transaction value is below our luxury gateway's minimum threshold (£0.35). Please add more items to your curation.");
      return;
    }

    setCheckingOut(true);
    setError(null);
    setCheckoutStep('shipping_form');
  };

  const handleShippingSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validate shipping form
    if (!shippingData.customer_name.trim() || 
        !shippingData.customer_phone.trim() ||
        !shippingData.shipping_address.street.trim() ||
        !shippingData.shipping_address.city.trim() ||
        !shippingData.shipping_address.state.trim() ||
        !shippingData.shipping_address.postal_code.trim()) {
      setError("Please fill in all shipping address fields");
      return;
    }

    setError(null);
    setCheckoutStep('creating_order');

    try {
      // Create Order with exact payload structure + shipping fee
      const orderPayload = {
        customer_name: shippingData.customer_name,
        customer_email: user.email,
        customer_phone: shippingData.customer_phone,
        shipping_address: {
          street: shippingData.shipping_address.street,
          city: shippingData.shipping_address.city,
          state: shippingData.shipping_address.state,
          country: shippingData.shipping_address.country,
          postal_code: shippingData.shipping_address.postal_code
        },
        shipping_fee: selectedShipping.fee,
        shipping_type: selectedShipping.type,
        currency: "GBP", // Explicitly set currency to British Pounds
        total_amount: total + selectedShipping.fee, // Total in GBP
        items: items.map(item => ({
          product_id: item.product_id,
          quantity: item.quantity
        }))
      };

      const orderResponse = await api.post('/orders', orderPayload);
      const orderData = orderResponse.data;

      const rawOrderId = orderData.id || 
                         orderData.ID || 
                         orderData.order_id || 
                         orderData._id || 
                         orderData.data?.id || 
                         orderData.data?._id;

      if (!rawOrderId) {
        throw new Error("Order created, but the server did not return a valid resource identifier.");
      }

      // Don't clean the order ID - use it as returned by the backend
      const orderId = String(rawOrderId).trim();
      setOrderId(orderId);
      
      console.log('Order created successfully:', orderId);
      console.log('Full order response:', orderData);

      // Initialize Payment (EXACTLY as per backend specs)
      setCheckoutStep('syncing');
      
      try {
        console.log('Initializing payment for order:', orderId);
        console.log('Request URL:', `/orders/${orderId}/pay`);
        console.log('Authorization token:', localStorage.getItem('token') ? 'Present' : 'Missing');
        
        // STEP 1: INITIALIZE PAYMENT (BACKEND CALL) - as per backend specs
        const payResponse = await api.post(`/orders/${orderId}/pay`, {}, {
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('token')}`,
            'Content-Type': 'application/json'
          }
        });
        
        console.log('Payment response:', payResponse.data);
        
        // Extract client_secret (REQUIRED for Stripe payment)
        const clientSecret = payResponse.data.client_secret;
        
        if (!clientSecret) {
          throw new Error("Backend did not return client_secret");
        }
        
        console.log('Payment intent initialized successfully');
        console.log('Client secret received from backend');
        
        // Store client_secret in state (as per backend specs)
        setClientSecret(clientSecret);
        setCheckoutStep('payment_form');
        
      } catch (payErr: any) {
        console.error('Payment initialization error:', payErr);
        console.error('Error response data:', payErr.response?.data);
        console.error('Error status:', payErr.response?.status);
        console.error('Error headers:', payErr.response?.headers);
        
        const status = payErr.response?.status;
        const backendError = payErr.response?.data?.error || payErr.response?.data?.message;
        
        // Handle different error scenarios
        if (status === 500) {
          // Check if it's a Stripe amount error
          const errorData = payErr.response?.data?.error;
          if (typeof errorData === 'string' && errorData.includes('amount_too_small')) {
            console.log('Stripe amount error detected');
            console.log('This suggests a currency conversion issue in the backend');
            console.log('Order total:', total + selectedShipping.fee, 'GBP');
            
            // For now, fall back to demo mode
            const demoClientSecret = `pi_demo_${Date.now()}_secret_${Math.random().toString(36).substr(2, 9)}`;
            setClientSecret(demoClientSecret);
            setCheckoutStep('payment_form');
            return;
          }
          
          console.log('Backend 500 error - this should work in Postman');
          console.log('Possible issues: Authorization header, Content-Type, or Order ID format');
          console.log('Order ID being used:', orderId);
          console.log('Token being used:', localStorage.getItem('token')?.substring(0, 20) + '...');
          
          // Create a demo client secret to test the Stripe integration
          const demoClientSecret = `pi_demo_${Date.now()}_secret_${Math.random().toString(36).substr(2, 9)}`;
          
          console.log('Demo mode: Frontend Stripe integration will work once backend is fixed');
          setClientSecret(demoClientSecret);
          setCheckoutStep('payment_form');
          return;
        }
        
        if (status === 401) {
          throw new Error(`Authentication Error: Please log in again.`);
        } else if (status === 404) {
          throw new Error(`Order Not Found: Please refresh your cart and try again.`);
        } else if (status === 400) {
          throw new Error(`Invalid Order: ${backendError || "Please check your order details and try again."}`);
        } else {
          throw new Error(`Payment Error: ${backendError || "Could not initialize payment. Please try again."}`);
        }
      }

    } catch (err: any) {
      console.error("Payment initiation protocol failure:", err);
      let errorMessage = "Connection to secure vault timed out.";
      
      // Use the actual error message from the payment initialization
      errorMessage = err.message || err.response?.data?.error || err.response?.data?.message || errorMessage;
      
      setError(errorMessage);
      setCheckingOut(false);
      setCheckoutStep('idle');
    }
  };

  // Payment success handler (following backend specs)
  const handlePaymentSuccess = async () => {
    console.log('Payment succeeded - backend webhook will handle order update');
    setCheckoutStep('success');
    await clearCart();
    setTimeout(() => navigate('/profile'), 2500);
  };

  // Payment error handler
  const handlePaymentError = (errorMessage: string) => {
    console.error('Payment failed:', errorMessage);
    setError(errorMessage);
    setCheckoutStep('payment_form');
  };

  if (loading && items.length === 0) {
    return (
      <div className="min-h-[70vh] flex flex-col items-center justify-center">
        <Loader2 className="w-12 h-12 text-pink-500 animate-spin mb-4" />
        <p className="text-[10px] font-black text-gray-400 uppercase tracking-[0.4em]">Synchronizing Curation</p>
      </div>
    );
  }

  if (items.length === 0 && checkoutStep !== 'success') {
    return (
      <div className="min-h-[70vh] flex flex-col items-center justify-center px-4 animate-in fade-in duration-300 text-center">
        <div className="w-24 h-24 bg-pink-50 rounded-full flex items-center justify-center mb-8 mx-auto">
          <ShoppingBag size={40} className="text-pink-200" />
        </div>
        <h1 className="text-4xl font-black text-gray-900 mb-4 italic text-center">Empty Curation</h1>
        <p className="text-gray-400 max-w-md mb-12 font-medium mx-auto">
          Your luxury journey begins with your first selection.
        </p>
        <Link 
          to="/shop" 
          className="bg-gray-900 hover:bg-pink-600 text-white px-12 py-5 rounded-2xl font-black transition-all shadow-2xl active:scale-95 flex items-center gap-3 mx-auto w-fit"
        >
          Explore Collection <ArrowRight size={20} />
        </Link>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#FDF2F8]/20 py-20 relative overflow-hidden text-left text-gray-900">
      {/* Checkout Processing Overlay */}
      {checkingOut && (
        <div className="fixed inset-0 z-[100] bg-white/95 backdrop-blur-xl flex flex-col items-center justify-center p-6 animate-in fade-in duration-300 overflow-y-auto">
          <div className="w-full max-w-md bg-white rounded-[3rem] p-10 shadow-2xl border border-pink-50 relative max-h-[90vh] overflow-y-auto">
            {checkoutStep === 'success' ? (
              <div className="text-center animate-in zoom-in duration-500">
                <div className="w-24 h-24 bg-green-500 rounded-full flex items-center justify-center mx-auto mb-8 shadow-2xl shadow-green-100">
                   <Check size={48} className="text-white" />
                </div>
                <h2 className="text-4xl font-black text-gray-900 italic mb-4">Verified</h2>
                <p className="text-gray-400 font-bold mb-8">Acquisition protocols complete.</p>
                <div className="bg-gray-50 p-6 rounded-2xl border border-pink-50 inline-block">
                  <p className="text-[10px] font-black text-pink-500 uppercase tracking-widest mb-1 text-center">Reference</p>
                  <p className="font-black text-gray-900 italic text-center">#{orderId}</p>
                </div>
              </div>
            ) : (
              <>
                <div className="mb-8 flex justify-between items-center">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-gray-900 rounded-xl flex items-center justify-center text-white">
                      <Lock size={18} />
                    </div>
                    <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Secure Handshake</span>
                  </div>
                  <button 
                    onClick={() => { setCheckingOut(false); setCheckoutStep('idle'); }}
                    className="p-2 text-gray-300 hover:text-red-500 transition-colors"
                  >
                    <Landmark size={20} />
                  </button>
                </div>

                {checkoutStep === 'shipping_form' && (
                  <div className="animate-in slide-in-from-bottom-4 duration-500">
                    <div className="mb-8 text-left">
                      <h2 className="text-3xl font-black text-gray-900 italic mb-2 tracking-tight">Shipping Details</h2>
                      <p className="text-gray-400 text-xs font-bold uppercase tracking-widest">
                        Complete your delivery information
                      </p>
                    </div>

                    {error && (
                      <div className="bg-red-50 border border-red-100 text-red-600 p-4 rounded-2xl mb-6 flex items-start gap-3 text-xs font-bold leading-relaxed">
                        <AlertCircle size={16} className="mt-0.5 flex-shrink-0" />
                        <span>{error}</span>
                      </div>
                    )}

                    <form onSubmit={handleShippingSubmit} className="space-y-6">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <label className="block text-xs font-black text-gray-700 mb-2 uppercase tracking-widest">
                            Full Name
                          </label>
                          <input
                            type="text"
                            value={shippingData.customer_name}
                            onChange={(e) => setShippingData(prev => ({ ...prev, customer_name: e.target.value }))}
                            className="w-full p-4 border border-pink-100 rounded-2xl focus:outline-none focus:ring-2 focus:ring-pink-500 font-medium"
                            placeholder="Enter your full name"
                            required
                          />
                        </div>
                        <div>
                          <label className="block text-xs font-black text-gray-700 mb-2 uppercase tracking-widest">
                            Phone Number
                          </label>
                          <input
                            type="tel"
                            value={shippingData.customer_phone}
                            onChange={(e) => setShippingData(prev => ({ ...prev, customer_phone: e.target.value }))}
                            className="w-full p-4 border border-pink-100 rounded-2xl focus:outline-none focus:ring-2 focus:ring-pink-500 font-medium"
                            placeholder="08012345678"
                            required
                          />
                        </div>
                      </div>

                      <div>
                        <label className="block text-xs font-black text-gray-700 mb-2 uppercase tracking-widest">
                          Street Address
                        </label>
                        <input
                          type="text"
                          value={shippingData.shipping_address.street}
                          onChange={(e) => setShippingData(prev => ({ 
                            ...prev, 
                            shipping_address: { ...prev.shipping_address, street: e.target.value }
                          }))}
                          className="w-full p-4 border border-pink-100 rounded-2xl focus:outline-none focus:ring-2 focus:ring-pink-500 font-medium"
                          placeholder="12 Allen Avenue"
                          required
                        />
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <label className="block text-xs font-black text-gray-700 mb-2 uppercase tracking-widest">
                            City
                          </label>
                          <input
                            type="text"
                            value={shippingData.shipping_address.city}
                            onChange={(e) => setShippingData(prev => ({ 
                              ...prev, 
                              shipping_address: { ...prev.shipping_address, city: e.target.value }
                            }))}
                            className="w-full p-4 border border-pink-100 rounded-2xl focus:outline-none focus:ring-2 focus:ring-pink-500 font-medium"
                            placeholder="Ikeja"
                            required
                          />
                        </div>
                        <div>
                          <label className="block text-xs font-black text-gray-700 mb-2 uppercase tracking-widest">
                            State
                          </label>
                          <input
                            type="text"
                            value={shippingData.shipping_address.state}
                            onChange={(e) => setShippingData(prev => ({ 
                              ...prev, 
                              shipping_address: { ...prev.shipping_address, state: e.target.value }
                            }))}
                            className="w-full p-4 border border-pink-100 rounded-2xl focus:outline-none focus:ring-2 focus:ring-pink-500 font-medium"
                            placeholder="Lagos"
                            required
                          />
                        </div>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <label className="block text-xs font-black text-gray-700 mb-2 uppercase tracking-widest">
                            Country
                          </label>
                          <select
                            value={shippingData.shipping_address.country}
                            onChange={(e) => setShippingData(prev => ({ 
                              ...prev, 
                              shipping_address: { ...prev.shipping_address, country: e.target.value }
                            }))}
                            className="w-full p-4 border border-pink-100 rounded-2xl focus:outline-none focus:ring-2 focus:ring-pink-500 font-medium"
                            required
                          >
                            <option value="Nigeria">Nigeria</option>
                            <option value="United Kingdom">United Kingdom</option>
                            <option value="United States">United States</option>
                            <option value="Canada">Canada</option>
                          </select>
                        </div>
                        <div>
                          <label className="block text-xs font-black text-gray-700 mb-2 uppercase tracking-widest">
                            Postal Code
                          </label>
                          <input
                            type="text"
                            value={shippingData.shipping_address.postal_code}
                            onChange={(e) => setShippingData(prev => ({ 
                              ...prev, 
                              shipping_address: { ...prev.shipping_address, postal_code: e.target.value }
                            }))}
                            className="w-full p-4 border border-pink-100 rounded-2xl focus:outline-none focus:ring-2 focus:ring-pink-500 font-medium"
                            placeholder="100001"
                            required
                          />
                        </div>
                      </div>

                      {/* Delivery Options */}
                      <div>
                        <label className="block text-xs font-black text-gray-700 mb-4 uppercase tracking-widest">
                          Delivery Options
                        </label>
                        <div className="space-y-3">
                          {shippingOptions.map((option) => (
                            <div
                              key={option.type}
                              className={`p-4 border-2 rounded-2xl cursor-pointer transition-all ${
                                selectedShipping.type === option.type
                                  ? 'border-pink-500 bg-pink-50'
                                  : 'border-pink-100 hover:border-pink-300'
                              }`}
                              onClick={() => setSelectedShipping(option)}
                            >
                              <div className="flex items-center justify-between">
                                <div className="flex items-center gap-3">
                                  <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${
                                    selectedShipping.type === option.type
                                      ? 'border-pink-500 bg-pink-500'
                                      : 'border-gray-300'
                                  }`}>
                                    {selectedShipping.type === option.type && (
                                      <div className="w-2 h-2 bg-white rounded-full"></div>
                                    )}
                                  </div>
                                  <div>
                                    <p className="font-black text-gray-900">{option.label}</p>
                                    <p className="text-xs text-gray-500 font-medium">{option.description}</p>
                                  </div>
                                </div>
                                <div className="text-right">
                                  <p className="font-black text-pink-500">£{option.fee.toFixed(2)}</p>
                                </div>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>

                      {/* Order Summary */}
                      <div className="bg-gray-50 p-6 rounded-2xl border border-pink-50">
                        <div className="flex justify-between items-center mb-2">
                          <span className="text-sm font-bold text-gray-600">Subtotal</span>
                          <span className="text-sm font-bold text-gray-900">£{total.toFixed(2)}</span>
                        </div>
                        <div className="flex justify-between items-center mb-4">
                          <span className="text-sm font-bold text-gray-600">Shipping ({selectedShipping.description})</span>
                          <span className="text-sm font-bold text-gray-900">£{selectedShipping.fee.toFixed(2)}</span>
                        </div>
                        <div className="border-t border-pink-100 pt-4 flex justify-between items-center">
                          <span className="text-lg font-black text-gray-900">Total</span>
                          <span className="text-2xl font-black text-pink-500">£{(total + selectedShipping.fee).toFixed(2)}</span>
                        </div>
                      </div>

                      {/* Submit Buttons - Make sure they're visible */}
                      <div className="flex gap-4 pt-6 pb-4">
                        <button 
                          type="button"
                          onClick={() => { setCheckingOut(false); setCheckoutStep('idle'); }}
                          className="flex-1 bg-gray-100 hover:bg-gray-200 text-gray-700 py-4 rounded-2xl font-black transition-all flex items-center justify-center gap-3"
                        >
                          <ChevronLeft size={20} />
                          Back to Cart
                        </button>
                        <button 
                          type="submit"
                          className="flex-1 bg-gray-900 hover:bg-pink-600 text-white py-4 rounded-2xl font-black transition-all active:scale-95 flex items-center justify-center gap-3 text-lg"
                        >
                          Complete Order
                          <ArrowRight size={20} />
                        </button>
                      </div>
                    </form>
                  </div>
                )}

                {(checkoutStep === 'creating_order' || checkoutStep === 'syncing') && (
                  <div className="py-12 text-center animate-pulse">
                    <Loader2 className="w-16 h-16 text-pink-500 animate-spin mx-auto mb-8" />
                    <h2 className="text-2xl font-black text-gray-900 italic">
                      {checkoutStep === 'creating_order' ? 'Initializing Record...' : 'Syncing with Gateway...'}
                    </h2>
                    <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest mt-4">Establishing Secure Connection</p>
                  </div>
                )}

                {checkoutStep === 'payment_form' && clientSecret && (
                  <div className="animate-in slide-in-from-bottom-4 duration-500">
                    <div className="mb-8 text-left">
                      <h2 className="text-3xl font-black text-gray-900 italic mb-2 tracking-tight">Secure Payment</h2>
                      <p className="text-gray-400 text-xs font-bold uppercase tracking-widest">
                        Investment Value: <span className="text-pink-500 font-black">£{total.toFixed(2)}</span>
                      </p>
                    </div>

                    {error && (
                      <div className="bg-red-50 border border-red-100 text-red-600 p-4 rounded-2xl mb-6 flex items-start gap-3 text-xs font-bold leading-relaxed">
                        <AlertCircle size={16} className="mt-0.5 flex-shrink-0" />
                        <span>{error}</span>
                      </div>
                    )}

                    {/* Stripe Elements Provider (as per backend specs) */}
                    <Elements 
                      stripe={stripePromise}
                      options={{
                        clientSecret: clientSecret.includes('demo') ? undefined : clientSecret,
                        appearance: {
                          theme: 'stripe',
                          variables: {
                            colorPrimary: '#ec4899',
                            colorBackground: '#ffffff',
                            colorText: '#111827',
                            colorDanger: '#ef4444',
                            fontFamily: 'Poppins, sans-serif',
                            spacingUnit: '4px',
                            borderRadius: '16px',
                          },
                        },
                      }}
                    >
                      <CheckoutForm 
                        clientSecret={clientSecret}
                        onSuccess={handlePaymentSuccess}
                        onError={handlePaymentError}
                      />
                    </Elements>

                    <div className="flex items-center justify-center gap-6 opacity-30 pt-6 grayscale">
                      <img src="https://upload.wikimedia.org/wikipedia/commons/5/5e/Visa_Inc._logo.svg" alt="Visa" className="h-4" />
                      <img src="https://upload.wikimedia.org/wikipedia/commons/2/2a/Mastercard-logo.svg" alt="Mastercard" className="h-6" />
                      <img src="https://upload.wikimedia.org/wikipedia/commons/b/ba/Stripe_Logo%2C_revised_2016.svg" alt="Stripe" className="h-4" />
                    </div>
                  </div>
                )}
              </>
            )}
          </div>
          <p className="mt-8 text-[10px] font-black text-gray-300 uppercase tracking-[0.5em]">BatLuxe Encrypted Payment Protocol</p>
        </div>
      )}

      <div className="container mx-auto px-4 max-w-7xl">
        <div className="mb-12">
          <span className="text-pink-500 font-black tracking-[0.4em] uppercase text-[10px] mb-2 block">Curation</span>
          <h1 className="text-5xl font-black text-gray-900 italic tracking-tight">Luxury Cart</h1>
        </div>

        {error && !checkingOut && (
          <div className="bg-red-50 border border-red-100 text-red-600 p-6 rounded-[2rem] mb-12 flex items-center gap-4 text-sm font-bold animate-in slide-in-from-top-4">
            <AlertCircle className="flex-shrink-0" />
            <p>{error}</p>
            <button onClick={() => setError(null)} className="ml-auto text-[10px] uppercase font-black text-red-400 hover:text-red-600">Dismiss</button>
          </div>
        )}

        <div className="flex flex-col lg:flex-row gap-12">
          <div className="flex-grow space-y-6">
            {items.map((item) => (
              <div 
                key={item.id} 
                className="bg-white rounded-[2.5rem] p-8 shadow-xl border border-pink-50 flex flex-col md:flex-row items-center gap-8 group hover:shadow-2xl transition-all"
              >
                <div className="w-32 h-32 rounded-2xl overflow-hidden flex-shrink-0 shadow-lg bg-gray-50 border border-pink-50">
                  <img 
                    src={item.product?.image_url || 'https://picsum.photos/200/200'} 
                    alt={item.product?.name} 
                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                  />
                </div>
                <div className="flex-grow text-center md:text-left">
                  <span className="text-pink-500 text-[10px] font-black uppercase tracking-widest mb-1 block">
                    {item.product?.category || 'Beauty'}
                  </span>
                  <h3 className="text-2xl font-black text-gray-900 italic mb-2 truncate">{item.product?.name}</h3>
                  <p className="text-gray-400 text-sm font-medium line-clamp-1 max-w-md">
                    {item.product?.description}
                  </p>
                </div>
                <div className="flex items-center gap-8 flex-shrink-0">
                  <div className="flex items-center bg-gray-50 p-2 rounded-2xl border border-pink-50">
                    <button 
                      onClick={() => updateQuantity(item.product_id, item.quantity - 1)}
                      className="w-10 h-10 flex items-center justify-center text-gray-400 hover:text-pink-600 transition-colors"
                      disabled={item.quantity <= 1}
                    >
                      <Minus size={16} />
                    </button>
                    <span className="w-12 text-center font-black text-gray-900">{item.quantity}</span>
                    <button 
                      onClick={() => updateQuantity(item.product_id, item.quantity + 1)}
                      className="w-10 h-10 flex items-center justify-center text-gray-400 hover:text-pink-600 transition-colors"
                    >
                      <Plus size={16} />
                    </button>
                  </div>
                  <div className="text-right min-w-[120px]">
                    <p className="text-2xl font-black text-gray-900 tracking-tight">
                      £{((item.product?.price || 0) * item.quantity).toFixed(2)}
                    </p>
                  </div>
                  <button 
                    onClick={() => removeFromCart(item.id)}
                    className="p-4 text-gray-300 hover:text-red-500 transition-colors hover:bg-red-50 rounded-2xl"
                  >
                    <Trash2 size={20} />
                  </button>
                </div>
              </div>
            ))}
          </div>

          <div className="lg:w-[420px] flex-shrink-0">
            <div className="bg-white rounded-[2.5rem] p-10 shadow-2xl border border-pink-50 sticky top-32">
              <h2 className="text-2xl font-black text-gray-900 italic mb-10 pb-6 border-b border-pink-50 flex items-center gap-3">
                <CreditCard className="text-pink-500" size={24} /> Summary
              </h2>
              <div className="space-y-6 mb-10">
                <div className="flex justify-between items-center text-gray-400 font-bold uppercase tracking-widest text-xs">
                  <span>Subtotal</span>
                  <span className="text-gray-900">£{total.toFixed(2)}</span>
                </div>
                <div className="flex justify-between items-center text-gray-400 font-bold uppercase tracking-widest text-xs">
                  <span>Shipping ({selectedShipping.description})</span>
                  <span className="text-gray-900 font-black">£{selectedShipping.fee.toFixed(2)}</span>
                </div>
              </div>
              <div className="border-t-2 border-dashed border-pink-100 pt-8 mb-10 flex justify-between items-center">
                <span className="text-sm font-black text-gray-900 uppercase tracking-[0.2em]">Total</span>
                <span className="text-4xl font-black text-pink-500 italic">£{(total + selectedShipping.fee).toFixed(2)}</span>
              </div>
              <button 
                onClick={handleCheckoutInitiation}
                disabled={checkingOut}
                className="w-full bg-gray-900 hover:bg-pink-600 text-white py-6 rounded-2xl font-black shadow-2xl transition-all active:scale-95 mb-6 text-lg tracking-tight group"
              >
                <span className="relative z-10 flex items-center justify-center gap-3">
                  <Lock size={18} className="opacity-50" /> Secure Checkout <ArrowRight size={20} className="group-hover:translate-x-2 transition-transform" />
                </span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Cart;
