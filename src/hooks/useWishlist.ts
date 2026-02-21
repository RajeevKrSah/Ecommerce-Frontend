'use client';

import { useState, useEffect, useCallback } from 'react';
import { Wishlist } from '@/types/wishlist';
import { wishlistService } from '@/services/wishlist.service';
import { useAuth } from './useAuth';
import { guestWishlistManager, GuestWishlistItem } from '@/lib/guestWishlist';

export function useWishlist() {
  const [wishlist, setWishlist] = useState<Wishlist | null>(null);
  const [guestWishlist, setGuestWishlist] = useState<GuestWishlistItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const { isAuthenticated } = useAuth();

  const fetchWishlist = useCallback(async () => {
    if (!isAuthenticated) {
      // Load guest wishlist from localStorage
      const localWishlist = guestWishlistManager.getWishlist();
      setGuestWishlist(localWishlist);
      setWishlist(null);
      setIsLoading(false);
      return;
    }

    try {
      const data = await wishlistService.getWishlist();
      setWishlist(data);
      setGuestWishlist([]);
    } catch (error) {
      console.error('Failed to fetch wishlist:', error);
    } finally {
      setIsLoading(false);
    }
  }, [isAuthenticated]);

  // Merge guest wishlist with user wishlist on login
  useEffect(() => {
    const mergeGuestWishlist = async () => {
      if (isAuthenticated && guestWishlist.length > 0) {
        console.log('Merging guest wishlist with user wishlist...');
        
        try {
          // Add all guest wishlist items to user wishlist
          for (const item of guestWishlist) {
            await wishlistService.addToWishlist(item.productId);
          }
          
          // Clear guest wishlist after merge
          guestWishlistManager.clearWishlist();
          setGuestWishlist([]);
          
          // Refresh user wishlist
          await fetchWishlist();
        } catch (error) {
          console.error('Failed to merge guest wishlist:', error);
        }
      }
    };

    mergeGuestWishlist();
  }, [isAuthenticated, guestWishlist.length, fetchWishlist]);

  // Initial load
  useEffect(() => {
    fetchWishlist();
  }, [fetchWishlist]);

  // Listen for guest wishlist updates
  useEffect(() => {
    if (!isAuthenticated) {
      const handleGuestWishlistUpdate = () => {
        const localWishlist = guestWishlistManager.getWishlist();
        setGuestWishlist(localWishlist);
      };

      window.addEventListener('guestWishlistUpdated', handleGuestWishlistUpdate);
      return () => {
        window.removeEventListener('guestWishlistUpdated', handleGuestWishlistUpdate);
      };
    }
  }, [isAuthenticated]);

  const addToWishlist = async (productId: number) => {
    if (!isAuthenticated) {
      // Guest user - use localStorage
      console.log('Adding to guest wishlist:', productId);
      guestWishlistManager.addItem(productId);
      return;
    }

    // Authenticated user - use API
    console.log('Adding to user wishlist:', productId);
    try {
      const updatedWishlist = await wishlistService.addToWishlist(productId);
      setWishlist(updatedWishlist);
    } catch (error) {
      console.error('Failed to add to wishlist:', error);
      throw error;
    }
  };

  const removeFromWishlist = async (productId: number, itemId?: number) => {
    if (!isAuthenticated) {
      // Guest user - use localStorage
      guestWishlistManager.removeItem(productId);
      return;
    }

    // Authenticated user - use API
    try {
      const updatedWishlist = await wishlistService.removeByProduct(productId);
      setWishlist(updatedWishlist);
    } catch (error) {
      console.error('Failed to remove from wishlist:', error);
      throw error;
    }
  };

  const clearWishlist = async () => {
    if (!isAuthenticated) {
      guestWishlistManager.clearWishlist();
      return;
    }

    try {
      await wishlistService.clearWishlist();
      await fetchWishlist();
    } catch (error) {
      console.error('Failed to clear wishlist:', error);
      throw error;
    }
  };

  const isInWishlist = (productId: number): boolean => {
    if (!isAuthenticated) {
      return guestWishlistManager.isInWishlist(productId);
    }

    return wishlist?.items.some(item => item.product_id === productId) || false;
  };

  const moveToCart = async (itemId: number) => {
    if (!isAuthenticated) {
      throw new Error('Must be logged in to move items to cart');
    }

    try {
      const updatedWishlist = await wishlistService.moveToCart(itemId);
      setWishlist(updatedWishlist);
    } catch (error) {
      console.error('Failed to move to cart:', error);
      throw error;
    }
  };

  const wishlistCount = isAuthenticated 
    ? wishlist?.total_items || 0 
    : guestWishlist.length;

  return {
    wishlist,
    guestWishlist,
    isLoading,
    addToWishlist,
    removeFromWishlist,
    clearWishlist,
    isInWishlist,
    moveToCart,
    wishlistCount,
    refetch: fetchWishlist,
  };
}
