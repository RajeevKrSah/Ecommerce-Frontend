import { Product } from './product';

export interface WishlistItem {
  id: number;
  wishlist_id: number;
  product_id: number;
  product?: Product;
  created_at: string;
  updated_at: string;
}

export interface Wishlist {
  id: number;
  user_id: number;
  items: WishlistItem[];
  total_items: number;
  created_at: string;
  updated_at: string;
}
