/**
 * Admin Products Configuration
 * Centralized configuration for the products module
 * @module admin/products/config
 */

export const PRODUCTS_CONFIG = {
  // Pagination
  DEFAULT_PAGE_SIZE: 20,
  MAX_PAGE_SIZE: 100,
  
  // Search
  SEARCH_DEBOUNCE_MS: 300,
  MIN_SEARCH_LENGTH: 2,
  
  // Images
  MAX_IMAGES_PER_PRODUCT: 10,
  MAX_IMAGE_SIZE_MB: 10,
  ALLOWED_IMAGE_TYPES: ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'],
  RECOMMENDED_IMAGE_SIZE: '1200x1200px',
  
  // Validation
  MIN_PRODUCT_NAME_LENGTH: 3,
  MAX_PRODUCT_NAME_LENGTH: 255,
  MIN_SKU_LENGTH: 3,
  MAX_SKU_LENGTH: 50,
  MIN_PRICE: 0.01,
  MAX_PRICE: 999999.99,
  MIN_STOCK: 0,
  MAX_STOCK: 999999,
  
  // Variants
  MAX_VARIANTS_PER_PRODUCT: 100,
  MAX_ATTRIBUTES_PER_VARIANT: 5,
  
  // UI
  TOAST_DURATION_MS: 5000,
  MODAL_ANIMATION_MS: 200,
  
  // API
  REQUEST_TIMEOUT_MS: 30000,
  MAX_RETRIES: 3,
  RETRY_DELAY_MS: 1000,
  
  // Features
  FEATURES: {
    BULK_OPERATIONS: true,
    VARIANTS: true,
    IMAGE_UPLOAD: true,
    STOCK_MANAGEMENT: true,
    CATEGORIES: true,
    SIZES_COLORS: true,
  },
  
  // Status options
  PRODUCT_STATUSES: [
    { value: 'active', label: 'Active', color: 'green' },
    { value: 'inactive', label: 'Inactive', color: 'gray' },
    { value: 'draft', label: 'Draft', color: 'yellow' },
    { value: 'archived', label: 'Archived', color: 'red' },
  ],
  
  // Stock status thresholds
  STOCK_THRESHOLDS: {
    LOW: 10,
    MEDIUM: 50,
    HIGH: 100,
  },
  
  // Error messages
  ERROR_MESSAGES: {
    NETWORK: 'Network error. Please check your connection.',
    UNAUTHORIZED: 'Session expired. Please login again.',
    FORBIDDEN: 'You do not have permission to perform this action.',
    NOT_FOUND: 'Resource not found.',
    VALIDATION: 'Please check your input and try again.',
    SERVER: 'Server error. Please try again later.',
    UNKNOWN: 'An unexpected error occurred.',
  },
  
  // Success messages
  SUCCESS_MESSAGES: {
    PRODUCT_CREATED: 'Product created successfully',
    PRODUCT_UPDATED: 'Product updated successfully',
    PRODUCT_DELETED: 'Product deleted successfully',
    IMAGE_UPLOADED: 'Image uploaded successfully',
    STATUS_UPDATED: 'Status updated successfully',
  },
} as const;

// Type exports for TypeScript
export type ProductStatus = typeof PRODUCTS_CONFIG.PRODUCT_STATUSES[number]['value'];
export type ErrorType = keyof typeof PRODUCTS_CONFIG.ERROR_MESSAGES;
export type SuccessType = keyof typeof PRODUCTS_CONFIG.SUCCESS_MESSAGES;

// Validation helpers
export const validateProductName = (name: string): boolean => {
  return name.length >= PRODUCTS_CONFIG.MIN_PRODUCT_NAME_LENGTH &&
         name.length <= PRODUCTS_CONFIG.MAX_PRODUCT_NAME_LENGTH;
};

export const validateSKU = (sku: string): boolean => {
  return sku.length >= PRODUCTS_CONFIG.MIN_SKU_LENGTH &&
         sku.length <= PRODUCTS_CONFIG.MAX_SKU_LENGTH;
};

export const validatePrice = (price: number): boolean => {
  return price >= PRODUCTS_CONFIG.MIN_PRICE &&
         price <= PRODUCTS_CONFIG.MAX_PRICE;
};

export const validateStock = (stock: number): boolean => {
  return stock >= PRODUCTS_CONFIG.MIN_STOCK &&
         stock <= PRODUCTS_CONFIG.MAX_STOCK;
};

export const validateImageFile = (file: File): { valid: boolean; error?: string } => {
  if (!PRODUCTS_CONFIG.ALLOWED_IMAGE_TYPES.includes(file.type as any)) {
    return {
      valid: false,
      error: `Invalid file type. Allowed types: ${PRODUCTS_CONFIG.ALLOWED_IMAGE_TYPES.join(', ')}`
    };
  }
  
  const maxSizeBytes = PRODUCTS_CONFIG.MAX_IMAGE_SIZE_MB * 1024 * 1024;
  if (file.size > maxSizeBytes) {
    return {
      valid: false,
      error: `File too large. Maximum size: ${PRODUCTS_CONFIG.MAX_IMAGE_SIZE_MB}MB`
    };
  }
  
  return { valid: true };
};

// Stock status helper
export const getStockStatus = (quantity: number): 'low' | 'medium' | 'high' | 'out' => {
  if (quantity === 0) return 'out';
  if (quantity <= PRODUCTS_CONFIG.STOCK_THRESHOLDS.LOW) return 'low';
  if (quantity <= PRODUCTS_CONFIG.STOCK_THRESHOLDS.MEDIUM) return 'medium';
  return 'high';
};

// Stock color helper
export const getStockColor = (quantity: number): string => {
  const status = getStockStatus(quantity);
  switch (status) {
    case 'out': return 'text-red-600 bg-red-50';
    case 'low': return 'text-orange-600 bg-orange-50';
    case 'medium': return 'text-yellow-600 bg-yellow-50';
    case 'high': return 'text-green-600 bg-green-50';
    default: return 'text-gray-600 bg-gray-50';
  }
};
