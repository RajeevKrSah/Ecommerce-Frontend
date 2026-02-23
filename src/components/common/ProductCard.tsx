/**
 * Reusable Product Card Component
 * Production-ready e-commerce product card with accessibility, performance optimizations
 */

'use client';

import { useState, useCallback, useMemo, memo } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { Heart } from 'lucide-react';

interface ProductImage {
  image_url: string;
  full_image_url?: string;
  is_primary?: boolean;
}

interface Product {
  id: number;
  name: string;
  slug: string;
  price: number;
  sale_price?: number;
  images?: ProductImage[];
  stock_quantity: number;
  is_featured?: boolean;
  created_at?: string;
}

interface ProductCardProps {
  product: Product;
  variant?: 'default' | 'compact' | 'detailed';
  showQuickActions?: boolean;
  onAddToCart?: (productId: number) => void;
  onAddToWishlist?: (productId: number) => void;
}

const ProductCardComponent: React.FC<ProductCardProps> = ({
  product,
  variant = 'default',
  showQuickActions = true,
  onAddToCart,
  onAddToWishlist,
}) => {
  const [isWishlisted, setIsWishlisted] = useState(false);
  const [imageError, setImageError] = useState(false);

  // Memoized calculations
  const { price, salePrice, discount, isNew, imageUrl, isOutOfStock } = useMemo(() => {
    const price = Number(product.price) || 0;
    const salePrice = product.sale_price ? Number(product.sale_price) : undefined;
    
    const discount = salePrice 
      ? Math.round(((price - salePrice) / price) * 100)
      : 0;
    
    const isNew = product.created_at 
      ? Math.floor((Date.now() - new Date(product.created_at).getTime()) / (1000 * 60 * 60 * 24)) <= 7
      : false;
    
    const imageUrl = product.images?.[0]?.full_image_url || product.images?.[0]?.image_url || '';
    const isOutOfStock = product.stock_quantity <= 0;

    return { price, salePrice, discount, isNew, imageUrl, isOutOfStock };
  }, [product]);

  // Event handlers
  const handleAddToCart = useCallback((e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (!isOutOfStock && onAddToCart) {
      onAddToCart(product.id);
    }
  }, [isOutOfStock, onAddToCart, product.id]);

  const handleAddToWishlist = useCallback((e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsWishlisted(prev => !prev);
    if (onAddToWishlist) {
      onAddToWishlist(product.id);
    }
  }, [onAddToWishlist, product.id]);

  const handleImageError = useCallback(() => {
    setImageError(true);
  }, []);

  return (
    <article 
      className="group relative rounded-2xl overflow-hidden bg-white border border-gray-100 transition-all duration-300 hover:shadow-lg hover:-translate-y-1"
      aria-label={`${product.name} product card`}
    >
      {/* Image Section */}
      <Link
        href={`/products/${product.slug}`}
        className="relative block aspect-[3/4] bg-gray-100 overflow-hidden"
        aria-label={`View ${product.name} details`}
      >
        {imageUrl && !imageError ? (
          <Image
            src={imageUrl}
            alt={product.name}
            fill
            sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
            className="object-cover transition-transform duration-500 ease-out group-hover:scale-105"
            onError={handleImageError}
            loading="lazy"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-gray-300">
            <svg 
              className="w-16 h-16" 
              fill="none" 
              stroke="currentColor" 
              viewBox="0 0 24 24"
              aria-hidden="true"
            >
              <path 
                strokeLinecap="round" 
                strokeLinejoin="round" 
                strokeWidth={1.5} 
                d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" 
              />
            </svg>
          </div>
        )}

        {/* Out of Stock Overlay */}
        {isOutOfStock && (
          <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
            <span className="bg-white text-gray-900 px-4 py-2 rounded-full font-semibold text-sm">
              Out of Stock
            </span>
          </div>
        )}

        {/* Top Badges */}
        <div className="absolute top-4 left-4 flex flex-col gap-2" aria-label="Product badges">
          {isNew && (
            <span className="px-2.5 py-1 text-[10px] font-medium bg-black text-white rounded-full uppercase tracking-wide">
              New
            </span>
          )}
          {discount > 0 && (
            <span className="px-2.5 py-1 text-[10px] font-medium bg-red-600 text-white rounded-full">
              -{discount}%
            </span>
          )}
        </div>

        {/* Wishlist Button */}
        {showQuickActions && (
          <button
            onClick={handleAddToWishlist}
            className={`absolute top-4 right-4 w-9 h-9 backdrop-blur-md rounded-full flex items-center justify-center shadow-sm opacity-0 group-hover:opacity-100 transition-all duration-200 ${
              isWishlisted 
                ? 'bg-red-50 hover:bg-red-100' 
                : 'bg-white/80 hover:bg-white'
            }`}
            aria-label={isWishlisted ? 'Remove from wishlist' : 'Add to wishlist'}
            type="button"
          >
            <Heart 
              className={`w-4 h-4 transition-colors ${
                isWishlisted ? 'fill-red-500 text-red-500' : 'text-gray-700'
              }`}
            />
          </button>
        )}

        {/* Quick View Overlay */}
        {!isOutOfStock && (
          <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-all duration-300 flex items-end justify-center pb-6 opacity-0 group-hover:opacity-100 pointer-events-none">
            <span className="bg-white text-sm font-medium px-6 py-2 rounded-full shadow-md pointer-events-auto">
              Quick View
            </span>
          </div>
        )}
      </Link>

      {/* Product Info */}
      <div className="p-5 space-y-2">
        <Link 
          href={`/products/${product.slug}`}
          className="block"
        >
          <h3 className="text-sm font-medium text-gray-900 leading-snug line-clamp-2 hover:underline">
            {product.name}
          </h3>
        </Link>

        {/* Price */}
        <div className="flex items-center gap-2 pt-1">
          {salePrice ? (
            <>
              <span className="text-base font-semibold text-gray-900" aria-label={`Sale price ${salePrice} Dirhams`}>
                Dhs. {salePrice.toFixed(2)}
              </span>
              <span className="text-sm text-gray-400 line-through" aria-label={`Original price ${price} Dirhams`}>
                {price.toFixed(2)}
              </span>
            </>
          ) : (
            <span className="text-base font-semibold text-gray-900" aria-label={`Price ${price} Dirhams`}>
              Dhs. {price.toFixed(2)}
            </span>
          )}
        </div>

        {/* Stock Status */}
        {product.stock_quantity > 0 && product.stock_quantity <= 5 && (
          <p className="text-xs text-orange-600 font-medium">
            Only {product.stock_quantity} left in stock
          </p>
        )}
      </div>
    </article>
  );
};

export const ProductCard = memo(ProductCardComponent);
export default ProductCard;
