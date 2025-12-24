import React, { memo } from "react";
import { Link } from "react-router-dom";
import { Heart, ShoppingCart, Loader2, Check } from "lucide-react";
import { Product } from "../types";

interface ProductCardProps {
    product: Product;
    onAddToCart: (product: Product) => void;
    onToggleWishlist: () => void;
    isWishlisted: boolean;
    isAddingToCart?: boolean;
    addSuccess?: boolean;
    wishlistLoading?: boolean;
}

const ProductCard = memo(
    ({ 
        product, 
        onAddToCart, 
        onToggleWishlist, 
        isWishlisted, 
        isAddingToCart = false,
        addSuccess = false,
        wishlistLoading = false
    }: ProductCardProps) => {
        return (
            <div className="bg-white rounded-2xl overflow-hidden shadow-lg group hover:shadow-xl transition-all border border-pink-50 flex flex-col relative text-left">
                {/* Wishlist Button */}
                <button 
                    onClick={(e) => {
                        e.preventDefault();
                        e.stopPropagation();
                        onToggleWishlist();
                    }}
                    disabled={wishlistLoading}
                    className={`absolute top-3 right-3 z-10 w-9 h-9 flex items-center justify-center rounded-xl backdrop-blur-md shadow-md transition-all active:scale-90 border border-white/20 ${
                        wishlistLoading 
                            ? 'bg-gray-200 text-gray-400' 
                            : isWishlisted 
                                ? 'bg-pink-500 text-white shadow-pink-200' 
                                : 'bg-white/80 text-gray-400 hover:text-pink-500 hover:bg-pink-50'
                    }`}
                >
                    {wishlistLoading ? (
                        <Loader2 size={14} className="animate-spin" />
                    ) : (
                        <Heart 
                            size={16} 
                            fill={isWishlisted ? 'currentColor' : 'none'} 
                            className={isWishlisted ? 'text-white' : 'text-gray-400'}
                        />
                    )}
                </button>

                <Link to={`/product/${product.id}`} className="block">
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
                </Link>

                <div className="p-4 flex flex-col flex-grow">
                    <Link to={`/product/${product.id}`}>
                        <h3 className="text-base font-black text-gray-900 mb-1 truncate italic hover:text-pink-600 transition-colors">{product.name}</h3>
                    </Link>
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
                            onClick={(e) => {
                                e.preventDefault();
                                e.stopPropagation();
                                onAddToCart(product);
                            }}
                            disabled={isAddingToCart || addSuccess}
                            className={`w-full py-3 rounded-xl font-black text-[10px] transition-all flex items-center justify-center gap-2 shadow-lg active:scale-95 ${
                                addSuccess 
                                ? 'bg-green-500 text-white' 
                                : 'bg-gray-900 hover:bg-pink-600 text-white'
                            }`}
                        >
                            {isAddingToCart ? (
                                <Loader2 className="animate-spin" size={14} />
                            ) : addSuccess ? (
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
        );
    }
);

ProductCard.displayName = 'ProductCard';

export default ProductCard;
