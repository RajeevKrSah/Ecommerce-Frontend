"use client";

import { memo, useMemo, useCallback, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { FiHeart, FiShuffle, FiEye } from "react-icons/fi";
import type { Product } from "@/types/product";
import { useCart } from "@/hooks/useCart";

interface ProductCardProps {
  product: Product;
  onWishlistClick?: (productId: number) => void;
  onCompareClick?: (productId: number) => void;
  onQuickViewClick?: (productId: number) => void;
  priority?: boolean;
}

const FALLBACK_IMAGE = "/images/women.jpg";
const ACTION_ICONS = [
  { Icon: FiHeart, label: "Add to wishlist", action: "wishlist" },
  { Icon: FiShuffle, label: "Compare", action: "compare" },
  { Icon: FiEye, label: "Quick view", action: "quickView" },
] as const;

function ProductCard({
  product,
  onWishlistClick,
  onCompareClick,
  onQuickViewClick,
  priority = false,
}: ProductCardProps) {
  const productUrl = `/products/${product.slug}`;
  const [isAdding, setIsAdding] = useState(false);
  const { addToCart } = useCart();

  const { hasDiscount, discountPercentage, displayPrice, imageUrl } = useMemo(() => {
    const hasSale = product.sale_price != null && product.sale_price < product.price;
    const discount = hasSale && product.sale_price
      ? Math.round(((product.price - product.sale_price) / product.price) * 100)
      : 0;

    const price = product.current_price || product.sale_price || product.price;
    const primaryImage = product.images?.find((img) => img.is_primary) || product.images?.[0];
    const imgUrl = primaryImage?.image_url || FALLBACK_IMAGE;

    return {
      hasDiscount: hasSale,
      discountPercentage: discount,
      displayPrice: Number(price),
      imageUrl: imgUrl,
    };
  }, [product]);

  const priceNum = useMemo(() => Number(product.price), [product.price]);

  const handleActionClick = useCallback(
    (action: string, e: React.MouseEvent) => {
      e.preventDefault();
      e.stopPropagation();

      switch (action) {
        case "wishlist":
          onWishlistClick?.(product.id);
          break;
        case "compare":
          onCompareClick?.(product.id);
          break;
        case "quickView":
          onQuickViewClick?.(product.id);
          break;
      }
    },
    [product.id, onWishlistClick, onCompareClick, onQuickViewClick]
  );

  const handleAddToCart = useCallback(
    async (e: React.MouseEvent) => {
      e.preventDefault();
      e.stopPropagation();

      if (isAdding) return;

      console.log('[ProductCard] Adding to cart, product:', product.id);
      setIsAdding(true);
      try {
        const result = await addToCart(product.id, 1);
        console.log('[ProductCard] Added to cart successfully, result:', result);
        // Optional: Show success toast notification
      } catch (error: any) {
        console.error('[ProductCard] Failed to add to cart:', error);
        console.error('[ProductCard] Error details:', error.response?.data || error.message);
        // Optional: Show error toast notification
      } finally {
        setIsAdding(false);
      }
    },
    [product.id, addToCart, isAdding]
  );

  return (
    <article className="group text-gray-600" aria-label={`Product: ${product.name}`}>
      <div className="relative overflow-hidden rounded-2xl bg-gray-100">
        {hasDiscount && (
          <span
            className="absolute top-4 left-4 z-10 bg-red-500 text-white text-xs font-semibold px-3 py-1 rounded-full"
            aria-label={`${discountPercentage}% discount`}
          >
            -{discountPercentage}%
          </span>
        )}

        <div
          className="absolute top-4 right-4 z-10 flex flex-col gap-3 opacity-0 group-hover:opacity-100 transition-opacity duration-200"
          role="group"
          aria-label="Product actions"
        >
          {ACTION_ICONS.map(({ Icon, label, action }) => (
            <button
              key={action}
              onClick={(e) => handleActionClick(action, e)}
              className="w-10 h-10 bg-white rounded-full flex items-center justify-center shadow hover:bg-gray-100 transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-gray-900 focus:ring-offset-2"
              aria-label={label}
              type="button"
            >
              <Icon size={18} aria-hidden="true" />
            </button>
          ))}
        </div>

        <Link href={productUrl} aria-label={`View ${product.name} details`}>
          <div className="relative h-[420px] w-full">
            <Image
              src={imageUrl}
              alt={product.name}
              fill
              sizes="(max-width: 768px) 100vw, (max-width: 1024px) 33vw, 25vw"
              className="object-cover transition-transform duration-300 group-hover:scale-105"
              priority={priority}
              quality={85}
            />
          </div>
        </Link>

        <div className="absolute inset-x-0 bottom-0 bg-transparent p-3 translate-y-full group-hover:translate-y-0 transition-transform duration-300">
          <button
            onClick={handleAddToCart}
            disabled={isAdding}
            className="w-full mb-2 bg-white border border-gray-200 rounded-full py-3 text-sm font-medium hover:bg-gray-900 hover:text-white transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-gray-900 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed"
            type="button"
            aria-label={`Add ${product.name} to cart`}
          >
            {isAdding ? "ADDING..." : "QUICK ADD"}
          </button>
        </div>
      </div>

      <Link href={productUrl} className="block mt-4 focus:outline-none focus:ring-2 focus:ring-gray-900 focus:ring-offset-2 rounded">
        <h3 className="text-sm font-medium text-gray-900 line-clamp-2 min-h-[2.5rem]">
          {product.name}
        </h3>

        <div className="mt-2 flex items-center gap-3">
          {hasDiscount && (
            <span className="text-sm text-gray-400 line-through" aria-label={`Original price $${priceNum.toFixed(2)}`}>
              ${priceNum.toFixed(2)}
            </span>
          )}
          <span className="text-sm font-semibold text-gray-900" aria-label={`Current price $${displayPrice.toFixed(2)}`}>
            ${displayPrice.toFixed(2)}
          </span>
        </div>
      </Link>
    </article>
  );
}

export default memo(ProductCard);
