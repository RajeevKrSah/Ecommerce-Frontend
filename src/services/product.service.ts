import api from '@/lib/api';
import { Product, ProductsResponse, Category } from '@/types/product';

export const productService = {
  async getProducts(params?: {
    search?: string;
    category_id?: number;
    featured?: boolean;
    in_stock?: boolean;
    sort_by?: string;
    sort_order?: 'asc' | 'desc';
    page?: number;
    per_page?: number;
  }): Promise<ProductsResponse> {
    const response = await api.get('/products', { params });
    return response.data;
  },

  async getProduct(slug: string): Promise<Product> {
    const response = await api.get(`/products/${slug}`);
    // ProductResource wraps the data in a 'data' property
    return response.data.data || response.data;
  },

  async getProductById(id: number): Promise<Product> {
    // First get all products, then find by ID
    // This is a workaround since we don't have a direct ID endpoint
    const response = await api.get('/products');
    const products = response.data.data || response.data;
    const product = products.find((p: Product) => p.id === id);
    if (!product) {
      throw new Error('Product not found');
    }
    return product;
  },

  async getCategories(): Promise<Category[]> {
    const response = await api.get('/categories');
    return response.data;
  },

  async getCategory(id: number): Promise<Category> {
    const response = await api.get(`/categories/${id}`);
    return response.data;
  },
};
