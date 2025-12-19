
import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';
import { Order, Product } from '../types';
import { 
  ShoppingBag, Calendar, Package, ArrowRight, 
  Loader2, CheckCircle2, X, Info, FileText, 
  User, Mail, ShieldCheck, Hash, Clock, Settings
} from 'lucide-react';

const Profile: React.FC = () => {
  const { user } = useAuth();
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  
  // Detail Modal State
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [orderItems, setOrderItems] = useState<any[]>([]);
  const [loadingDetails, setLoadingDetails] = useState(false);

  useEffect(() => {
    const fetchOrders = async () => {
      try {
        const response = await api.get('/orders');
        const data = response.data;
        const ordersArray = Array.isArray(data) 
          ? data 
          : (data?.orders || data?.data || []);
        setOrders(ordersArray);
      } catch (err) {
        console.error("Failed to fetch order history", err);
      } finally {
        setLoading(false);
      }
    };

    if (user) fetchOrders();
  }, [user]);

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
    <div className="min-h-screen bg-[#FDF2F8]/20 py-20">
      <div className="container mx-auto px-4 max-w-6xl">
        <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center mb-16 gap-8">
          <div className="text-left">
            <span className="text-pink-500 font-black tracking-[0.4em] uppercase text-[10px] mb-2 block">Patron Profile</span>
            <h1 className="text-5xl font-black text-gray-900 italic tracking-tight">Your Journey</h1>
          </div>
          
          <div className="flex flex-col sm:flex-row gap-6 w-full lg:w-auto">
            <div className="bg-white p-6 rounded-[2rem] shadow-xl border border-pink-50 flex items-center gap-6 flex-1 min-w-[320px]">
              <div className="w-14 h-14 bg-pink-500 rounded-2xl flex items-center justify-center text-white shadow-lg">
                 <User size={28} />
              </div>
              <div className="text-left">
                <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">Authenticated Account</p>
                <p className="text-lg font-black text-gray-900 truncate max-w-[200px]">{user?.email}</p>
              </div>
            </div>

            <Link 
              to="/account-settings" 
              className="bg-gray-900 hover:bg-pink-600 text-white p-6 rounded-[2rem] shadow-xl flex items-center justify-center gap-3 font-black text-[10px] uppercase tracking-widest transition-all active:scale-95"
            >
              <Settings size={20} /> Manage Protocols
            </Link>
          </div>
        </div>

        <div className="space-y-8">
          <div className="flex items-center gap-4 mb-2">
            <Clock size={20} className="text-pink-500" />
            <h2 className="text-xl font-black text-gray-900 italic">Order Acquisitions</h2>
          </div>

          {orders.length === 0 ? (
            <div className="bg-white rounded-[3rem] p-20 text-center shadow-xl border border-pink-50">
              <div className="w-20 h-20 bg-pink-50 rounded-full flex items-center justify-center mx-auto mb-6">
                <ShoppingBag size={32} className="text-pink-200" />
              </div>
              <p className="text-gray-400 font-bold mb-8">No previous transactions found in your ledger.</p>
              <Link 
                to="/shop" 
                className="inline-block bg-gray-900 text-white px-10 py-4 rounded-xl font-black text-xs uppercase tracking-widest hover:bg-pink-600 transition-all shadow-xl active:scale-95"
              >
                Start Your Curation
              </Link>
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-6">
              {orders.map((order) => (
                <div 
                  key={order.id} 
                  className="bg-white rounded-[2rem] p-8 shadow-lg border border-pink-50 flex flex-col md:flex-row items-center justify-between gap-8 hover:shadow-2xl transition-all group"
                >
                  <div className="flex items-center gap-8 text-left w-full md:w-auto">
                    <div className="w-14 h-14 bg-gray-50 rounded-2xl flex items-center justify-center text-gray-900 border border-pink-50 shadow-inner group-hover:bg-pink-500 group-hover:text-white transition-all">
                      <Hash size={24} />
                    </div>
                    <div>
                      <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">Order Identifier</p>
                      <p className="text-lg font-black text-gray-900 italic">#{order.id}</p>
                    </div>
                  </div>

                  <div className="flex flex-col md:flex-row items-center gap-12 w-full md:w-auto">
                    <div className="text-center md:text-left">
                       <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">Status</p>
                       <span className="text-[10px] font-black px-4 py-1.5 rounded-full border border-blue-100 bg-blue-50 text-blue-600 uppercase tracking-widest">
                         {order.status}
                       </span>
                    </div>

                    <div className="text-center md:text-left">
                       <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">Transaction Value</p>
                       <p className="text-xl font-black text-gray-900">£{(order.total_amount || 0).toFixed(2)}</p>
                    </div>

                    <div className="text-center md:text-left">
                       <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">Date</p>
                       <p className="text-sm font-bold text-gray-500 flex items-center gap-2">
                         <Calendar size={14} className="text-pink-400" />
                         {new Date(order.created_at || Date.now()).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })}
                       </p>
                    </div>

                    <button 
                      onClick={() => viewOrderDetails(order)}
                      className="bg-gray-900 hover:bg-pink-600 text-white px-8 py-4 rounded-xl font-black text-[10px] uppercase tracking-widest shadow-xl transition-all flex items-center gap-2 group-hover:translate-x-1"
                    >
                      View Details <ArrowRight size={14} />
                    </button>
                  </div>
                </div>
              ))}
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
