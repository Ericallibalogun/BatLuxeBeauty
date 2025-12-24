
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
import ProductCard from '../components/ProductCard';
import { imagePreloader } from '../utils/imagePreloader';

const Shop: React.FC = () => {
  const navigate = useNavigate();
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
        setProducts(cachedProducts);
        setLoading(false);
        return;
      }

      try {
        const response = await api.get('/products');
        const rawData = response.data;
        const productsArray = Array.isArray(rawData)
          ? rawData
          : (rawData?.products || rawData?.data || []);

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

  // handleNavigateToProduct was removed since ProductCard now uses <Link> directly

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
                onToggleWishlist={() => handleToggleWishlist(product)}
                isWishlisted={isInWishlist(product.id)}
                isAddingToCart={addingMap[product.id]}
                addSuccess={successMap[product.id]}
                wishlistLoading={wishlistLoading[product.id]}
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
