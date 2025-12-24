
import React, { useEffect, useState, useMemo, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, ShoppingCart, Heart, Filter, Loader2, Check } from 'lucide-react';
import api from '../services/api';
import { Product } from '../types';
import { useCart } from '../context/CartContext';
import { useWishlist } from '../context/WishlistContext';
import { productCache } from '../services/productCache';
import { useDebounce } from '../hooks/useDebounce';
import { usePerformanceMonitor } from '../hooks/usePerformanceMonitor';
import FastImage from '../components/FastImage';
import Pagination from '../components/Pagination';
import { imagePreloader } from '../utils/imagePreloader';

// Test import to force ProductDetail to be included in bundle
import ProductDetail from './ProductDetail';

// Memoized ProductCard component to prevent unnecessary re-renders
const ProductCard = React.memo(({
  product,
  onAddToCart,
  onToggleWishlist,
  onNavigate,
  isAddingToCart,
  isAddedToCart,
  isWishlistLoading,
  isInWishlist
}: {
  product: Product;
  onAddToCart: (product: Product) => void;
  onToggleWishlist: (product: Product) => void;
  onNavigate: (id: string) => void;
  isAddingToCart: boolean;
  isAddedToCart: boolean;
  isWishlistLoading: boolean;
  isInWishlist: boolean;
}) => {
  const handleWishlistClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    e.preventDefault();
    console.log('❤️ Wishlist clicked:', product.id);
    onToggleWishlist(product);
  };

  const handleAddToCartClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    e.preventDefault();
    console.log('🛍️ Add to cart clicked:', product.id);
    onAddToCart(product);
  };

  return (
    <div
      onClick={() => onNavigate(product.id)}
      className="bg-white rounded-2xl overflow-hidden shadow-lg group hover:shadow-xl hover:scale-[1.02] transition-all duration-300 border border-pink-50 flex flex-col relative cursor-pointer"
    >
      <button
        onClick={handleWishlistClick}
        disabled={isWishlistLoading}
        className={`absolute top-3 right-3 z-30 w-9 h-9 flex items-center justify-center rounded-xl backdrop-blur-md shadow-md transition-all active:scale-90 border border-white/20 ${isWishlistLoading
            ? 'bg-gray-200 text-gray-400'
            : isInWishlist
              ? 'bg-pink-500 text-white shadow-pink-200'
              : 'bg-white/80 text-gray-400 hover:text-pink-500 hover:bg-pink-50'
          }`}
      >
        {isWishlistLoading ? (
          <Loader2 size={14} className="animate-spin" />
        ) : (
          <Heart
            size={16}
            fill={isInWishlist ? 'currentColor' : 'none'}
            className={isInWishlist ? 'text-white' : 'text-gray-400'}
          />
        )}
      </button>

      <div className="relative h-48 overflow-hidden">
        <img
          src={product.image_url || 'https://picsum.photos/400/400'}
          alt={product.name}
          className="w-full h-full object-cover transform transition-transform duration-700 group-hover:scale-110"
          loading="lazy"
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

      <div className="p-4 flex flex-col flex-grow">
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
            onClick={handleAddToCartClick}
            disabled={isAddingToCart || isAddedToCart}
            className={`w-full py-3 rounded-xl font-black text-[10px] transition-all flex items-center justify-center gap-2 shadow-lg active:scale-95 ${isAddedToCart
                ? 'bg-green-500 text-white'
                : 'bg-gray-900 hover:bg-pink-600 text-white'
              }`}
          >
            {isAddingToCart ? (
              <Loader2 className="animate-spin" size={14} />
            ) : isAddedToCart ? (
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
  );
});

