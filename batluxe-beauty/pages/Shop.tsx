
import React, { useEffect, useState } from 'react';
import { Search, ShoppingCart, Heart, Filter, Loader2, Check } from 'lucide-react';
import api from '../services/api';
import { Product } from '../types';
import { useCart } from '../context/CartContext';
import { useWishlist } from '../context/WishlistContext';

const Shop: React.FC = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const { addToCart } = useCart();
  const { toggleWishlist, isInWishlist } = useWishlist();

  // State for button feedback
  const [addingMap, setAddingMap] = useState<Record<string, boolean>>({});
  const [successMap, setSuccessMap] = useState<Record<string, boolean>>({});

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

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-10">
          {loading ? (
            Array(8).fill(0).map((_, i) => (
              <div key={i} className="animate-pulse bg-white rounded-[2.5rem] h-[550px] shadow-sm"></div>
            ))
          ) : filteredProducts.length > 0 ? (
            filteredProducts.map((product) => (
              <div key={product.id} className="bg-white rounded-[2.5rem] overflow-hidden shadow-xl group hover:shadow-2xl transition-all border border-pink-50 flex flex-col relative">
                <button 
                  onClick={() => toggleWishlist(product)}
                  className={`absolute top-6 right-6 z-10 w-12 h-12 flex items-center justify-center rounded-2xl backdrop-blur-md shadow-lg transition-all active:scale-90 ${isInWishlist(product.id) ? 'bg-pink-500 text-white shadow-pink-200' : 'bg-white/80 text-gray-400 hover:text-pink-500'}`}
                >
                  <Heart size={22} fill={isInWishlist(product.id) ? 'currentColor' : 'none'} />
                </button>

                <div className="relative h-72 overflow-hidden">
                  <img 
                    src={product.image_url || 'https://picsum.photos/400/400'} 
                    alt={product.name}
                    className="w-full h-full object-cover transform transition-transform duration-700 group-hover:scale-110"
                  />
                  <div className="absolute top-6 left-6">
                    <span className="bg-white/95 backdrop-blur-md text-pink-600 text-[10px] font-black px-4 py-2 rounded-full uppercase tracking-widest shadow-xl">
                      {product.category || 'Beauty'}
                    </span>
                  </div>
                </div>
                <div className="p-10 flex flex-col flex-grow">
                  <h3 className="text-2xl font-black text-gray-900 mb-2 italic truncate">{product.name}</h3>
                  <p className="text-3xl font-black text-pink-500 mb-6">£{(product.price || 0).toFixed(2)}</p>
                  
                  <div className="border-t border-gray-50 pt-6 mb-8 h-20 overflow-hidden">
                    <p className="text-gray-400 text-sm font-medium line-clamp-2 leading-relaxed">{product.description}</p>
                  </div>

                  <div className="mt-auto">
                    <div className="bg-green-50/50 text-green-700 text-[10px] py-2 px-4 rounded-full mb-8 font-black uppercase tracking-widest border border-green-100/50 inline-block">
                      Limited Reserve ({product.stock} available)
                    </div>
                    <button 
                      onClick={() => handleAddToCart(product)}
                      disabled={addingMap[product.id] || successMap[product.id]}
                      className={`w-full py-5 rounded-2xl font-black transition-all flex items-center justify-center gap-3 shadow-2xl active:scale-95 transform ${
                        successMap[product.id] 
                        ? 'bg-green-500 text-white scale-105' 
                        : 'bg-gray-900 hover:bg-pink-600 text-white hover:translate-y-[-4px]'
                      }`}
                    >
                      {addingMap[product.id] ? (
                        <Loader2 className="animate-spin" size={20} />
                      ) : successMap[product.id] ? (
                        <>
                          <Check size={20} /> Added to Cart
                        </>
                      ) : (
                        <>
                          <ShoppingCart size={20} /> Add to Cart
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
