/**
 * Type definitions for Product Management
 * @module admin/products/types
 */

import { Attribute } from '@/types/variant';

export interface Product {
  id: number;
  name: string;
  sku: string;
  price: number;
  sale_price?: number | null;
  stock_quantity: number;
  in_stock: boolean;
  is_active?: boolean;
  category?: {
    id: number;
    name: string;
  };
  images?: Array<{ 
    image_url: string;
    full_image_url?: string;
    is_primary?: boolean;
  }>;
  updated_at?: string;
  has_variants?: boolean;
}

export interface Category {
  id: number;
  name: string;
  slug: string;
}

export interface ProductFormData {
  name: string;
  slug: string;
  description: string;
  short_description: string;
  price: number | string;
  sale_price: number | string;
  sku: string;
  stock_quantity: number | string;
  category_id: number | string;
  is_active: boolean;
  is_featured: boolean;
  has_variants: boolean;
}

export interface VariantFormData {
  sku: string;
  price: string;
  stock_quantity: string;
  attribute_values: number[];
}

export interface ProductImage {
  file?: File;
  preview: string;
  is_primary: boolean;
}

export interface ProductModalProps {
  product?: Product | null;
  categories: Category[];
  attributes: Attribute[];
  sizes: any[];
  colors: any[];
  onClose: () => void;
  onSave: (product: Product) => void;
  mode: 'create' | 'edit';
}

export type FormStep = 'basic' | 'variants';
