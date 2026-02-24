import { ProductWithVariants, ProductVariant, Attribute } from './variant';

export interface Category {
  id: number;
  name: string;
  slug: string;
  description?: string;
  parent_id?: number;
  is_active: boolean;
  sort_order: number;
  children?: Category[];
  created_at: string;
  updated_at: string;
}

export interface ProductImage {
  id: number;
  product_id: number;
  image_url: string;
  is_primary: boolean;
  sort_order: number;
}

// Legacy color/size support (backward compatible)
export interface ProductColor {
  id: number;
  name: string;
  code: string;
  hex_code: string;
}

export interface ProductSize {
  id: number;
  name: string;
  code: string;
}

export interface Product {
  id: number;
  name: string;
  slug: string;
  description?: string;
  short_description?: string;
  price: number;
  sale_price?: number;
  sku: string;
  stock_quantity: number;
  is_active: boolean;
  is_featured: boolean;
  category_id: number;
  category?: Category;
  images?: ProductImage[];
  current_price: number;
  in_stock: boolean;
  created_at: string;
  updated_at: string;
  
  // Variant system support
  has_variants?: boolean;
  variants?: ProductVariant[];
  available_variants?: ProductVariant[];
  attributes?: Attribute[];
  total_stock?: number;
  
  // Legacy support (backward compatible)
  sizes?: ProductSize[];
  colors?: ProductColor[];
}

export interface ProductsResponse {
  data: Product[];
  current_page: number;
  last_page: number;
  per_page: number;
  total: number;
}

// Re-export variant types for convenience
export type { ProductWithVariants, ProductVariant, Attribute };
