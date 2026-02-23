/**
 * Products Page Constants
 * Centralized configuration for products listing
 */

export const PRODUCTS_CONFIG = {
  // Pagination
  PRODUCTS_PER_PAGE: 20,
  TRENDING_PRODUCTS_COUNT: 4,
  
  // Product badges
  NEW_PRODUCT_DAYS: 7,
  LOW_STOCK_THRESHOLD: 5,
  
  // Sort options
  SORT_OPTIONS: [
    { value: 'newest', label: 'Newest' },
    { value: 'price-low', label: 'Price: Low to High' },
    { value: 'price-high', label: 'Price: High to Low' },
    { value: 'popular', label: 'Most Popular' },
  ] as const,
  
  // Grid breakpoints
  GRID_COLS: {
    mobile: 1,
    tablet: 2,
    desktop: 4,
  },
  
  // Animation durations (ms)
  ANIMATION: {
    hover: 300,
    transition: 200,
  },
} as const;

export type SortOption = typeof PRODUCTS_CONFIG.SORT_OPTIONS[number]['value'];
