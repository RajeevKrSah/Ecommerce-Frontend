// Guest wishlist management using localStorage
// This allows users to add items to wishlist BEFORE logging in

export interface GuestWishlistItem {
  productId: number;
  addedAt: string;
  // Product details for display (optional, fetched separately)
  name?: string;
  slug?: string;
  price?: number;
  sale_price?: number;
  image?: string;
  in_stock?: boolean;
}

const GUEST_WISHLIST_KEY = 'guest_wishlist';

export const guestWishlistManager = {
  // Get guest wishlist from localStorage
  getWishlist(): GuestWishlistItem[] {
    if (typeof window === 'undefined') return [];
    
    try {
      const wishlist = localStorage.getItem(GUEST_WISHLIST_KEY);
      return wishlist ? JSON.parse(wishlist) : [];
    } catch (error) {
      console.error('Failed to get guest wishlist:', error);
      return [];
    }
  },

  // Add item to guest wishlist
  addItem(productId: number, productDetails?: Partial<GuestWishlistItem>): GuestWishlistItem[] {
    const wishlist = this.getWishlist();
    const existingItem = wishlist.find(item => item.productId === productId);

    if (existingItem) {
      // Already in wishlist, return as is
      return wishlist;
    }

    const newItem: GuestWishlistItem = { 
      productId, 
      addedAt: new Date().toISOString(),
      ...productDetails,
    };

    wishlist.push(newItem);

    this.saveWishlist(wishlist);
    this.dispatchUpdateEvent();
    return wishlist;
  },

  // Remove item from guest wishlist
  removeItem(productId: number): GuestWishlistItem[] {
    const wishlist = this.getWishlist();
    const filtered = wishlist.filter(item => item.productId !== productId);
    
    this.saveWishlist(filtered);
    this.dispatchUpdateEvent();
    return filtered;
  },

  // Check if item is in wishlist
  isInWishlist(productId: number): boolean {
    const wishlist = this.getWishlist();
    return wishlist.some(item => item.productId === productId);
  },

  // Clear guest wishlist
  clearWishlist(): void {
    if (typeof window === 'undefined') return;
    
    localStorage.removeItem(GUEST_WISHLIST_KEY);
    this.dispatchUpdateEvent();
  },

  // Save wishlist to localStorage
  saveWishlist(wishlist: GuestWishlistItem[]): void {
    if (typeof window === 'undefined') return;
    
    try {
      localStorage.setItem(GUEST_WISHLIST_KEY, JSON.stringify(wishlist));
    } catch (error) {
      console.error('Failed to save guest wishlist:', error);
    }
  },

  // Get wishlist count
  getCount(): number {
    return this.getWishlist().length;
  },

  // Dispatch custom event for wishlist updates
  dispatchUpdateEvent(): void {
    if (typeof window === 'undefined') return;
    
    window.dispatchEvent(new CustomEvent('guestWishlistUpdated'));
  },
};
