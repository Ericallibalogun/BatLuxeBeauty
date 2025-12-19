
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
  const [wishlistLoading, setWishlistLoading] = useState<Record<string, boolean>>({});

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const response = await api.get('/products');
        const rawData = response.data;
        const productsArray = Array.isArray(rawData) 
          ? rawData 
          : (rawData?.products || rawData?.data || []);
          
        // Sort products by stock (higher stock = more popular) and take top 20
        const sortedProducts = productsArray
          .sort((a, b) => (b.stock || 0) - (a.stock || 0))
          .slice(0, 20);
        setProducts(sortedProducts);
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
            <h2 className="text-5xl font-black text-gray-900 mb-6 italic tracking-tight">Top Products</h2>
            <p className="text-gray-400 font-medium max-w-2xl mx-auto mb-8 italic">
              "Our most coveted selections, curated for the discerning aesthetic."
            </p>
            <div className="w-24 h-2 bg-gradient-to-r from-pink-400 to-purple-400 mx-auto rounded-full shadow-lg"></div>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
            {loading ? (
              Array(20).fill(0).map((_, i) => (
                <div key={i} className="animate-pulse bg-white rounded-2xl p-3 h-[320px] shadow-sm"></div>
              ))
            ) : products.length > 0 ? (
              products.map((product) => (
                <div key={product.id} className="bg-white rounded-2xl overflow-hidden shadow-lg group hover:shadow-xl transition-all border border-pink-50 flex flex-col relative text-left">
                  {/* Wishlist Button */}
                  <button 
                    onClick={() => handleToggleWishlist(product)}
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

                  <div className="relative h-48 overflow-hidden">
                    <img 
                      src={product.image_url || 'https://picsum.photos/400/400'} 
                      alt={product.name}
                      className="w-full h-full object-cover transform transition-transform duration-700 group-hover:scale-110"
                    />
                    <div className="absolute top-3 left-3">
                      <span className="bg-white/95 backdrop-blur-md text-pink-600 text-[8px] font-black px-3 py-1.5 rounded-full uppercase tracking-widest shadow-lg border border-pink-50">
                        {product.category || 'Beauty'}
                      </span>
                    </div>
                  </div>
                  <div className="p-4 flex flex-col flex-grow">
                    <h3 className="text-base font-black text-gray-900 mb-1 truncate italic">{product.name}</h3>
                    <p className="text-xs text-gray-400 mb-3 line-clamp-1 font-medium">
                      {product.description || 'Premium beauty product'}
                    </p>
                    <div className="mt-auto">
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-lg font-black text-gray-900">£{(product.price || 0).toFixed(2)}</span>
                      </div>
                      <div className="mb-3">
                        <div className="bg-green-50/50 text-green-700 text-[8px] py-1 px-2 rounded-full font-black uppercase tracking-widest border border-green-100/50 inline-block">
                          {product.stock} available
                        </div>
                      </div>
                      <button 
                        onClick={() => handleAddToCart(product)}
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
                            <Check size={14} /> Added
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
