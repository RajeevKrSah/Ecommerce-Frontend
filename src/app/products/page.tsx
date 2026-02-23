'use client';

import { useState, useEffect, useCallback, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { productService } from '@/services/product.service';
import { ProductCard } from '@/components/common/ProductCard';
import { ProductCardSkeleton } from '@/components/common/ProductCardSkeleton';
import { EmptyState } from '@/components/common/EmptyState';
import { useToast } from '@/components/ui/Toast';
import { useCart } from '@/hooks/useCart';
import { useWishlist } from '@/hooks/useWishlist';

interface Product {
  id: number;
  name: string;
  slug: string;
  price: number;
  sale_price?: number;
  images?: Array<{ image_url: string; full_image_url?: string }>;
  category?: { id: number; name: string };
  stock_quantity: number;
  is_featured?: boolean;
  created_at?: string;
}

interface PaginationMeta {
  current_page: number;
  last_page: number;
  per_page: number;
  total: number;
}

const PRODUCTS_PER_PAGE = 20;

function ProductsContent() {
  const searchParams = useSearchParams();
  const { addToast } = useToast();
  const { addToCart } = useCart();
  const { addToWishlist } = useWishlist();

  // State
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [paginationMeta, setPaginationMeta] = useState<PaginationMeta | null>(null);
  const [loadingMore, setLoadingMore] = useState(false);

  // Get filters from URL
  const searchQuery = searchParams.get('search');
  const categoryId = searchParams.get('category');

  // Fetch data
  useEffect(() => {
    setCurrentPage(1); // Reset to page 1 when filters change
    fetchData();
  }, [searchQuery, categoryId]);

  useEffect(() => {
    if (currentPage > 1) {
      fetchData();
    }
  }, [currentPage]);

  const fetchData = async () => {
    try {
      setLoading(true);
      setError(null);

      const params: any = {
        per_page: PRODUCTS_PER_PAGE,
        page: currentPage,
      };

      // Add search query if present
      if (searchQuery) {
        params.search = searchQuery;
      }

      // Add category filter if present
      if (categoryId) {
        params.category_id = parseInt(categoryId);
      }

      const productsResponse = await productService.getProducts(params);

      const productsData = Array.isArray(productsResponse) 
        ? productsResponse 
        : productsResponse?.data || [];

      setProducts(productsData);
      
      // Handle pagination metadata
      if (productsResponse && typeof productsResponse === 'object' && 'current_page' in productsResponse) {
        setPaginationMeta({
          current_page: productsResponse.current_page,
          last_page: productsResponse.last_page,
          per_page: productsResponse.per_page,
          total: productsResponse.total,
        });
      }
    } catch (err) {
      console.error('Failed to fetch data:', err);
      setError('Failed to load products. Please try again later.');
      setProducts([]);
      addToast({
        type: 'error',
        message: 'Failed to load products',
      });
    } finally {
      setLoading(false);
      setLoadingMore(false);
    }
  };

  // Event handlers
  const handleAddToCart = useCallback(async (productId: number) => {
    try {
      const product = products.find(p => p.id === productId);
      if (!product) return;

      if (product.stock_quantity <= 0) {
        addToast({
          type: 'error',
          message: 'This product is out of stock',
        });
        return;
      }

      await addToCart(productId, 1);

      addToast({
        type: 'success',
        message: `${product.name} added to cart!`,
      });
    } catch (err) {
      console.error('Failed to add to cart:', err);
      addToast({
        type: 'error',
        message: 'Failed to add product to cart',
      });
    }
  }, [products, addToCart, addToast]);

  const handleAddToWishlist = useCallback(async (productId: number) => {
    try {
      const product = products.find(p => p.id === productId);
      if (!product) return;

      await addToWishlist(productId);

      addToast({
        type: 'success',
        message: `${product.name} added to wishlist!`,
      });
    } catch (err) {
      console.error('Failed to add to wishlist:', err);
      addToast({
        type: 'error',
        message: 'Failed to add product to wishlist',
      });
    }
  }, [products, addToWishlist, addToast]);

  const handleLoadMore = useCallback(() => {
    if (paginationMeta && currentPage < paginationMeta.last_page) {
      setLoadingMore(true);
      setCurrentPage(prev => prev + 1);
    }
  }, [paginationMeta, currentPage]);

  // Loading skeleton
  const LoadingSkeleton = ({ count = 8 }: { count?: number }) => (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
      {Array.from({ length: count }).map((_, i) => (
        <ProductCardSkeleton key={i} />
      ))}
    </div>
  );

  // Empty state component
  const ProductsEmptyState = () => (
    <EmptyState
      title="No products found"
      description={searchQuery ? `No results for "${searchQuery}"` : "Check back later for new products"}
    />
  );

  // Get page title based on filters
  const getPageTitle = () => {
    if (searchQuery) return `Search: "${searchQuery}"`;
    if (categoryId) return 'CATEGORY PRODUCTS';
    return 'ALL PRODUCTS';
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Products Section */}
      <section className="py-12" aria-labelledby="products-heading">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Page Header */}
          <div className="text-center mb-10">
            <div className="flex items-center justify-center gap-4 mb-2">
              <div className="h-px w-16 bg-gray-300" aria-hidden="true"></div>
              <h1 id="products-heading" className="text-3xl font-bold text-gray-900">
                {getPageTitle()}
              </h1>
              <div className="h-px w-16 bg-gray-300" aria-hidden="true"></div>
            </div>
            {paginationMeta && (
              <p className="text-gray-500 italic">
                Showing {products.length} of {paginationMeta.total} products
              </p>
            )}
          </div>

          {/* Error State */}
          {error && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-8" role="alert">
              <p className="text-red-800">{error}</p>
              <button
                onClick={fetchData}
                className="mt-2 text-sm text-red-600 hover:text-red-800 underline"
              >
                Try again
              </button>
            </div>
          )}

          {/* Products Grid */}
          {loading ? (
            <LoadingSkeleton count={8} />
          ) : products.length === 0 ? (
            <ProductsEmptyState />
          ) : (
            <>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                {products.map((product) => (
                  <ProductCard
                    key={product.id}
                    product={product}
                    onAddToCart={handleAddToCart}
                    onAddToWishlist={handleAddToWishlist}
                  />
                ))}
              </div>

              {/* Load More Button */}
              {paginationMeta && currentPage < paginationMeta.last_page && (
                <div className="text-center mt-12">
                  <button
                    onClick={handleLoadMore}
                    disabled={loadingMore}
                    className="px-8 py-3 bg-gray-900 text-white rounded-lg hover:bg-gray-800 transition-colors font-medium disabled:opacity-50 disabled:cursor-not-allowed"
                    aria-label="Load more products"
                  >
                    {loadingMore ? 'Loading...' : 'Load More Products'}
                  </button>
                </div>
              )}
            </>
          )}
        </div>
      </section>
    </div>
  );
}

export default function ProductsPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-gray-50">
        <section className="py-12">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-10">
              <div className="flex items-center justify-center gap-4 mb-2">
                <div className="h-px w-16 bg-gray-300"></div>
                <h1 className="text-3xl font-bold text-gray-900">PRODUCTS</h1>
                <div className="h-px w-16 bg-gray-300"></div>
              </div>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {Array.from({ length: 8 }).map((_, i) => (
                <ProductCardSkeleton key={i} />
              ))}
            </div>
          </div>
        </section>
      </div>
    }>
      <ProductsContent />
    </Suspense>
  );
}
