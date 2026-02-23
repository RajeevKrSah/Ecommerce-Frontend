import api from '@/lib/api';
import {
  ProductVariant,
  CreateVariantRequest,
  UpdateStockRequest,
  FindVariantRequest,
  StockHistoryEntry,
} from '@/types/variant';

export const variantService = {
  /**
   * Get all variants for a product
   */
  async getVariants(
    productId: number,
    params?: {
      available_only?: boolean;
      in_stock_only?: boolean;
      attributes?: Record<string, string>;
    }
  ): Promise<ProductVariant[]> {
    const response = await api.get(`/products/${productId}/variants`, { params });
    return response.data.data;
  },

  /**
   * Get a specific variant
   */
  async getVariant(productId: number, variantId: number): Promise<ProductVariant> {
    const response = await api.get(`/products/${productId}/variants/${variantId}`);
    return response.data.data;
  },

  /**
   * Create a new variant
   */
  async createVariant(
    productId: number,
    data: CreateVariantRequest
  ): Promise<ProductVariant> {
    const response = await api.post(`/products/${productId}/variants`, data);
    return response.data.data;
  },

  /**
   * Update a variant
   */
  async updateVariant(
    productId: number,
    variantId: number,
    data: Partial<CreateVariantRequest>
  ): Promise<ProductVariant> {
    const response = await api.put(`/products/${productId}/variants/${variantId}`, data);
    return response.data.data;
  },

  /**
   * Delete a variant
   */
  async deleteVariant(productId: number, variantId: number): Promise<void> {
    await api.delete(`/products/${productId}/variants/${variantId}`);
  },

  /**
   * Update variant stock
   */
  async updateStock(
    productId: number,
    variantId: number,
    data: UpdateStockRequest
  ): Promise<{ message: string; stock_quantity: number }> {
    const response = await api.post(
      `/products/${productId}/variants/${variantId}/stock`,
      data
    );
    return response.data;
  },

  /**
   * Get stock history for a variant
   */
  async getStockHistory(
    productId: number,
    variantId: number,
    days: number = 30
  ): Promise<{ data: StockHistoryEntry[]; meta: any }> {
    const response = await api.get(
      `/products/${productId}/variants/${variantId}/history`,
      { params: { days } }
    );
    return response.data;
  },

  /**
   * Find variant by attributes (for cart/checkout)
   */
  async findByAttributes(
    productId: number,
    attributes: Record<string, string>
  ): Promise<ProductVariant> {
    const response = await api.post(`/products/${productId}/variants/find`, {
      attributes,
    });
    return response.data.data;
  },

  /**
   * Helper: Check if variant is available
   */
  isVariantAvailable(variant: ProductVariant): boolean {
    if (!variant.is_active || !variant.is_in_stock) {
      return false;
    }

    const now = new Date();

    if (variant.available_from) {
      const availableFrom = new Date(variant.available_from);
      if (availableFrom > now) {
        return false;
      }
    }

    if (variant.available_until) {
      const availableUntil = new Date(variant.available_until);
      if (availableUntil < now) {
        return false;
      }
    }

    return true;
  },

  /**
   * Helper: Get variant display name from attributes
   */
  getVariantDisplayName(variant: ProductVariant): string {
    if (variant.formatted_attributes && variant.formatted_attributes.length > 0) {
      return variant.formatted_attributes
        .map((attr) => attr.value)
        .join(' / ');
    }

    // Fallback to legacy size/color
    const parts: string[] = [];
    if (variant.color) parts.push(variant.color.name);
    if (variant.size) parts.push(variant.size.name);
    return parts.join(' / ') || variant.sku;
  },

  /**
   * Helper: Get primary image for variant
   */
  getPrimaryImage(variant: ProductVariant): string | undefined {
    if (variant.images && variant.images.length > 0) {
      const primary = variant.images.find((img) => img.is_primary);
      return primary?.url || variant.images[0]?.url;
    }
    return variant.image_url;
  },

  /**
   * Helper: Format price
   */
  formatPrice(price: number, currency: string = 'USD'): string {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency,
    }).format(price);
  },

  /**
   * Helper: Get stock status message
   */
  getStockStatus(variant: ProductVariant): {
    status: 'in_stock' | 'low_stock' | 'out_of_stock';
    message: string;
  } {
    if (!variant.is_in_stock) {
      return {
        status: 'out_of_stock',
        message: 'Out of stock',
      };
    }

    if (variant.is_low_stock) {
      return {
        status: 'low_stock',
        message: `Only ${variant.stock_quantity} left`,
      };
    }

    return {
      status: 'in_stock',
      message: 'In stock',
    };
  },
};

export default variantService;
