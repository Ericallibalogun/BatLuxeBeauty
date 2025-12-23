
import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, ShoppingCart, Heart, Filter, Loader2, Check } from 'lucide-react';
import api from '../services/api';
import { Product } from '../types';
import { useCart } from '../context/CartContext';
import { useWishlist } from '../context/WishlistContext';

const Shop: React.FC = () => {
  const navigate = useNavigate();
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const { addToCart } = useCart();
  const { toggleWishlist, isInWishlist } = useWishlist();

  // State for button feedback
  const [addingMap, setAddingMap] = useState<Record<string, boolean>>({});
  const [successMap, setSuccessMap] = useState<Record<string, boolean>>({});
  const [wishlistLoading, setWishlistLoading] = useState<Record<string, boolean>>({});

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const response = await api.get('/products');
        const rawData = response.data;
        const productsArray = Array.isArray(rawData) 
          ? rawData 
          : (rawData?.products || rawData?.data || []);
        setProducts(productsArray);
      } catch (err) {
        console.error("Error fetching products", err);
      } finally {
        setLoading(false);
      }
    };
    fetchProducts();
  }, []);

  const handleAddToCart = async (product: Product) => {
    setAddingMap(prev => ({ ...prev, [product.id]: true }));
    const success = await addToCart(product, 1);
    setAddingMap(prev => ({ ...prev, [product.id]: false }));
    
    if (success) {
      setSuccessMap(prev => ({ ...prev, [product.id]: true }));
      setTimeout(() => {
        setSuccessMap(prev => ({ ...prev, [product.id]: false }));
      }, 2000);
    }
  };

  const handleToggleWishlist = async (product: Product) => {
    setWishlistLoading(prev => ({ ...prev, [product.id]: true }));
    try {
      await toggleWishlist(product);
    } catch (error) {
      console.error('Error toggling wishlist:', error);
    }
    // Always clear loading state after a short delay
    setTimeout(() => {
      setWishlistLoading(prev => ({ ...prev, [product.id]: false }));
    }, 500);
  };

  const filteredProducts = products.filter(p => 
    p.name.toLowerCase().includes(search.toLowerCase()) || 
    p.category?.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-[#FDF2F8]/20 py-20">
      <div className="container mx-auto px-4">
        <div className="text-center mb-16">
          <span className="text-pink-500 font-black tracking-[0.4em] uppercase text-[10px] mb-4 block">The Collection</span>
          <h1 className="text-6xl font-black text-gray-900 mb-6 italic tracking-tight">Luxury Defined</h1>
          <p className="text-gray-400 font-medium max-w-2xl mx-auto">Discover our masterfully curated collection of high-end beauty essentials designed to elevate your aesthetic journey.</p>
        </div>

        {/* Search & Filters */}
        <div className="bg-white p-4 rounded-[2.5rem] shadow-2xl mb-16 flex flex-col lg:flex-row items-center gap-4 border border-pink-50">
          <div className="relative flex-1 w-full lg:w-auto">
            <Search className="absolute left-6 top-1/2 -translate-y-1/2 text-pink-400" size={24} />
            <input 
              type="text" 
              placeholder="Search assets..." 
              className="w-full pl-16 pr-6 py-6 bg-gray-50 border-none rounded-[2rem] focus:ring-2 focus:ring-pink-500 outline-none font-bold text-gray-900 shadow-inner placeholder:text-gray-300"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
          <div className="flex flex-col sm:flex-row gap-4 w-full lg:w-auto">
            <select className="px-10 py-6 bg-gray-50 border-none rounded-[2rem] focus:ring-2 focus:ring-pink-500 outline-none font-bold text-gray-900 shadow-inner appearance-none min-w-[200px]">
              <option>All Aesthetics</option>
              <option>Necklace</option>
              <option>Makeup</option>
              <option>Skincare</option>
            </select>
            <select className="px-10 py-6 bg-gray-50 border-none rounded-[2rem] focus:ring-2 focus:ring-pink-500 outline-none font-bold text-gray-900 shadow-inner appearance-none min-w-[200px]">
              <option>Curated Order</option>
              <option>Value: Low to High</option>
              <option>Value: High to Low</option>
            </select>
            <button className="bg-gray-900 text-white p-6 rounded-[2rem] hover:bg-pink-600 transition-all shadow-xl">
              <Filter size={24} />
            </button>
          </div>
        </div>

        <div className="flex justify-between items-center mb-12">
          <p className="text-gray-400 font-bold uppercase tracking-widest text-xs">Presenting {filteredProducts.length} Exclusive Creations</p>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
          {loading ? (
            Array(20).fill(0).map((_, i) => (
              <div key={i} className="animate-pulse bg-white rounded-2xl h-[320px] shadow-sm"></div>
            ))
          ) : filteredProducts.length > 0 ? (
            filteredProducts.map((product) => (
              <div key={product.id} className="bg-white rounded-2xl overflow-hidden shadow-lg group hover:shadow-xl hover:scale-[1.02] transition-all duration-300 border border-pink-50 flex flex-col relative cursor-pointer">
                <button 
                  onClick={(e) => {
                    e.stopPropagation();
                    handleToggleWishlist(product);
                  }}
                  disabled={wishlistLoading[product.id]}
                  className={`absolute top-3 right-3 z-10 w-9 h-9 flex items-center justify-center rounded-xl backdrop-blur-md shadow-md transition-all active:scale-90 border border-white/20 ${
                    wishlistLoading[product.id] 
                      ? 'bg-gray-200 text-gray-400' 
                      : isInWishlist(product.id) 
                        ? 'bg-pink-500 text-white shadow-pink-200' 
                        : 'bg-white/80 text-gray-400 hover:text-pink-500 hover:bg-pink-50'
                  }`}
                >
                  {wishlistLoading[product.id] ? (
                    <Loader2 size={14} className="animate-spin" />
                  ) : (
                    <Heart 
                      size={16} 
                      fill={isInWishlist(product.id) ? 'currentColor' : 'none'} 
                      className={isInWishlist(product.id) ? 'text-white' : 'text-gray-400'}
                    />
                  )}
                </button>

                <div 
                  className="relative h-48 overflow-hidden"
                  onClick={() => navigate(`/product/${product.id}`)}
                >
                  <img 
                    src={product.image_url || 'https://picsum.photos/400/400'} 
                    alt={product.name}
                    className="w-full h-full object-cover transform transition-transform duration-700 group-hover:scale-110"
                  />
                  <div className="absolute top-3 left-3">
                    <span className="bg-white/95 backdrop-blur-md text-pink-600 text-[8px] font-black px-3 py-1.5 rounded-full uppercase tracking-widest shadow-lg">
                      {product.category || 'Beauty'}
                    </span>
                  </div>
                  {/* Click indicator overlay */}
                  <div className="absolute inset-0 bg-black/0 group-hover:bg-black/5 transition-all duration-300 flex items-center justify-center">
                    <div className="opacity-0 group-hover:opacity-100 transition-opacity duration-300 bg-white/90 backdrop-blur-sm rounded-full px-4 py-2 text-xs font-bold text-gray-900">
                      View Details
                    </div>
                  </div>
                </div>
                <div 
                  className="p-4 flex flex-col flex-grow"
                  onClick={() => navigate(`/product/${product.id}`)}
                >
                  <h3 className="text-base font-black text-gray-900 mb-1 italic truncate group-hover:text-pink-600 transition-colors">{product.name}</h3>
                  <p className="text-lg font-black text-pink-500 mb-2">£{(product.price || 0).toFixed(2)}</p>
                  
                  <div className="mb-3">
                    <p className="text-xs text-gray-400 font-medium line-clamp-1">{product.description}</p>
                  </div>

                  <div className="mt-auto">
                    <div className="bg-green-50/50 text-green-700 text-[8px] py-1 px-2 rounded-full mb-3 font-black uppercase tracking-widest border border-green-100/50 inline-block">
                      {product.stock} available
                    </div>
                    <button 
                      onClick={(e) => {
                        e.stopPropagation();
                        handleAddToCart(product);
                      }}
                      disabled={addingMap[product.id] || successMap[product.id]}
                      className={`w-full py-3 rounded-xl font-black text-[10px] transition-all flex items-center justify-center gap-2 shadow-lg active:scale-95 ${
                        successMap[product.id] 
                        ? 'bg-green-500 text-white' 
                        : 'bg-gray-900 hover:bg-pink-600 text-white'
                      }`}
                    >
                      {addingMap[product.id] ? (
                        <Loader2 className="animate-spin" size={14} />
                      ) : successMap[product.id] ? (
                        <>
                          <Check size={14} /> Added to Cart
                        </>
                      ) : (
                        <>
                          <ShoppingCart size={14} /> Add to Cart
                        </>
                      )}
                    </button>
                  </div>
                </div>
              </div>
            ))
          ) : (
            <div className="col-span-full text-center py-40 bg-white rounded-[3rem] shadow-inner border border-pink-50">
              <p className="text-gray-300 font-bold text-2xl italic mb-4">No assets found matching your curation</p>
              <button onClick={() => setSearch('')} className="text-pink-500 font-black uppercase tracking-widest text-xs hover:underline">Clear Filters</button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Shop;
