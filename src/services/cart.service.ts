import api from '@/lib/api';
import {
  Cart,
  CartResponse,
  AddToCartRequest,
  UpdateCartItemRequest,
  StockValidationResponse,
} from '@/types/cart';

/**
 * Production-Ready Cart Service
 */
export const cartService = {
  /**
   * Get current cart (authenticated or guest)
   */
  async getCart(): Promise<Cart> {
    const response = await api.get<CartResponse>('/cart');
    if (!response.data.success || !response.data.cart) {
      throw new Error('Failed to fetch cart');
    }
    return response.data.cart;
  },

  /**
   * Add product to cart (supports both variant and product+metadata)
   */
  async addToCart(
    productId?: number,
    quantity: number = 1,
    variantId?: number,
    metadata?: Record<string, any>
  ): Promise<CartResponse> {
    try {
      const payload: any = {
        quantity,
        metadata,
      };

      if (variantId) {
        payload.variant_id = variantId;
      } else if (productId) {
        payload.product_id = productId;
      }

      const response = await api.post<CartResponse>('/cart/add', payload);
      return response.data;
    } catch (error: any) {
      console.error('Add to cart error:', error);
      throw new Error(
        error.response?.data?.message || 
        error.message || 
        'Failed to add item to cart'
      );
    }
  },

  /**
   * Update cart item quantity
   */
  async updateQuantity(itemId: number, quantity: number): Promise<Cart> {
    try {
      const response = await api.put<CartResponse>(`/cart/items/${itemId}`, {
        quantity,
      });
      if (!response.data.success || !response.data.cart) {
        throw new Error('Failed to update quantity');
      }
      return response.data.cart;
    } catch (error: any) {
      console.error('Update quantity error:', error);
      throw new Error(
        error.response?.data?.message || 
        error.message || 
        'Failed to update quantity'
      );
    }
  },

  /**
   * Remove item from cart
   */
  async removeItem(itemId: number): Promise<Cart> {
    try {
      const response = await api.delete<CartResponse>(`/cart/items/${itemId}`);
      if (!response.data.success || !response.data.cart) {
        throw new Error('Failed to remove item');
      }
      return response.data.cart;
    } catch (error: any) {
      console.error('Remove item error:', error);
      throw new Error(
        error.response?.data?.message || 
        error.message || 
        'Failed to remove item'
      );
    }
  },

  /**
   * Clear entire cart
   */
  async clearCart(): Promise<void> {
    try {
      await api.delete('/cart/clear');
    } catch (error: any) {
      console.error('Clear cart error:', error);
      throw new Error(
        error.response?.data?.message || 
        error.message || 
        'Failed to clear cart'
      );
    }
  },

  /**
   * Get session ID for guest cart
   */
  getSessionId(): string {
    let sessionId = localStorage.getItem('cart_session_id');
    if (!sessionId) {
      sessionId = this.generateSessionId();
      localStorage.setItem('cart_session_id', sessionId);
    }
    return sessionId;
  },

  /**
   * Generate unique session ID
   */
  generateSessionId(): string {
    return `guest_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  },

  /**
   * Clear session ID (call after login merge)
   */
  clearSessionId(): void {
    localStorage.removeItem('cart_session_id');
  },
};
