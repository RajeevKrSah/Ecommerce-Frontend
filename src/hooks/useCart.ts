'use client';

import { useState, useEffect, useCallback } from 'react';
import { Cart, CartItem, CartResponse } from '@/types/cart';
import { cartService } from '@/services/cart.service';
import { useAuth } from './useAuth';

/**
 * Production-Ready Cart Hook
 */
export function useCart() {
  const [cart, setCart] = useState<Cart | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { isAuthenticated } = useAuth();

  /**
   * Fetch cart from API
   */
  const fetchCart = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const cartData = await cartService.getCart();
      setCart(cartData);
    } catch (err: any) {
      console.error('Failed to fetch cart:', err);
      setError(err.message);
      setCart(null);
    } finally {
      setIsLoading(false);
    }
  }, []);

  /**
   * Add to cart (supports both variant and product+metadata)
   */
  const addToCart = useCallback(async (
    productId?: number,
    quantity: number = 1,
    variantId?: number,
    metadata?: Record<string, any>
  ): Promise<CartResponse> => {
    try {
      const response = await cartService.addToCart(productId, quantity, variantId, metadata);
      if (response.success && response.cart) {
        setCart(response.cart);
      }
      return response;
    } catch (err: any) {
      setError(err.message);
      throw err;
    }
  }, []);

  /**
   * Update item quantity
   */
  const updateQuantity = useCallback(async (
    itemId: number,
    quantity: number
  ): Promise<void> => {
    // Optimistic update
    if (cart) {
      const updatedItems = cart.items.map(item =>
        item.id === itemId ? { ...item, quantity } : item
      );
      setCart({ ...cart, items: updatedItems });
    }

    try {
      const updatedCart = await cartService.updateQuantity(itemId, quantity);
      setCart(updatedCart);
    } catch (err: any) {
      setError(err.message);
      // Revert optimistic update
      await fetchCart();
      throw err;
    }
  }, [cart, fetchCart]);

  /**
   * Remove item from cart
   */
  const removeItem = useCallback(async (itemId: number): Promise<void> => {
    // Optimistic update
    if (cart) {
      const updatedItems = cart.items.filter(item => item.id !== itemId);
      setCart({ ...cart, items: updatedItems });
    }

    try {
      const updatedCart = await cartService.removeItem(itemId);
      setCart(updatedCart);
    } catch (err: any) {
      setError(err.message);
      // Revert optimistic update
      await fetchCart();
      throw err;
    }
  }, [cart, fetchCart]);

  /**
   * Clear cart
   */
  const clearCart = useCallback(async (): Promise<void> => {
    try {
      await cartService.clearCart();
      setCart(null);
    } catch (err: any) {
      setError(err.message);
      throw err;
    }
  }, []);

  /**
   * Initialize cart on mount and auth change
   */
  useEffect(() => {
    fetchCart();
  }, [fetchCart]);

  /**
   * Get cart count
   */
  const cartCount = cart?.total_items || 0;

  /**
   * Get cart subtotal
   */
  const cartSubtotal = cart?.subtotal || '0.00';

  /**
   * Check if cart is empty
   */
  const isEmpty = !cart || cart.items.length === 0;

  return {
    cart,
    isLoading,
    error,
    cartCount,
    cartSubtotal,
    isEmpty,
    addToCart,
    updateQuantity,
    removeItem,
    clearCart,
    refreshCart: fetchCart,
  };
}
