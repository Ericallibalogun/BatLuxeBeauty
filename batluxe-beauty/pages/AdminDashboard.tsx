
import React, { useEffect, useState, useMemo, useCallback } from 'react';
import api from '../services/api';
import { Product, Order, DashboardAnalytics, UserProfile } from '../types';
import { 
  Package, Plus, Edit, Trash2, ShoppingBag, 
  Layers, X, CheckCircle2, Loader2, ArrowRight, 
  BarChart3, TrendingUp, DollarSign, Award, Upload,
  User, Mail, Calendar, Hash, Info, FileText,
  Users, Shield
} from 'lucide-react';
import { usePerformanceMonitor } from '../hooks/usePerformanceMonitor';
import { useDebounce } from '../hooks/useDebounce';
import FastImage from '../components/FastImage';
import Pagination from '../components/Pagination';

const AdminDashboard: React.FC = () => {
  usePerformanceMonitor('AdminDashboard');
  
  type Tab = 'overview' | 'products' | 'orders' | 'users';
  const [activeTab, setActiveTab] = useState<Tab>('overview');
  
  const [products, setProducts] = useState<Product[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);
  const [users, setUsers] = useState<UserProfile[]>([]);
  const [analytics, setAnalytics] = useState<DashboardAnalytics | null>(null);
  const [loading, setLoading] = useState(true);
  const [showAddModal, setShowAddModal] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [notification, setNotification] = useState<{message: string; type: 'success' | 'error'} | null>(null);

  // Pagination states
  const [productsPage, setProductsPage] = useState(1);
  const [ordersPage, setOrdersPage] = useState(1);
  const [usersPage, setUsersPage] = useState(1);
  const [itemsPerPage] = useState(10);

  // Search states
  const [productSearch, setProductSearch] = useState('');
  const [orderSearch, setOrderSearch] = useState('');
  const [userSearch, setUserSearch] = useState('');

  // Debounced search values
  const debouncedProductSearch = useDebounce(productSearch, 300);
  const debouncedOrderSearch = useDebounce(orderSearch, 300);
  const debouncedUserSearch = useDebounce(userSearch, 300);

  // Order Details State
  const [viewingOrder, setViewingOrder] = useState<Order | null>(null);
  const [orderItems, setOrderItems] = useState<any[]>([]);
  const [loadingOrderDetails, setLoadingOrderDetails] = useState(false);

  // Status Update State
  const [showStatusModal, setShowStatusModal] = useState(false);
  const [updatingStatus, setUpdatingStatus] = useState(false);

  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [newProduct, setNewProduct] = useState({
    name: '',
    description: '',
    price: 0,
    category: 'Skincare',
    stock: 0,
    image_url: '' 
  });

  const fetchData = async () => {
    setLoading(true);
    try {
      const prodRes = await api.get('/products');
      const pData = prodRes.data;
      setProducts(Array.isArray(pData) ? pData : (pData?.products || pData?.data || []));

      // Fetch Users
      try {
        const usersRes = await api.get('/admin/users');
        const uData = usersRes.data;
        setUsers(Array.isArray(uData) ? uData : (uData?.users || uData?.data || []));
      } catch (e) {
        console.warn("Could not fetch user directory, may require elevated permissions.");
        setUsers([]);
      }

      // Attempt /admin/orders first, fallback to /orders if 404
      try {
        const orderRes = await api.get('/admin/orders');
        const oData = orderRes.data;
        setOrders(Array.isArray(oData) ? oData : (oData?.orders || oData?.data || []));
      } catch (e) {
        try {
          const altOrderRes = await api.get('/orders');
          const altData = altOrderRes.data;
          setOrders(Array.isArray(altData) ? altData : (altData?.orders || altData?.data || []));
        } catch (err) {
          setOrders([]);
        }
      }

      try {
        const analyticsRes = await api.get('/admin/analytics');
        const aData = analyticsRes.data?.analytics || analyticsRes.data;
        // We'll use calculated analytics instead of backend analytics
        console.log('Backend analytics (if available):', aData);
      } catch (e) {
        console.log('Backend analytics not available, using calculated analytics from orders');
      }
    } catch (err) {
      console.error("Dashboard fetch error:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  // Memoized filtered data
  const filteredProducts = useMemo(() => {
    if (!debouncedProductSearch.trim()) return products;
    const searchLower = debouncedProductSearch.toLowerCase();
    return products.filter(p => 
      p.name.toLowerCase().includes(searchLower) || 
      p.category?.toLowerCase().includes(searchLower)
    );
  }, [products, debouncedProductSearch]);

  const filteredOrders = useMemo(() => {
    if (!debouncedOrderSearch.trim()) return orders;
    const searchLower = debouncedOrderSearch.toLowerCase();
    return orders.filter(o => 
      o.id.toLowerCase().includes(searchLower) ||
      o.customer_name?.toLowerCase().includes(searchLower) ||
      o.customer_email?.toLowerCase().includes(searchLower)
    );
  }, [orders, debouncedOrderSearch]);

  const filteredUsers = useMemo(() => {
    if (!debouncedUserSearch.trim()) return users;
    const searchLower = debouncedUserSearch.toLowerCase();
    return users.filter(u => 
      u.name?.toLowerCase().includes(searchLower) ||
      u.email?.toLowerCase().includes(searchLower)
    );
  }, [users, debouncedUserSearch]);

  // Paginated data
  const paginatedProducts = useMemo(() => {
    const startIndex = (productsPage - 1) * itemsPerPage;
    return filteredProducts.slice(startIndex, startIndex + itemsPerPage);
  }, [filteredProducts, productsPage, itemsPerPage]);

  const paginatedOrders = useMemo(() => {
    const startIndex = (ordersPage - 1) * itemsPerPage;
    return filteredOrders.slice(startIndex, startIndex + itemsPerPage);
  }, [filteredOrders, ordersPage, itemsPerPage]);

  const paginatedUsers = useMemo(() => {
    const startIndex = (usersPage - 1) * itemsPerPage;
    return filteredUsers.slice(startIndex, startIndex + itemsPerPage);
  }, [filteredUsers, usersPage, itemsPerPage]);

  // Reset pagination when search changes
  useEffect(() => {
    setProductsPage(1);
  }, [debouncedProductSearch]);

  useEffect(() => {
    setOrdersPage(1);
  }, [debouncedOrderSearch]);

  useEffect(() => {
    setUsersPage(1);
  }, [debouncedUserSearch]);
  const getStoredStatusOverride = (orderId: string): string | null => {
    try {
      const overrides = localStorage.getItem('order_status_overrides');
      if (overrides) {
        const parsed = JSON.parse(overrides);
        const override = parsed[orderId];
        // Handle both old format (string) and new format (object)
        return typeof override === 'string' ? override : override?.status || null;
      }
    } catch (error) {
      console.error('Error reading status overrides:', error);
    }
    return null;
  };

  const setStoredStatusOverride = (orderId: string, newStatus: string) => {
    try {
      const existing = localStorage.getItem('order_status_overrides');
      const overrides = existing ? JSON.parse(existing) : {};
      overrides[orderId] = {
        status: newStatus,
        timestamp: new Date().toISOString(),
        synced: false
      };
      localStorage.setItem('order_status_overrides', JSON.stringify(overrides));
    } catch (error) {
      console.error('Error storing status override:', error);
    }
  };

  const getEffectiveOrderStatus = (order: any): string => {
    const override = getStoredStatusOverride(order.id);
    return override || order.status;
  };

  const isStatusOverridden = (orderId: string): boolean => {
    return getStoredStatusOverride(orderId) !== null;
  };

  // Available status options
  const statusOptions: { value: Order['status']; label: string; color: string }[] = [
    { value: 'Pending', label: 'Pending', color: 'bg-yellow-50 text-yellow-600 border-yellow-100' },
    { value: 'Processing', label: 'Processing', color: 'bg-blue-50 text-blue-600 border-blue-100' },
    { value: 'Shipped', label: 'Shipped', color: 'bg-purple-50 text-purple-600 border-purple-100' },
    { value: 'Delivered', label: 'Delivered', color: 'bg-green-50 text-green-600 border-green-100' },
    { value: 'Cancelled', label: 'Cancelled', color: 'bg-red-50 text-red-600 border-red-100' }
  ];

  const updateOrderStatus = async (orderId: string, newStatus: Order['status']) => {
    setUpdatingStatus(true);
    try {
      // First, try to update the status on the backend
      try {
        // Try multiple possible endpoints for updating order status
        let updateSuccess = false;
        
        // Try PATCH /orders/{id}/status first
        try {
          await api.patch(`/orders/${orderId}/status`, { status: newStatus });
          updateSuccess = true;
        } catch (err: any) {
          if (err.response?.status === 404 || err.response?.status === 405) {
            // Try PUT /orders/{id} with full order data
            try {
              await api.put(`/orders/${orderId}`, { status: newStatus });
              updateSuccess = true;
            } catch (err2: any) {
              if (err2.response?.status === 404 || err2.response?.status === 405) {
                // Try admin-specific endpoint
                await api.patch(`/admin/orders/${orderId}/status`, { status: newStatus });
                updateSuccess = true;
              } else {
                throw err2;
              }
            }
          } else {
            throw err;
          }
        }
        
        if (updateSuccess) {
          console.log(`Order ${orderId} status successfully updated to ${newStatus} on backend`);
          setNotification({message: `Order status updated to ${newStatus}`, type: 'success'});
          
          // Clear any local override since we've updated the backend
          const existing = localStorage.getItem('order_status_overrides');
          if (existing) {
            const overrides = JSON.parse(existing);
            delete overrides[orderId];
            localStorage.setItem('order_status_overrides', JSON.stringify(overrides));
          }
        }
      } catch (apiError: any) {
        console.warn('Failed to update status on backend, storing locally:', apiError.message);
        console.warn('API Error details:', apiError.response?.data);
        
        // If backend update fails, store locally as fallback
        setStoredStatusOverride(orderId, newStatus);
        setNotification({message: `Status updated locally. Backend sync failed.`, type: 'error'});
      }
      
      // Update the viewing order if it's the current one
      if (viewingOrder && viewingOrder.id === orderId) {
        setViewingOrder({
          ...viewingOrder,
          status: newStatus
        });
      }
      
      // Update the orders list
      setOrders(prevOrders => 
        prevOrders.map(order => 
          order.id === orderId 
            ? { ...order, status: newStatus }
            : order
        )
      );
      
      setShowStatusModal(false);
      
      // Show success feedback
      console.log(`Order ${orderId} status updated to ${newStatus}`);
      
    } catch (error) {
      console.error('Error updating order status:', error);
      setNotification({message: 'Failed to update order status. Please try again.', type: 'error'});
    } finally {
      setUpdatingStatus(false);
      // Auto-hide notification after 3 seconds
      setTimeout(() => setNotification(null), 3000);
    }
  };
  const calculateOrderTotal = (order: any) => {
    // Priority 1: Use total_price from backend (most reliable)
    if (order.total_price && order.total_price > 0) {
      return order.total_price;
    }
    
    // Priority 2: Use total_amount from backend
    if (order.total_amount && order.total_amount > 0) {
      return order.total_amount;
    }
    
    // Priority 3: Calculate from subtotal + shipping
    if (order.subtotal && order.subtotal > 0) {
      const shipping = order.shipping_fee || 0;
      return order.subtotal + shipping;
    }
    
    // Priority 4: Calculate from items if available
    if (order.items && Array.isArray(order.items) && order.items.length > 0) {
      const itemsTotal = order.items.reduce((sum: number, item: any) => {
        const price = item.price || 0;
        const quantity = item.quantity || 1;
        return sum + (price * quantity);
      }, 0);
      const shipping = order.shipping_fee || 0;
      return itemsTotal + shipping;
    }
    
    return 0;
  };

  // Calculate total revenue from all orders
  const calculateTotalRevenue = () => {
    return orders.reduce((total, order) => total + calculateOrderTotal(order), 0);
  };

  // Calculate daily sales (orders from today)
  const calculateDailySales = () => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    return orders
      .filter(order => {
        const orderDate = new Date(order.created_at);
        orderDate.setHours(0, 0, 0, 0);
        return orderDate.getTime() === today.getTime();
      })
      .reduce((total, order) => total + calculateOrderTotal(order), 0);
  };

  // Get top products based on order frequency
  const getTopProducts = () => {
    const productSales: { [key: string]: { name: string; sales: number } } = {};
    
    // Count sales from orders
    orders.forEach(order => {
      if (order.items && Array.isArray(order.items)) {
        order.items.forEach((item: any) => {
          const productName = item.product_name || item.name || 'Unknown Product';
          if (productSales[productName]) {
            productSales[productName].sales += item.quantity || 1;
          } else {
            productSales[productName] = {
              name: productName,
              sales: item.quantity || 1
            };
          }
        });
      }
    });
    
    // Convert to array and sort by sales
    return Object.values(productSales)
      .sort((a, b) => b.sales - a.sales)
      .slice(0, 5); // Top 5 products
  };

  const handleViewOrderDetails = async (order: Order) => {
    setViewingOrder(order);
    setOrderItems([]);
    setLoadingOrderDetails(true);
    try {
      // Try regular orders endpoint first, then admin endpoint if needed
      let response;
      try {
        response = await api.get(`/orders/${order.id}`);
      } catch (err: any) {
        if (err.response?.status === 404 || err.response?.status === 403) {
          // Fallback to admin endpoint
          response = await api.get(`/admin/orders/${order.id}`);
        } else {
          throw err;
        }
      }
      
      const data = response.data;
      console.log('Admin order details response:', data);
      console.log('Full order data structure:', JSON.stringify(data, null, 2));
      
      // Backend returns { order: {...} } or direct order data
      const orderData = data.order || data;
      console.log('Extracted order data:', orderData);
      console.log('Shipping address in order data:', orderData.shipping_address);
      console.log('All order data keys:', Object.keys(orderData));
      console.log('Address-related fields:', Object.keys(orderData).filter(key => 
        key.toLowerCase().includes('address') || 
        key.toLowerCase().includes('shipping') ||
        key.toLowerCase().includes('delivery')
      ));
      
      // Get items from the order data
      let items = orderData.items || orderData.order_items || [];
      console.log('Admin order items:', items);
      
      // Ensure items have proper structure
      if (items && items.length > 0) {
        items = items.map((item: any) => ({
          ...item,
          product_name: item.product_name || item.name || 'Product',
          price: item.price || 0,
          quantity: item.quantity || 1
        }));
      }
      
      setOrderItems(Array.isArray(items) ? items : []);
      
      // Update viewing order with complete data
      setViewingOrder({
        ...order,
        ...orderData,
        items: items,
        // Ensure shipping address is properly set
        shipping_address: orderData.shipping_address || orderData.delivery_address || orderData.address || null
      });
      
    } catch (err) {
      console.error("Failed to fetch order details", err);
      setOrderItems([]);
    } finally {
      setLoadingOrderDetails(false);
    }
  };

  const handleAddProduct = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      const formData = new FormData();
      formData.append('name', newProduct.name);
      formData.append('description', newProduct.description);
      formData.append('price', String(newProduct.price));
      formData.append('stock', String(newProduct.stock));
      formData.append('category', newProduct.category);
      
      if (selectedFile) {
        formData.append('image', selectedFile);
      }

      await api.post('/admin/products', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });

      setShowAddModal(false);
      setSelectedFile(null);
      setNewProduct({ name: '', description: '', price: 0, category: 'Skincare', stock: 0, image_url: '' });
      fetchData();
    } catch (err: any) {
      const data = err.response?.data;
      let errorMsg = 'Failed to add product.';
      
      if (data && typeof data === 'object') {
        errorMsg = data.error || data.message || data.err || JSON.stringify(data);
      } else if (typeof data === 'string') {
        errorMsg = data;
      } else {
        errorMsg = err.message;
      }
      
      alert(errorMsg);
    } finally {
      setSubmitting(false);
    }
  };

  const deleteProduct = async (id: string) => {
    if (!confirm("Are you sure you want to delete this product?")) return;
    try {
      await api.delete(`/admin/products/${id}`);
      fetchData();
    } catch (err: any) {
      const data = err.response?.data;
      let errorMsg = 'Failed to delete product.';
      
      if (data && typeof data === 'object') {
        errorMsg = data.error || data.message || data.err || JSON.stringify(data);
      } else if (typeof data === 'string') {
        errorMsg = data;
      }
      
      alert(errorMsg);
    }
  };

  const deleteUser = async (id: string) => {
    if (!confirm("Are you sure you want to de-authorize this patron?")) return;
    try {
      await api.delete(`/admin/users/${id}`);
      fetchData();
    } catch (err: any) {
      alert(err.response?.data?.message || "User removal protocol failed.");
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-pink-50/20">
        <Loader2 className="w-12 h-12 text-pink-500 animate-spin mb-4" />
        <p className="text-gray-400 font-bold uppercase tracking-widest text-[10px]">Accessing Control Center...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#FDF2F8]/20 py-12 text-gray-900">
      {/* Notification Toast */}
      {notification && (
        <div className={`fixed top-4 right-4 z-[200] p-4 rounded-xl shadow-lg border-2 animate-in slide-in-from-top-2 ${
          notification.type === 'success' 
            ? 'bg-green-50 border-green-200 text-green-800' 
            : 'bg-red-50 border-red-200 text-red-800'
        }`}>
          <div className="flex items-center gap-3">
            {notification.type === 'success' ? (
              <CheckCircle2 size={20} className="text-green-600" />
            ) : (
              <X size={20} className="text-red-600" />
            )}
            <span className="font-bold text-sm">{notification.message}</span>
            <button 
              onClick={() => setNotification(null)}
              className="ml-2 text-gray-400 hover:text-gray-600"
            >
              <X size={16} />
            </button>
          </div>
        </div>
      )}
      
      <div className="container mx-auto px-4 max-w-7xl">
        <div className="flex flex-col md:flex-row justify-between items-center mb-12 gap-6">
          <div className="text-left flex items-center gap-4">
            <div className="w-12 h-12 bg-gray-900 rounded-xl flex items-center justify-center text-white shadow-lg">
              <Layers size={24} />
            </div>
            <div>
              <h1 className="text-3xl font-black text-gray-900 italic tracking-tight">Admin Console</h1>
              <p className="text-gray-400 text-[10px] font-black uppercase tracking-widest">Management Interface</p>
            </div>
          </div>

          <div className="flex bg-white p-1.5 rounded-2xl shadow-xl border border-pink-100 overflow-hidden">
            {(['overview', 'products', 'orders', 'users'] as Tab[]).map((tab) => (
              <button 
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`px-8 py-3 rounded-xl font-black text-[10px] uppercase tracking-widest transition-all ${activeTab === tab ? 'bg-pink-600 text-white shadow-lg' : 'text-gray-400 hover:text-pink-600'}`}
              >
                {tab}
              </button>
            ))}
          </div>
        </div>

        {activeTab === 'overview' && (
          <div className="space-y-10 animate-in fade-in slide-in-from-bottom-4 duration-500">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
              <div className="bg-white p-8 rounded-[2.5rem] shadow-xl border border-pink-50 flex items-center gap-6 group hover:-translate-y-1 transition-all">
                <div className="w-14 h-14 bg-pink-50 rounded-2xl flex items-center justify-center text-pink-500 group-hover:bg-pink-500 group-hover:text-white transition-all">
                  <DollarSign size={28} />
                </div>
                <div>
                  <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">Total Revenue</p>
                  <p className="text-2xl font-black text-gray-900">£{calculateTotalRevenue().toLocaleString()}</p>
                </div>
              </div>
              <div className="bg-white p-8 rounded-[2.5rem] shadow-xl border border-pink-50 flex items-center gap-6 group hover:-translate-y-1 transition-all">
                <div className="w-14 h-14 bg-purple-50 rounded-2xl flex items-center justify-center text-purple-500 group-hover:bg-purple-500 group-hover:text-white transition-all">
                  <TrendingUp size={28} />
                </div>
                <div>
                  <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">Daily Velocity</p>
                  <p className="text-2xl font-black text-gray-900">£{calculateDailySales().toLocaleString()}</p>
                </div>
              </div>
              <div className="bg-white p-8 rounded-[2.5rem] shadow-xl border border-pink-50 flex items-center gap-6 group hover:-translate-y-1 transition-all">
                <div className="w-14 h-14 bg-blue-50 rounded-2xl flex items-center justify-center text-blue-500 group-hover:bg-blue-500 group-hover:text-white transition-all">
                  <ShoppingBag size={28} />
                </div>
                <div>
                  <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">Total Assets</p>
                  <p className="text-2xl font-black text-gray-900">{products.length}</p>
                </div>
              </div>
              <div className="bg-white p-8 rounded-[2.5rem] shadow-xl border border-pink-50 flex items-center gap-6 group hover:-translate-y-1 transition-all">
                <div className="w-14 h-14 bg-green-50 rounded-2xl flex items-center justify-center text-green-500 group-hover:bg-green-500 group-hover:text-white transition-all">
                  <Users size={28} />
                </div>
                <div>
                  <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">Total Patrons</p>
                  <p className="text-2xl font-black text-gray-900">{users.length}</p>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
              {/* Product Performance */}
              <div className="bg-white rounded-[2.5rem] shadow-2xl border border-pink-50 p-12">
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-16 gap-4 text-left">
                  <div>
                    <div className="flex items-center gap-2 mb-2">
                      <Award size={20} className="text-pink-500" />
                      <h2 className="text-2xl font-black text-gray-900 italic">Product Performance</h2>
                    </div>
                    <p className="text-gray-400 text-xs font-bold uppercase tracking-widest">Master Analysis: Most Sold Acquisitions</p>
                  </div>
                  <div className="bg-gray-50 px-6 py-3 rounded-full border border-pink-50 text-[10px] font-black text-pink-500 uppercase tracking-widest">
                    Live Market Feed
                  </div>
                </div>

                <div className="relative pt-10 text-left">
                  <div className="space-y-12">
                    {getTopProducts().length > 0 ? (
                      getTopProducts().map((product, idx) => (
                        <div key={idx} className="group">
                          <div className="flex justify-between items-end mb-4">
                            <div className="flex items-center gap-4">
                              <span className="w-8 h-8 rounded-full bg-gray-900 text-white flex items-center justify-center text-[10px] font-black italic shadow-lg">
                                {idx + 1}
                              </span>
                              <span className="font-black text-gray-900 italic text-lg">{product.name}</span>
                            </div>
                            <span className="text-pink-500 font-black text-lg italic tracking-tight">{product.sales} Sales</span>
                          </div>
                          <div className="h-4 bg-gray-50 rounded-full overflow-hidden shadow-inner border border-gray-100 p-0.5">
                            <div 
                              className="h-full rounded-full bg-gradient-to-r from-pink-400 to-purple-600 shadow-lg shadow-pink-200 transition-all duration-1000 ease-out flex items-center justify-end px-4 relative group-hover:brightness-110"
                              style={{ width: `${(product.sales / Math.max(...getTopProducts().map(p => p.sales), 1)) * 100}%` }}
                            >
                            </div>
                          </div>
                        </div>
                      ))
                    ) : (
                      <p className="text-center py-10 text-gray-300 font-bold italic">Awaiting Market Performance Data...</p>
                    )}
                  </div>
                </div>

                <div className="mt-20 pt-10 border-t border-pink-50 flex flex-col md:flex-row justify-between items-center gap-6">
                  <div className="flex items-center gap-3">
                     <div className="w-3 h-3 rounded-full bg-green-500 animate-pulse"></div>
                     <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest text-left">Database Synced via JWT Secure Link</span>
                  </div>
                  <button 
                    onClick={() => setActiveTab('products')}
                    className="flex items-center gap-3 text-pink-600 font-black uppercase tracking-widest text-[10px] hover:translate-x-2 transition-transform"
                  >
                    Manage Full Inventory <ArrowRight size={14} />
                  </button>
                </div>
              </div>

              {/* Recent Orders */}
              <div className="bg-white rounded-[2.5rem] shadow-2xl border border-pink-50 p-12">
                <div className="flex items-center justify-between mb-12">
                  <div>
                    <div className="flex items-center gap-2 mb-2">
                      <Hash size={20} className="text-pink-500" />
                      <h2 className="text-2xl font-black text-gray-900 italic">Recent Orders</h2>
                    </div>
                    <p className="text-gray-400 text-xs font-bold uppercase tracking-widest">Latest Transactions</p>
                  </div>
                  <button 
                    onClick={() => setActiveTab('orders')}
                    className="flex items-center gap-3 text-pink-600 font-black uppercase tracking-widest text-[10px] hover:translate-x-2 transition-transform"
                  >
                    View All <ArrowRight size={14} />
                  </button>
                </div>

                <div className="space-y-6">
                  {orders.length === 0 ? (
                    <div className="text-center py-20">
                      <div className="w-24 h-24 bg-pink-50 rounded-full flex items-center justify-center mx-auto mb-8">
                        <ShoppingBag size={32} className="text-pink-200" />
                      </div>
                      <p className="text-gray-400 font-bold mb-8 italic">No transactions found in ledger.</p>
                    </div>
                  ) : (
                    orders.slice(0, 5).map((order: any) => (
                      <div 
                        key={order.id} 
                        onClick={() => handleViewOrderDetails(order)}
                        className="flex items-center justify-between p-6 bg-gray-50 rounded-3xl hover:bg-pink-50 hover:shadow-xl transition-all group border border-pink-50 cursor-pointer"
                      >
                        <div className="flex items-center gap-4">
                          <div className="w-12 h-12 bg-white rounded-2xl flex items-center justify-center text-gray-900 border border-pink-100 shadow-inner group-hover:bg-pink-500 group-hover:text-white transition-all">
                            <Hash size={16} />
                          </div>
                          <div>
                            <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">Order #{order.id.slice(-6)}</p>
                            <p className="text-sm font-black text-gray-900">{order.customer_name}</p>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="text-lg font-black text-gray-900">£{calculateOrderTotal(order).toFixed(2)}</p>
                          <div className="flex items-center justify-end gap-2">
                            <span className={`text-[8px] font-black px-3 py-1 rounded-full border uppercase tracking-widest ${
                              getEffectiveOrderStatus(order) === 'Pending' ? 'bg-yellow-50 text-yellow-600 border-yellow-100' :
                              getEffectiveOrderStatus(order) === 'Processing' ? 'bg-blue-50 text-blue-600 border-blue-100' :
                              getEffectiveOrderStatus(order) === 'Shipped' ? 'bg-purple-50 text-purple-600 border-purple-100' :
                              getEffectiveOrderStatus(order) === 'Delivered' ? 'bg-green-50 text-green-600 border-green-100' :
                              getEffectiveOrderStatus(order) === 'Cancelled' ? 'bg-red-50 text-red-600 border-red-100' :
                              'bg-blue-50 text-blue-600 border-blue-100'
                            }`}>
                              {getEffectiveOrderStatus(order)}
                            </span>
                            {isStatusOverridden(order.id) && (
                              <div className="w-1.5 h-1.5 bg-orange-500 rounded-full animate-pulse" title="Status updated locally (pending backend sync)"></div>
                            )}
                          </div>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'products' && (
          <div className="bg-white rounded-[2.5rem] shadow-2xl border border-pink-50 overflow-hidden animate-in fade-in slide-in-from-bottom-4 duration-500">
            <div className="p-10 border-b flex flex-col sm:flex-row justify-between items-center bg-gray-50/20 gap-6 text-left">
              <div>
                <h2 className="text-2xl font-black text-gray-900 italic">Catalog Management</h2>
                <p className="text-gray-400 text-xs font-bold">{filteredProducts.length} Products {filteredProducts.length !== products.length && `(${products.length} total)`}</p>
              </div>
              <div className="flex flex-col sm:flex-row gap-4 w-full sm:w-auto">
                <input
                  type="text"
                  placeholder="Search products..."
                  value={productSearch}
                  onChange={(e) => setProductSearch(e.target.value)}
                  className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500 outline-none"
                />
                <button 
                  onClick={() => setShowAddModal(true)}
                  className="bg-gray-900 hover:bg-pink-600 text-white px-8 py-4 rounded-xl flex items-center gap-3 font-black text-xs uppercase tracking-widest shadow-xl transition-all"
                >
                  <Plus size={18} /> Add New Asset
                </button>
              </div>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead className="bg-gray-50/50 text-gray-400 text-[10px] uppercase tracking-[0.2em] font-black">
                  <tr>
                    <th className="px-10 py-6">Product</th>
                    <th className="px-10 py-6">Category</th>
                    <th className="px-10 py-6">Price</th>
                    <th className="px-10 py-6">Stock</th>
                    <th className="px-10 py-6 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-pink-50">
                  {paginatedProducts.map((p) => (
                    <tr key={p.id} className="hover:bg-pink-50/10 transition-colors group">
                      <td className="px-10 py-6">
                        <div className="flex items-center gap-4">
                          <FastImage 
                            src={p.image_url || 'https://picsum.photos/200/200'} 
                            alt={p.name}
                            className="w-12 h-12 rounded-lg object-cover shadow-md"
                          />
                          <span className="font-black text-gray-900">{p.name}</span>
                        </div>
                      </td>
                      <td className="px-10 py-6">
                        <span className="text-[10px] font-black text-pink-600 uppercase tracking-widest">{p.category}</span>
                      </td>
                      <td className="px-10 py-6 font-bold text-gray-900">£{(p.price || 0).toFixed(2)}</td>
                      <td className="px-10 py-6 font-bold text-gray-500">{p.stock} Units</td>
                      <td className="px-10 py-6 text-right">
                        <div className="flex justify-end gap-2">
                          <button onClick={() => deleteProduct(p.id)} className="p-2 text-gray-400 hover:text-red-600 transition-colors"><Trash2 size={18} /></button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            {Math.ceil(filteredProducts.length / itemsPerPage) > 1 && (
              <div className="p-6 border-t">
                <Pagination
                  currentPage={productsPage}
                  totalPages={Math.ceil(filteredProducts.length / itemsPerPage)}
                  onPageChange={setProductsPage}
                  itemsPerPage={itemsPerPage}
                  totalItems={filteredProducts.length}
                />
              </div>
            )}
          </div>
        )}

        {activeTab === 'orders' && (
          <div className="bg-white rounded-[2.5rem] shadow-2xl border border-pink-50 overflow-hidden animate-in fade-in slide-in-from-bottom-4 duration-500">
            <div className="p-10 border-b bg-gray-50/20 text-left flex flex-col sm:flex-row justify-between items-center gap-6">
              <div>
                <h2 className="text-2xl font-black text-gray-900 italic">Order Ledger</h2>
                <p className="text-gray-400 text-xs font-bold">{filteredOrders.length} Orders {filteredOrders.length !== orders.length && `(${orders.length} total)`}</p>
              </div>
              <input
                type="text"
                placeholder="Search orders..."
                value={orderSearch}
                onChange={(e) => setOrderSearch(e.target.value)}
                className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500 outline-none"
              />
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead className="bg-gray-50/50 text-gray-400 text-[10px] uppercase tracking-[0.2em] font-black">
                  <tr>
                    <th className="px-10 py-6">Order ID</th>
                    <th className="px-10 py-6">Customer</th>
                    <th className="px-10 py-6">Status</th>
                    <th className="px-10 py-6">Total</th>
                    <th className="px-10 py-6 text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-pink-50">
                  {paginatedOrders.map((o) => (
                    <tr key={o.id} className="hover:bg-pink-50/10 transition-colors">
                      <td className="px-10 py-6 font-black text-gray-900">#{o.id.slice(-6)}</td>
                      <td className="px-10 py-6">
                        <div className="text-sm font-bold text-gray-800">{o.customer_name}</div>
                        <div className="text-[10px] text-gray-400">{o.customer_email}</div>
                      </td>
                      <td className="px-10 py-6">
                        <div className="flex items-center gap-2">
                          <span className={`text-[10px] font-black px-3 py-1 rounded-full border uppercase tracking-widest ${
                            getEffectiveOrderStatus(o) === 'Pending' ? 'bg-yellow-50 text-yellow-600 border-yellow-100' :
                            getEffectiveOrderStatus(o) === 'Processing' ? 'bg-blue-50 text-blue-600 border-blue-100' :
                            getEffectiveOrderStatus(o) === 'Shipped' ? 'bg-purple-50 text-purple-600 border-purple-100' :
                            getEffectiveOrderStatus(o) === 'Delivered' ? 'bg-green-50 text-green-600 border-green-100' :
                            getEffectiveOrderStatus(o) === 'Cancelled' ? 'bg-red-50 text-red-600 border-red-100' :
                            'bg-blue-50 text-blue-600 border-blue-100'
                          }`}>
                            {getEffectiveOrderStatus(o)}
                          </span>
                          {isStatusOverridden(o.id) && (
                            <div className="w-2 h-2 bg-orange-500 rounded-full animate-pulse" title="Status updated locally (pending backend sync)"></div>
                          )}
                        </div>
                      </td>
                      <td className="px-10 py-6 font-black text-gray-900">£{calculateOrderTotal(o).toFixed(2)}</td>
                      <td className="px-10 py-6 text-right">
                        <button 
                          onClick={() => handleViewOrderDetails(o)}
                          className="text-pink-600 text-[10px] font-black uppercase tracking-widest hover:underline flex items-center gap-1 ml-auto"
                        >
                          View Details <ArrowRight size={12} />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            {Math.ceil(filteredOrders.length / itemsPerPage) > 1 && (
              <div className="p-6 border-t">
                <Pagination
                  currentPage={ordersPage}
                  totalPages={Math.ceil(filteredOrders.length / itemsPerPage)}
                  onPageChange={setOrdersPage}
                  itemsPerPage={itemsPerPage}
                  totalItems={filteredOrders.length}
                />
              </div>
            )}
          </div>
        )}

        {activeTab === 'users' && (
          <div className="bg-white rounded-[2.5rem] shadow-2xl border border-pink-50 overflow-hidden animate-in fade-in slide-in-from-bottom-4 duration-500">
            <div className="p-10 border-b bg-gray-50/20 text-left flex flex-col sm:flex-row justify-between items-center gap-6">
              <div>
                <h2 className="text-2xl font-black text-gray-900 italic">User Directory</h2>
                <p className="text-gray-400 text-xs font-bold">{filteredUsers.length} Authorized Patrons {filteredUsers.length !== users.length && `(${users.length} total)`}</p>
              </div>
              <input
                type="text"
                placeholder="Search users..."
                value={userSearch}
                onChange={(e) => setUserSearch(e.target.value)}
                className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500 outline-none"
              />
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead className="bg-gray-50/50 text-gray-400 text-[10px] uppercase tracking-[0.2em] font-black">
                  <tr>
                    <th className="px-10 py-6">Identity</th>
                    <th className="px-10 py-6">Phone</th>
                    <th className="px-10 py-6">Role</th>
                    <th className="px-10 py-6 text-right">Access</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-pink-50">
                  {paginatedUsers.length > 0 ? paginatedUsers.map((u) => (
                    <tr key={u.id} className="hover:bg-pink-50/10 transition-colors">
                      <td className="px-10 py-6">
                        <div className="flex items-center gap-4">
                          <div className="w-10 h-10 bg-pink-50 text-pink-500 rounded-full flex items-center justify-center font-black italic">
                            {u.name?.charAt(0) || 'P'}
                          </div>
                          <div>
                            <div className="font-black text-gray-900">{u.name || 'Anonymous Patron'}</div>
                            <div className="text-[10px] text-gray-400">{u.email}</div>
                          </div>
                        </div>
                      </td>
                      <td className="px-10 py-6 font-bold text-gray-500 text-sm">
                        {u.phone_number || 'No contact provided'}
                      </td>
                      <td className="px-10 py-6">
                        <div className="flex items-center gap-2">
                          <Shield size={12} className={u.role?.toUpperCase() === 'ADMIN' ? 'text-pink-500' : 'text-gray-300'} />
                          <span className={`text-[10px] font-black uppercase tracking-widest ${u.role?.toUpperCase() === 'ADMIN' ? 'text-pink-600' : 'text-gray-400'}`}>
                            {u.role || 'User'}
                          </span>
                        </div>
                      </td>
                      <td className="px-10 py-6 text-right">
                        <button 
                          onClick={() => deleteUser(u.id)}
                          disabled={u.email === 'admin@batluxe.com'}
                          className="p-2 text-gray-300 hover:text-red-600 transition-colors disabled:opacity-20"
                        >
                          <Trash2 size={18} />
                        </button>
                      </td>
                    </tr>
                  )) : (
                    <tr>
                      <td colSpan={4} className="px-10 py-20 text-center text-gray-300 italic font-bold">
                        {userSearch ? 'No users found matching your search.' : 'User directory synchronization pending or insufficient permissions.'}
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
            {Math.ceil(filteredUsers.length / itemsPerPage) > 1 && (
              <div className="p-6 border-t">
                <Pagination
                  currentPage={usersPage}
                  totalPages={Math.ceil(filteredUsers.length / itemsPerPage)}
                  onPageChange={setUsersPage}
                  itemsPerPage={itemsPerPage}
                  totalItems={filteredUsers.length}
                />
              </div>
            )}
          </div>
        )}
      </div>

      {/* Add Product Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-6">
          <div className="absolute inset-0 bg-gray-900/40 backdrop-blur-sm" onClick={() => setShowAddModal(false)}></div>
          <div className="relative w-full max-w-2xl bg-white rounded-[2rem] shadow-2xl overflow-hidden border border-white/20">
            <div className="p-8 border-b flex justify-between items-center bg-gray-50/50">
              <h2 className="text-2xl font-black text-gray-900 italic">Add New Product</h2>
              <button onClick={() => setShowAddModal(false)} className="text-gray-400 hover:text-pink-600 transition-colors"><X size={24} /></button>
            </div>
            <form onSubmit={handleAddProduct} className="p-8 space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2 text-left">
                  <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Name</label>
                  <input 
                    type="text" required
                    className="w-full px-4 py-3 bg-gray-50 rounded-xl border-none focus:ring-2 focus:ring-pink-500 font-bold text-gray-900 placeholder:text-gray-300"
                    value={newProduct.name}
                    onChange={e => setNewProduct({...newProduct, name: e.target.value})}
                  />
                </div>
                <div className="space-y-2 text-left">
                  <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Category</label>
                  <select 
                    className="w-full px-4 py-3 bg-gray-50 rounded-xl border-none focus:ring-2 focus:ring-pink-500 font-bold text-xs uppercase text-gray-900"
                    value={newProduct.category}
                    onChange={e => setNewProduct({...newProduct, category: e.target.value})}
                  >
                    <option>Skincare</option>
                    <option>Makeup</option>
                    <option>Fragrance</option>
                    <option>Accessories</option>
                    <option>Nails</option>
                    <option>Eye Pencil</option>
                    <option>Lip Gloss</option>
                    <option>Lip Liner</option>
                  </select>
                </div>
                <div className="space-y-2 text-left">
                  <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Price (GBP)</label>
                  <input 
                    type="number" step="0.01" required
                    className="w-full px-4 py-3 bg-gray-50 rounded-xl border-none focus:ring-2 focus:ring-pink-500 font-bold text-gray-900 placeholder:text-gray-300"
                    value={newProduct.price}
                    onChange={e => setNewProduct({...newProduct, price: parseFloat(e.target.value)})}
                  />
                </div>
                <div className="space-y-2 text-left">
                  <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Stock</label>
                  <input 
                    type="number" required
                    className="w-full px-4 py-3 bg-gray-50 rounded-xl border-none focus:ring-2 focus:ring-pink-500 font-bold text-gray-900 placeholder:text-gray-300"
                    value={newProduct.stock}
                    onChange={e => setNewProduct({...newProduct, stock: parseInt(e.target.value)})}
                  />
                </div>
              </div>
              <div className="space-y-2 text-left">
                <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Description</label>
                <textarea 
                  required
                  className="w-full px-4 py-3 bg-gray-50 rounded-xl border-none focus:ring-2 focus:ring-pink-500 font-bold min-h-[100px] text-gray-900 placeholder:text-gray-300"
                  value={newProduct.description}
                  onChange={e => setNewProduct({...newProduct, description: e.target.value})}
                />
              </div>
              <div className="space-y-2 text-left">
                <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Product Image</label>
                <div className="flex items-center gap-4">
                  <label className="flex-1 flex items-center justify-center gap-3 px-4 py-3 bg-pink-50 text-pink-600 rounded-xl cursor-pointer hover:bg-pink-100 transition-all font-black uppercase text-[10px] border-2 border-dashed border-pink-200">
                    <Upload size={16} /> {selectedFile ? selectedFile.name : 'Upload Image File'}
                    <input 
                      type="file" 
                      className="hidden" 
                      accept="image/*"
                      onChange={e => setSelectedFile(e.target.files ? e.target.files[0] : null)}
                    />
                  </label>
                </div>
              </div>
              <button 
                type="submit" disabled={submitting}
                className="w-full bg-gray-900 hover:bg-pink-600 text-white py-4 rounded-xl font-black text-sm uppercase tracking-widest shadow-xl transition-all flex items-center justify-center gap-2"
              >
                {submitting ? <Loader2 className="animate-spin" /> : 'Create Product'}
              </button>
            </form>
          </div>
        </div>
      )}

      {/* Order Details Modal */}
      {viewingOrder && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-6 animate-in fade-in duration-300">
          <div className="absolute inset-0 bg-gray-900/60 backdrop-blur-md" onClick={() => setViewingOrder(null)}></div>
          <div className="relative w-full max-w-4xl bg-white rounded-[2.5rem] shadow-2xl overflow-hidden border border-white/20 flex flex-col max-h-[90vh]">
            <div className="p-10 border-b flex justify-between items-center bg-gray-900 text-white">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-pink-500 rounded-2xl flex items-center justify-center shadow-lg">
                   <ShoppingBag size={24} />
                </div>
                <div className="text-left">
                  <h2 className="text-2xl font-black italic">Order #{viewingOrder.id}</h2>
                  <p className="text-pink-300 text-[10px] font-black uppercase tracking-widest">Transaction Audit Ledger</p>
                </div>
              </div>
              <button onClick={() => setViewingOrder(null)} className="text-white/50 hover:text-white transition-colors bg-white/10 p-2 rounded-xl"><X size={24} /></button>
            </div>
            
            <div className="p-10 overflow-y-auto space-y-12">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
                {/* Customer Information */}
                <div className="space-y-6 text-left">
                   <div className="flex items-center gap-3 mb-2">
                     <User size={18} className="text-pink-500" />
                     <h3 className="text-xs font-black uppercase tracking-[0.2em] text-gray-400">Customer Identity</h3>
                   </div>
                   <div className="bg-gray-50 p-6 rounded-3xl space-y-4 border border-pink-50">
                      <div>
                        <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">Full Name</p>
                        <p className="font-black text-gray-900">{viewingOrder.customer_name}</p>
                      </div>
                      <div className="flex items-center gap-2">
                        <Mail size={14} className="text-gray-300" />
                        <p className="text-sm font-bold text-gray-600">{viewingOrder.customer_email}</p>
                      </div>
                      {viewingOrder.customer_phone && (
                        <div>
                          <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">Phone</p>
                          <p className="text-sm font-bold text-gray-600">{viewingOrder.customer_phone}</p>
                        </div>
                      )}
                   </div>
                </div>

                {/* Shipping Address */}
                <div className="space-y-6 text-left">
                   <div className="flex items-center gap-3 mb-2">
                     <Package size={18} className="text-pink-500" />
                     <h3 className="text-xs font-black uppercase tracking-[0.2em] text-gray-400">Shipping Address</h3>
                   </div>
                   <div className="bg-gray-50 p-6 rounded-3xl space-y-4 border border-pink-50">
                      {viewingOrder.shipping_address ? (
                        <>
                          <div>
                            <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">Street Address</p>
                            <p className="font-black text-gray-900">{viewingOrder.shipping_address.street}</p>
                          </div>
                          <div className="grid grid-cols-2 gap-4">
                            <div>
                              <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">City</p>
                              <p className="text-sm font-bold text-gray-600">{viewingOrder.shipping_address.city}</p>
                            </div>
                            <div>
                              <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">Postal Code</p>
                              <p className="text-sm font-bold text-gray-600">{viewingOrder.shipping_address.postal_code}</p>
                            </div>
                          </div>
                          <div className="grid grid-cols-2 gap-4">
                            <div>
                              <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">State/Region</p>
                              <p className="text-sm font-bold text-gray-600">{viewingOrder.shipping_address.state}</p>
                            </div>
                            <div>
                              <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">Country</p>
                              <p className="text-sm font-bold text-gray-600">{viewingOrder.shipping_address.country}</p>
                            </div>
                          </div>
                        </>
                      ) : (
                        <div className="text-center py-4">
                          <p className="text-red-500 font-bold text-sm">⚠️ No shipping address available</p>
                          <p className="text-gray-400 text-xs mt-1">This order may be missing shipping information</p>
                          <details className="mt-2 text-left">
                            <summary className="text-xs text-gray-500 cursor-pointer">Debug Info</summary>
                            <pre className="text-xs text-gray-400 mt-1 bg-gray-100 p-2 rounded overflow-auto">
                              {JSON.stringify({
                                orderId: viewingOrder.id,
                                hasShippingAddress: !!viewingOrder.shipping_address,
                                availableFields: Object.keys(viewingOrder).filter(key => 
                                  key.toLowerCase().includes('address') || 
                                  key.toLowerCase().includes('shipping') ||
                                  key.toLowerCase().includes('delivery')
                                )
                              }, null, 2)}
                            </pre>
                          </details>
                        </div>
                      )}
                   </div>
                </div>
              </div>

              <div className="grid grid-cols-1 gap-10">
                {/* Status & Timing */}
                <div className="space-y-6 text-left">
                   <div className="flex items-center gap-3 mb-2">
                     <Info size={18} className="text-pink-500" />
                     <h3 className="text-xs font-black uppercase tracking-[0.2em] text-gray-400">Status & Timing</h3>
                   </div>
                   <div className="bg-gray-50 p-6 rounded-3xl space-y-4 border border-pink-50">
                      <div className="flex justify-between items-center">
                        <div className="text-left">
                          <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">Current State</p>
                          <div className="flex items-center gap-2">
                            <span className={`text-[10px] font-black px-4 py-1.5 rounded-full border uppercase tracking-widest shadow-sm ${
                              getEffectiveOrderStatus(viewingOrder) === 'Pending' ? 'bg-yellow-50 text-yellow-600 border-yellow-100' :
                              getEffectiveOrderStatus(viewingOrder) === 'Processing' ? 'bg-blue-50 text-blue-600 border-blue-100' :
                              getEffectiveOrderStatus(viewingOrder) === 'Shipped' ? 'bg-purple-50 text-purple-600 border-purple-100' :
                              getEffectiveOrderStatus(viewingOrder) === 'Delivered' ? 'bg-green-50 text-green-600 border-green-100' :
                              getEffectiveOrderStatus(viewingOrder) === 'Cancelled' ? 'bg-red-50 text-red-600 border-red-100' :
                              'bg-blue-50 text-blue-600 border-blue-100'
                            }`}>
                              {getEffectiveOrderStatus(viewingOrder)}
                            </span>
                            {isStatusOverridden(viewingOrder.id) && (
                              <div className="flex items-center gap-1">
                                <div className="w-2 h-2 bg-orange-500 rounded-full animate-pulse"></div>
                                <span className="text-[8px] font-black text-orange-500 uppercase tracking-widest">Local Update</span>
                              </div>
                            )}
                          </div>
                        </div>
                        <div className="text-right">
                           <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">Acquisition Date</p>
                           <p className="text-xs font-bold text-gray-900 flex items-center gap-2 justify-end">
                              <Calendar size={12} className="text-pink-500" />
                              {new Date(viewingOrder.created_at || Date.now()).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })}
                           </p>
                        </div>
                      </div>
                   </div>
                </div>
              </div>

              {/* Line Items */}
              <div className="space-y-6 text-left">
                 <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3 text-left">
                      <FileText size={18} className="text-pink-500" />
                      <h3 className="text-xs font-black uppercase tracking-[0.2em] text-gray-400">Inventory Assets ({viewingOrder.items_count})</h3>
                    </div>
                 </div>

                 <div className="bg-white rounded-3xl border border-pink-50 shadow-inner overflow-hidden">
                    {loadingOrderDetails ? (
                      <div className="p-10 flex flex-col items-center justify-center">
                        <Loader2 className="w-8 h-8 text-pink-500 animate-spin mb-3" />
                        <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Retrieving Line Items...</p>
                      </div>
                    ) : orderItems.length > 0 ? (
                      <table className="w-full text-left">
                        <thead className="bg-gray-50 text-[10px] font-black text-gray-400 uppercase tracking-widest">
                          <tr>
                            <th className="px-8 py-5">Product Name</th>
                            <th className="px-8 py-5 text-center">Qty</th>
                            <th className="px-8 py-5 text-right">Value</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-pink-50">
                          {orderItems.map((item, idx) => (
                            <tr key={idx} className="hover:bg-pink-50/10 transition-colors">
                              <td className="px-8 py-5 font-bold text-gray-900 italic">{item.product_name || item.name || 'Bespoke Asset'}</td>
                              <td className="px-8 py-5 text-center font-black text-gray-400">{item.quantity}</td>
                              <td className="px-8 py-5 text-right font-black text-gray-900">£{((item.price || 0) * (item.quantity || 1)).toFixed(2)}</td>
                            </tr>
                          ))}
                          {orderItems.length > 0 && (
                            <>
                              <tr className="border-t-2 border-pink-100">
                                <td className="px-8 py-4 font-bold text-gray-600 italic" colSpan={2}>Subtotal</td>
                                <td className="px-8 py-4 text-right font-black text-gray-900">
                                  £{orderItems.reduce((sum, item) => {
                                    const price = item.price || 0;
                                    const quantity = item.quantity || 1;
                                    return sum + (price * quantity);
                                  }, 0).toFixed(2)}
                                </td>
                              </tr>
                              <tr>
                                <td className="px-8 py-4 font-bold text-gray-600 italic" colSpan={2}>Shipping</td>
                                <td className="px-8 py-4 text-right font-black text-gray-900">
                                  £{(viewingOrder?.shipping_fee || 0).toFixed(2)}
                                </td>
                              </tr>
                              <tr className="border-t-2 border-pink-200 bg-pink-50">
                                <td className="px-8 py-5 font-black text-gray-900 uppercase text-xs tracking-widest" colSpan={2}>Total</td>
                                <td className="px-8 py-5 text-right font-black text-pink-600 text-lg">
                                  £{calculateOrderTotal(viewingOrder).toFixed(2)}
                                </td>
                              </tr>
                            </>
                          )}
                        </tbody>
                      </table>
                    ) : (
                      <div className="p-10 text-center text-gray-300 italic font-medium">
                        Detailed item breakdown not available for this legacy record.
                      </div>
                    )}
                 </div>
              </div>

              {/* Total Summary Card */}
              <div className="bg-gray-900 rounded-[2rem] p-8 text-white flex flex-col md:flex-row justify-between items-center gap-6 shadow-2xl">
                 <div className="flex items-center gap-6">
                    <div className="w-16 h-16 bg-white/10 rounded-2xl flex items-center justify-center text-pink-500 shadow-inner">
                       <DollarSign size={32} />
                    </div>
                    <div className="text-left">
                       <p className="text-[10px] font-black text-pink-300 uppercase tracking-widest mb-1">Total Transaction Volume</p>
                       <p className="text-4xl font-black italic">£{calculateOrderTotal(viewingOrder).toFixed(2)}</p>
                    </div>
                 </div>
                 <button 
                   onClick={() => setShowStatusModal(true)}
                   className="bg-pink-600 hover:bg-pink-500 text-white px-10 py-4 rounded-xl font-black text-xs uppercase tracking-widest shadow-xl transition-all active:scale-95"
                 >
                    Update Dispatch State
                 </button>
              </div>
            </div>
            
            <div className="p-8 bg-gray-50 border-t flex justify-center">
               <p className="text-[10px] font-black text-gray-300 uppercase tracking-[0.4em]">BatLuxe Beauty Administrative Protocol Secure</p>
            </div>
          </div>
        </div>
      )}

      {/* Status Update Modal */}
      {showStatusModal && viewingOrder && (
        <div className="fixed inset-0 z-[110] flex items-center justify-center p-6 animate-in fade-in duration-300">
          <div className="absolute inset-0 bg-gray-900/60 backdrop-blur-md" onClick={() => setShowStatusModal(false)}></div>
          <div className="relative w-full max-w-md bg-white rounded-[2rem] shadow-2xl overflow-hidden border border-white/20">
            <div className="p-8 border-b flex justify-between items-center bg-gray-900 text-white">
              <div>
                <h2 className="text-xl font-black italic">Update Status</h2>
                <p className="text-pink-300 text-[10px] font-black uppercase tracking-widest">Order #{viewingOrder.id.slice(-6)}</p>
              </div>
              <button onClick={() => setShowStatusModal(false)} className="text-white/50 hover:text-white transition-colors bg-white/10 p-2 rounded-xl">
                <X size={20} />
              </button>
            </div>
            
            <div className="p-8 space-y-6">
              <div className="text-center">
                <p className="text-sm font-bold text-gray-600 mb-2">Current Status</p>
                <span className={`inline-block text-[10px] font-black px-4 py-2 rounded-full border uppercase tracking-widest ${
                  getEffectiveOrderStatus(viewingOrder) === 'Pending' ? 'bg-yellow-50 text-yellow-600 border-yellow-100' :
                  getEffectiveOrderStatus(viewingOrder) === 'Processing' ? 'bg-blue-50 text-blue-600 border-blue-100' :
                  getEffectiveOrderStatus(viewingOrder) === 'Shipped' ? 'bg-purple-50 text-purple-600 border-purple-100' :
                  getEffectiveOrderStatus(viewingOrder) === 'Delivered' ? 'bg-green-50 text-green-600 border-green-100' :
                  getEffectiveOrderStatus(viewingOrder) === 'Cancelled' ? 'bg-red-50 text-red-600 border-red-100' :
                  'bg-blue-50 text-blue-600 border-blue-100'
                }`}>
                  {getEffectiveOrderStatus(viewingOrder)}
                </span>
              </div>

              <div>
                <p className="text-sm font-bold text-gray-600 mb-4">Select New Status</p>
                <div className="space-y-3">
                  {statusOptions.map((status) => (
                    <button
                      key={status.value}
                      onClick={() => updateOrderStatus(viewingOrder.id, status.value)}
                      disabled={updatingStatus || getEffectiveOrderStatus(viewingOrder) === status.value}
                      className={`w-full p-4 rounded-xl border-2 font-black text-sm uppercase tracking-widest transition-all text-left flex items-center justify-between ${
                        getEffectiveOrderStatus(viewingOrder) === status.value
                          ? 'border-gray-300 bg-gray-100 text-gray-400 cursor-not-allowed'
                          : `border-transparent ${status.color} hover:border-gray-300 hover:shadow-lg cursor-pointer`
                      }`}
                    >
                      <span>{status.label}</span>
                      {getEffectiveOrderStatus(viewingOrder) === status.value && (
                        <CheckCircle2 size={16} className="text-gray-400" />
                      )}
                    </button>
                  ))}
                </div>
              </div>

              {updatingStatus && (
                <div className="flex items-center justify-center gap-3 py-4">
                  <Loader2 className="w-5 h-5 text-pink-500 animate-spin" />
                  <span className="text-sm font-bold text-gray-600">Updating status...</span>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminDashboard;
