'use client';

import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import { productService } from '@/services/product.service';
import { Product, ProductVariant } from '@/types/product';
import { useAuth } from '@/hooks/useAuth';
import { useCart } from '@/hooks/useCart';
import { useWishlist } from '@/hooks/useWishlist';
import { useToast } from '@/components/ui/Toast';
import ProductVariantSelector from '@/components/ProductVariantSelector';

export default function ProductDetailPage() {
  const params = useParams();
  const slug = params.slug as string;
  const { isAuthenticated } = useAuth();
  const { addToCart } = useCart();
  const { addToWishlist, removeFromWishlist, isInWishlist } = useWishlist();
  const { addToast } = useToast();

  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedImage, setSelectedImage] = useState(0);
  const [quantity, setQuantity] = useState(1);
  const [isAdding, setIsAdding] = useState(false);
  const [justAdded, setJustAdded] = useState(false);
  const [selectedVariant, setSelectedVariant] = useState<ProductVariant | null>(null);
  const [viewingCount, setViewingCount] = useState(34);
  const [isAddingToWishlist, setIsAddingToWishlist] = useState(false);

  useEffect(() => {
    loadProduct();
  }, [slug]);

  // Simulate viewing count changes
  useEffect(() => {
    const interval = setInterval(() => {
      setViewingCount(prev => {
        const change = Math.floor(Math.random() * 5) - 2; // -2 to +2
        return Math.max(20, Math.min(50, prev + change));
      });
    }, 5000);

    return () => clearInterval(interval);
  }, []);

  const loadProduct = async () => {
    setLoading(true);
    try {
      const data = await productService.getProduct(slug);
      setProduct(data);
    } catch (error) {
      console.error('Failed to load product:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="text-center space-y-4">
          <div className="w-12 h-12 border-2 border-neutral-200 border-t-neutral-900 rounded-full animate-spin mx-auto"></div>
          <p className="text-sm text-neutral-500">Loading product...</p>
        </div>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center px-4">
        <div className="text-center max-w-md space-y-6">
          <div className="w-16 h-16 mx-auto rounded-full bg-neutral-100 flex items-center justify-center">
            <svg className="w-8 h-8 text-neutral-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </div>
          <div>
            <h2 className="text-2xl font-semibold text-neutral-900 mb-2">Product not found</h2>
            <p className="text-neutral-500">The product you're looking for doesn't exist or has been removed.</p>
          </div>
          <Link href="/products">
            <button className="px-6 py-2.5 bg-neutral-900 text-white rounded-xl hover:bg-neutral-800 transition-all duration-200 font-medium">
              Browse Products
            </button>
          </Link>
        </div>
      </div>
    );
  }

  const images = product.images || [];
  const currentImage = images[selectedImage]?.image_url;

  const getImageUrl = (url?: string) => {
    if (!url) return '';
    if (url.startsWith('http')) return url;
    // Remove /api from the URL for storage paths
    const baseUrl = process.env.NEXT_PUBLIC_API_URL?.replace('/api', '') || 'http://localhost:8000';
    return `${baseUrl}${url}`;
  };

  const handleAddToCart = async () => {
    if (!product) return;

    // Check if product has variants and none is selected
    if (product.has_variants && !selectedVariant) {
      addToast({
        type: 'error',
        message: 'Please select product options',
      });
      return;
    }

    setIsAdding(true);
    try {
      // Add to cart with variant ID if applicable
      await addToCart(product.id, quantity, selectedVariant?.id);

      if (!isAuthenticated) {
        addToast({
          type: 'success',
          message: `${product.name} added to cart! Login to checkout.`,
        });
      } else {
        addToast({
          type: 'success',
          message: `${product.name} added to cart!`,
        });
      }

      setJustAdded(true);
      setTimeout(() => setJustAdded(false), 3000);
    } catch (error: any) {
      console.error('Add to cart error:', error);
      const errorMessage = error.response?.data?.message || error.message || 'Failed to add to cart';
      addToast({
        type: 'error',
        message: errorMessage,
      });
    } finally {
      setIsAdding(false);
    }
  };

  const handleWishlistToggle = async () => {
    if (!product) return;

    setIsAddingToWishlist(true);
    try {
      const inWishlist = isInWishlist(product.id);

      if (inWishlist) {
        await removeFromWishlist(product.id);
        addToast({
          type: 'success',
          message: `${product.name} removed from wishlist`,
        });
      } else {
        if (!isAuthenticated) {
          const { guestWishlistManager } = await import('@/lib/guestWishlist');
          guestWishlistManager.addItem(product.id, {
            name: product.name,
            slug: product.slug,
            price: product.price,
            sale_price: product.sale_price,
            image: product.images?.[0]?.image_url,
            in_stock: product.in_stock,
          });
        } else {
          await addToWishlist(product.id);
        }
        addToast({
          type: 'success',
          message: `${product.name} added to wishlist!`,
        });
      }
    } catch (error: any) {
      console.error('Wishlist error:', error);
      const errorMessage = error.response?.data?.message || error.message || 'Failed to update wishlist';
      addToast({
        type: 'error',
        message: errorMessage,
      });
    } finally {
      setIsAddingToWishlist(false);
    }
  };

  const handleVariantChange = (variant: ProductVariant | null) => {
    setSelectedVariant(variant);
    // Update main image if variant has images
    if (variant?.images && variant.images.length > 0) {
      setSelectedImage(0); // Reset to first image
    }
  };

  const inWishlist = product ? isInWishlist(product.id) : false;

  // Get current display price
  const displayPrice = Number(selectedVariant?.price || product?.sale_price || product?.price || 0);
  const originalPrice = Number(selectedVariant?.original_price || product?.price || 0);
  const hasDiscount = displayPrice < originalPrice && originalPrice > 0;

  // Get current stock status
  const currentStock = selectedVariant?.stock_quantity ?? product?.stock_quantity ?? 0;
  const isInStock = selectedVariant ? selectedVariant.is_in_stock : product?.in_stock ?? false;
  const isLowStock = selectedVariant?.is_low_stock ?? false;

  return (
    <div className="min-h-screen bg-white">
      <div className="container mx-auto px-4 md:px-12 lg:px-24 py-8 lg:py-12">
        {/* Breadcrumb */}
        <Link
          href="/products"
          className="group inline-flex items-center gap-2 text-sm text-neutral-500 hover:text-neutral-900 transition-colors duration-200 mb-8"
        >
          <svg className="w-4 h-4 transition-transform duration-200 group-hover:-translate-x-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
          Back to Products
        </Link>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-16">
          {/* Images - Vertical Thumbnail Layout */}
          <div className="flex gap-4">
            {/* Thumbnail Column */}
            {images.length > 1 && (
              <div className="flex flex-col gap-3 w-20">
                {images.map((image, index) => (
                  <button
                    key={image.id}
                    onClick={() => setSelectedImage(index)}
                    className={`aspect-square rounded-xl overflow-hidden transition-all duration-200 ${selectedImage === index
                      ? 'ring-2 ring-neutral-900 ring-offset-2'
                      : 'ring-1 ring-neutral-200 hover:ring-neutral-300'
                      }`}
                  >
                    <img
                      src={getImageUrl(image.image_url)}
                      alt={`${product.name} ${index + 1}`}
                      className="w-full h-full object-cover"
                    />
                  </button>
                ))}
              </div>
            )}

            {/* Main Image */}
            <div className="flex-1 bg-neutral-50 rounded-2xl overflow-hidden relative group">
              {currentImage ? (
                <img
                  src={getImageUrl(currentImage)}
                  alt={product.name}
                  className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                />
              ) : (
                <div className="w-full aspect-square flex items-center justify-center">
                  <div className="text-center space-y-2">
                    <div className="w-16 h-16 mx-auto rounded-full bg-neutral-100 flex items-center justify-center">
                      <svg className="w-8 h-8 text-neutral-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                      </svg>
                    </div>
                    <p className="text-sm text-neutral-400">No image available</p>
                  </div>
                </div>
              )}

              {/* Floating Badge - Subtle */}
              <div className="absolute bottom-4 left-4 bg-white/90 backdrop-blur-sm rounded-full px-3 py-1.5 shadow-sm flex items-center gap-2">
                <div className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-pulse"></div>
                <span className="text-xs font-medium text-neutral-700">{viewingCount} viewing</span>
              </div>
            </div>
          </div>

          {/* Product Info */}
          <div className="space-y-6">
            {/* Brand & Title */}
            <div className="space-y-2">
              <p className="text-xs text-neutral-500 tracking-wider uppercase">AUTOMET</p>
              <h1 className="text-2xl lg:text-3xl font-semibold text-neutral-900 tracking-tight">
                {product.name}
              </h1>

              {/* Rating & Social Proof */}
              <div className="flex flex-wrap items-center gap-3 pt-1">
                <div className="flex items-center gap-1">
                  {[...Array(5)].map((_, i) => (
                    <svg key={i} className="w-3.5 h-3.5 fill-amber-400" viewBox="0 0 20 20">
                      <path d="M10 15l-5.878 3.09 1.123-6.545L.489 6.91l6.572-.955L10 0l2.939 5.955 6.572.955-4.756 4.635 1.123 6.545z" />
                    </svg>
                  ))}
                  <span className="text-xs text-neutral-600 ml-1">4.8 (3)</span>
                </div>
                <div className="h-3 w-px bg-neutral-200"></div>
                <div className="flex items-center gap-1 text-xs text-neutral-600">
                  <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
                  </svg>
                  <span>6 added recently</span>
                </div>
              </div>
            </div>

            {/* Price & Stock */}
            <div className="space-y-3 pb-6 border-b border-neutral-200">
              <div className="flex items-baseline gap-2.5">
                {hasDiscount ? (
                  <>
                    <span className="text-3xl font-semibold text-neutral-900">
                      ${displayPrice.toFixed(2)}
                    </span>
                    <span className="text-lg text-neutral-400 line-through">
                      ${originalPrice.toFixed(2)}
                    </span>
                    <span className="px-1.5 py-0.5 bg-emerald-50 text-emerald-700 text-[10px] font-medium rounded-full">
                      Save {Math.round(((originalPrice - displayPrice) / originalPrice) * 100)}%
                    </span>
                  </>
                ) : (
                  <span className="text-3xl font-semibold text-neutral-900">${displayPrice.toFixed(2)}</span>
                )}
              </div>

              {/* Stock Status */}
              {isInStock ? (
                <div className="flex items-center gap-2 text-xs">
                  <div className={`w-1.5 h-1.5 rounded-full ${isLowStock ? 'bg-yellow-500' : 'bg-emerald-500'}`}></div>
                  <span className="text-neutral-600">
                    {isLowStock ? `Only ${currentStock} left in stock` : 'In stock, ready to ship'}
                  </span>
                </div>
              ) : (
                <div className="flex items-center gap-2 text-xs">
                  <div className="w-1.5 h-1.5 bg-neutral-400 rounded-full"></div>
                  <span className="text-neutral-600">Out of stock</span>
                </div>
              )}
            </div>

            {/* Description */}
            {product.short_description && (
              <div className="space-y-2">
                <p className="text-xs text-neutral-600 leading-relaxed">
                  {product.short_description}
                </p>
              </div>
            )}

            {/* Variant Selector or Simple Add to Cart */}
            {product.has_variants ? (
              <ProductVariantSelector
                product={product as any}
                onVariantChange={handleVariantChange}
                onAddToCart={handleAddToCart}
              />
            ) : (
              <>
                {/* Quantity */}
                <div className="space-y-2">
                  <label className="text-[11px] font-medium text-neutral-900 block">Quantity</label>
                  <div className="inline-flex items-center bg-neutral-50 rounded-lg overflow-hidden">
                    <button
                      onClick={() => setQuantity(Math.max(1, quantity - 1))}
                      className="px-3 py-1.5 text-black hover:bg-neutral-100 transition-colors duration-200 disabled:opacity-40 disabled:cursor-not-allowed"
                      disabled={!isInStock}
                    >
                      <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 12H4" />
                      </svg>
                    </button>
                    <span className="px-4 py-1.5 text-xs font-medium text-neutral-900 min-w-[45px] text-center tabular-nums">
                      {quantity}
                    </span>
                    <button
                      onClick={() => setQuantity(Math.min(currentStock, quantity + 1))}
                      className="px-3 py-1.5 text-black hover:bg-neutral-100 transition-colors duration-200 disabled:opacity-40 disabled:cursor-not-allowed"
                      disabled={!isInStock}
                    >
                      <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                      </svg>
                    </button>
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="flex gap-5 pt-2">
                  <button
                    onClick={handleAddToCart}
                    disabled={!isInStock || isAdding}
                    className="w-full px-4 py-3 bg-neutral-900 text-white text-xs rounded-lg hover:bg-neutral-800 active:scale-[0.98] transition-all duration-200 font-medium disabled:opacity-50 disabled:cursor-not-allowed disabled:active:scale-100 flex items-center justify-center gap-1.5"
                  >
                    {isAdding ? (
                      <>
                        <div className="w-3 h-3 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                        <span>Adding...</span>
                      </>
                    ) : (
                      <>
                        <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
                        </svg>
                        <span>{isInStock ? 'Add to Cart' : 'Out of Stock'}</span>
                      </>
                    )}
                  </button>

                  {justAdded && (
                    <Link href="/cart">
                      <button className="w-full shrink-0 px-4 py-2.5 bg-emerald-600 text-white text-xs rounded-lg hover:bg-emerald-700 active:scale-[0.98] transition-all duration-200 font-medium flex items-center justify-center gap-1.5">
                        <svg className="w-3.5 h-3.5 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                        </svg>
                        <span>View Cart</span>
                      </button>
                    </Link>
                  )}

                  <button
                    onClick={handleWishlistToggle}
                    disabled={isAddingToWishlist}
                    className={`w-full px-4 py-3 text-xs rounded-lg transition-all duration-200 font-medium flex items-center justify-center gap-1.5 active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed disabled:active:scale-100 ${inWishlist
                      ? 'bg-rose-50 text-rose-600 hover:bg-rose-100'
                      : 'bg-neutral-50 text-neutral-900 hover:bg-neutral-100'
                      }`}
                  >
                    <svg
                      className={`w-3.5 h-3.5 transition-all duration-200 ${inWishlist ? 'fill-rose-600' : 'fill-none'}`}
                      stroke="currentColor"
                      strokeWidth={2}
                      viewBox="0 0 24 24"
                    >
                      <path strokeLinecap="round" strokeLinejoin="round" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                    </svg>
                    <span>
                      {isAddingToWishlist
                        ? 'Updating...'
                        : inWishlist
                          ? 'Remove from Wishlist'
                          : 'Add to Wishlist'
                      }
                    </span>
                  </button>
                </div>
              </>
            )}
          </div>
        </div>

        {/* Product Details Section - Below Grid */}
        {product.description && (
          <div className="mt-12 max-w-3xl">
            <div className="border-t border-neutral-200 pt-8 space-y-3">
              <h2 className="text-base font-semibold text-neutral-900">Product Details</h2>
              <div className="text-sm text-neutral-600 leading-relaxed">
                {product.description}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
