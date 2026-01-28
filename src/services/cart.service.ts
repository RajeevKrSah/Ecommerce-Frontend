import api from '@/lib/api';
import { Cart } from '@/types/cart';

export const cartService = {
  async getCart(): Promise<Cart> {
    const response = await api.get('/cart');
    return response.data.cart;
  },

  async addToCart(productId: number, quantity: number = 1): Promise<Cart> {
    console.log('Cart service: Adding to cart', { productId, quantity });
    const response = await api.post('/cart/add', {
      product_id: productId,
      quantity,
    });
    console.log('Cart service: Response', response.data);
    return response.data.cart;
  },

  async updateQuantity(itemId: number, quantity: number): Promise<Cart> {
    const response = await api.put(`/cart/items/${itemId}`, { quantity });
    return response.data.cart;
  },

  async removeItem(itemId: number): Promise<Cart> {
    const response = await api.delete(`/cart/items/${itemId}`);
    return response.data.cart;
  },

  async clearCart(): Promise<void> {
    await api.delete('/cart/clear');
  },
};
