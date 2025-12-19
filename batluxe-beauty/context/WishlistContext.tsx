
import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { WishlistItem, Product } from '../types';
import { useAuth } from './AuthContext';
import api from '../services/api';

interface WishlistContextType {
  items: WishlistItem[];
  toggleWishlist: (product: Product) => Promise<void>;
  isInWishlist: (productId: string | number) => boolean;
  count: number;
  loading: boolean;
}

const WishlistContext = createContext<WishlistContextType | undefined>(undefined);

export const WishlistProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [items, setItems] = useState<WishlistItem[]>([]);
  const [loading, setLoading] = useState(false);
  const { user, token, isSessionInvalid } = useAuth();
  
  const isGuest = !user || !token || token === 'null' || token === 'undefined' || isSessionInvalid;

  const fetchWishlist = useCallback(async () => {
    if (isGuest) {
      const guestWishlist = localStorage.getItem('guest_wishlist');
      if (guestWishlist) {
        try {
          const parsed = JSON.parse(guestWishlist);
          setItems(Array.isArray(parsed) ? parsed : []);
        } catch (e) {
          setItems([]);
        }
      } else {
        setItems([]);
      }
      return;
    }

    // Check for local backup first
    const backupWishlist = localStorage.getItem('wishlist_backup');
    if (backupWishlist) {
      try {
        const parsed = JSON.parse(backupWishlist);
        if (Array.isArray(parsed) && parsed.length > 0) {
          setItems(parsed);
        }
      } catch (e) {
        // Ignore parsing errors
      }
    }

    setLoading(true);
    try {
      const response = await api.get('/wishlist');
      const data = response.data;
      
      let rawItems: any[] = [];
      if (Array.isArray(data)) {
        rawItems = data;
      } else if (data && typeof data === 'object') {
        rawItems = data.items || data.wishlist || data.data || data.WishlistItems || [];
      }

      // Only update if we got actual data from server
      if (rawItems.length > 0) {
        const productsRes = await api.get('/products');
        const allProducts: Product[] = Array.isArray(productsRes.data) 
          ? productsRes.data 
          : (productsRes.data?.products || productsRes.data?.data || []);

        const hydratedItems = rawItems.map((item: any) => {
          const productId = String(item.product_id || item.productId || item.id || item.ID);
          const productInfo = allProducts.find(p => String(p.id) === productId);
          
          return {
            id: String(item.id || item.ID || `wish-${productId}`),
            product_id: productId,
            product: productInfo || item.product || {
              id: productId,
              name: item.name || 'Luxury Asset',
              price: item.price || 0,
              image_url: item.image_url || ''
            }
          };
        }).filter(Boolean) as WishlistItem[];

        setItems(hydratedItems);
        // Update backup
        localStorage.setItem('wishlist_backup', JSON.stringify(hydratedItems));
      }
      // If server returns empty but we have local items, keep local items
    } catch (err: any) {
      // Keep existing items if API fails
      console.log('Wishlist fetch failed, keeping local state');
    } finally {
      setLoading(false);
    }
  }, [user, token, isSessionInvalid, isGuest]);

  useEffect(() => {
    fetchWishlist();
  }, [fetchWishlist]);

  const toggleWishlist = async (product: Product) => {
    const prodId = String(product.id);
    const existingItem = items.find(item => String(item.product_id) === prodId);

    // Always update local state immediately for instant feedback
    let newItems;
    if (existingItem) {
      newItems = items.filter(item => String(item.product_id) !== prodId);
    } else {
      const newItem: WishlistItem = {
        id: isGuest ? `guest-wish-${prodId}` : `wish-${prodId}`,
        product_id: prodId,
        product: product
      };
      newItems = [...items, newItem];
    }
    
    // Update state immediately
    setItems(newItems);
    
    if (isGuest) {
      localStorage.setItem('guest_wishlist', JSON.stringify(newItems));
      return;
    }

    // Save to localStorage as backup
    localStorage.setItem('wishlist_backup', JSON.stringify(newItems));

    // Try API call in background
    try {
      if (existingItem) {
        try {
          await api.delete(`/wishlist/${existingItem.id}`);
        } catch (delErr) {
          await api.delete(`/wishlist/remove/${prodId}`);
        }
      } else {
        await api.post('/wishlist/add', { product_id: product.id });
      }
      // Only refresh from server if API call was successful
      // Don't call fetchWishlist() to avoid overriding our local state
    } catch (err: any) {
      console.error('Wishlist API error:', err);
      // Keep the local state since we already updated it
      // Don't call fetchWishlist() as it would override our local changes
    }
  };

  const isInWishlist = (productId: string | number) => {
    const searchId = String(productId);
    const found = items.some(item => String(item.product_id) === searchId);
    return found;
  };

  return (
    <WishlistContext.Provider value={{ items, toggleWishlist, isInWishlist, count: items.length, loading }}>
      {children}
    </WishlistContext.Provider>
  );
};

export const useWishlist = () => {
  const context = useContext(WishlistContext);
  if (!context) throw new Error('useWishlist must be used within WishlistProvider');
  return context;
};
