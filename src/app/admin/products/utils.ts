/**
 * Utility functions for admin products
 * @module admin/products/utils
 */

import { Product } from './types';
import { PRODUCTS_CONFIG } from './config';

/**
 * Format currency value
 */
export const formatCurrency = (value: number, currency: string = 'USD'): string => {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency,
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(value);
};

/**
 * Format date to readable string
 */
export const formatDate = (dateString?: string): string => {
  if (!dateString) return 'N/A';
  
  try {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
    });
  } catch (error) {
    return 'Invalid date';
  }
};

/**
 * Format date with time
 */
export const formatDateTime = (dateString?: string): string => {
  if (!dateString) return 'N/A';
  
  try {
    const date = new Date(dateString);
    return date.toLocaleString('en-US', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  } catch (error) {
    return 'Invalid date';
  }
};

/**
 * Generate slug from string
 */
export const generateSlug = (text: string): string => {
  return text
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, '') // Remove special characters
    .replace(/[\s_-]+/g, '-') // Replace spaces and underscores with hyphens
    .replace(/^-+|-+$/g, ''); // Remove leading/trailing hyphens
};

/**
 * Generate SKU from product name
 */
export const generateSKU = (name: string, prefix: string = 'PRD'): string => {
  const cleanName = name
    .toUpperCase()
    .replace(/[^A-Z0-9]/g, '')
    .substring(0, 6);
  
  const timestamp = Date.now().toString().slice(-6);
  return `${prefix}-${cleanName}-${timestamp}`;
};

/**
 * Calculate discount percentage
 */
export const calculateDiscount = (price: number, salePrice: number): number => {
  if (salePrice >= price) return 0;
  return Math.round(((price - salePrice) / price) * 100);
};

/**
 * Format file size
 */
export const formatFileSize = (bytes: number): string => {
  if (bytes === 0) return '0 Bytes';
  
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  
  return Math.round(bytes / Math.pow(k, i) * 100) / 100 + ' ' + sizes[i];
};

/**
 * Validate image dimensions
 */
export const validateImageDimensions = async (
  file: File,
  minWidth: number = 800,
  minHeight: number = 800
): Promise<{ valid: boolean; error?: string; dimensions?: { width: number; height: number } }> => {
  return new Promise((resolve) => {
    const img = new Image();
    const url = URL.createObjectURL(file);
    
    img.onload = () => {
      URL.revokeObjectURL(url);
      
      if (img.width < minWidth || img.height < minHeight) {
        resolve({
          valid: false,
          error: `Image dimensions too small. Minimum: ${minWidth}x${minHeight}px`,
          dimensions: { width: img.width, height: img.height }
        });
      } else {
        resolve({
          valid: true,
          dimensions: { width: img.width, height: img.height }
        });
      }
    };
    
    img.onerror = () => {
      URL.revokeObjectURL(url);
      resolve({
        valid: false,
        error: 'Failed to load image'
      });
    };
    
    img.src = url;
  });
};

/**
 * Debounce function
 */
export const debounce = <T extends (...args: any[]) => any>(
  func: T,
  wait: number
): ((...args: Parameters<T>) => void) => {
  let timeout: NodeJS.Timeout | null = null;
  
  return (...args: Parameters<T>) => {
    if (timeout) clearTimeout(timeout);
    timeout = setTimeout(() => func(...args), wait);
  };
};

/**
 * Throttle function
 */
export const throttle = <T extends (...args: any[]) => any>(
  func: T,
  limit: number
): ((...args: Parameters<T>) => void) => {
  let inThrottle: boolean = false;
  
  return (...args: Parameters<T>) => {
    if (!inThrottle) {
      func(...args);
      inThrottle = true;
      setTimeout(() => (inThrottle = false), limit);
    }
  };
};

/**
 * Deep clone object
 */
export const deepClone = <T>(obj: T): T => {
  return JSON.parse(JSON.stringify(obj));
};

/**
 * Check if product is on sale
 */
export const isOnSale = (product: Product): boolean => {
  return !!(product.sale_price && product.sale_price < product.price);
};

/**
 * Get product display price
 */
export const getDisplayPrice = (product: Product): number => {
  return isOnSale(product) ? product.sale_price! : product.price;
};

/**
 * Calculate stock percentage
 */
export const calculateStockPercentage = (current: number, max: number = 100): number => {
  return Math.min((current / max) * 100, 100);
};

/**
 * Sort products by field
 */
export const sortProducts = (
  products: Product[],
  field: keyof Product,
  order: 'asc' | 'desc' = 'asc'
): Product[] => {
  return [...products].sort((a, b) => {
    const aVal = a[field];
    const bVal = b[field];
    
    if (aVal === undefined || aVal === null) return 1;
    if (bVal === undefined || bVal === null) return -1;
    
    if (typeof aVal === 'string' && typeof bVal === 'string') {
      return order === 'asc'
        ? aVal.localeCompare(bVal)
        : bVal.localeCompare(aVal);
    }
    
    if (typeof aVal === 'number' && typeof bVal === 'number') {
      return order === 'asc' ? aVal - bVal : bVal - aVal;
    }
    
    return 0;
  });
};

/**
 * Filter products by search term
 */
export const filterProducts = (products: Product[], searchTerm: string): Product[] => {
  if (!searchTerm || searchTerm.length < PRODUCTS_CONFIG.MIN_SEARCH_LENGTH) {
    return products;
  }
  
  const term = searchTerm.toLowerCase();
  
  return products.filter(product =>
    product.name.toLowerCase().includes(term) ||
    product.sku.toLowerCase().includes(term) ||
    product.category?.name.toLowerCase().includes(term)
  );
};

/**
 * Group products by category
 */
export const groupByCategory = (products: Product[]): Record<string, Product[]> => {
  return products.reduce((acc, product) => {
    const category = product.category?.name || 'Uncategorized';
    if (!acc[category]) {
      acc[category] = [];
    }
    acc[category].push(product);
    return acc;
  }, {} as Record<string, Product[]>);
};

/**
 * Calculate total inventory value
 */
export const calculateInventoryValue = (products: Product[]): number => {
  return products.reduce((total, product) => {
    return total + (getDisplayPrice(product) * product.stock_quantity);
  }, 0);
};

/**
 * Get low stock products
 */
export const getLowStockProducts = (
  products: Product[],
  threshold: number = PRODUCTS_CONFIG.STOCK_THRESHOLDS.LOW
): Product[] => {
  return products.filter(product =>
    product.stock_quantity > 0 && product.stock_quantity <= threshold
  );
};

/**
 * Get out of stock products
 */
export const getOutOfStockProducts = (products: Product[]): Product[] => {
  return products.filter(product => product.stock_quantity === 0);
};

/**
 * Export products to CSV
 */
export const exportToCSV = (products: Product[], filename: string = 'products.csv'): void => {
  const headers = ['ID', 'Name', 'SKU', 'Price', 'Sale Price', 'Stock', 'Category', 'Status'];
  const rows = products.map(p => [
    p.id,
    p.name,
    p.sku,
    p.price,
    p.sale_price || '',
    p.stock_quantity,
    p.category?.name || '',
    p.is_active ? 'Active' : 'Inactive'
  ]);
  
  const csvContent = [
    headers.join(','),
    ...rows.map(row => row.join(','))
  ].join('\n');
  
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const link = document.createElement('a');
  const url = URL.createObjectURL(blob);
  
  link.setAttribute('href', url);
  link.setAttribute('download', filename);
  link.style.visibility = 'hidden';
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
};

/**
 * Sanitize HTML to prevent XSS
 */
export const sanitizeHTML = (html: string): string => {
  const div = document.createElement('div');
  div.textContent = html;
  return div.innerHTML;
};

/**
 * Truncate text
 */
export const truncate = (text: string, maxLength: number = 50): string => {
  if (text.length <= maxLength) return text;
  return text.substring(0, maxLength) + '...';
};
