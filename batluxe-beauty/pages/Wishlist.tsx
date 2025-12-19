
import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useWishlist } from '../context/WishlistContext';
import { useCart } from '../context/CartContext';
import { ShoppingCart, Heart, Trash2, ArrowRight, Loader2, Check, ShoppingBag } from 'lucide-react';
import { Product } from '../types';

const Wishlist: React.FC = () => {
  const { items, toggleWishlist, loading: wishlistLoading } = useWishlist();
  const { addToCart } = useCart();

  // Button feedback state for adding to cart
  const [addingMap, setAddingMap] = useState<Record<string, boolean>>({});
  const [successMap, setSuccessMap] = useState<Record<string, boolean>>({});

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

  if (wishlistLoading && items.length === 0) {
    return (
      <div className="min-h-[70vh] flex flex-col items-center justify-center">
        <Loader2 className="w-12 h-12 text-pink-500 animate-spin mb-4" />
        <p className="text-[10px] font-black text-gray-400 uppercase tracking-[0.4em]">Synchronizing Your Desires</p>
      </div>
    );
  }

  if (items.length === 0) {
    return (
      <div className="min-h-[70vh] flex flex-col items-center justify-center px-4 animate-in fade-in duration-300">
        <div className="w-24 h-24 bg-pink-50 rounded-full flex items-center justify-center mb-8">
          <Heart size={40} className="text-pink-200" />
        </div>
        <h1 className="text-4xl font-black text-gray-900 mb-4 italic text-center">Your Wishlist is Empty</h1>
        <p className="text-gray-400 text-center max-w-md mb-12 font-medium">
          Save your favorite luxury assets for later. Explore our collection and start curating your dream aesthetic today.
        </p>
        <Link 
          to="/shop" 
          className="bg-gray-900 hover:bg-pink-600 text-white px-12 py-5 rounded-2xl font-black transition-all shadow-2xl active:scale-95 flex items-center gap-3 group"
        >
          Discover Collection <ArrowRight size={20} className="group-hover:translate-x-1 transition-transform" />
        </Link>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#FDF2F8]/20 py-20">
      <div className="container mx-auto px-4 max-w-7xl">
        <div className="mb-16">
          <span className="text-pink-500 font-black tracking-[0.4em] uppercase text-[10px] mb-2 block">Personal Curation</span>
          <h1 className="text-5xl font-black text-gray-900 italic tracking-tight">Your Wishlist</h1>
          <p className="text-gray-400 font-bold mt-2 uppercase tracking-widest text-xs">
            Reviewing {items.length} Saved {items.length === 1 ? 'Asset' : 'Assets'}
          </p>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
          {items.map((item) => (
            <div key={item.id} className="bg-white rounded-2xl overflow-hidden shadow-lg group hover:shadow-xl transition-all border border-pink-50 flex flex-col relative">
              {/* Remove from Wishlist Button */}
              <button 
                onClick={() => toggleWishlist(item.product)}
                className="absolute top-3 right-3 z-10 w-9 h-9 flex items-center justify-center rounded-xl bg-white/90 backdrop-blur-md text-red-400 hover:text-red-600 shadow-md transition-all active:scale-90 border border-pink-50"
                aria-label="Remove from wishlist"
              >
                <Trash2 size={16} />
              </button>

              <div className="relative h-48 overflow-hidden">
                <img 
                  src={item.product?.image_url || 'https://picsum.photos/400/400'} 
                  alt={item.product?.name}
                  className="w-full h-full object-cover transform transition-transform duration-700 group-hover:scale-110"
                />
                <div className="absolute top-3 left-3">
                  <span className="bg-white/95 backdrop-blur-md text-pink-600 text-[8px] font-black px-3 py-1.5 rounded-full uppercase tracking-widest shadow-lg">
                    {item.product?.category || 'Beauty'}
                  </span>
                </div>
              </div>

              <div className="p-4 flex flex-col flex-grow text-left">
                <h3 className="text-base font-black text-gray-900 mb-1 italic truncate">{item.product?.name}</h3>
                <p className="text-lg font-black text-pink-500 mb-2">£{(item.product?.price || 0).toFixed(2)}</p>
                
                <div className="mb-3">
                  <div className="bg-green-50/50 text-green-700 text-[8px] py-1 px-2 rounded-full font-black uppercase tracking-widest border border-green-100/50 inline-block">
                    {item.product?.stock || 0} available
                  </div>
                </div>
                
                <div className="mt-auto space-y-2">
                  <button 
                    onClick={() => handleAddToCart(item.product)}
                    disabled={addingMap[item.product_id] || successMap[item.product_id]}
                    className={`w-full py-3 rounded-xl font-black text-[10px] transition-all flex items-center justify-center gap-2 shadow-lg active:scale-95 ${
                      successMap[item.product_id] 
                      ? 'bg-green-500 text-white' 
                      : 'bg-gray-900 hover:bg-pink-600 text-white'
                    }`}
                  >
                    {addingMap[item.product_id] ? (
                      <Loader2 className="animate-spin" size={14} />
                    ) : successMap[item.product_id] ? (
                      <>
                        <Check size={14} /> In Cart
                      </>
                    ) : (
                      <>
                        <ShoppingCart size={14} /> Add to Cart
                      </>
                    )}
                  </button>
                  <Link 
                    to="/shop" 
                    className="w-full py-2 text-center text-gray-400 hover:text-pink-500 font-black uppercase tracking-widest text-[8px] block transition-colors"
                  >
                    View Details
                  </Link>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Wishlist;
