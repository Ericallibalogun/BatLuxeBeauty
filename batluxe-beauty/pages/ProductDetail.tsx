import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, ShoppingCart, Heart, Loader2, Check, Star } from 'lucide-react';
import api from '../services/api';
import { Product } from '../types';
import { useCart } from '../context/CartContext';
import { useWishlist } from '../context/WishlistContext';

const ProductDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  
  // Core state
  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  // Interaction state
  const [quantity, setQuantity] = useState(1);
  const [addingToCart, setAddingToCart] = useState(false);
  const [addedToCart, setAddedToCart] = useState(false);
  const [wishlistLoading, setWishlistLoading] = useState(false);

  // Hooks
  const { addToCart } = useCart();
  const { toggleWishlist, isInWishlist } = useWishlist();

  // Fetch product data
  useEffect(() => {
    const fetchProduct = async () => {
      if (!id) {
        setError('No product ID provided');
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        setError(null);
        
        // Try individual product endpoint first
        try {
          const response = await api.get(`/products/${id}`);
          const productData = response.data?.product || response.data;
          setProduct(productData);
          return;
        } catch (individualError) {
          // Fallback: fetch all products and find the one we need
          const response = await api.get('/products');
          const productsData = response.data;
          const productsArray = Array.isArray(productsData) 
            ? productsData 
            : (productsData?.products || productsData?.data || []);
          
          const foundProduct = productsArray.find((p: Product) => p.id === id);
          
          if (foundProduct) {
            setProduct(foundProduct);
          } else {
            throw new Error('Product not found');
          }
        }
      } catch (err) {
        console.error('Error fetching product:', err);
        setError('Product not found');
      } finally {
        setLoading(false);
      }
    };

    fetchProduct();
  }, [id]);

  // Handle add to cart
  const handleAddToCart = async () => {
    if (!product) return;
    
    setAddingToCart(true);
    try {
      const success = await addToCart(product, quantity);
      if (success) {
        setAddedToCart(true);
        setTimeout(() => setAddedToCart(false), 2000);
      }
    } catch (err) {
      console.error('Error adding to cart:', err);
    } finally {
      setAddingToCart(false);
    }
  };

  // Handle wishlist toggle
  const handleToggleWishlist = async () => {
    if (!product) return;
    
    setWishlistLoading(true);
    try {
      await toggleWishlist(product);
    } catch (err) {
      console.error('Error toggling wishlist:', err);
    } finally {
      setTimeout(() => setWishlistLoading(false), 500);
    }
  };

  // Calculate total price
  const totalPrice = product ? (product.price * quantity).toFixed(2) : '0.00';

  // Loading state
  if (loading) {
    return (
      <div className="min-h-screen bg-[#FDF2F8]/20 py-20">
        <div className="container mx-auto px-4">
          <div className="text-center mt-8">
            <Loader2 className="w-8 h-8 text-pink-500 animate-spin mx-auto mb-4" />
            <p className="text-[10px] font-black text-gray-400 uppercase tracking-[0.4em]">Loading Product Details</p>
          </div>
        </div>
      </div>
    );
  }

  // Error state
  if (error || !product) {
    return (
      <div className="min-h-screen bg-[#FDF2F8]/20 py-20">
        <div className="container mx-auto px-4">
          <div className="text-center bg-white rounded-3xl p-12 shadow-xl border border-pink-50">
            <h1 className="text-4xl font-black text-gray-900 mb-4 italic">Product Not Found</h1>
            <p className="text-gray-400 font-medium mb-8 max-w-md mx-auto">
              The product you're looking for doesn't exist or may have been removed.
            </p>
            <button 
              onClick={() => navigate('/shop')}
              className="bg-gray-900 hover:bg-pink-600 text-white px-8 py-4 rounded-xl font-black text-xs uppercase tracking-widest transition-all shadow-xl"
            >
              Browse Collection
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#FDF2F8]/20 py-20">
      <div className="container mx-auto px-4">
        {/* Back Button */}
        <button 
          onClick={() => navigate('/shop')}
          className="flex items-center gap-2 text-gray-600 hover:text-pink-500 font-bold mb-8 transition-all"
        >
          <ArrowLeft size={20} />
          Back to Shop
        </button>

        <div className="bg-white rounded-3xl overflow-hidden shadow-2xl border border-pink-50">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-0">
            {/* Product Image */}
            <div className="relative h-96 lg:h-auto">
              <img 
                src={product.image_url || 'https://picsum.photos/600/600'} 
                alt={product.name}
                className="w-full h-full object-cover"
                loading="lazy"
              />
              <div className="absolute top-6 left-6">
                <span className="bg-white/95 backdrop-blur-md text-pink-600 text-xs font-black px-4 py-2 rounded-full uppercase tracking-widest shadow-lg">
                  {product.category}
                </span>
              </div>
            </div>

            {/* Product Details */}
            <div className="p-8 lg:p-12 flex flex-col">
              <div className="flex-grow">
                <h1 className="text-4xl lg:text-5xl font-black text-gray-900 mb-4 italic tracking-tight">
                  {product.name}
                </h1>
                
                <div className="flex items-center gap-4 mb-6">
                  <span className="text-3xl font-black text-pink-500">
                    £{product.price.toFixed(2)}
                  </span>
                  <div className="flex items-center gap-1">
                    {[...Array(5)].map((_, i) => (
                      <Star key={i} size={16} className="text-yellow-400 fill-current" />
                    ))}
                    <span className="text-gray-400 text-sm ml-2">(4.8)</span>
                  </div>
                </div>

                <div className="mb-8">
                  <h3 className="text-lg font-black text-gray-900 mb-3">Description</h3>
                  <p className="text-gray-600 leading-relaxed">
                    {product.description}
                  </p>
                </div>

                <div className="mb-8">
                  <div className="flex items-center gap-4 mb-4">
                    <span className="text-sm font-bold text-gray-700">Availability:</span>
                    <span className={`text-sm font-black px-3 py-1 rounded-full ${
                      product.stock > 0 
                        ? 'bg-green-50 text-green-700 border border-green-100' 
                        : 'bg-red-50 text-red-700 border border-red-100'
                    }`}>
                      {product.stock > 0 ? `${product.stock} in stock` : 'Out of stock'}
                    </span>
                  </div>
                </div>

                {/* Quantity Selector */}
                <div className="mb-8">
                  <label className="text-sm font-bold text-gray-700 mb-3 block">Quantity</label>
                  <div className="flex items-center gap-4">
                    <div className="flex items-center border border-gray-200 rounded-xl overflow-hidden">
                      <button 
                        onClick={() => setQuantity(Math.max(1, quantity - 1))}
                        className="px-4 py-3 bg-gray-50 hover:bg-gray-100 font-bold text-gray-700 transition-all"
                      >
                        -
                      </button>
                      <span className="px-6 py-3 font-bold text-gray-900 bg-white min-w-[60px] text-center">
                        {quantity}
                      </span>
                      <button 
                        onClick={() => setQuantity(Math.min(product.stock, quantity + 1))}
                        className="px-4 py-3 bg-gray-50 hover:bg-gray-100 font-bold text-gray-700 transition-all"
                        disabled={quantity >= product.stock}
                      >
                        +
                      </button>
                    </div>
                    <span className="text-sm text-gray-500">
                      Total: £{totalPrice}
                    </span>
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex flex-col sm:flex-row gap-4">
                <button 
                  onClick={handleAddToCart}
                  disabled={addingToCart || addedToCart || product.stock === 0}
                  className={`flex-1 py-4 rounded-xl font-black text-sm transition-all flex items-center justify-center gap-3 shadow-lg active:scale-95 ${
                    addedToCart 
                      ? 'bg-green-500 text-white' 
                      : product.stock === 0
                        ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                        : 'bg-gray-900 hover:bg-pink-600 text-white'
                  }`}
                >
                  {addingToCart ? (
                    <Loader2 className="animate-spin" size={18} />
                  ) : addedToCart ? (
                    <>
                      <Check size={18} /> Added to Cart
                    </>
                  ) : (
                    <>
                      <ShoppingCart size={18} /> 
                      {product.stock === 0 ? 'Out of Stock' : 'Add to Cart'}
                    </>
                  )}
                </button>

                <button 
                  onClick={handleToggleWishlist}
                  disabled={wishlistLoading}
                  className={`px-6 py-4 rounded-xl font-black text-sm transition-all flex items-center justify-center gap-2 shadow-lg active:scale-95 border-2 ${
                    wishlistLoading 
                      ? 'bg-gray-200 text-gray-400 border-gray-200' 
                      : isInWishlist(product.id) 
                        ? 'bg-pink-500 text-white border-pink-500' 
                        : 'bg-white text-pink-500 border-pink-500 hover:bg-pink-50'
                  }`}
                >
                  {wishlistLoading ? (
                    <Loader2 size={18} className="animate-spin" />
                  ) : (
                    <Heart 
                      size={18} 
                      fill={isInWishlist(product.id) ? 'currentColor' : 'none'} 
                    />
                  )}
                  {isInWishlist(product.id) ? 'In Wishlist' : 'Add to Wishlist'}
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProductDetail;