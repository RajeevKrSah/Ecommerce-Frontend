// Product Variant System Types

export interface Attribute {
  id: number;
  name: string;
  code: string;
  type: 'select' | 'color' | 'text';
  is_required?: boolean;
  values: AttributeValue[];
  sort_order: number;
}

export interface AttributeValue {
  id: number;
  value: string;
  code: string;
  meta?: {
    hex?: string;
    image?: string;
    [key: string]: any;
  };
  attribute?: {
    id: number;
    name: string;
    code: string;
    type: string;
  };
}

export interface FormattedAttribute {
  name: string;
  code: string;
  type: string;
  value: string;
  value_code: string;
  meta?: any;
}

export interface VariantImage {
  id: number;
  url: string;
  thumbnail?: string;
  is_primary: boolean;
}

export interface ProductVariant {
  id: number;
  sku: string;
  price: number;
  original_price?: number;
  price_adjustment?: number;
  stock_quantity: number;
  is_in_stock: boolean;
  is_low_stock: boolean;
  is_available: boolean;
  low_stock_threshold: number;
  weight?: number;
  
  // Legacy support
  size?: {
    id: number;
    name: string;
    code: string;
  };
  color?: {
    id: number;
    name: string;
    code: string;
    hex: string;
  };
  
  // New dynamic attributes
  attributes?: AttributeValue[];
  formatted_attributes?: FormattedAttribute[];
  
  // Images
  image_url?: string;
  images?: VariantImage[];
  
  // Availability
  available_from?: string;
  available_until?: string;
  
  is_active: boolean;
  created_at?: string;
  updated_at?: string;
}

export interface ProductWithVariants {
  id: number;
  name: string;
  slug: string;
  description?: string;
  short_description?: string;
  sku: string;
  
  // Pricing
  price: number;
  sale_price?: number;
  current_price: number;
  
  // Stock
  stock_quantity: number;
  in_stock: boolean;
  total_stock?: number;
  
  // Category
  category?: {
    id: number;
    name: string;
    slug: string;
  };
  
  // Images
  images?: Array<{
    id: number;
    url: string;
    is_primary: boolean;
  }>;
  
  // Variants
  has_variants: boolean;
  variants?: ProductVariant[];
  available_variants?: ProductVariant[];
  
  // Attributes (for variant configuration)
  attributes?: Attribute[];
  
  // Legacy size/color support
  sizes?: string[];
  colors?: Array<{
    name: string;
    value: string;
    hex: string;
  }>;
  
  // Flags
  is_active: boolean;
  is_featured: boolean;
  
  // Timestamps
  created_at?: string;
  updated_at?: string;
}

export interface VariantSelection {
  [attributeCode: string]: string; // e.g., { color: 'black', size: 'm' }
}

export interface StockHistoryEntry {
  id: number;
  product_variant_id: number;
  quantity_change: number;
  quantity_after: number;
  reason: string;
  notes?: string;
  user?: {
    id: number;
    name: string;
    email: string;
  };
  created_at: string;
}

export interface CreateVariantRequest {
  sku: string;
  price?: number;
  price_adjustment?: number;
  stock_quantity: number;
  low_stock_threshold?: number;
  weight?: number;
  image_url?: string;
  is_active?: boolean;
  available_from?: string;
  available_until?: string;
  attribute_values: number[];
  images?: Array<{
    url: string;
    thumbnail_url?: string;
    is_primary?: boolean;
  }>;
}

export interface UpdateStockRequest {
  quantity: number;
  operation: 'set' | 'increment' | 'decrement';
  reason?: string;
  notes?: string;
}

export interface FindVariantRequest {
  attributes: VariantSelection;
}
