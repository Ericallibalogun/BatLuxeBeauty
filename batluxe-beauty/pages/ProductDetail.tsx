
import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
    ArrowLeft,
    ShoppingCart,
    Heart,
    Minus,
    Plus,
    Check,
    Loader2,
    Share2,
    ShieldCheck,
    Truck
} from 'lucide-react';
import api from '../services/api';
import { Product } from '../types';
import { useCart } from '../context/CartContext';
import { useWishlist } from '../context/WishlistContext';
import { productCache } from '../services/productCache';
import FastImage from '../components/FastImage';

const ProductDetail: React.FC = () => {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();
    const { addToCart } = useCart();
    const { toggleWishlist, isInWishlist } = useWishlist();

    const [product, setProduct] = useState<Product | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [quantity, setQuantity] = useState(1);
    const [isAddingToCart, setIsAddingToCart] = useState(false);
    const [isAddedToCart, setIsAddedToCart] = useState(false);
    const [isWishlistLoading, setIsWishlistLoading] = useState(false);

    useEffect(() => {
        const fetchProduct = async () => {
            if (!id) return;

            setLoading(true);
            setError(null);

            // 1. Try cache first
            try {
                const cachedProduct = productCache.findById(id);
                if (cachedProduct) {
                    console.log('📦 Found product in cache');
                    setProduct(cachedProduct);
                    setLoading(false);
                    return;
                }

                // 2. Fetch from API if not in cache
                console.log('🌐 Fetching product details from API...');
                // We might need to fetch all products if specific endpoint doesn't exist
                // But let's try specific endpoint first or fallback to finding in list
                try {
                    // First try getting from the full list endpoint since we want to cache properly
                    // And we know /products works from Shop.tsx
                    // Optimization: Check if we can get single product. 
                    // For now, let's assume valid ID means we can find it if we load all or query specific.

                    // Strategy: Try grabbing single product. If 404, valid. 
                    // If backend doesn't support /products/:id nicely, we might need a different approach.
                    // However, standard REST usually supports it.
                    // Let's try getting all products if cache is empty to populate it? 
                    // No, that's heavy. Let's assume /products returns list and we might have to filter
                    // if /products/:id isn't available. 
                    // Actually, let's try the direct route, and if it fails, try the list.

                    const response = await api.get(`/products/${id}`);
                    // Handle response structure variances
                    const productData = response.data?.product || response.data?.data || response.data;

                    if (productData) {
                        setProduct(productData);
                    } else {
                        // Fallback: fetch all and find
                        const allResponse = await api.get('/products');
                        const allProducts = Array.isArray(allResponse.data)
                            ? allResponse.data
                            : (allResponse.data?.products || allResponse.data?.data || []);

                        const found = allProducts.find((p: Product) => p.id === id);
                        if (found) {
                            productCache.set(allProducts); // Cache everything for next time
                            setProduct(found);
                        } else {
                            setError('Product not found');
                        }
                    }
                } catch (err) {
                    console.error('Error fetching product:', err);
                    // Last ditch effort: fetch all if direct fetch failed
                    try {
                        const allResponse = await api.get('/products');
                        const allProducts = Array.isArray(allResponse.data)
                            ? allResponse.data
                            : (allResponse.data?.products || allResponse.data?.data || []);

                        const found = allProducts.find((p: Product) => p.id === id);
                        if (found) {
                            productCache.set(allProducts);
                            setProduct(found);
                            setError(null);
                        } else {
                            setError('Product not found');
                        }
                    } catch (fallbackErr) {
                        setError('Failed to load product details');
                    }
                }
            } catch (err) {
                setError('An unexpected error occurred');
            } finally {
                setLoading(false);
            }
        };

        fetchProduct();
    }, [id]);

    const handleQuantityChange = (delta: number) => {
        setQuantity(prev => Math.max(1, Math.min(prev + delta, product?.stock || 99)));
    };

    const handleAddToCart = async () => {
        if (!product) return;

        setIsAddingToCart(true);
        await addToCart(product, quantity);
        setIsAddingToCart(false);

        setIsAddedToCart(true);
        setTimeout(() => setIsAddedToCart(false), 2000);
    };

    const handleToggleWishlist = async () => {
        if (!product) return;
        setIsWishlistLoading(true);
        await toggleWishlist(product);
        setIsWishlistLoading(false);
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-[#FDF2F8]/20 flex items-center justify-center">
                <Loader2 className="animate-spin text-pink-500" size={48} />
            </div>
        );
    }

    if (error || !product) {
        return (
            <div className="min-h-screen bg-[#FDF2F8]/20 flex flex-col items-center justify-center p-4 text-center">
                <h2 className="text-2xl font-bold text-gray-900 mb-4">Product Not Found</h2>
                <p className="text-gray-600 mb-8">{error || "The product you're looking for doesn't exist."}</p>
                <button
                    onClick={() => navigate('/shop')}
                    className="bg-pink-500 text-white px-8 py-3 rounded-full font-bold hover:bg-pink-600 transition-colors"
                >
                    Return to Shop
                </button>
            </div>
        );
    }

    const inWishlist = product ? isInWishlist(product.id) : false;

    return (
        <div className="min-h-screen bg-[#FDF2F8]/20 pt-24 pb-12 px-4 sm:px-6 lg:px-8">
            <div className="max-w-7xl mx-auto">
                {/* Breadcrumb / Back Navigation */}
                <button
                    onClick={() => navigate(-1)}
                    className="group flex items-center text-gray-500 hover:text-pink-600 mb-8 transition-colors font-medium"
                >
                    <div className="bg-white p-2 rounded-full shadow-sm mr-3 group-hover:shadow-md transition-all">
                        <ArrowLeft size={20} />
                    </div>
                    Back to Collection
                </button>

                <div className="bg-white rounded-[3rem] shadow-xl overflow-hidden border border-pink-50">
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-0">
                        {/* Image Section */}
                        <div className="relative h-[500px] lg:h-auto bg-gray-50 p-8 flex items-center justify-center">
                            <div className="absolute top-8 left-8 z-10">
                                <span className="bg-white/90 backdrop-blur text-pink-600 text-[10px] font-black px-4 py-2 rounded-full uppercase tracking-widest shadow-lg border border-pink-100">
                                    {product.category || 'Luxury Beauty'}
                                </span>
                            </div>

                            <FastImage
                                src={product.image_url || 'https://picsum.photos/800/800'}
                                alt={product.name}
                                className="w-full h-full object-contain mix-blend-multiply hover:scale-105 transition-transform duration-700"
                            />
                        </div>

                        {/* Content Section */}
                        <div className="p-8 lg:p-12 xl:p-16 flex flex-col justify-center bg-white relative">

                            {/* Header Info */}
                            <div className="mb-8">
                                <div className="flex justify-between items-start mb-4">
                                    <h1 className="text-4xl lg:text-5xl font-black text-gray-900 italic tracking-tight leading-tight">
                                        {product.name}
                                    </h1>
                                    <button
                                        onClick={handleToggleWishlist}
                                        disabled={isWishlistLoading}
                                        className={`p-4 rounded-2xl transition-all active:scale-95 ${inWishlist
                                                ? 'bg-pink-500 text-white shadow-lg shadow-pink-200'
                                                : 'bg-gray-50 text-gray-400 hover:bg-pink-50 hover:text-pink-500'
                                            }`}
                                    >
                                        {isWishlistLoading ? (
                                            <Loader2 size={24} className="animate-spin" />
                                        ) : (
                                            <Heart size={24} fill={inWishlist ? "currentColor" : "none"} />
                                        )}
                                    </button>
                                </div>

                                <div className="flex items-baseline gap-4 mb-6">
                                    <span className="text-3xl font-black text-pink-500">
                                        £{product.price.toFixed(2)}
                                    </span>
                                    {product.stock > 0 ? (
                                        <span className="text-green-600 bg-green-50 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wide">
                                            In Stock ({product.stock})
                                        </span>
                                    ) : (
                                        <span className="text-red-600 bg-red-50 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wide">
                                            Out of Stock
                                        </span>
                                    )}
                                </div>

                                <p className="text-gray-500 leading-relaxed text-lg">
                                    {product.description}
                                </p>
                            </div>

                            {/* Controls */}
                            <div className="border-t border-gray-100 pt-8 mt-auto">
                                <div className="flex flex-col sm:flex-row gap-6 mb-8">
                                    {/* Quantity Selector */}
                                    <div className="flex items-center bg-gray-50 rounded-2xl p-2 w-full sm:w-auto border border-gray-100">
                                        <button
                                            onClick={() => handleQuantityChange(-1)}
                                            className="p-4 hover:bg-white rounded-xl transition-all text-gray-500 hover:text-gray-900 shadow-sm disabled:opacity-50"
                                            disabled={quantity <= 1}
                                        >
                                            <Minus size={20} />
                                        </button>
                                        <span className="w-16 text-center font-black text-xl text-gray-900">
                                            {quantity}
                                        </span>
                                        <button
                                            onClick={() => handleQuantityChange(1)}
                                            className="p-4 hover:bg-white rounded-xl transition-all text-gray-500 hover:text-gray-900 shadow-sm disabled:opacity-50"
                                            disabled={quantity >= product.stock}
                                        >
                                            <Plus size={20} />
                                        </button>
                                    </div>

                                    {/* Add to Cart Button */}
                                    <button
                                        onClick={handleAddToCart}
                                        disabled={isAddingToCart || product.stock === 0}
                                        className={`flex-1 py-4 px-8 rounded-2xl font-black text-lg uppercase tracking-wide transition-all shadow-xl hover:shadow-2xl active:scale-[0.98] flex items-center justify-center gap-3 ${isAddedToCart
                                                ? 'bg-green-500 text-white'
                                                : product.stock === 0
                                                    ? 'bg-gray-200 text-gray-400 cursor-not-allowed'
                                                    : 'bg-gray-900 text-white hover:bg-pink-600'
                                            }`}
                                    >
                                        {isAddingToCart ? (
                                            <Loader2 className="animate-spin" />
                                        ) : isAddedToCart ? (
                                            <>
                                                <Check /> Added to Cart
                                            </>
                                        ) : product.stock === 0 ? (
                                            'Out of Stock'
                                        ) : (
                                            <>
                                                <ShoppingCart /> Add to Cart
                                            </>
                                        )}
                                    </button>
                                </div>

                                {/* Features / Benefits */}
                                <div className="grid grid-cols-2 gap-4 text-sm text-gray-500 font-medium">
                                    <div className="flex items-center gap-3 p-3 bg-blue-50/50 rounded-xl">
                                        <ShieldCheck className="text-blue-500" size={20} />
                                        <span>Authentic Guaranteed</span>
                                    </div>
                                    <div className="flex items-center gap-3 p-3 bg-green-50/50 rounded-xl">
                                        <Truck className="text-green-500" size={20} />
                                        <span>Free Express Shipping</span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ProductDetail;
