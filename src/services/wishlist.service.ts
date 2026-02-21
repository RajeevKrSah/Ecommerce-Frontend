import api from '@/lib/api';
import { Wishlist } from '@/types/wishlist';

export const wishlistService = {
  async getWishlist(): Promise<Wishlist> {
    const response = await api.get('/wishlist');
    return response.data.wishlist;
  },

  async addToWishlist(productId: number): Promise<Wishlist> {
    const response = await api.post('/wishlist/add', {
      product_id: productId,
    });
    return response.data.wishlist;
  },

  async removeItem(itemId: number): Promise<Wishlist> {
    const response = await api.delete(`/wishlist/items/${itemId}`);
    return response.data.wishlist;
  },

  async removeByProduct(productId: number): Promise<Wishlist> {
    const response = await api.delete(`/wishlist/products/${productId}`);
    return response.data.wishlist;
  },

  async clearWishlist(): Promise<void> {
    await api.delete('/wishlist/clear');
  },

  async checkInWishlist(productId: number): Promise<boolean> {
    const response = await api.get(`/wishlist/check/${productId}`);
    return response.data.in_wishlist;
  },

  async moveToCart(itemId: number): Promise<Wishlist> {
    const response = await api.post(`/wishlist/items/${itemId}/move-to-cart`);
    return response.data.wishlist;
  },
};
