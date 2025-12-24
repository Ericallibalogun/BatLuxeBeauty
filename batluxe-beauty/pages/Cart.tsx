
import React, { useState, useEffect, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import { useWebhook } from '../context/WebhookContext';
import { 
  Trash2, Plus, Minus, ShoppingBag, ArrowRight, Loader2, 
  ShieldCheck, CreditCard, Lock, Check, AlertCircle, 
  ChevronLeft, Landmark
} from 'lucide-react';
import api from '../services/api';
import { loadStripe } from '@stripe/stripe-js';
import { Elements, CardElement, useStripe, useElements, PaymentRequestButtonElement } from '@stripe/react-stripe-js';

/**
 * STRIPE CONFIGURATION:
 * Using live key for production transactions
 */
const STRIPE_PUBLISHABLE_KEY = import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY;

console.log('Stripe Key Available:', !!STRIPE_PUBLISHABLE_KEY);
console.log('Stripe Key Prefix:', STRIPE_PUBLISHABLE_KEY?.substring(0, 10));

if (!STRIPE_PUBLISHABLE_KEY) {
  console.error('VITE_STRIPE_PUBLISHABLE_KEY is not set in environment variables');
}

// Initialize Stripe Promise (as per backend specs)
const stripePromise = loadStripe(STRIPE_PUBLISHABLE_KEY);

// Enhanced Stripe Checkout Form Component with PayPal and Apple Pay support
const CheckoutForm: React.FC<{ 
  clientSecret: string; 
  onSuccess: () => void; 
  onError: (error: string) => void;
  orderTotal: number;
  orderData: any;
}> = ({ 
  clientSecret, 
  onSuccess, 
  onError,
  orderTotal,
  orderData
}) => {
  const stripe = useStripe();
  const elements = useElements();
  const [processing, setProcessing] = useState(false);
  const [stripeLoadTimeout, setStripeLoadTimeout] = useState(false);
  const [paymentRequest, setPaymentRequest] = useState<any>(null);
  const [canMakePayment, setCanMakePayment] = useState(false);
  const { user } = useAuth();

  // Initialize Payment Request for Apple Pay, Google Pay, and other digital wallets
  useEffect(() => {
    if (!stripe) return;

    const pr = stripe.paymentRequest({
      country: 'GB',
      currency: 'gbp',
      total: {
        label: 'BatLuxe Beauty Order',
        amount: Math.round(orderTotal * 100), // Convert to pence
      },
      requestPayerName: true,
      requestPayerEmail: true,
      requestPayerPhone: true,
      requestShipping: true,
      shippingOptions: [
        {
          id: 'standard',
          label: 'Standard Delivery (2-3 days)',
          detail: '2-3 business days',
          amount: 399, // £3.99 in pence
        },
        {
          id: 'express',
          label: 'Express Delivery (Next day)',
          detail: 'Next business day',
          amount: 499, // £4.99 in pence
        },
      ],
    });

    // Check if Payment Request is available (Apple Pay, Google Pay, etc.)
    pr.canMakePayment().then((result) => {
      if (result) {
        setCanMakePayment(true);
        setPaymentRequest(pr);
      }
    });

    // Handle payment method selection
    pr.on('paymentmethod', async (ev) => {
      setProcessing(true);
      
      try {
        // Confirm payment with the payment method from Apple Pay/Google Pay
        const { error, paymentIntent } = await stripe.confirmCardPayment(
          clientSecret,
          {
            payment_method: ev.paymentMethod.id,
          },
          { handleActions: false }
        );

        if (error) {
          ev.complete('fail');
          onError(error.message || 'Payment failed');
        } else {
          ev.complete('success');
          if (paymentIntent.status === 'succeeded') {
            onSuccess();
          }
        }
      } catch (err: any) {
        ev.complete('fail');
        onError(err.message || 'Payment processing failed');
      } finally {
        setProcessing(false);
      }
    });

    // Handle shipping address change
    pr.on('shippingaddresschange', (ev) => {
      // You can update shipping options based on address
      ev.updateWith({
        status: 'success',
        shippingOptions: [
          {
            id: 'standard',
            label: 'Standard Delivery (2-3 days)',
            detail: '2-3 business days',
            amount: 399,
          },
          {
            id: 'express',
            label: 'Express Delivery (Next day)',
            detail: 'Next business day',
            amount: 499,
          },
        ],
      });
    });

    // Handle shipping option change
    pr.on('shippingoptionchange', (ev) => {
      const shippingOption = ev.shippingOption;
      const newTotal = Math.round((orderTotal - 3.99) * 100) + shippingOption.amount; // Adjust total based on shipping
      
      ev.updateWith({
        status: 'success',
        total: {
          label: 'BatLuxe Beauty Order',
          amount: newTotal,
        },
      });
    });

  }, [stripe, orderTotal, clientSecret, onSuccess, onError]);

  // Debug Stripe Elements loading
  useEffect(() => {
    console.log('Stripe Elements Status:', {
      stripe: !!stripe,
      elements: !!elements,
      clientSecret: !!clientSecret,
      stripeLoaded: stripe !== null,
      elementsLoaded: elements !== null,
      canMakePayment
    });
    
    if (stripe && elements) {
      console.log('Stripe Elements fully loaded and ready');
    } else {
      console.log('Waiting for Stripe Elements to load...');
    }
  }, [stripe, elements, clientSecret, canMakePayment]);

  // Timeout mechanism for Stripe loading
  useEffect(() => {
    const timeout = setTimeout(() => {
      if (!stripe || !elements) {
        console.error('Stripe Elements failed to load within 10 seconds');
        setStripeLoadTimeout(true);
      }
    }, 10000); // 10 second timeout

    return () => clearTimeout(timeout);
  }, [stripe, elements]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    setProcessing(true);

    try {
      if (!stripe || !elements) {
        throw new Error('Stripe not loaded');
      }
      
      const cardElement = elements.getElement(CardElement);
      if (!cardElement) {
        throw new Error('Card element not found');
      }
      
      const { error, paymentIntent } = await stripe.confirmCardPayment(clientSecret, {
        payment_method: {
          card: cardElement as any,
          billing_details: {
            email: user?.email,
            name: user?.email?.split('@')[0] || 'Customer'
          }
        }
      });

      if (error) {
        console.error('Payment processing failed');
        // Sanitize error message to avoid exposing payment intent IDs
        let userFriendlyError = error.message || 'Payment failed';
        if (userFriendlyError.includes('payment_intent')) {
          userFriendlyError = 'Payment session expired. Refreshing session...';
        }
        onError(userFriendlyError);
      } else if (paymentIntent.status === 'succeeded') {
        onSuccess();
      }
    } catch (err: any) {
      console.error('Payment processing failed');
      onError(err.message || 'Payment processing failed');
    } finally {
      setProcessing(false);
    }
  };

  // Real Stripe form with multiple payment options
  return (
    <div className="space-y-6 w-full">
      {/* Digital Wallet Payments (Apple Pay, Google Pay, etc.) */}
      {canMakePayment && paymentRequest && (
        <>
          <div className="bg-gray-50 p-6 md:p-8 rounded-2xl border border-pink-50 w-full">
            <label className="block text-sm font-black text-gray-700 mb-6 uppercase tracking-widest">
              Express Checkout
            </label>
            <div className="bg-white rounded-xl border border-gray-200 p-4">
              <PaymentRequestButtonElement 
                options={{ 
                  paymentRequest,
                  style: {
                    paymentRequestButton: {
                      type: 'default',
                      theme: 'dark',
                      height: '48px',
                    },
                  },
                }} 
              />
            </div>
            <p className="text-xs text-gray-500 mt-3 text-center font-medium">
              Pay with Apple Pay, Google Pay, or other digital wallets
            </p>
          </div>

          {/* Divider */}
          <div className="flex items-center gap-4">
            <div className="flex-1 h-px bg-gray-200"></div>
            <span className="text-xs font-black text-gray-400 uppercase tracking-widest">Or pay with card</span>
            <div className="flex-1 h-px bg-gray-200"></div>
          </div>
        </>
      )}

      {/* Traditional Card Payment */}
      <form onSubmit={handleSubmit} className="space-y-6 w-full">
        <div className="bg-gray-50 p-6 md:p-8 rounded-2xl border border-pink-50 w-full">
          <label className="block text-sm font-black text-gray-700 mb-6 uppercase tracking-widest">
            Card Details
          </label>
          {!stripe || !elements ? (
            <div className="flex items-center justify-center py-8">
              <Loader2 className="w-6 h-6 text-pink-500 animate-spin mr-3" />
              <div className="text-center">
                <span className="text-gray-500 font-medium block">Loading secure payment form...</span>
                {stripeLoadTimeout && (
                  <div className="mt-4 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
                    <p className="text-xs text-yellow-700 font-medium">
                      Payment form is taking longer than expected. 
                      <button 
                        onClick={() => window.location.reload()} 
                        className="ml-2 underline hover:no-underline"
                      >
                        Refresh page
                      </button>
                    </p>
                  </div>
                )}
              </div>
            </div>
          ) : (
            <div className="w-full">
              <div className="bg-white rounded-xl border border-gray-200 min-h-[60px] w-full">
                <CardElement
                  options={{
                    style: {
                      base: {
                        fontSize: '16px',
                        color: '#111827',
                        fontFamily: 'Poppins, sans-serif',
                        lineHeight: '40px',
                        padding: '20px 24px',
                        '::placeholder': { color: '#9CA3AF' },
                      },
                      invalid: { color: '#EF4444' },
                    },
                    hidePostalCode: false,
                  }}
                  className="w-full"
                />
              </div>
            </div>
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

      {/* Supported Payment Methods */}
      <div className="flex items-center justify-center gap-6 opacity-30 pt-6 grayscale">
        <img src="https://upload.wikimedia.org/wikipedia/commons/5/5e/Visa_Inc._logo.svg" alt="Visa" className="h-4" />
        <img src="https://upload.wikimedia.org/wikipedia/commons/2/2a/Mastercard-logo.svg" alt="Mastercard" className="h-6" />
        <img src="https://upload.wikimedia.org/wikipedia/commons/f/fa/Apple_logo_black.svg" alt="Apple Pay" className="h-5" />
        <img src="https://upload.wikimedia.org/wikipedia/commons/5/53/Google_%22G%22_Logo.svg" alt="Google Pay" className="h-5" />
        <img src="https://upload.wikimedia.org/wikipedia/commons/b/b5/PayPal.svg" alt="PayPal" className="h-4" />
        <img src="https://upload.wikimedia.org/wikipedia/commons/b/ba/Stripe_Logo%2C_revised_2016.svg" alt="Stripe" className="h-4" />
      </div>
    </div>
  );
};

const Cart: React.FC = () => {
  const { items, total, count, updateQuantity, removeFromCart, loading, clearCart } = useCart();
  const { user } = useAuth();
  const { processPaymentSuccess, processPaymentFailure } = useWebhook();
  const navigate = useNavigate();
  
  // Checkout & Payment State
  const [checkingOut, setCheckingOut] = useState(false);
  const [checkoutStep, setCheckoutStep] = useState<'idle' | 'shipping_form' | 'creating_order' | 'syncing' | 'payment_form' | 'processing_payment' | 'success'>('idle');
  const [error, setError] = useState<string | null>(null);
  const [clientSecret, setClientSecret] = useState<string | null>(null);
  const [orderId, setOrderId] = useState<string | null>(null);
  const [orderData, setOrderData] = useState<any>(null); // Store complete order data from backend
  
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
      city: 'London',
      state: 'Greater London',
      country: 'United Kingdom',
      postal_code: ''
    }
  });

  // Calculate total with shipping
  const totalWithShipping = total + selectedShipping.fee;

  // Session timeout handling - refresh payment session before it expires
  useEffect(() => {
    if (!clientSecret || !orderId) return;

    // Stripe payment intents typically expire after 24 hours
    // Refresh after 20 minutes to be safe
    const refreshTimer = setTimeout(async () => {
      if (checkoutStep === 'payment_form') {
        try {
          console.log('Proactively refreshing payment session...');
          const payResponse = await api.post(`/orders/${orderId}/pay`, {}, {
            headers: {
              'Authorization': `Bearer ${localStorage.getItem('token')}`,
              'Content-Type': 'application/json'
            }
          });
          
          const newClientSecret = payResponse.data.client_secret;
          if (newClientSecret) {
            setClientSecret(newClientSecret);
            console.log('Payment session refreshed successfully');
          }
        } catch (error) {
          console.error('Proactive session refresh failed:', error);
          // Don't show error to user for proactive refresh
        }
      }
    }, 20 * 60 * 1000); // 20 minutes

    return () => clearTimeout(refreshTimer);
  }, [clientSecret, orderId, checkoutStep]);

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
      // Create Order with updated payload structure
      const orderPayload = {
        customer_name: shippingData.customer_name,
        customer_email: user.email,
        customer_phone: shippingData.customer_phone,
        delivery_type: selectedShipping.type, // Use delivery_type instead of shipping_fee
        shipping_address: {
          street: shippingData.shipping_address.street,
          city: shippingData.shipping_address.city,
          state: shippingData.shipping_address.state,
          country: shippingData.shipping_address.country,
          postal_code: shippingData.shipping_address.postal_code
        },
        items: items.map(item => ({
          product_id: item.product_id,
          quantity: item.quantity
          // Backend will fetch product details and calculate prices
        }))
      };

      console.log('Creating order with payload:', orderPayload);
      console.log('Cart total:', total, 'Selected shipping:', selectedShipping);

      const orderResponse = await api.post('/orders', orderPayload);
      const orderData = orderResponse.data;
      
      console.log('Order creation response:', orderData);
      console.log('Backend calculated total_price:', orderData.total_price);
      console.log('Backend calculated subtotal:', orderData.subtotal);
      console.log('Backend calculated shipping_fee:', orderData.shipping_fee);

      const rawOrderId = orderData.id || orderData.ID || orderData._id;
      
      if (!rawOrderId) {
        throw new Error("Order created, but the server did not return a valid resource identifier.");
      }

      const orderId = String(rawOrderId).trim();
      setOrderId(orderId);
      setOrderData(orderData); // Store complete order data for webhook
      
      console.log('Order created successfully:', orderId);
      console.log('Backend total will be used for payment:', orderData.total_price);

      // Initialize Payment (EXACTLY as per backend specs)
      setCheckoutStep('syncing');
      
      try {
        console.log('Initializing payment for order');
        console.log('Authorization token:', localStorage.getItem('token') ? 'Present' : 'Missing');
        
        // STEP 1: INITIALIZE PAYMENT (BACKEND CALL) - as per backend specs
        const payResponse = await api.post(`/orders/${orderId}/pay`, {}, {
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('token')}`,
            'Content-Type': 'application/json'
          }
        });
        
        // Extract client_secret (REQUIRED for Stripe payment)
        const clientSecret = payResponse.data.client_secret;
        
        if (!clientSecret) {
          throw new Error("Backend did not return client_secret");
        }
        
        console.log('Payment intent initialized successfully');
        
        // Store client_secret in state (as per backend specs)
        setClientSecret(clientSecret);
        setCheckoutStep('payment_form');
        
      } catch (payErr: any) {
        console.error('Payment initialization failed');
        
        const status = payErr.response?.status;
        const backendError = payErr.response?.data?.error || payErr.response?.data?.message;
        
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
      console.error("Payment initiation failed");
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
    setCheckoutStep('success');
    
    // Process webhook for payment success
    if (orderId && clientSecret && orderData) {
      const webhookPayload = {
        orderId: orderId,
        paymentIntentId: clientSecret?.split('_secret_')[0] || 'unknown', // Extract payment intent ID safely
        amount: Math.round((orderData.total_price || 0) * 100), // Use backend total converted to cents
        currency: 'gbp',
        customerEmail: user?.email,
        metadata: {
          items: orderData.items || items.map(item => ({
            id: item.id,
            name: item.product?.name || 'Product',
            quantity: item.quantity,
            price: item.product?.price || 0
          })),
          subtotal: orderData.subtotal,
          shipping_fee: orderData.shipping_fee,
          delivery_type: orderData.delivery_type
        }
      };
      
      // Process webhook asynchronously without blocking success flow
      processPaymentSuccess(webhookPayload).catch(webhookError => {
        console.error('Webhook processing failed:', webhookError);
        // Don't interfere with success flow if webhook fails
      });
    }
    
    await clearCart();
    setTimeout(() => navigate('/profile'), 2500);
  };

  // Payment error handler with automatic session renewal
  const handlePaymentError = async (errorMessage: string) => {
    setError(errorMessage);
    
    // Check if this is a session expiration error
    const isSessionExpired = errorMessage.includes('payment session expired') || 
                            errorMessage.includes('payment_intent') ||
                            errorMessage.includes('expired') ||
                            errorMessage.includes('invalid');
    
    if (isSessionExpired && orderId) {
      try {
        setError('Refreshing payment session...');
        
        // Clear current clientSecret first to force Elements unmount
        setClientSecret(null);
        
        // Small delay to ensure Elements is properly unmounted
        await new Promise(resolve => setTimeout(resolve, 100));
        
        // Automatically renew the payment session
        const payResponse = await api.post(`/orders/${orderId}/pay`, {}, {
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('token')}`,
            'Content-Type': 'application/json'
          }
        });
        
        const newClientSecret = payResponse.data.client_secret;
        if (newClientSecret) {
          setClientSecret(newClientSecret);
          setError(null);
          setCheckoutStep('payment_form');
          return; // Stay on payment form with fresh session
        }
        
      } catch (renewError: any) {
        console.error('Payment session renewal failed:', renewError);
        setError('Unable to refresh payment session. Please try checkout again.');
        setCheckoutStep('shipping_form');
        setClientSecret(null);
        return;
      }
    }
    
    // For non-session errors, stay on payment form
    setCheckoutStep('payment_form');
    
    // Process webhook for payment failure
    if (orderId && clientSecret && orderData) {
      const webhookPayload = {
        orderId: orderId,
        paymentIntentId: clientSecret?.split('_secret_')[0] || 'unknown', // Extract payment intent ID safely
        amount: Math.round((orderData.total_price || 0) * 100), // Use backend total converted to cents
        currency: 'gbp',
        customerEmail: user?.email,
        metadata: {
          error: errorMessage,
          items: orderData.items || items.map(item => ({
            id: item.id,
            name: item.product?.name || 'Product',
            quantity: item.quantity,
            price: item.product?.price || 0
          })),
          subtotal: orderData.subtotal,
          shipping_fee: orderData.shipping_fee,
          delivery_type: orderData.delivery_type
        }
      };
      
      // Process webhook asynchronously without blocking error handling
      processPaymentFailure(webhookPayload).catch(webhookError => {
        console.error('Webhook processing failed:', webhookError);
        // Don't interfere with error display if webhook fails
      });
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
        <div className="fixed inset-0 z-[100] bg-white/95 backdrop-blur-xl flex flex-col items-center justify-center p-4 md:p-6 animate-in fade-in duration-300 overflow-y-auto">
          <div className="w-full max-w-xl bg-white rounded-[3rem] p-8 md:p-10 shadow-2xl border border-pink-50 relative max-h-[90vh] overflow-y-auto">
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
                            placeholder="+44 7XXX XXXXXX"
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
                          placeholder="123 Oxford Street"
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
                            placeholder="London"
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
                            placeholder="Greater London"
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
                            <option value="United Kingdom">United Kingdom</option>
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
                            placeholder="SW1A 1AA"
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
                      <div className="flex gap-3 pt-6 pb-4">
                        <button
                          type="button"
                          onClick={() => {
                            setCheckingOut(false);
                            setCheckoutStep('idle');
                          }}
                          className="flex-1 bg-gray-100 hover:bg-gray-200 text-gray-700 py-3 px-4 rounded-2xl font-bold text-sm transition-all flex items-center justify-center gap-2"
                        >
                          <ChevronLeft size={16} />
                          <span>Back</span>
                        </button>
                        <button
                          type="submit"
                          className="flex-[2] bg-gray-900 hover:bg-pink-600 text-white py-3 px-4 rounded-2xl font-bold text-sm transition-all active:scale-95 flex items-center justify-center gap-2"
                        >
                          <span>Complete Order</span>
                          <ArrowRight size={16} />
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
                        Investment Value: <span className="text-pink-500 font-black">£{orderData?.total_price?.toFixed(2) || (total + selectedShipping.fee).toFixed(2)}</span>
                      </p>
                    </div>

                    {error && (
                      <div className="bg-red-50 border border-red-100 text-red-600 p-4 rounded-2xl mb-6 flex items-start gap-3 text-xs font-bold leading-relaxed">
                        <AlertCircle size={16} className="mt-0.5 flex-shrink-0" />
                        <div className="flex-1">
                          <span>{error}</span>
                          {error.includes('Refreshing payment session') && (
                            <div className="mt-2 flex items-center gap-2 text-xs text-blue-600">
                              <div className="w-3 h-3 border border-blue-600 border-t-transparent rounded-full animate-spin"></div>
                              <span>Updating payment session automatically...</span>
                            </div>
                          )}
                          {error.includes('payment session expired') && !error.includes('Refreshing') && (
                            <button
                              onClick={() => {
                                setCheckingOut(false);
                                setCheckoutStep('idle');
                                setError(null);
                                setClientSecret(null);
                              }}
                              className="block mt-3 text-xs bg-red-100 hover:bg-red-200 text-red-700 px-3 py-2 rounded-lg font-bold transition-colors"
                            >
                              Start New Checkout
                            </button>
                          )}
                        </div>
                      </div>
                    )}

                    {/* Stripe Elements Provider (as per backend specs) */}
                    {/* Force re-render when clientSecret changes by using key */}
                    <Elements 
                      key={clientSecret} // This forces re-render when clientSecret changes
                      stripe={stripePromise}
                      options={{
                        clientSecret: clientSecret,
                        appearance: {
                          theme: 'stripe',
                          variables: {
                            colorPrimary: '#ec4899',
                            colorBackground: '#ffffff',
                            colorText: '#111827',
                            colorDanger: '#ef4444',
                            fontFamily: 'Poppins, sans-serif',
                            spacingUnit: '6px',
                            borderRadius: '12px',
                          },
                        },
                      }}
                    >
                      <CheckoutForm 
                        clientSecret={clientSecret}
                        onSuccess={handlePaymentSuccess}
                        onError={handlePaymentError}
                        orderTotal={orderData?.total_price || (total + selectedShipping.fee)}
                        orderData={orderData}
                      />
                    </Elements>
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
                className="bg-white rounded-[2.5rem] p-6 sm:p-8 shadow-xl border border-pink-50 group hover:shadow-2xl transition-all"
              >
                <div className="flex flex-col sm:flex-row items-center gap-6 sm:gap-8">
                  <div className="w-28 h-28 sm:w-32 sm:h-32 rounded-2xl overflow-hidden flex-shrink-0 shadow-lg bg-gray-50 border border-pink-50">
                    <img 
                      src={item.product?.image_url || 'https://picsum.photos/200/200'} 
                      alt={item.product?.name} 
                      className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                    />
                  </div>
                  <div className="flex-grow text-center sm:text-left min-w-0">
                    <span className="text-pink-500 text-[10px] font-black uppercase tracking-widest mb-1 block">
                      {item.product?.category || 'Beauty'}
                    </span>
                    <h3 className="text-xl sm:text-2xl font-black text-gray-900 italic mb-2 truncate">{item.product?.name}</h3>
                    <p className="text-gray-400 text-sm font-medium line-clamp-1 max-w-md">
                      {item.product?.description}
                    </p>
                  </div>
                </div>
                <div className="flex items-center justify-between gap-4 mt-6 pt-6 border-t border-pink-50 sm:border-0 sm:pt-0 sm:mt-0 sm:justify-end">
                  <div className="flex items-center bg-gray-50 p-1.5 sm:p-2 rounded-xl sm:rounded-2xl border border-pink-50">
                    <button 
                      onClick={() => updateQuantity(item.product_id, item.quantity - 1)}
                      className="w-8 h-8 sm:w-10 sm:h-10 flex items-center justify-center text-pink-500 hover:text-pink-600 transition-colors"
                      disabled={item.quantity <= 1}
                    >
                      <Minus size={16} />
                    </button>
                    <span className="w-8 sm:w-12 text-center font-black text-gray-900">{item.quantity}</span>
                    <button 
                      onClick={() => updateQuantity(item.product_id, item.quantity + 1)}
                      className="w-8 h-8 sm:w-10 sm:h-10 flex items-center justify-center text-pink-500 hover:text-pink-600 transition-colors"
                    >
                      <Plus size={16} />
                    </button>
                  </div>
                  <div className="text-right">
                    <p className="text-xl sm:text-2xl font-black text-gray-900 tracking-tight">
                      £{((item.product?.price || 0) * item.quantity).toFixed(2)}
                    </p>
                  </div>
                  <button 
                    onClick={() => removeFromCart(item.id)}
                    className="p-3 sm:p-4 text-gray-300 hover:text-red-500 transition-colors hover:bg-red-50 rounded-xl sm:rounded-2xl flex-shrink-0"
                  >
                    <Trash2 size={18} />
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
