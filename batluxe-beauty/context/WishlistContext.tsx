
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
    } catch (err: any) {
      setItems([]);
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

    if (isGuest) {
      let newItems;
      if (existingItem) {
        newItems = items.filter(item => String(item.product_id) !== prodId);
      } else {
        const newItem: WishlistItem = {
          id: `guest-wish-${prodId}`,
          product_id: prodId,
          product: product
        };
        newItems = [...items, newItem];
      }
      setItems(newItems);
      localStorage.setItem('guest_wishlist', JSON.stringify(newItems));
      return;
    }

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
      await fetchWishlist();
    } catch (err: any) {
      // Sync local state as fallback
      await fetchWishlist();
    }
  };

  const isInWishlist = (productId: string | number) => {
    const searchId = String(productId);
    return items.some(item => String(item.product_id) === searchId);
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
