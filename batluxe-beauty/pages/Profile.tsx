
import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';
import { Order, Product } from '../types';
import { 
  ShoppingBag, Calendar, Package, ArrowRight, 
  Loader2, CheckCircle2, X, Info, FileText, 
  User, Mail, ShieldCheck, Hash, Clock, Settings,
  Edit, Phone, MapPin, Save
} from 'lucide-react';

const Profile: React.FC = () => {
  const { user } = useAuth();
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  
  // Profile editing state
  const [isEditingShipping, setIsEditingShipping] = useState(false);
  const [profileData, setProfileData] = useState({
    fullName: '',
    email: user?.email || '',
    phone: '',
    accountType: user?.role || 'User',
    memberSince: new Date().toISOString()
  });
  const [shippingAddress, setShippingAddress] = useState({
    street: '',
    city: '',
    postalCode: '',
    country: 'United Kingdom'
  });
  
  // Detail Modal State
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [orderItems, setOrderItems] = useState<any[]>([]);
  const [loadingDetails, setLoadingDetails] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      try {
        // Fetch orders
        const ordersResponse = await api.get('/orders');
        const ordersData = ordersResponse.data;
        const ordersArray = Array.isArray(ordersData) 
          ? ordersData 
          : (ordersData?.orders || ordersData?.data || []);
        setOrders(ordersArray);

        // Fetch user profile data and shipping address
        try {
          const profileResponse = await api.get('/profile');
          const profile = profileResponse.data;
          
          // Update profile data with fetched API data
          setProfileData({
            fullName: profile.name || profile.full_name || '',
            email: user?.email || profile.email || '', // Email from token is most reliable
            phone: profile.phone_number || profile.phone || '',
            accountType: user?.role || profile.role || 'User',
            memberSince: profile.created_at || new Date().toISOString()
          });
          
          // Fetch shipping address from profile
          if (profile.shipping_address) {
            setShippingAddress(profile.shipping_address);
          }
        } catch (profileErr) {
          console.error("Failed to fetch profile data:", profileErr);
          // If profile fetch fails, we still have email from token
          setProfileData({
            fullName: '',
            email: user?.email || '',
            phone: '',
            accountType: user?.role || 'User',
            memberSince: new Date().toISOString()
          });
        }
      } catch (err) {
        console.error("Failed to fetch data", err);
      } finally {
        setLoading(false);
      }
    };

    if (user) fetchData();
  }, [user]);



  const saveShippingAddress = async () => {
    try {
      await api.put('/profile/shipping', { shipping_address: shippingAddress });
      setIsEditingShipping(false);
    } catch (err) {
      console.error("Failed to update shipping address", err);
    }
  };

  const viewOrderDetails = async (order: Order) => {
    setSelectedOrder(order);
    setOrderItems([]);
    setLoadingDetails(true);
    try {
      const response = await api.get(`/orders/${order.id}`);
      const data = response.data;
      const items = data.items || data.order_items || data.OrderItems || [];
      setOrderItems(Array.isArray(items) ? items : []);
    } catch (err) {
      console.error("Error fetching detailed order info", err);
    } finally {
      setLoadingDetails(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-[70vh] flex flex-col items-center justify-center">
        <Loader2 className="w-12 h-12 text-pink-500 animate-spin mb-4" />
        <p className="text-[10px] font-black text-gray-400 uppercase tracking-[0.4em]">Retrieving Your Legacy</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#FDF2F8]/20 py-24">
      <div className="container mx-auto px-4 max-w-6xl">
        {/* Header */}
        <div className="text-center mb-20">
          <span className="text-pink-500 font-black tracking-[0.4em] uppercase text-[10px] mb-4 block">Patron Profile</span>
          <h1 className="text-6xl font-black text-gray-900 mb-6 italic tracking-tight">Your Legacy</h1>
          <p className="text-gray-400 font-medium max-w-2xl mx-auto italic">
            "Curated excellence begins with understanding your aesthetic journey."
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 mb-16">
          {/* Personal Information Card */}
          <div className="bg-white rounded-[3rem] p-12 shadow-2xl border border-pink-50 relative overflow-hidden">
            <div className="absolute top-0 right-0 w-64 h-64 bg-pink-50/50 rounded-full blur-3xl -mr-32 -mt-32"></div>
            
            <div className="relative z-10">
              <div className="mb-12">
                <h2 className="text-3xl font-black text-gray-900 italic mb-3 flex items-center gap-3">
                  <User className="text-pink-500" size={28} /> Identity Matrix
                </h2>
                <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Authenticated Credentials</p>
              </div>

              <div className="space-y-10">
                <div className="flex items-start gap-6">
                  <div className="w-12 h-12 bg-pink-50 rounded-2xl flex items-center justify-center text-pink-500 shadow-inner">
                    <User size={24} />
                  </div>
                  <div className="flex-1">
                    <p className="text-[10px] font-black text-pink-300 uppercase tracking-widest mb-1">Full Name</p>
                    <p className="text-xl font-black text-gray-900 italic">
                      {profileData.fullName || (
                        <span className="text-gray-400 font-medium text-base">Loading profile data...</span>
                      )}
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-6">
                  <div className="w-12 h-12 bg-pink-50 rounded-2xl flex items-center justify-center text-pink-500 shadow-inner">
                    <Mail size={24} />
                  </div>
                  <div className="flex-1">
                    <p className="text-[10px] font-black text-pink-300 uppercase tracking-widest mb-1">Digital Concierge</p>
                    <p className="text-lg font-black text-gray-900 break-all">{profileData.email}</p>
                  </div>
                </div>

                <div className="flex items-start gap-6">
                  <div className="w-12 h-12 bg-pink-50 rounded-2xl flex items-center justify-center text-pink-500 shadow-inner">
                    <Phone size={24} />
                  </div>
                  <div className="flex-1">
                    <p className="text-[10px] font-black text-pink-300 uppercase tracking-widest mb-1">Direct Line</p>
                    <p className="text-lg font-black text-gray-900">
                      {profileData.phone || (
                        <span className="text-gray-400 font-medium text-base">Loading profile data...</span>
                      )}
                    </p>
                  </div>
                </div>

                <div className="grid grid-cols-1 gap-8 pt-6 border-t border-pink-50">
                  <div className="flex justify-between items-center">
                    <div>
                      <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">Account Classification</p>
                      <p className="text-sm font-black text-gray-900 uppercase tracking-widest">{profileData.accountType}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">Member Since</p>
                      <p className="text-sm font-black text-gray-900">
                        {new Date(profileData.memberSince).toLocaleDateString('en-GB', { 
                          month: 'short', 
                          year: 'numeric' 
                        })}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Shipping Address Card */}
          <div className="bg-gray-900 rounded-[3rem] p-12 text-white shadow-2xl relative overflow-hidden group">
            <div className="absolute bottom-0 right-0 w-40 h-40 bg-pink-500/20 rounded-full blur-3xl -mb-20 -mr-20 group-hover:bg-pink-500/30 transition-all"></div>
            
            <div className="relative z-10">
              <div className="flex items-center justify-between mb-12">
                <div>
                  <h2 className="text-3xl font-black italic mb-3 flex items-center gap-3">
                    <MapPin className="text-pink-500" size={28} /> Delivery Coordinates
                  </h2>
                  <p className="text-[10px] font-black text-pink-300 uppercase tracking-widest">Fulfillment Address</p>
                </div>
                <button
                  onClick={() => setIsEditingShipping(!isEditingShipping)}
                  className="bg-white/10 hover:bg-pink-500 text-white px-6 py-3 rounded-2xl font-black text-[10px] uppercase tracking-widest transition-all shadow-xl flex items-center gap-2"
                >
                  <Edit size={16} />
                  {isEditingShipping ? 'Cancel' : 'Configure'}
                </button>
              </div>

              <div className="space-y-8">
                {isEditingShipping ? (
                  <>
                    <div className="space-y-6">
                      <div>
                        <label className="text-[10px] font-black text-pink-300 uppercase tracking-widest mb-3 block">Street Address</label>
                        <input
                          type="text"
                          value={shippingAddress.street}
                          onChange={(e) => setShippingAddress({...shippingAddress, street: e.target.value})}
                          className="w-full px-6 py-4 bg-white/10 border border-white/20 rounded-2xl focus:ring-2 focus:ring-pink-500 focus:border-transparent outline-none text-white font-bold placeholder:text-white/50"
                          placeholder="Enter your street address"
                        />
                      </div>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                          <label className="text-[10px] font-black text-pink-300 uppercase tracking-widest mb-3 block">City</label>
                          <input
                            type="text"
                            value={shippingAddress.city}
                            onChange={(e) => setShippingAddress({...shippingAddress, city: e.target.value})}
                            className="w-full px-6 py-4 bg-white/10 border border-white/20 rounded-2xl focus:ring-2 focus:ring-pink-500 focus:border-transparent outline-none text-white font-bold placeholder:text-white/50"
                            placeholder="Enter your city"
                          />
                        </div>
                        <div>
                          <label className="text-[10px] font-black text-pink-300 uppercase tracking-widest mb-3 block">Postal Code</label>
                          <input
                            type="text"
                            value={shippingAddress.postalCode}
                            onChange={(e) => setShippingAddress({...shippingAddress, postalCode: e.target.value})}
                            className="w-full px-6 py-4 bg-white/10 border border-white/20 rounded-2xl focus:ring-2 focus:ring-pink-500 focus:border-transparent outline-none text-white font-bold placeholder:text-white/50"
                            placeholder="Postal code"
                          />
                        </div>
                      </div>
                      <div>
                        <label className="text-[10px] font-black text-pink-300 uppercase tracking-widest mb-3 block">Country</label>
                        <select
                          value={shippingAddress.country}
                          onChange={(e) => setShippingAddress({...shippingAddress, country: e.target.value})}
                          className="w-full px-6 py-4 bg-white/10 border border-white/20 rounded-2xl focus:ring-2 focus:ring-pink-500 focus:border-transparent outline-none text-white font-bold"
                        >
                          <option value="United Kingdom">United Kingdom</option>
                          <option value="Ireland">Ireland</option>
                          <option value="France">France</option>
                          <option value="Germany">Germany</option>
                          <option value="Spain">Spain</option>
                        </select>
                      </div>
                    </div>
                    <button
                      onClick={saveShippingAddress}
                      className="bg-pink-500 hover:bg-pink-600 text-white px-8 py-4 rounded-2xl font-black text-[10px] uppercase tracking-widest shadow-xl transition-all flex items-center gap-3"
                    >
                      <Save size={18} />
                      Secure Address
                    </button>
                  </>
                ) : (
                  <div>
                    {shippingAddress.street ? (
                      <div className="bg-white/5 p-8 rounded-3xl border border-white/10">
                        <div className="text-white font-bold text-lg leading-relaxed">
                          <p className="mb-2">{shippingAddress.street}</p>
                          <p className="mb-2">{shippingAddress.city} {shippingAddress.postalCode}</p>
                          <p className="text-pink-300 font-black uppercase text-sm tracking-widest">{shippingAddress.country}</p>
                        </div>
                      </div>
                    ) : (
                      <div className="bg-white/5 p-8 rounded-3xl border border-white/10 text-center">
                        <p className="text-white/60 italic font-medium mb-4">No delivery coordinates configured</p>
                        <p className="text-[10px] font-black text-pink-300 uppercase tracking-widest">Configure address for seamless fulfillment</p>
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="bg-white rounded-[3rem] p-12 shadow-2xl border border-pink-50 mb-16">
          <h2 className="text-3xl font-black text-gray-900 italic mb-8 flex items-center gap-3">
            <Package className="text-pink-500" size={28} /> Patron Actions
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Link
              to="/profile"
              onClick={() => {
                const ordersSection = document.getElementById('orders-section');
                if (ordersSection) ordersSection.scrollIntoView({ behavior: 'smooth' });
              }}
              className="flex items-center gap-6 p-8 bg-gray-50 rounded-3xl hover:bg-pink-50 hover:shadow-xl transition-all group border border-pink-50"
            >
              <div className="w-16 h-16 bg-pink-500 rounded-2xl flex items-center justify-center group-hover:bg-pink-600 transition-all shadow-lg">
                <Package size={28} className="text-white" />
              </div>
              <div>
                <p className="text-lg font-black text-gray-900 italic">View Orders</p>
                <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Acquisition History</p>
              </div>
            </Link>
            
            <Link
              to="/shop"
              className="flex items-center gap-6 p-8 bg-gray-50 rounded-3xl hover:bg-pink-50 hover:shadow-xl transition-all group border border-pink-50"
            >
              <div className="w-16 h-16 bg-gray-900 rounded-2xl flex items-center justify-center group-hover:bg-pink-600 transition-all shadow-lg">
                <ShoppingBag size={28} className="text-white" />
              </div>
              <div>
                <p className="text-lg font-black text-gray-900 italic">Continue Shopping</p>
                <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Curated Collection</p>
              </div>
            </Link>
          </div>
        </div>

        {/* Recent Orders */}
        <div id="orders-section" className="bg-white rounded-[3rem] p-12 shadow-2xl border border-pink-50">
          <div className="flex items-center gap-4 mb-12">
            <Hash size={28} className="text-pink-500" />
            <h2 className="text-3xl font-black text-gray-900 italic">Recent Acquisitions</h2>
          </div>
          
          {orders.length === 0 ? (
            <div className="text-center py-20">
              <div className="w-24 h-24 bg-pink-50 rounded-full flex items-center justify-center mx-auto mb-8">
                <ShoppingBag size={32} className="text-pink-200" />
              </div>
              <p className="text-gray-400 font-bold mb-8 italic">No previous transactions found in your ledger.</p>
              <Link 
                to="/shop" 
                className="inline-block bg-gray-900 text-white px-12 py-6 rounded-2xl font-black text-xs uppercase tracking-[0.3em] hover:bg-pink-600 transition-all shadow-2xl active:scale-95"
              >
                Begin Your Curation
              </Link>
            </div>
          ) : (
            <div className="space-y-6">
              {orders.slice(0, 3).map((order: any) => (
                <div 
                  key={order.id} 
                  className="flex flex-col md:flex-row items-start md:items-center justify-between p-8 bg-gray-50 rounded-3xl hover:bg-pink-50 hover:shadow-xl transition-all group border border-pink-50"
                >
                  <div className="flex items-center gap-6 mb-4 md:mb-0">
                    <div className="w-14 h-14 bg-white rounded-2xl flex items-center justify-center text-gray-900 border border-pink-100 shadow-inner group-hover:bg-pink-500 group-hover:text-white transition-all">
                      <Hash size={24} />
                    </div>
                    <div>
                      <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">Order Identifier</p>
                      <p className="text-xl font-black text-gray-900 italic">#{order.id}</p>
                    </div>
                  </div>
                  <div className="flex flex-col md:flex-row items-start md:items-center gap-6 md:gap-12">
                    <div className="text-left">
                      <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">Investment</p>
                      <p className="text-xl font-black text-gray-900">£{(order.total_amount || 0).toFixed(2)}</p>
                    </div>
                    <div className="text-left">
                      <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">Status</p>
                      <span className="text-[10px] font-black px-4 py-2 rounded-full border border-blue-100 bg-blue-50 text-blue-600 uppercase tracking-widest">
                        {order.status}
                      </span>
                    </div>
                  </div>
                </div>
              ))}
              {orders.length > 3 && (
                <div className="text-center pt-8">
                  <button className="text-pink-500 hover:text-pink-600 font-black text-sm uppercase tracking-widest transition-colors">
                    View Complete Ledger
                  </button>
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Detail Modal */}
      {selectedOrder && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-6 animate-in fade-in duration-300">
          <div className="absolute inset-0 bg-gray-900/60 backdrop-blur-md" onClick={() => setSelectedOrder(null)}></div>
          <div className="relative w-full max-w-3xl bg-white rounded-[2.5rem] shadow-2xl overflow-hidden border border-white/20 flex flex-col max-h-[85vh]">
            <div className="p-10 border-b flex justify-between items-center bg-gray-900 text-white">
              <div className="flex items-center gap-4 text-left">
                <div className="w-12 h-12 bg-pink-500 rounded-2xl flex items-center justify-center shadow-lg">
                   <Package size={24} />
                </div>
                <div>
                  <h2 className="text-2xl font-black italic">Details for #{selectedOrder.id}</h2>
                  <p className="text-pink-300 text-[10px] font-black uppercase tracking-widest">Acquisition Receipt</p>
                </div>
              </div>
              <button onClick={() => setSelectedOrder(null)} className="text-white/50 hover:text-white transition-colors bg-white/10 p-2 rounded-xl"><X size={24} /></button>
            </div>
            
            <div className="p-10 overflow-y-auto space-y-10">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                 <div className="bg-gray-50 p-6 rounded-3xl border border-pink-50 text-left">
                    <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-3">Shipment Status</p>
                    <div className="flex items-center gap-3">
                       <CheckCircle2 size={18} className="text-green-500" />
                       <span className="font-black text-gray-900 uppercase text-xs tracking-widest">{selectedOrder.status}</span>
                    </div>
                 </div>
                 <div className="bg-gray-50 p-6 rounded-3xl border border-pink-50 text-left">
                    <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-3">Total Investment</p>
                    <p className="text-2xl font-black text-gray-900">£{(selectedOrder.total_amount || 0).toFixed(2)}</p>
                 </div>
              </div>

              <div className="space-y-4">
                 <div className="flex items-center gap-3 mb-2">
                    <FileText size={18} className="text-pink-500" />
                    <h3 className="text-xs font-black uppercase tracking-[0.2em] text-gray-400">Inventory Items</h3>
                 </div>

                 <div className="bg-white rounded-3xl border border-pink-50 shadow-inner overflow-hidden">
                    {loadingDetails ? (
                      <div className="p-10 flex flex-col items-center justify-center">
                        <Loader2 className="w-8 h-8 text-pink-500 animate-spin mb-3" />
                        <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Decrypting Details...</p>
                      </div>
                    ) : orderItems.length > 0 ? (
                      <table className="w-full text-left">
                        <thead className="bg-gray-50 text-[10px] font-black text-gray-400 uppercase tracking-widest">
                          <tr>
                            <th className="px-8 py-5">Product Asset</th>
                            <th className="px-8 py-5 text-center">Qty</th>
                            <th className="px-8 py-5 text-right">Price</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-pink-50">
                          {orderItems.map((item, idx) => (
                            <tr key={idx}>
                              <td className="px-8 py-5 font-bold text-gray-900 italic">{item.product_name || item.name || 'Bespoke Item'}</td>
                              <td className="px-8 py-5 text-center font-black text-gray-400">{item.quantity}</td>
                              <td className="px-8 py-5 text-right font-black text-gray-900">£{(item.price || 0).toFixed(2)}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    ) : (
                      <div className="p-10 text-center text-gray-300 italic">No line items retrieved for this session.</div>
                    )}
                 </div>
              </div>
            </div>

            <div className="p-8 bg-gray-50 border-t text-center">
               <p className="text-[10px] font-black text-gray-300 uppercase tracking-[0.4em]">BatLuxe Beauty Certified Record</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Profile;
