import api from '@/lib/api';
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
    const response = await api.get('/admin/dashboard');
    return response.data;
  },

  async getOrders(params?: {
    status?: string;
    search?: string;
    page?: number;
  }): Promise<AdminOrdersResponse> {
    const response = await api.get('/admin/orders', { params });
    return response.data;
  },

  async updateOrderStatus(
    orderId: number,
    status: string,
    notes?: string
  ): Promise<Order> {
    const response = await api.put(`/admin/orders/${orderId}/status`, {
      status,
      notes,
    });
    return response.data.order;
  },

  async getUsers(params?: {
    search?: string;
    role?: string;
    page?: number;
  }): Promise<{ data: User[]; current_page: number; last_page: number; total: number }> {
    const response = await api.get('/admin/users', { params });
    return response.data;
  },

  async updateUserRole(userId: number, role: 'user' | 'admin'): Promise<User> {
    const response = await api.put(`/admin/users/${userId}/role`, { role });
    return response.data.user;
  },

  async getProducts(params?: {
    search?: string;
    category?: number;
    stock_status?: string;
    page?: number;
  }): Promise<{ data: Product[]; current_page: number; last_page: number; total: number }> {
    const response = await api.get('/admin/products', { params });
    return response.data;
  },

  async updateStock(productId: number, stock_quantity: number): Promise<Product> {
    const response = await api.put(`/admin/products/${productId}/stock`, {
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
        formData.append(key, value.toString());
      }
    });

    // Append images
    if (images && images.length > 0) {
      images.forEach((image) => {
        formData.append('images[]', image);
      });
    }

    const response = await api.post('/admin/products', formData, {
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
    const formData = new FormData();
    
    // Append product data
    Object.entries(data).forEach(([key, value]) => {
      if (value !== undefined && value !== null) {
        formData.append(key, value.toString());
      }
    });

    // Append images
    if (images && images.length > 0) {
      images.forEach((image) => {
        formData.append('images[]', image);
      });
    }

    // Laravel doesn't support PUT with FormData, so we use POST with _method
    formData.append('_method', 'PUT');

    const response = await api.post(`/admin/products/${productId}`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data.product;
  },

  async deleteProduct(productId: number): Promise<void> {
    await api.delete(`/admin/products/${productId}`);
  },

  async deleteProductImage(imageId: number): Promise<void> {
    await api.delete(`/admin/product-images/${imageId}`);
  },

  async setPrimaryImage(imageId: number): Promise<void> {
    await api.put(`/admin/product-images/${imageId}/primary`);
  },

  async getCategories(): Promise<Array<{ id: number; name: string; slug: string }>> {
    const response = await api.get('/admin/categories');
    return response.data;
  },
};
