export interface OrderItem {
  id: number;
  product_id: number;
  product_name: string;
  product_sku: string;
  quantity: number;
  price: number | string;
  total: number | string;
}

export interface Order {
  id: number;
  order_number: string;
  user_id: number;
  subtotal: number | string;
  tax: number | string;
  shipping: number | string;
  total: number | string;
  currency?: string;
  shipping_name: string;
  shipping_email: string;
  shipping_phone: string;
  shipping_address: string;
  shipping_city: string;
  shipping_state: string;
  shipping_zip: string;
  shipping_country: string;
  status: 'pending' | 'processing' | 'shipped' | 'delivered' | 'cancelled';
  payment_status: 'pending' | 'paid' | 'failed' | 'expired' | 'refunded' | 'partially_refunded';
  payment_intent_id?: string | null;
  payment_method?: string | null;
  paid_at?: string | null;
  payment_expires_at?: string | null;
  refunded_amount: number | string;
  refunded_at?: string | null;
  refund_reason?: string | null;
  notes: string | null;
  items: OrderItem[];
  created_at: string;
  updated_at: string;
}

export interface CheckoutFormData {
  shipping_name: string;
  shipping_email: string;
  shipping_phone: string;
  shipping_address: string;
  shipping_city: string;
  shipping_state: string;
  shipping_zip: string;
  shipping_country?: string;
  notes?: string;
}
