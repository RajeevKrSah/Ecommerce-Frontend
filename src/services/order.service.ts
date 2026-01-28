import api from '@/lib/api';
import { Order, CheckoutFormData } from '@/types/order';

export const orderService = {
  async getOrders(): Promise<Order[]> {
    const response = await api.get('/orders');
    return response.data.orders;
  },

  async getOrder(orderId: number): Promise<Order> {
    const response = await api.get(`/orders/${orderId}`);
    return response.data.order;
  },

  async createOrder(data: CheckoutFormData): Promise<Order> {
    const response = await api.post('/orders', data);
    return response.data.order;
  },
};
