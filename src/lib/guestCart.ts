// Guest cart management using localStorage
// This allows users to add items to cart BEFORE logging in

export interface GuestCartItem {
  productId: number;
  quantity: number;
  variantId?: number;
  metadata?: {
    size?: string;
    color?: string;
    color_hex?: string;
  };
}

const GUEST_CART_KEY = 'guest_cart';

export const guestCartManager = {
  // Get guest cart from localStorage
  getCart(): GuestCartItem[] {
    if (typeof window === 'undefined') return [];
    
    try {
      const cart = localStorage.getItem(GUEST_CART_KEY);
      return cart ? JSON.parse(cart) : [];
    } catch (error) {
      console.error('Failed to get guest cart:', error);
      return [];
    }
  },

  // Add item to guest cart
  addItem(productId: number, quantity: number = 1, variantId?: number, metadata?: any): GuestCartItem[] {
    const cart = this.getCart();
    // Find existing item with same product, variant, AND metadata (size/color)
    const existingItem = cart.find(item => {
      const sameProduct = item.productId === productId && item.variantId === variantId;
      const sameMetadata = JSON.stringify(item.metadata || {}) === JSON.stringify(metadata || {});
      return sameProduct && sameMetadata;
    });

    if (existingItem) {
      existingItem.quantity += quantity;
    } else {
      cart.push({ productId, quantity, variantId, metadata });
    }

    this.saveCart(cart);
    return cart;
  },

  // Update item quantity
  updateItem(productId: number, quantity: number, variantId?: number, metadata?: any): GuestCartItem[] {
    const cart = this.getCart();
    const item = cart.find(item => {
      const sameProduct = item.productId === productId && item.variantId === variantId;
      const sameMetadata = JSON.stringify(item.metadata || {}) === JSON.stringify(metadata || {});
      return sameProduct && sameMetadata;
    });

    if (item) {
      item.quantity = quantity;
    }

    this.saveCart(cart);
    return cart;
  },

  // Remove item from cart
  removeItem(productId: number, variantId?: number, metadata?: any): GuestCartItem[] {
    const cart = this.getCart().filter(item => {
      const sameProduct = item.productId === productId && item.variantId === variantId;
      const sameMetadata = JSON.stringify(item.metadata || {}) === JSON.stringify(metadata || {});
      return !(sameProduct && sameMetadata);
    });
    this.saveCart(cart);
    return cart;
  },

  // Clear entire cart
  clearCart(): void {
    if (typeof window === 'undefined') return;
    localStorage.removeItem(GUEST_CART_KEY);
  },

  // Get cart count
  getCartCount(): number {
    return this.getCart().reduce((total, item) => total + item.quantity, 0);
  },

  // Save cart to localStorage
  saveCart(cart: GuestCartItem[]): void {
    if (typeof window === 'undefined') return;
    
    try {
      localStorage.setItem(GUEST_CART_KEY, JSON.stringify(cart));
      // Dispatch custom event for cart updates
      window.dispatchEvent(new CustomEvent('guestCartUpdated', { detail: cart }));
    } catch (error) {
      console.error('Failed to save guest cart:', error);
    }
  },
};
