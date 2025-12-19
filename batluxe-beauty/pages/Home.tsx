
import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { ShoppingCart, Heart, Loader2, Check, ArrowRight } from 'lucide-react';
import api from '../services/api';
import { Product } from '../types';
import { useCart } from '../context/CartContext';
import { useWishlist } from '../context/WishlistContext';

const Home: React.FC = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const { addToCart } = useCart();
  const { toggleWishlist, isInWishlist } = useWishlist();

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
          
        setProducts(productsArray.slice(0, 8)); // Show a good variety on home
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

  return (
    <div className="flex flex-col animate-in fade-in duration-700">
      {/* Hero Section */}
      <section className="relative h-[85vh] flex items-center justify-center text-center overflow-hidden">
        <div 
          className="absolute inset-0 bg-cover bg-center transition-transform duration-1000 hover:scale-105"
          style={{ backgroundImage: `url('https://images.unsplash.com/photo-1522338242992-e1a54906a8da?q=80&w=2574&auto=format&fit=crop')` }}
        >
          <div className="absolute inset-0 bg-pink-900/10 backdrop-blur-[1px]"></div>
        </div>
        <div className="relative z-10 max-w-4xl px-4">
          <div className="bg-white/10 backdrop-blur-md p-10 md:p-16 rounded-[3rem] border border-white/20 shadow-2xl">
            <span className="text-white font-black tracking-[0.5em] uppercase text-xs mb-6 block drop-shadow-lg">Establishment 2025</span>
            <h1 className="text-6xl md:text-8xl font-black text-white drop-shadow-2xl mb-6 leading-tight italic tracking-tighter">
              Luxury Beauty, <span className="text-pink-300">Redefined</span>
            </h1>
            <p className="text-xl md:text-2xl text-white drop-shadow-lg mb-12 font-bold tracking-widest uppercase italic opacity-90">
              Glow in your own excellence
            </p>
            <div className="flex flex-col sm:flex-row gap-6 justify-center">
              <Link 
                to="/shop" 
                className="bg-white hover:bg-pink-50 text-pink-600 px-12 py-5 rounded-2xl text-xl font-black shadow-2xl transform transition-all hover:scale-105 active:scale-95 flex items-center justify-center gap-3"
              >
                Discover Collection <ArrowRight size={20} />
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Featured Products */}
      <section className="py-32 bg-[#FDF2F8]/30">
        <div className="container mx-auto px-4">
          <div className="text-center mb-24">
            <span className="text-pink-500 font-black tracking-[0.4em] uppercase text-[10px] mb-4 block">Curation Elite</span>
            <h2 className="text-5xl font-black text-gray-900 mb-6 italic tracking-tight">Featured Essentials</h2>
            <div className="w-24 h-2 bg-gradient-to-r from-pink-400 to-purple-400 mx-auto rounded-full shadow-lg"></div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-10">
            {loading ? (
              Array(4).fill(0).map((_, i) => (
                <div key={i} className="animate-pulse bg-white rounded-[2.5rem] p-4 h-[500px] shadow-sm"></div>
              ))
            ) : products.length > 0 ? (
              products.map((product) => (
                <div key={product.id} className="bg-white rounded-[2.5rem] overflow-hidden shadow-xl group hover:shadow-2xl transition-all border border-pink-50 flex flex-col relative text-left">
                  {/* Wishlist Button */}
                  <button 
                    onClick={() => toggleWishlist(product)}
                    className={`absolute top-6 right-6 z-10 w-12 h-12 flex items-center justify-center rounded-2xl backdrop-blur-md shadow-lg transition-all active:scale-90 border border-white/20 ${isInWishlist(product.id) ? 'bg-pink-500 text-white shadow-pink-200' : 'bg-white/80 text-gray-400 hover:text-pink-500'}`}
                  >
                    <Heart size={22} fill={isInWishlist(product.id) ? 'currentColor' : 'none'} />
                  </button>

                  <div className="relative h-80 overflow-hidden">
                    <img 
                      src={product.image_url || 'https://picsum.photos/400/400'} 
                      alt={product.name}
                      className="w-full h-full object-cover transform transition-transform duration-700 group-hover:scale-110"
                    />
                    <div className="absolute top-6 left-6">
                      <span className="bg-white/95 backdrop-blur-md text-pink-600 text-[10px] font-black px-5 py-2.5 rounded-full uppercase tracking-widest shadow-xl border border-pink-50">
                        {product.category || 'Beauty'}
                      </span>
                    </div>
                  </div>
                  <div className="p-10 flex flex-col flex-grow">
                    <h3 className="text-2xl font-black text-gray-900 mb-2 truncate italic tracking-tight">{product.name}</h3>
                    <p className="text-gray-400 text-sm mb-8 line-clamp-2 leading-relaxed font-medium italic">
                      {product.description || 'A masterpiece of aesthetic brilliance curated for the modern individual.'}
                    </p>
                    <div className="mt-auto">
                      <div className="flex items-center justify-between mb-8">
                        <span className="text-3xl font-black text-gray-900 tracking-tighter">£{(product.price || 0).toFixed(2)}</span>
                        <div className="flex items-center gap-2">
                           <div className="w-2 h-2 rounded-full bg-green-500 shadow-[0_0_8px_rgba(34,197,94,0.4)]"></div>
                           <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest">In Stock</span>
                        </div>
                      </div>
                      <button 
                        onClick={() => handleAddToCart(product)}
                        disabled={addingMap[product.id] || successMap[product.id]}
                        className={`w-full py-5 rounded-2xl font-black transition-all flex items-center justify-center gap-3 shadow-2xl active:scale-95 group-hover:translate-y-[-4px] transform ${
                          successMap[product.id] 
                          ? 'bg-green-500 text-white scale-105' 
                          : 'bg-gray-900 hover:bg-pink-600 text-white'
                        }`}
                      >
                        {addingMap[product.id] ? (
                          <Loader2 className="animate-spin" size={20} />
                        ) : successMap[product.id] ? (
                          <>
                            <Check size={20} /> Added
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
               <div className="col-span-full text-center py-32 text-gray-400 italic font-bold">
                 Curating our newest arrivals for your browsing...
               </div>
            )}
          </div>

          <div className="text-center mt-24">
            <Link 
              to="/shop" 
              className="inline-flex items-center gap-8 bg-pink-500 hover:bg-pink-600 text-white px-20 py-7 rounded-[2.5rem] font-black shadow-2xl transition-all hover:px-24 group italic"
            >
              Explore Full Catalog <ArrowRight size={28} className="transition-transform group-hover:translate-x-3" />
            </Link>
          </div>
        </div>
      </section>

      {/* Luxury Quote */}
      <section className="py-40 bg-gray-900 text-white overflow-hidden relative">
        <div className="absolute top-0 right-0 w-96 h-96 bg-pink-500/10 rounded-full blur-[120px] -mr-48 -mt-48"></div>
        <div className="container mx-auto px-4 relative z-10">
           <div className="max-w-4xl mx-auto text-center">
              <span className="text-pink-400 font-black uppercase tracking-[0.5em] text-xs mb-8 block">The BatLuxe Creed</span>
              <p className="text-4xl md:text-6xl font-black italic leading-tight mb-12 tracking-tighter">
                "True luxury is not just what you wear, it's how you feel in the quiet moments of your own beauty."
              </p>
              <div className="w-20 h-1 bg-pink-500 mx-auto rounded-full"></div>
           </div>
        </div>
      </section>
    </div>
  );
};

export default Home;
