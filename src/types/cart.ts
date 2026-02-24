// Production-Ready Cart Types

export interface Cart {
  id: number;
  user_id: number | null;
  session_id: string | null;
  items: CartItem[];
  subtotal: string;
  total_items: number;
  expires_at: string | null;
  created_at: string;
  updated_at: string;
}

export interface CartItem {
  id: number;
  cart_id: number;
  variant_id: number | null;
  product_id: number | null;
  variant?: ProductVariant;
  product?: Product;
  quantity: number;
  price: string;
  total: string;
  metadata?: CartItemMetadata;
  created_at: string;
  updated_at: string;
}

export interface ProductVariant {
  id: number;
  product_id: number;
  size_id: number | null;
  color_id: number | null;
  sku: string;
  stock_quantity: number;
  price: string;
  final_price: string;
  is_available: boolean;
  is_low_stock: boolean;
  product: Product;
  size?: {
    id: number;
    name: string;
    code: string;
  };
  color?: {
    id: number;
    name: string;
    code: string;
    hex_code: string;
  };
}

export interface Product {
  id: number;
  name: string;
  slug: string;
  price: string;
  sale_price: string | null;
  current_price: string;
  stock_quantity: number;
  in_stock: boolean;
  image: string | null;
  images?: Array<{
    id: number;
    image_url: string;
  }>;
}

export interface CartItemMetadata {
  size?: string;
  color?: string;
  color_hex?: string;
  [key: string]: any;
}

export interface AddToCartRequest {
  product_id?: number;
  variant_id?: number;
  quantity: number;
  metadata?: CartItemMetadata;
}

export interface UpdateCartItemRequest {
  quantity: number;
}

export interface CartResponse {
  success: boolean;
  message?: string;
  cart?: Cart;
  error?: string;
  errors?: Record<string, string[]>;
}

export interface StockValidationError {
  item_id: number;
  message: string;
  available: number;
  requested: number;
}

export interface StockValidationResponse {
  success: boolean;
  message: string;
  errors?: StockValidationError[];
}
