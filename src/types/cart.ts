export interface CartItem {
  id: number;
  product_id: number;
  product: {
    id: number;
    name: string;
    slug: string;
    price: number;
    sale_price: number | null;
    current_price: number;
    stock_quantity: number;
    in_stock: boolean;
    image: string | null;
  };
  quantity: number;
  price: number | string;
  total: number | string;
}

export interface Cart {
  id: number;
  items: CartItem[];
  subtotal: number | string;
  total_items: number;
}
