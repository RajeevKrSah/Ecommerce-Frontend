/**
 * Admin Products Page
 * Production-ready implementation with token-based authentication
 * @module admin/products/page
 */

'use client';

import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { useToast } from '@/components/ui/Toast';
import { adminService } from '@/services/admin.service';
import TokenManager from '@/lib/tokenManager';
import { Trash2, RefreshCw, AlertCircle } from 'lucide-react';
import { ProductModal } from './AddProduct';
import { Product, Category } from './types';
import { Attribute } from '@/types/variant';

export default function AdminProductsPage() {
  const router = useRouter();
  const { addToast } = useToast();
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [attributes, setAttributes] = useState<Attribute[]>([]);
  const [sizes, setSizes] = useState<any[]>([]);
  const [colors, setColors] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState('');
  const [selectedProducts, setSelectedProducts] = useState<Set<number>>(new Set());
  const [modalState, setModalState] = useState<{
    isOpen: boolean;
    mode: 'create' | 'edit';
    product: Product | null;
  }>({
    isOpen: false,
    mode: 'create',
    product: null,
  });

  // Check authentication on mount
  useEffect(() => {
    if (!TokenManager.isAuthenticated()) {
      router.replace('/admin/login');
      return;
    }
    fetchData();
  }, []);

  const fetchData = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      
      // Verify token before making requests
      if (!TokenManager.isAuthenticated()) {
        router.replace('/admin/login');
        return;
      }

      // Fetch all data in parallel for better performance
      const [productsData, categoriesData, sizesData, colorsData] = await Promise.allSettled([
        adminService.getProducts(),
        adminService.getCategories(),
        adminService.getSizes(),
        adminService.getColors(),
      ]);

      // Handle products
      if (productsData.status === 'fulfilled') {
        const products = productsData.value.data || productsData.value;
        setProducts(Array.isArray(products) ? products : []);
      } else {
        console.error('Failed to fetch products:', productsData.reason);
        throw new Error('Failed to load products');
      }

      // Handle categories (non-critical)
      if (categoriesData.status === 'fulfilled') {
        setCategories(Array.isArray(categoriesData.value) ? categoriesData.value : []);
      } else {
        console.warn('Failed to fetch categories:', categoriesData.reason);
        setCategories([]);
      }

      // Handle sizes (non-critical)
      if (sizesData.status === 'fulfilled') {
        setSizes(Array.isArray(sizesData.value) ? sizesData.value : []);
      } else {
        console.warn('Failed to fetch sizes:', sizesData.reason);
        setSizes([]);
      }

      // Handle colors (non-critical)
      if (colorsData.status === 'fulfilled') {
        setColors(Array.isArray(colorsData.value) ? colorsData.value : []);
      } else {
        console.warn('Failed to fetch colors:', colorsData.reason);
        setColors([]);
      }

      // Attributes are optional for now
      setAttributes([]);
    } catch (error: any) {
      console.error('Failed to fetch data:', error);
      const errorMessage = error?.message || 'Failed to load data';
      setError(errorMessage);
      
      // Handle authentication errors
      if (error?.type === 'forbidden' || error?.response?.status === 401) {
        addToast({
          type: 'error',
          message: 'Session expired. Please login again.',
        });
        TokenManager.clearToken();
        router.replace('/admin/login');
      } else {
        addToast({
          type: 'error',
          message: errorMessage,
        });
      }
    } finally {
      setLoading(false);
    }
  }, [router, addToast]);

  const filteredProducts = products.filter(
    (product) =>
      product.name.toLowerCase().includes(search.toLowerCase()) ||
      product.sku.toLowerCase().includes(search.toLowerCase())
  );

  const handleCreate = () => {
    setModalState({
      isOpen: true,
      mode: 'create',
      product: null,
    });
  };

  const handleEdit = (product: Product) => {
    setModalState({
      isOpen: true,
      mode: 'edit',
      product,
    });
  };

  const handleSave = (savedProduct: Product) => {
    if (modalState.mode === 'create') {
      setProducts([savedProduct, ...products]);
    } else {
      setProducts(products.map((p) => (p.id === savedProduct.id ? savedProduct : p)));
    }
    setModalState({ isOpen: false, mode: 'create', product: null });
  };

  const handleDelete = async (product: Product) => {
    if (!confirm(`Are you sure you want to delete "${product.name}"? This action cannot be undone.`)) {
      return;
    }

    try {
      await adminService.deleteProduct(product.id);
      setProducts(products.filter((p) => p.id !== product.id));
      addToast({
        type: 'success',
        message: 'Product deleted successfully',
      });
    } catch (error: any) {
      console.error('Failed to delete product:', error);
      const errorMessage = error?.message || error?.response?.data?.message || 'Failed to delete product';
      addToast({
        type: 'error',
        message: errorMessage,
      });
    }
  };

  const handleBulkDelete = async () => {
    if (selectedProducts.size === 0) {
      addToast({
        type: 'warning',
        message: 'Please select products to delete',
      });
      return;
    }

    if (!confirm(`Are you sure you want to delete ${selectedProducts.size} product(s)? This action cannot be undone.`)) {
      return;
    }

    const deletePromises = Array.from(selectedProducts).map(id => 
      adminService.deleteProduct(id).catch(err => ({ error: true, id, err }))
    );

    try {
      const results = await Promise.all(deletePromises);
      const errors = results.filter((r: any) => r?.error);
      
      if (errors.length === 0) {
        setProducts(products.filter(p => !selectedProducts.has(p.id)));
        setSelectedProducts(new Set());
        addToast({
          type: 'success',
          message: `Successfully deleted ${selectedProducts.size} product(s)`,
        });
      } else {
        const successCount = results.length - errors.length;
        setProducts(products.filter(p => !selectedProducts.has(p.id) || errors.some((e: any) => e.id === p.id)));
        setSelectedProducts(new Set(errors.map((e: any) => e.id)));
        addToast({
          type: 'warning',
          message: `Deleted ${successCount} product(s). ${errors.length} failed.`,
        });
      }
    } catch (error) {
      console.error('Bulk delete failed:', error);
      addToast({
        type: 'error',
        message: 'Failed to delete products',
      });
    }
  };

  const toggleSelectAll = () => {
    if (selectedProducts.size === filteredProducts.length) {
      setSelectedProducts(new Set());
    } else {
      setSelectedProducts(new Set(filteredProducts.map((p) => p.id)));
    }
  };

  const toggleSelectProduct = (productId: number) => {
    const newSelected = new Set(selectedProducts);
    if (newSelected.has(productId)) {
      newSelected.delete(productId);
    } else {
      newSelected.add(productId);
    }
    setSelectedProducts(newSelected);
  };

  const toggleProductStatus = async (product: Product) => {
    try {
      const updatedProduct = await adminService.updateProduct(product.id, {
        is_active: !product.is_active,
      });
      setProducts(products.map((p) => (p.id === product.id ? updatedProduct : p)));
      addToast({
        type: 'success',
        message: `Product ${!product.is_active ? 'activated' : 'deactivated'} successfully`,
      });
    } catch (error: any) {
      console.error('Failed to update product status:', error);
      const errorMessage = error?.message || error?.response?.data?.message || 'Failed to update product status';
      addToast({
        type: 'error',
        message: errorMessage,
      });
    }
  };

  const formatDate = (dateString?: string) => {
    if (!dateString) return 'N/A';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
    });
  };

  if (loading) {
    return (
      <div className="p-6">
        <div className="text-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading products...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-6">
        <div className="bg-red-50 border border-red-200 rounded-lg p-6 text-center">
          <AlertCircle className="w-12 h-12 text-red-500 mx-auto mb-3" />
          <h3 className="text-lg font-semibold text-red-900 mb-2">Failed to Load Products</h3>
          <p className="text-red-700 mb-4">{error}</p>
          <button
            onClick={fetchData}
            className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors font-medium inline-flex items-center gap-2"
          >
            <RefreshCw className="w-4 h-4" />
            Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <>
      {modalState.isOpen && (
        <ProductModal
          product={modalState.product}
          categories={categories}
          attributes={attributes}
          sizes={sizes}
          colors={colors}
          onClose={() => setModalState({ isOpen: false, mode: 'create', product: null })}
          onSave={handleSave}
          mode={modalState.mode}
        />
      )}
      <div className="p-6">
        {/* Header */}
        <div className="mb-8 flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Product Management</h1>
            <p className="text-gray-600 mt-1">
              {products.length} {products.length === 1 ? 'product' : 'products'} in catalog
            </p>
          </div>
          <div className="flex items-center gap-3">
            {selectedProducts.size > 0 && (
              <button
                onClick={handleBulkDelete}
                className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors font-medium flex items-center gap-2"
              >
                <Trash2 className="w-4 h-4" />
                Delete ({selectedProducts.size})
              </button>
            )}
            <button
              onClick={fetchData}
              className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors font-medium flex items-center gap-2"
              title="Refresh"
            >
              <RefreshCw className="w-4 h-4" />
            </button>
            <button
              onClick={handleCreate}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium flex items-center gap-2"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 4v16m8-8H4"
                />
              </svg>
              Create Product
            </button>
          </div>
        </div>

        {/* Search */}
        <div className="mb-6">
          <input
            type="text"
            placeholder="Search products by name or SKU..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full px-4 py-2.5 text-gray-500 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        {/* Products Table */}
        <div className="bg-white rounded-lg shadow-sm border overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="px-6 py-4 text-left">
                    <input
                      type="checkbox"
                      checked={
                        selectedProducts.size === filteredProducts.length &&
                        filteredProducts.length > 0
                      }
                      onChange={toggleSelectAll}
                      className="w-4 h-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                    />
                  </th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700">
                    Product List
                  </th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700">
                    ID Number
                  </th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700">
                    <div className="flex items-center gap-1">
                      Last Updated
                      <svg
                        className="w-4 h-4"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M7 16V4m0 0L3 8m4-4l4 4m6 0v12m0 0l4-4m-4 4l-4-4"
                        />
                      </svg>
                    </div>
                  </th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700">
                    In Stocks
                  </th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700">
                    Variation
                  </th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700">
                    Status
                  </th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700">
                    <div className="flex items-center gap-1">
                      Price
                      <svg
                        className="w-4 h-4"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M7 16V4m0 0L3 8m4-4l4 4m6 0v12m0 0l4-4m-4 4l-4-4"
                        />
                      </svg>
                    </div>
                  </th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700">
                    Action
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {filteredProducts.length === 0 ? (
                  <tr>
                    <td colSpan={9} className="px-6 py-12 text-center text-gray-500">
                      No products found
                    </td>
                  </tr>
                ) : (
                  filteredProducts.map((product) => (
                    <tr key={product.id} className="hover:bg-gray-50 transition-colors">
                      <td className="px-6 py-4">
                        <input
                          type="checkbox"
                          checked={selectedProducts.has(product.id)}
                          onChange={() => toggleSelectProduct(product.id)}
                          className="w-4 h-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                        />
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <div className="w-12 h-12 bg-gray-100 rounded-lg flex items-center justify-center overflow-hidden flex-shrink-0">
                            {product.images && product.images.length > 0 ? (
                              <img
                                src={product.images[0].full_image_url || product.images[0].image_url}
                                alt={product.name}
                                className="w-full h-full object-cover"
                                onError={(e) => {
                                  // Fallback to placeholder on error
                                  e.currentTarget.style.display = 'none';
                                  e.currentTarget.parentElement!.innerHTML = `
                                    <svg class="w-6 h-6 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                                    </svg>
                                  `;
                                }}
                              />
                            ) : (
                              <svg
                                className="w-6 h-6 text-gray-400"
                                fill="none"
                                stroke="currentColor"
                                viewBox="0 0 24 24"
                              >
                                <path
                                  strokeLinecap="round"
                                  strokeLinejoin="round"
                                  strokeWidth={2}
                                  d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
                                />
                              </svg>
                            )}
                          </div>
                          <div>
                            <div className="font-medium text-gray-900">{product.name}</div>
                            <div className="text-sm text-gray-500">
                              {product.category?.name || 'Uncategorized'}
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-700">{product.sku}</td>
                      <td className="px-6 py-4 text-sm text-gray-700">
                        {formatDate(product.updated_at)}
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2">
                          <div className="w-16 h-2 bg-gray-200 rounded-full overflow-hidden">
                            <div
                              className="h-full bg-blue-500 rounded-full"
                              style={{
                                width: `${Math.min((product.stock_quantity / 100) * 100, 100)}%`,
                              }}
                            />
                          </div>
                          <span className="text-sm text-gray-700">
                            {product.stock_quantity}/100
                          </span>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-700">005</td>
                      <td className="px-6 py-4">
                        <button
                          onClick={() => toggleProductStatus(product)}
                          className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                            product.is_active ? 'bg-green-500' : 'bg-gray-300'
                          }`}
                        >
                          <span
                            className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                              product.is_active ? 'translate-x-6' : 'translate-x-1'
                            }`}
                          />
                        </button>
                      </td>
                      <td className="px-6 py-4 text-sm font-semibold text-gray-900">
                        ${product.price}
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => handleEdit(product)}
                            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                            title="View"
                          >
                            <svg
                              className="w-5 h-5 text-gray-600"
                              fill="none"
                              stroke="currentColor"
                              viewBox="0 0 24 24"
                            >
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                              />
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"
                              />
                            </svg>
                          </button>
                          <button
                            onClick={() => handleDelete(product)}
                            className="text-red-700 hover:text-red-600"
                            title="Delete"
                          >
                            <Trash2 size={18} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </>
  );
}
