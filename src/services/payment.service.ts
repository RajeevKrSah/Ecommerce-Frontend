import api from '@/lib/api';

export interface PaymentIntent {
  clientSecret: string;
  paymentIntentId: string;
  expiresAt: string;
}

export interface PaymentStatus {
  payment_status: 'pending' | 'paid' | 'failed' | 'expired' | 'refunded' | 'partially_refunded';
  payment_intent_id: string | null;
  paid_at: string | null;
  payment_expires_at: string | null;
  refunded_amount: number;
  refunded_at: string | null;
}

export interface PaymentTransaction {
  id: number;
  order_id: number;
  transaction_type: 'charge' | 'refund' | 'failed' | 'cancelled';
  stripe_id: string;
  amount: number;
  currency: string;
  status: string;
  payment_method: string | null;
  failure_reason: string | null;
  metadata: any;
  processed_at: string;
  created_at: string;
}

export interface RefundRequest {
  reason?: string;
}

export interface PartialRefundRequest {
  amount: number;
  reason?: string;
}

export interface PaymentAnalytics {
  total_transactions: number;
  successful_payments: number;
  failed_payments: number;
  total_refunds: number;
  total_revenue: number;
  total_refunded: number;
  success_rate: number;
}

export const paymentService = {
  async createPaymentIntent(orderId: number): Promise<PaymentIntent> {
    const response = await api.post(`/orders/${orderId}/payment/intent`);
    return response.data;
  },

  async getPaymentStatus(orderId: number): Promise<PaymentStatus> {
    const response = await api.get(`/orders/${orderId}/payment/status`);
    return response.data;
  },

  async confirmPayment(orderId: number): Promise<{ message: string; payment_status: string }> {
    const response = await api.post(`/orders/${orderId}/payment/confirm`);
    return response.data;
  },

  async getTransactions(orderId: number): Promise<PaymentTransaction[]> {
    const response = await api.get(`/orders/${orderId}/payment/transactions`);
    return response.data.transactions;
  },

  // Admin only
  async refundOrder(orderId: number, data: RefundRequest): Promise<any> {
    const response = await api.post(`/admin/orders/${orderId}/refund`, data);
    return response.data;
  },

  // Admin only
  async partialRefund(orderId: number, data: PartialRefundRequest): Promise<any> {
    const response = await api.post(`/admin/orders/${orderId}/refund/partial`, data);
    return response.data;
  },

  // Admin only
  async getAnalytics(startDate?: string, endDate?: string): Promise<PaymentAnalytics> {
    const params = new URLSearchParams();
    if (startDate) params.append('start_date', startDate);
    if (endDate) params.append('end_date', endDate);
    
    const response = await api.get(`/admin/payment/analytics?${params.toString()}`);
    return response.data;
  },
};
