'use client';

import { useState, useEffect } from 'react';
import { Cart } from '@/types/cart';
import { cartService } from '@/services/cart.service';
import { useAuth } from './useAuth';
import { guestCartManager, GuestCartItem } from '@/lib/guestCart';

export function useCart() {
  const [cart, setCart] = useState<Cart | null>(null);
  const [guestCart, setGuestCart] = useState<GuestCartItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const { isAuthenticated } = useAuth();

  const fetchCart = async () => {
    if (!isAuthenticated) {
      // Load guest cart from localStorage
      const localCart = guestCartManager.getCart();
      setGuestCart(localCart);
      setCart(null);
      setIsLoading(false);
      return;
    }

    try {
      const data = await cartService.getCart();
      setCart(data);
      setGuestCart([]);
    } catch (error) {
      console.error('Failed to fetch cart:', error);
    } finally {
      setIsLoading(false);
    }
  };

  // Merge guest cart with user cart on login
  useEffect(() => {
    const mergeGuestCart = async () => {
      if (isAuthenticated && guestCart.length > 0) {
        console.log('Merging guest cart with user cart...');
        
        try {
          // Add all guest cart items to user cart
          for (const item of guestCart) {
            await cartService.addToCart(item.productId, item.quantity);
          }
          
          // Clear guest cart after merge
          guestCartManager.clearCart();
          setGuestCart([]);
          
          // Refresh user cart
          await fetchCart();
        } catch (error) {
          console.error('Failed to merge guest cart:', error);
        }
      }
    };

    mergeGuestCart();
  }, [isAuthenticated]);

  useEffect(() => {
    fetchCart();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isAuthenticated]);

  // Listen for guest cart updates
  useEffect(() => {
    if (!isAuthenticated) {
      const handleGuestCartUpdate = (event: CustomEvent) => {
        setGuestCart(event.detail);
      };

      window.addEventListener('guestCartUpdated', handleGuestCartUpdate as EventListener);
      
      return () => {
        window.removeEventListener('guestCartUpdated', handleGuestCartUpdate as EventListener);
      };
    }
  }, [isAuthenticated]);

  const addToCart = async (productId: number, quantity: number = 1, variantId?: number) => {
    if (!isAuthenticated) {
      // Add to guest cart (localStorage)
      const updatedGuestCart = guestCartManager.addItem(productId, quantity, variantId);
      setGuestCart(updatedGuestCart);
      return null;
    }

    try {
      const updatedCart = await cartService.addToCart(productId, quantity, variantId);
      setCart(updatedCart);
      return updatedCart;
    } catch (error) {
      throw error;
    }
  };

  const updateQuantity = async (itemId: number, quantity: number) => {
    try {
      const updatedCart = await cartService.updateQuantity(itemId, quantity);
      setCart(updatedCart);
      return updatedCart;
    } catch (error) {
      throw error;
    }
  };

  const removeItem = async (itemId: number) => {
    try {
      const updatedCart = await cartService.removeItem(itemId);
      setCart(updatedCart);
      return updatedCart;
    } catch (error) {
      throw error;
    }
  };

  const clearCart = async () => {
    if (!isAuthenticated) {
      guestCartManager.clearCart();
      setGuestCart([]);
      return;
    }

    try {
      await cartService.clearCart();
      setCart(null);
    } catch (error) {
      throw error;
    }
  };

  // Get cart count (works for both guest and authenticated)
  const getCartCount = () => {
    if (!isAuthenticated) {
      return guestCart.reduce((total, item) => total + item.quantity, 0);
    }
    return cart?.total_items || 0;
  };

  return {
    cart,
    guestCart,
    isLoading,
    addToCart,
    updateQuantity,
    removeItem,
    clearCart,
    refreshCart: fetchCart,
    cartCount: getCartCount(),
  };
}