const Shop: React.FC = () => {
  console.log('🏪 Shop component mounted');
  console.log('🧪 ProductDetail component available:', !!ProductDetail);
  const navigate = useNavigate();
  console.log('🔍 Navigate function:', typeof navigate);
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All Aesthetics');
  const [sortBy, setSortBy] = useState('Curated Order');
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(24); // Optimized page size

  const { addToCart } = useCart();
  const { toggleWishlist, isInWishlist } = useWishlist();

  // Debounce search to prevent excessive filtering
  const debouncedSearch = useDebounce(search, 300);

  // State for button feedback
  const [addingMap, setAddingMap] = useState<Record<string, boolean>>({});
  const [successMap, setSuccessMap] = useState<Record<string, boolean>>({});
  const [wishlistLoading, setWishlistLoading] = useState<Record<string, boolean>>({});

  // Memoized categories from products
  const categories = useMemo(() => {
    const cats = ['All Aesthetics', ...new Set(products.map(p => p.category).filter(Boolean))];
    return cats;
  }, [products]);

  useEffect(() => {
    const fetchProducts = async () => {
      // Check cache first
      const cachedProducts = productCache.get();
      if (cachedProducts) {
        console.log('📦 Using cached products:', cachedProducts.length);
        setProducts(cachedProducts);
        setLoading(false);
        return;
      }

      try {
        console.log('🌐 Fetching products from API...');
        const response = await api.get('/products');
        const rawData = response.data;
        const productsArray = Array.isArray(rawData)
          ? rawData
          : (rawData?.products || rawData?.data || []);

        console.log('📦 Fetched products:', productsArray.length);
        console.log('📦 First product:', productsArray[0]);

        setProducts(productsArray);
        productCache.set(productsArray); // Cache the results
      } catch (err) {
        console.error("Error fetching products", err);
      } finally {
        setLoading(false);
      }
    };
    fetchProducts();
  }, []);

  const handleAddToCart = useCallback(async (product: Product) => {
    setAddingMap(prev => ({ ...prev, [product.id]: true }));
    const success = await addToCart(product, 1);
    setAddingMap(prev => ({ ...prev, [product.id]: false }));

    if (success) {
      setSuccessMap(prev => ({ ...prev, [product.id]: true }));
      setTimeout(() => {
        setSuccessMap(prev => ({ ...prev, [product.id]: false }));
      }, 2000);
    }
  }, [addToCart]);

  const handleToggleWishlist = useCallback(async (product: Product) => {
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
  }, [toggleWishlist]);

  const handleNavigateToProduct = useCallback((productId: string) => {
    console.log('🔍 Navigating to product:', productId);
    console.log('🔍 Navigation URL:', `/product/${productId}`);
    console.log('🔍 Current location:', window.location.href);
    console.log('🔍 Navigate function:', typeof navigate);

    try {
      navigate(`/product/${productId}`);
      console.log('✅ Navigation called successfully');

      // Additional debug: Check if URL actually changed
      setTimeout(() => {
        console.log('🔍 URL after navigation:', window.location.href);
      }, 100);
    } catch (error) {
      console.error('❌ Navigation error:', error);
    }
  }, [navigate]);

  // Optimized filtering and sorting with memoization
  const filteredAndSortedProducts = useMemo(() => {
    let filtered = products;

    // Filter by search
    if (debouncedSearch.trim()) {
      const searchLower = debouncedSearch.toLowerCase();
      filtered = filtered.filter(p =>
        p.name.toLowerCase().includes(searchLower) ||
        p.category?.toLowerCase().includes(searchLower) ||
        p.description?.toLowerCase().includes(searchLower)
      );
    }

    // Filter by category
    if (selectedCategory !== 'All Aesthetics') {
      filtered = filtered.filter(p => p.category === selectedCategory);
    }

    // Sort products
    switch (sortBy) {
      case 'Value: Low to High':
        filtered.sort((a, b) => (a.price || 0) - (b.price || 0));
        break;
      case 'Value: High to Low':
        filtered.sort((a, b) => (b.price || 0) - (a.price || 0));
        break;
      case 'Name A-Z':
        filtered.sort((a, b) => a.name.localeCompare(b.name));
        break;
      case 'Name Z-A':
        filtered.sort((a, b) => b.name.localeCompare(a.name));
        break;
      default:
        // Keep original order for 'Curated Order'
        break;
    }

    return filtered;
  }, [products, debouncedSearch, selectedCategory, sortBy]);

  // Paginated products
  const paginatedProducts = useMemo(() => {
    const startIndex = (currentPage - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;
    return filteredAndSortedProducts.slice(startIndex, endIndex);
  }, [filteredAndSortedProducts, currentPage, itemsPerPage]);

  const totalPages = Math.ceil(filteredAndSortedProducts.length / itemsPerPage);

  // Reset to first page when filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [debouncedSearch, selectedCategory, sortBy]);

  // Preload images for current page products
  useEffect(() => {
    const imagesToPreload = paginatedProducts
      .map(p => p.image_url)
      .filter(Boolean) as string[];

    if (imagesToPreload.length > 0) {
      imagePreloader.preloadImages(imagesToPreload, 'high');
    }
  }, [paginatedProducts]);

  // Preload next page images in background
  useEffect(() => {
    if (currentPage < totalPages) {
      const nextPageStart = currentPage * itemsPerPage;
      const nextPageEnd = nextPageStart + itemsPerPage;
      const nextPageProducts = filteredAndSortedProducts.slice(nextPageStart, nextPageEnd);

      const nextPageImages = nextPageProducts
        .map(p => p.image_url)
        .filter(Boolean) as string[];

      if (nextPageImages.length > 0) {
        // Preload next page images with low priority
        setTimeout(() => {
          imagePreloader.preloadImages(nextPageImages, 'low');
        }, 1000);
      }
    }
  }, [currentPage, totalPages, filteredAndSortedProducts, itemsPerPage]);

  return (
    <div className="min-h-screen bg-[#FDF2F8]/20 py-20">
      <div className="container mx-auto px-4">
        <div className="text-center mb-16">
          <span className="text-pink-500 font-black tracking-[0.4em] uppercase text-[10px] mb-4 block">The Collection</span>
          <h1 className="text-6xl font-black text-gray-900 mb-6 italic tracking-tight">Luxury Defined</h1>
          <p className="text-gray-400 font-medium max-w-2xl mx-auto">Discover our masterfully curated collection of high-end beauty essentials designed to elevate your aesthetic journey.</p>

          {/* Debug Navigation Test */}
          <div className="mt-6">
            <button
              onClick={() => {
                console.log('🧪 Test navigation button clicked');
                console.log('🧪 Current URL:', window.location.href);
                navigate('/product/test-id');
              }}
              className="bg-red-500 text-white px-4 py-2 rounded text-sm mr-4"
            >
              🧪 Test Navigation (Debug)
            </button>
            <button
              onClick={() => {
                console.log('🧪 Products loaded:', products.length);
                if (products.length > 0) {
                  console.log('🧪 First product:', products[0]);
                  navigate(`/product/${products[0].id}`);
                }
              }}
              className="bg-blue-500 text-white px-4 py-2 rounded text-sm mr-4"
            >
              🧪 Navigate to First Product
            </button>
            <button
              onClick={() => {
                console.log('🧪 Direct URL change test');
                window.location.hash = '#/product/test-direct';
              }}
              className="bg-green-500 text-white px-4 py-2 rounded text-sm"
            >
              🧪 Direct Hash Change
            </button>
          </div>
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
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="px-10 py-6 bg-gray-50 border-none rounded-[2rem] focus:ring-2 focus:ring-pink-500 outline-none font-bold text-gray-900 shadow-inner appearance-none min-w-[200px]"
            >
              {categories.map(category => (
                <option key={category} value={category}>{category}</option>
              ))}
            </select>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="px-10 py-6 bg-gray-50 border-none rounded-[2rem] focus:ring-2 focus:ring-pink-500 outline-none font-bold text-gray-900 shadow-inner appearance-none min-w-[200px]"
            >
              <option value="Curated Order">Curated Order</option>
              <option value="Value: Low to High">Value: Low to High</option>
              <option value="Value: High to Low">Value: High to Low</option>
              <option value="Name A-Z">Name A-Z</option>
              <option value="Name Z-A">Name Z-A</option>
            </select>
            <button className="bg-gray-900 text-white p-6 rounded-[2rem] hover:bg-pink-600 transition-all shadow-xl">
              <Filter size={24} />
            </button>
          </div>
        </div>

        <div className="flex justify-between items-center mb-12">
          <p className="text-gray-400 font-bold uppercase tracking-widest text-xs">
            Presenting {filteredAndSortedProducts.length} Exclusive Creations
            {filteredAndSortedProducts.length !== products.length && (
              <span className="text-pink-500 ml-2">({products.length} total)</span>
            )}
          </p>
          {/* Debug: Test direct navigation */}
          {paginatedProducts.length > 0 && (
            <button
              onClick={() => {
                const firstProduct = paginatedProducts[0];
                console.log('🧪 Testing direct navigation to:', firstProduct.id);
                navigate(`/product/${firstProduct.id}`);
              }}
              className="bg-red-500 text-white px-4 py-2 rounded text-xs"
            >
              Test Navigate
            </button>
          )}
        </div>

        {/* Products Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4 mb-12">
          {loading ? (
            Array(itemsPerPage).fill(0).map((_, i) => (
              <div key={i} className="animate-pulse bg-white rounded-2xl h-[320px] shadow-sm"></div>
            ))
          ) : paginatedProducts.length > 0 ? (
            paginatedProducts.map((product) => (
              <ProductCard
                key={product.id}
                product={product}
                onAddToCart={handleAddToCart}
                onToggleWishlist={handleToggleWishlist}
                onNavigate={handleNavigateToProduct}
                isAddingToCart={addingMap[product.id] || false}
                isAddedToCart={successMap[product.id] || false}
                isWishlistLoading={wishlistLoading[product.id] || false}
                isInWishlist={isInWishlist(product.id)}
              />
            ))
          ) : (
            <div className="col-span-full text-center py-40 bg-white rounded-[3rem] shadow-inner border border-pink-50">
              <p className="text-gray-300 font-bold text-2xl italic mb-4">No assets found matching your curation</p>
              <button
                onClick={() => {
                  setSearch('');
                  setSelectedCategory('All Aesthetics');
                  setSortBy('Curated Order');
                }}
                className="text-pink-500 font-black uppercase tracking-widest text-xs hover:underline"
              >
                Clear All Filters
              </button>
            </div>
          )}
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <Pagination
            currentPage={currentPage}
            totalPages={totalPages}
            onPageChange={setCurrentPage}
            itemsPerPage={itemsPerPage}
            totalItems={filteredAndSortedProducts.length}
            className="bg-white p-6 rounded-[2rem] shadow-xl border border-pink-50"
          />
        )}
      </div>
    </div>
  );
};

export default Shop;
