import adminApi from '@/lib/adminApi';
import { Order } from '@/types/order';
import { User } from '@/types/auth';
import { Product } from '@/types/product';

export interface AdminOrdersResponse {
  data: Order[];
  current_page: number;
  last_page: number;
  per_page: number;
  total: number;
}

export interface AdminDashboardStats {
  stats: {
    total_users: number;
    total_products: number;
    total_orders: number;
    total_revenue: number;
    pending_orders: number;
    processing_orders: number;
    shipped_orders: number;
    delivered_orders: number;
    cancelled_orders: number;
    in_stock_products: number;
    out_of_stock_products: number;
    low_stock_products: number;
  };
  recent_orders: Order[];
  revenue_by_month: Array<{
    month: string;
    revenue: number;
    orders: number;
  }>;
  top_products: Array<{
    id: number;
    name: string;
    total_sold: number;
    revenue: number;
  }>;
}

export const adminService = {
  async getDashboard(): Promise<AdminDashboardStats> {
    const response = await adminApi.get('/admin/dashboard');
    return response.data;
  },

  async getDashboardStats(): Promise<AdminDashboardStats> {
    const response = await adminApi.get('/admin/dashboard/stats');
    return response.data;
  },

  async getOrders(params?: {
    status?: string;
    search?: string;
    page?: number;
  }): Promise<AdminOrdersResponse> {
    const response = await adminApi.get('/admin/orders', { params });
    return response.data;
  },

  async updateOrderStatus(
    orderId: number,
    status: string,
    notes?: string
  ): Promise<Order> {
    try {
      console.log('adminService.updateOrderStatus called with:', { orderId, status, notes });
      console.log('Making PUT request to:', `/admin/orders/${orderId}/status`);
      
      const response = await adminApi.put(`/admin/orders/${orderId}/status`, {
        status,
        notes,
      });
      
      console.log('adminService.updateOrderStatus response:', response);
      console.log('adminService.updateOrderStatus response.data:', response.data);
      console.log('adminService.updateOrderStatus response.data.order:', response.data?.order);
      
      if (!response.data) {
        console.error('No response.data received');
        throw new Error('Invalid response: no data received');
      }
      
      if (!response.data.order) {
        console.error('No order in response.data:', response.data);
        throw new Error('Invalid response structure: missing order data');
      }
      
      return response.data.order;
    } catch (error: any) {
      console.error('adminService.updateOrderStatus error:', error);
      console.error('Error type:', typeof error);
      console.error('Error constructor:', error?.constructor?.name);
      console.error('Error message:', error?.message);
      console.error('Error response:', error?.response);
      console.error('Error response data:', error?.response?.data);
      console.error('Error stringified:', JSON.stringify(error, Object.getOwnPropertyNames(error)));
      throw error;
    }
  },

  async getUsers(params?: {
    search?: string;
    role?: string;
    page?: number;
  }): Promise<{ data: User[]; current_page: number; last_page: number; total: number }> {
    const response = await adminApi.get('/admin/users', { params });
    return response.data;
  },

  async updateUserRole(userId: number, role: 'user' | 'admin'): Promise<User> {
    const response = await adminApi.put(`/admin/users/${userId}/role`, { role });
    return response.data.user;
  },

  async getProducts(params?: {
    search?: string;
    category?: number;
    stock_status?: string;
    page?: number;
  }): Promise<{ data: Product[]; current_page: number; last_page: number; total: number }> {
    const response = await adminApi.get('/admin/products', { params });
    return response.data;
  },

  async updateStock(productId: number, stock_quantity: number): Promise<Product> {
    const response = await adminApi.put(`/admin/products/${productId}/stock`, {
      stock_quantity,
    });
    return response.data.product;
  },

  async createProduct(data: {
    name: string;
    slug: string;
    description?: string;
    short_description?: string;
    price: number;
    sale_price?: number;
    sku: string;
    stock_quantity: number;
    category_id: number;
    is_active?: boolean;
    is_featured?: boolean;
  }, images?: File[]): Promise<Product> {
    const formData = new FormData();
    
    // Append product data
    Object.entries(data).forEach(([key, value]) => {
      if (value !== undefined && value !== null) {
        // Convert booleans to 1 or 0 for Laravel
        if (typeof value === 'boolean') {
          formData.append(key, value ? '1' : '0');
        } else {
          formData.append(key, value.toString());
        }
      }
    });

    // Append images
    if (images && images.length > 0) {
      images.forEach((image) => {
        formData.append('images[]', image);
      });
    }

    const response = await adminApi.post('/admin/products', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data.product;
  },

  async updateProduct(productId: number, data: Partial<{
    name: string;
    slug: string;
    description: string;
    short_description: string;
    price: number;
    sale_price: number;
    sku: string;
    stock_quantity: number;
    category_id: number;
    is_active: boolean;
    is_featured: boolean;
  }>, images?: File[]): Promise<Product> {
    try {
      console.log('adminService.updateProduct called with:', { productId, data, hasImages: !!images });
      
      // If images are provided, use FormData
      if (images && images.length > 0) {
        const formData = new FormData();
        
        // Append product data
        Object.entries(data).forEach(([key, value]) => {
          if (value !== undefined && value !== null) {
            // Convert booleans to 1 or 0 for Laravel
            if (typeof value === 'boolean') {
              formData.append(key, value ? '1' : '0');
            } else {
              formData.append(key, value.toString());
            }
          }
        });

        // Append images
        images.forEach((image) => {
          formData.append('images[]', image);
        });

        // Laravel doesn't support PUT with FormData, so we use POST with _method
        formData.append('_method', 'PUT');

        const response = await adminApi.post(`/admin/products/${productId}`, formData, {
          headers: {
            'Content-Type': 'multipart/form-data',
          },
        });
        
        console.log('adminService.updateProduct response:', response);
        console.log('adminService.updateProduct response.data:', response.data);
        
        if (!response.data || !response.data.product) {
          throw new Error('Invalid response structure: missing product data');
        }
        
        return response.data.product;
      }
      
      // Otherwise, use regular JSON PUT request
      console.log('Making PUT request to:', `/admin/products/${productId}`);
      const response = await adminApi.put(`/admin/products/${productId}`, data);
      
      console.log('adminService.updateProduct response:', response);
      console.log('adminService.updateProduct response.data:', response.data);
      console.log('adminService.updateProduct response.data.product:', response.data?.product);
      
      if (!response.data) {
        throw new Error('Invalid response: no data received');
      }
      
      if (!response.data.product) {
        throw new Error('Invalid response structure: missing product data');
      }
      
      return response.data.product;
    } catch (error) {
      console.error('adminService.updateProduct error:', error);
      throw error;
    }
  },

  async deleteProduct(productId: number): Promise<void> {
    await adminApi.delete(`/admin/products/${productId}`);
  },

  async deleteProductImage(imageId: number): Promise<void> {
    await adminApi.delete(`/admin/product-images/${imageId}`);
  },

  async setPrimaryImage(imageId: number): Promise<void> {
    await adminApi.put(`/admin/product-images/${imageId}/primary`);
  },

  async getCategories(): Promise<Array<{ id: number; name: string; slug: string }>> {
    const response = await adminApi.get('/admin/categories');
    return response.data.categories;
  },

  async createCategory(data: {
    name: string;
    slug: string;
    description?: string;
  }): Promise<any> {
    const response = await adminApi.post('/admin/categories', data);
    return response.data.category;
  },

  async updateCategory(categoryId: number, data: Partial<{
    name: string;
    slug: string;
    description: string;
  }>): Promise<any> {
    const response = await adminApi.put(`/admin/categories/${categoryId}`, data);
    return response.data.category;
  },

  async deleteCategory(categoryId: number): Promise<void> {
    await adminApi.delete(`/admin/categories/${categoryId}`);
  },

  async updateUser(userId: number, data: Partial<{
    name: string;
    email: string;
    role: string;
  }>): Promise<User> {
    const response = await adminApi.put(`/admin/users/${userId}`, data);
    return response.data.user;
  },

  async deleteUser(userId: number): Promise<void> {
    await adminApi.delete(`/admin/users/${userId}`);
  },

  // Colors management
  async getColors(): Promise<Array<{ id: number; name: string; code: string; hex_code: string; sort_order: number; is_active: boolean; created_at?: string; updated_at?: string }>> {
    const response = await adminApi.get('/admin/colors');
    return response.data;
  },

  async createColor(data: {
    name: string;
    code: string;
    hex_code: string;
    sort_order?: number;
  }): Promise<any> {
    const response = await adminApi.post('/admin/colors', data);
    return response.data;
  },

  async updateColor(colorId: number, data: Partial<{
    name: string;
    code: string;
    hex_code: string;
    sort_order: number;
    is_active: boolean;
  }>): Promise<any> {
    const response = await adminApi.put(`/admin/colors/${colorId}`, data);
    return response.data;
  },

  async deleteColor(colorId: number): Promise<void> {
    await adminApi.delete(`/admin/colors/${colorId}`);
  },

  // Sizes management
  async getSizes(): Promise<Array<{ id: number; name: string; code: string; sort_order: number; is_active: boolean; created_at?: string; updated_at?: string }>> {
    const response = await adminApi.get('/admin/sizes');
    return response.data;
  },

  async createSize(data: {
    name: string;
    code: string;
    sort_order?: number;
  }): Promise<any> {
    const response = await adminApi.post('/admin/sizes', data);
    return response.data;
  },

  async updateSize(sizeId: number, data: Partial<{
    name: string;
    code: string;
    sort_order: number;
    is_active: boolean;
  }>): Promise<any> {
    const response = await adminApi.put(`/admin/sizes/${sizeId}`, data);
    return response.data;
  },

  async deleteSize(sizeId: number): Promise<void> {
    await adminApi.delete(`/admin/sizes/${sizeId}`);
  },
};
