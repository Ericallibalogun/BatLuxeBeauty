
import React, { createContext, useContext, useState, useEffect, useCallback, useRef } from 'react';
import api from '../services/api';
import { CartItem, Product, UserRole } from '../types';
import { useAuth } from './AuthContext';

interface CartContextType {
  items: CartItem[];
  addToCart: (product: Product, quantity?: number) => Promise<boolean>;
  removeFromCart: (itemId: string) => Promise<void>;
  updateQuantity: (productId: string, quantity: number) => Promise<void>;
  clearCart: () => Promise<void>;
  total: number;
  count: number;
  loading: boolean;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export const CartProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [items, setItems] = useState<CartItem[]>([]);
  const [loading, setLoading] = useState(false);
  const { user, token, isSessionInvalid } = useAuth();
  const isGuest = !user || !token || token === 'null' || isSessionInvalid;

  const fetchCart = useCallback(async () => {
    const isAdmin = user?.role === UserRole.ADMIN || String(user?.role).toUpperCase() === 'ADMIN';
    
    // For Guests: Load from Local Storage
    if (isGuest || isAdmin) {
      if (isAdmin) {
        setItems([]);
        return;
      }
      const guestCart = localStorage.getItem('guest_cart');
      if (guestCart) {
        try {
          setItems(JSON.parse(guestCart));
        } catch (e) {
          setItems([]);
        }
      }
      return;
    }

    // For authenticated users: Try backup first, then API
    const backupCart = localStorage.getItem('auth_cart_backup');
    if (backupCart) {
      try {
        const parsedBackup = JSON.parse(backupCart);
        if (parsedBackup.length > 0) {
          setItems(parsedBackup);
        }
      } catch (e) {
        // Ignore backup parsing errors
      }
    }
    
    // For Logged In Users: Fetch from API
    setLoading(true);
    try {
      const cartRes = await api.get('/cart');
      const cartData = cartRes.data;
      
      // Backend returns { cart_items: [...] }
      let rawItems = [];
      if (cartData && cartData.cart_items) {
        rawItems = cartData.cart_items;
      } else if (Array.isArray(cartData)) {
        rawItems = cartData;
      } else if (cartData && typeof cartData === 'object') {
        rawItems = cartData.items || cartData.data || [];
      }

      const productsRes = await api.get('/products');
      const products: Product[] = Array.isArray(productsRes.data) 
        ? productsRes.data 
        : (productsRes.data?.products || productsRes.data?.data || []);

      const hydratedItems = rawItems.map((item: any) => {
        const productId = item.product_id || item.productId || item.ID;
        const productInfo = products.find(p => p.id === productId);
        const cartItemId = item.id || item.ID || `cart-${productId}`;

        return {
          ...item,
          id: cartItemId,
          product_id: productId,
          product: productInfo || item.product || {
            id: productId,
            name: 'Luxury Asset',
            price: item.price || 0,
            image_url: 'https://picsum.photos/200/200'
          }
        };
      });

      setItems(hydratedItems);
    } catch (err: any) {
      setItems([]);
    } finally {
      setLoading(false);
    }
  }, [user, token, isSessionInvalid, isGuest]);

  useEffect(() => {
    fetchCart();
  }, [fetchCart]);

  const addToCart = async (product: Product, quantity: number = 1): Promise<boolean> => {
    const isAdmin = user?.role === UserRole.ADMIN || String(user?.role).toUpperCase() === 'ADMIN';
    if (isAdmin) return false;

    if (isGuest) {
      const existingItem = items.find(item => item.product_id === product.id);
      let newItems;
      if (existingItem) {
        newItems = items.map(item => 
          item.product_id === product.id 
          ? { ...item, quantity: item.quantity + Number(quantity) } 
          : item
        );
      } else {
        const newItem: CartItem = {
          id: `guest-${product.id}`,
          product_id: product.id,
          product: product,
          quantity: Number(quantity)
        };
        newItems = [...items, newItem];
      }
      setItems(newItems);
      localStorage.setItem('guest_cart', JSON.stringify(newItems));
      return true;
    }

    try {
      await api.post('/cart', { 
        product_id: product.id, 
        quantity: Number(quantity)
      });
      await fetchCart();
      return true;
    } catch (err) {
      return false;
    }
  };

  const removeFromCart = async (itemId: string) => {
    if (isGuest) {
      const newItems = items.filter(item => item.id !== itemId);
      setItems(newItems);
      localStorage.setItem('guest_cart', JSON.stringify(newItems));
      return;
    }
    try {
      await api.delete(`/cart/${itemId}`);
      await fetchCart();
    } catch (err) {}
  };

  const updateQuantity = async (productId: string, quantity: number) => {
    console.log('Updating quantity:', { productId, quantity, isGuest });
    if (quantity < 1) return;
    
    // Find the cart item to get the correct cart_item_id
    const cartItem = items.find(item => item.product_id === productId);
    if (!cartItem) {
      console.error('Cart item not found for product:', productId);
      return;
    }
    
    // Always update local state first for immediate feedback
    const newItems = items.map(item => 
      item.product_id === productId 
      ? { ...item, quantity: Number(quantity) } 
      : item
    );
    setItems(newItems);
    
    if (isGuest) {
      localStorage.setItem('guest_cart', JSON.stringify(newItems));
      return;
    }
    
    // Save to localStorage as backup for authenticated users too
    localStorage.setItem('auth_cart_backup', JSON.stringify(newItems));
    
    // Try API sync in background using the correct cart_item_id
    try {
      console.log('Making API call to update quantity with cart_item_id:', cartItem.id);
      await api.put(`/cart/${cartItem.id}`, { quantity: Number(quantity) });
      console.log('API sync successful');
    } catch (err) {
      console.error('API sync failed, keeping local state:', err);
      // Keep local state - user won't notice the API failure
    }
  };

  const clearCart = async () => {
    if (isGuest) {
      setItems([]);
      localStorage.removeItem('guest_cart');
      return;
    }
    try {
      await api.delete('/cart');
      setItems([]);
    } catch (err) {}
  };

  const total = items.reduce((acc, item) => {
    const price = item.product?.price || 0;
    return acc + (price * item.quantity);
  }, 0);
  
  const count = items.reduce((acc, item) => acc + item.quantity, 0);

  return (
    <CartContext.Provider value={{ items, addToCart, removeFromCart, updateQuantity, clearCart, total, count, loading }}>
      {children}
    </CartContext.Provider>
  );
};

export const useCart = () => {
  const context = useContext(CartContext);
  if (!context) throw new Error('useCart must be used within CartProvider');
  return context;
};
