'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useWishlist } from '@/hooks/useWishlist';
import { useAuth } from '@/hooks/useAuth';
import { useCart } from '@/hooks/useCart';
import { useToast } from '@/components/ui/Toast';

export default function WishlistPage() {
  const { wishlist, guestWishlist, isLoading, removeFromWishlist, clearWishlist, moveToCart } = useWishlist();
  const { isAuthenticated } = useAuth();
  const { addToCart } = useCart();
  const { addToast } = useToast();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const getImageUrl = (url: string) => {
    if (!url) return '';
    if (url.startsWith('http')) return url;
    const baseUrl = process.env.NEXT_PUBLIC_API_URL?.replace('/api', '') || 'http://localhost:8000';
    return `${baseUrl}${url}`;
  };

  const handleRemove = async (productId: number, itemId?: number) => {
    try {
      await removeFromWishlist(productId, itemId);
      addToast({
        type: 'success',
        message: 'Item removed from wishlist',
      });
    } catch (error) {
      addToast({
        type: 'error',
        message: 'Failed to remove item',
      });
    }
  };

  const handleMoveToCart = async (productId: number, itemId?: number) => {
    try {
      if (isAuthenticated && itemId) {
        await moveToCart(itemId);
      } else {
        await addToCart(productId, 1);
        await removeFromWishlist(productId);
      }
      addToast({
        type: 'success',
        message: 'Item moved to cart',
      });
    } catch (error) {
      addToast({
        type: 'error',
        message: 'Failed to move item to cart',
      });
    }
  };

  const handleClearWishlist = async () => {
    if (!confirm('Are you sure you want to clear your wishlist?')) return;

    try {
      await clearWishlist();
      addToast({
        type: 'success',
        message: 'Wishlist cleared',
      });
    } catch (error) {
      addToast({
        type: 'error',
        message: 'Failed to clear wishlist',
      });
    }
  };

  if (!mounted) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">Loading...</div>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">Loading wishlist...</div>
      </div>
    );
  }

  const items = isAuthenticated ? wishlist?.items || [] : guestWishlist;
  const isEmpty = items.length === 0;

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="container mx-auto px-4 md:px-12 lg:px-24">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">My Wishlist</h1>
          <p className="text-gray-600 mt-2">
            {isEmpty ? 'Your wishlist is empty' : `${items.length} item${items.length !== 1 ? 's' : ''} in your wishlist`}
          </p>
        </div>

        {isEmpty ? (
          <div className="bg-white rounded-lg shadow-md p-12 text-center">
            <svg className="w-24 h-24 mx-auto text-gray-300 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
            </svg>
            <h2 className="text-2xl font-semibold text-gray-900 mb-2">Your wishlist is empty</h2>
            <p className="text-gray-600 mb-6">Start adding products you love!</p>
            <Link href="/products">
              <button className="px-6 py-3 bg-gray-900 text-white rounded-lg hover:bg-gray-800 transition-colors font-medium">
                Browse Products
              </button>
            </Link>
          </div>
        ) : (
          <>
            <div className="flex justify-end mb-4">
              <button
                onClick={handleClearWishlist}
                className="px-4 py-2 text-red-600 hover:text-red-700 font-medium text-sm"
              >
                Clear Wishlist
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {items.map((item: any) => {
                // Handle both authenticated and guest wishlist items
                const product = isAuthenticated ? item.product : item;
                const productId = isAuthenticated ? item.product_id : item.productId;
                const itemId = isAuthenticated ? item.id : undefined;
                const slug = product?.slug || '#';

                return (
                  <div key={isAuthenticated ? item.id : item.productId} className="bg-white rounded-lg shadow-md overflow-hidden group">
                    {slug !== '#' ? (
                      <Link href={`/products/${slug}`}>
                        <div className="aspect-square bg-gray-200 overflow-hidden">
                          {product?.image ? (
                            <img
                              src={getImageUrl(product.image)}
                              alt={product.name || 'Product'}
                              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                            />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center text-gray-400">
                              No Image
                            </div>
                          )}
                        </div>
                      </Link>
                    ) : (
                      <div className="aspect-square bg-gray-200 overflow-hidden">
                        <div className="w-full h-full flex items-center justify-center text-gray-400">
                          Product Details Unavailable
                        </div>
                      </div>
                    )}

                    <div className="p-4">
                      {slug !== '#' && product?.name ? (
                        <Link href={`/products/${slug}`}>
                          <h3 className="font-semibold text-gray-900 mb-2 hover:text-gray-700 line-clamp-2">
                            {product.name}
                          </h3>
                        </Link>
                      ) : (
                        <h3 className="font-semibold text-gray-900 mb-2 line-clamp-2">
                          Product #{productId}
                        </h3>
                      )}

                      {product?.price && (
                        <div className="mb-3">
                          {product.sale_price ? (
                            <div className="flex items-center gap-2">
                              <span className="text-lg font-bold text-gray-900">
                                ${product.sale_price}
                              </span>
                              <span className="text-sm text-gray-500 line-through">
                                ${product.price}
                              </span>
                            </div>
                          ) : (
                            <span className="text-lg font-bold text-gray-900">
                              ${product.price}
                            </span>
                          )}
                        </div>
                      )}

                      {product && (
                        <div className="mb-3">
                          {product.in_stock ? (
                            <span className="text-xs text-green-600 font-medium">In Stock</span>
                          ) : (
                            <span className="text-xs text-red-600 font-medium">Out of Stock</span>
                          )}
                        </div>
                      )}

                      <div className="space-y-2">
                        <button
                          onClick={() => handleMoveToCart(productId, itemId)}
                          disabled={product && !product.in_stock}
                          className="w-full px-4 py-2 bg-gray-900 text-white rounded-lg hover:bg-gray-800 transition-colors font-medium text-sm disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                          {product && !product.in_stock ? 'Out of Stock' : 'Add to Cart'}
                        </button>
                        <button
                          onClick={() => handleRemove(productId, itemId)}
                          className="w-full px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors font-medium text-sm"
                        >
                          Remove
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </>
        )}

        {!isAuthenticated && !isEmpty && (
          <div className="mt-8 bg-blue-50 border border-blue-200 rounded-lg p-6 text-center">
            <p className="text-blue-900 mb-4">
              Sign in to save your wishlist and access it from any device
            </p>
            <Link href="/login">
              <button className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium">
                Sign In
              </button>
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}
