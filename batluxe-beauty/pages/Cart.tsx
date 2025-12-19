
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

/**
 * STRIPE CONFIGURATION:
 * Live Publishable Key for BatLuxe Beauty.
 */
const STRIPE_PUBLISHABLE_KEY = "pk_live_51SWyX9Fnm4YnB8dleWu3giBmRqWGbhit4VzMtBLBdwH81ATJf4NLkoLAAFMQag39rJ0Qu2OsUWWgvDynwJCse9vr00gFkQcLSG";

const Cart: React.FC = () => {
  const { items, total, count, updateQuantity, removeFromCart, loading, clearCart } = useCart();
  const { user } = useAuth();
  const navigate = useNavigate();
  
  // Checkout & Payment State
  const [checkingOut, setCheckingOut] = useState(false);
  const [checkoutStep, setCheckoutStep] = useState<'idle' | 'creating_order' | 'syncing' | 'payment_form' | 'processing_payment' | 'success'>('idle');
  const [error, setError] = useState<string | null>(null);
  const [clientSecret, setClientSecret] = useState<string | null>(null);
  const [orderId, setOrderId] = useState<string | null>(null);

  // Stripe Refs
  const cardElementRef = useRef<any>(null);
  const stripeRef = useRef<any>(null);

  // Initialize Stripe on mount or step change
  useEffect(() => {
    if (checkoutStep === 'payment_form' && !stripeRef.current) {
      if ((window as any).Stripe) {
        stripeRef.current = (window as any).Stripe(STRIPE_PUBLISHABLE_KEY);
        const elements = stripeRef.current.elements();
        const card = elements.create('card', {
          style: {
            base: {
              fontSize: '16px',
              color: '#111827',
              fontFamily: 'Poppins, sans-serif',
              '::placeholder': { color: '#9CA3AF' },
            },
            invalid: { color: '#EF4444' },
          },
        });
        card.mount('#stripe-card-element');
        cardElementRef.current = card;
      }
    }
  }, [checkoutStep]);

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
    setCheckoutStep('creating_order');

    try {
      // 1. Fetch profile to ensure we have the correct logistics data
      let profileData: any = {};
      try {
        const profileRes = await api.get('/profile');
        profileData = profileRes.data.user || profileRes.data.data || profileRes.data;
      } catch (e) { 
        // Silently skip if profile not found
      }

      // 2. Create Order in the backend
      // We send both total_amount (decimal) and amount (cents) to be extremely compatible
      // We also send currency in both lowercase and uppercase to satisfy various backend parsers
      const orderPayload = {
        user_id: (user as any).id || user.email, 
        customer_name: profileData?.name || user.email.split('@')[0],
        customer_email: user.email,
        customer_phone: profileData?.phone_number || profileData?.phone || "08000000000",
        total_amount: Number(total.toFixed(2)),
        total_price: Number(total.toFixed(2)), 
        amount: Math.round(total * 100), // Integer cents/pence
        currency: "gbp",
        currency_code: "GBP",
        shipping_address: {
          street: profileData?.address?.street || "Pending Fulfillment Address",
          city: profileData?.address?.city || "London",
          state: profileData?.address?.state || "Greater London",
          country: profileData?.address?.country || "United Kingdom",
          postal_code: profileData?.address?.postcode || profileData?.address?.postal_code || "W1K 7LU"
        },
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

      const cleanOrderId = String(rawOrderId).replace(/[^a-fA-F0-9]/g, '').trim();
      setOrderId(cleanOrderId);

      // 3. Sync Pause
      setCheckoutStep('syncing');
      await new Promise(resolve => setTimeout(resolve, 800));

      // 4. Request Payment Intent
      try {
        // Passing currency again to the /pay endpoint just in case the backend requires it there
        const payResponse = await api.post(`/orders/${cleanOrderId}/pay`, { 
          currency: "gbp",
          currency_code: "GBP"
        });
        const secret = payResponse.data.client_secret || 
                       payResponse.data.data?.client_secret || 
                       payResponse.data.payment_intent_client_secret;

        if (!secret) {
          throw new Error("Handshake failed: The payment gateway did not return a security secret.");
        }
        
        setClientSecret(secret);
        setCheckoutStep('payment_form');
      } catch (payErr: any) {
        const backendError = payErr.response?.data?.error || payErr.response?.data?.message;
        const status = payErr.response?.status;
        
        // Handle the specific amount_too_small error if it comes back from the backend
        if (backendError && typeof backendError === 'string' && backendError.includes('amount_too_small')) {
            throw new Error("The transaction value is too small for the selected currency. Please increase your cart total to at least £1.00.");
        }

        if (status === 500) {
          throw new Error(`Gateway Error (500): ${backendError || "The system failed to initialize the payment session. This usually happens if the backend currency is misaligned with the Stripe project settings."}`);
        } else if (status === 400) {
          throw new Error(`Invalid Transaction (400): ${backendError || "The order total is invalid or below the currency minimum threshold."}`);
        }
        throw payErr;
      }

    } catch (err: any) {
      console.error("Payment initiation protocol failure:", err);
      let errorMessage = "Connection to secure vault timed out.";
      
      if (typeof err.message === 'string' && err.message.includes('amount_too_small')) {
        errorMessage = "Your cart total is below the minimum processing limit for the payment gateway. Please add more luxury items to proceed.";
      } else {
        errorMessage = err.response?.data?.error || err.response?.data?.message || err.message || errorMessage;
      }
      
      setError(errorMessage);
      setCheckingOut(false);
      setCheckoutStep('idle');
    }
  };

  const handleStripePayment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!stripeRef.current || !cardElementRef.current || !clientSecret) return;

    setCheckoutStep('processing_payment');
    setError(null);

    try {
      const result = await stripeRef.current.confirmCardPayment(clientSecret, {
        payment_method: {
          card: cardElementRef.current,
          billing_details: {
            email: user?.email,
          },
        },
      });

      if (result.error) {
        throw new Error(result.error.message);
      } else if (result.paymentIntent.status === 'succeeded') {
        setCheckoutStep('success');
        await clearCart();
        setTimeout(() => navigate('/profile'), 2500);
      }
    } catch (err: any) {
      setError(err.message || "Payment verification protocol failed.");
      setCheckoutStep('payment_form');
    }
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
          <div className="w-full max-w-md bg-white rounded-[3rem] p-10 shadow-2xl border border-pink-50 relative overflow-hidden">
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

                {(checkoutStep === 'creating_order' || checkoutStep === 'syncing') && (
                  <div className="py-12 text-center animate-pulse">
                    <Loader2 className="w-16 h-16 text-pink-500 animate-spin mx-auto mb-8" />
                    <h2 className="text-2xl font-black text-gray-900 italic">
                      {checkoutStep === 'creating_order' ? 'Initializing Record...' : 'Syncing with Gateway...'}
                    </h2>
                    <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest mt-4">Establishing Secure Connection</p>
                  </div>
                )}

                {(checkoutStep === 'payment_form' || checkoutStep === 'processing_payment') && (
                  <form onSubmit={handleStripePayment} className="animate-in slide-in-from-bottom-4 duration-500">
                    <div className="mb-8 text-left">
                      <h2 className="text-3xl font-black text-gray-900 italic mb-2 tracking-tight">Checkout</h2>
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

                    <div className="space-y-6">
                      <div className="space-y-3">
                        <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Card Credentials</label>
                        <div className="p-5 bg-gray-50 rounded-2xl border border-pink-50 shadow-inner">
                          <div id="stripe-card-element" />
                        </div>
                      </div>

                      <button 
                        type="submit"
                        disabled={checkoutStep === 'processing_payment'}
                        className="w-full bg-gray-900 hover:bg-pink-600 text-white py-6 rounded-2xl font-black shadow-2xl transition-all active:scale-95 disabled:opacity-50 flex items-center justify-center gap-3 group"
                      >
                        {checkoutStep === 'processing_payment' ? (
                          <>
                            <Loader2 className="animate-spin" size={20} />
                            <span>Authenticating...</span>
                          </>
                        ) : (
                          <>
                            <span>Authorize Transfer</span>
                            <ArrowRight size={20} className="group-hover:translate-x-2 transition-transform" />
                          </>
                        )}
                      </button>

                      <div className="flex items-center justify-center gap-6 opacity-30 pt-4 grayscale">
                        <img src="https://upload.wikimedia.org/wikipedia/commons/5/5e/Visa_Inc._logo.svg" alt="Visa" className="h-4" />
                        <img src="https://upload.wikimedia.org/wikipedia/commons/2/2a/Mastercard-logo.svg" alt="Mastercard" className="h-6" />
                        <img src="https://upload.wikimedia.org/wikipedia/commons/b/ba/Stripe_Logo%2C_revised_2016.svg" alt="Stripe" className="h-4" />
                      </div>
                    </div>
                  </form>
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
                  <span>Shipping</span>
                  <span className="text-green-600 font-black">FREE</span>
                </div>
              </div>
              <div className="border-t-2 border-dashed border-pink-100 pt-8 mb-10 flex justify-between items-center">
                <span className="text-sm font-black text-gray-900 uppercase tracking-[0.2em]">Total</span>
                <span className="text-4xl font-black text-pink-500 italic">£{total.toFixed(2)}</span>
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
