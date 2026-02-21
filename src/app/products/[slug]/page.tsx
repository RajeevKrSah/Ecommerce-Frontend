'use client';

import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import { productService } from '@/services/product.service';
import { Product } from '@/types/product';
import { useAuth } from '@/hooks/useAuth';
import { useCart } from '@/hooks/useCart';
import { useWishlist } from '@/hooks/useWishlist';
import { useToast } from '@/components/ui/Toast';

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
  const [selectedSize, setSelectedSize] = useState('S');
  const [selectedColor, setSelectedColor] = useState('white');
  const [viewingCount, setViewingCount] = useState(34);
  const [isAddingToWishlist, setIsAddingToWishlist] = useState(false);
  
  // Countdown timer state
  const [timeLeft, setTimeLeft] = useState({
    days: 910,
    hours: 0,
    minutes: 35,
    seconds: 43
  });

  useEffect(() => {
    loadProduct();
  }, [slug]);

  // Countdown timer effect
  useEffect(() => {
    const timer = setInterval(() => {
      setTimeLeft(prev => {
        let { days, hours, minutes, seconds } = prev;
        
        if (seconds > 0) {
          seconds--;
        } else if (minutes > 0) {
          minutes--;
          seconds = 59;
        } else if (hours > 0) {
          hours--;
          minutes = 59;
          seconds = 59;
        } else if (days > 0) {
          days--;
          hours = 23;
          minutes = 59;
          seconds = 59;
        }
        
        return { days, hours, minutes, seconds };
      });
    }, 1000);

    return () => clearInterval(timer);
  }, []);

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
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">Loading product...</div>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold mb-4">Product not found</h2>
          <Link href="/products">
            <button className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium">
              Back to Products
            </button>
          </Link>
        </div>
      </div>
    );
  }

  const images = product.images || [];
  const currentImage = images[selectedImage]?.image_url;

  const getImageUrl = (url: string) => {
    if (!url) return '';
    if (url.startsWith('http')) return url;
    // Remove /api from the URL for storage paths
    const baseUrl = process.env.NEXT_PUBLIC_API_URL?.replace('/api', '') || 'http://localhost:8000';
    return `${baseUrl}${url}`;
  };

  const handleAddToCart = async () => {
    console.log('Add to cart clicked', { isAuthenticated, product: product?.id });
    
    if (!product) return;

    setIsAdding(true);
    try {
      console.log('Adding to cart:', { productId: product.id, quantity });
      await addToCart(product.id, quantity);
      
      if (!isAuthenticated) {
        // Guest cart - show message and option to login or continue shopping
        addToast({
          type: 'success',
          message: `${product.name} added to cart! Login to checkout.`,
        });
      } else {
        // Authenticated user
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
        // Pass product details for guest wishlist
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

  const sizes = ['S', 'M', 'L', 'XL'];
  const colors = [
    { name: 'Beige', value: 'beige', hex: '#F5F5DC' },
    { name: 'Green', value: 'green', hex: '#90C695' },
    { name: 'White', value: 'white', hex: '#FFFFFF' },
  ];

  const inWishlist = product ? isInWishlist(product.id) : false;

  return (
    <div className="min-h-screen bg-white py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <Link href="/products" className="text-gray-600 hover:text-gray-900 mb-6 inline-flex items-center text-sm">
          <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
          Back to Products
        </Link>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 mt-6">
          {/* Images - Vertical Thumbnail Layout */}
          <div className="flex gap-4">
            {/* Thumbnail Column */}
            {images.length > 1 && (
              <div className="flex flex-col gap-3 w-24">
                {images.map((image, index) => (
                  <button
                    key={image.id}
                    onClick={() => setSelectedImage(index)}
                    className={`aspect-square rounded-lg overflow-hidden border-2 transition-all ${
                      selectedImage === index
                        ? 'border-gray-900 shadow-md'
                        : 'border-gray-200 hover:border-gray-400'
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
            <div className="flex-1 bg-gray-50 rounded-2xl overflow-hidden relative">
              {currentImage ? (
                <img
                  src={getImageUrl(currentImage)}
                  alt={product.name}
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full aspect-square flex items-center justify-center text-gray-400">
                  No Image Available
                </div>
              )}
              
              {/* Floating Badge */}
              <div className="absolute bottom-6 left-6 bg-white rounded-full px-4 py-2 shadow-lg flex items-center gap-2">
                <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                <span className="text-sm font-medium">{viewingCount}</span>
                <span className="text-xs text-gray-600">People viewing this product right now!</span>
              </div>
            </div>
          </div>

          {/* Product Info */}
          <div className="space-y-6">
            {/* Brand & Title */}
            <div>
              <p className="text-sm text-gray-500 mb-2">Brand: AUTOMET</p>
              <h1 className="text-4xl font-bold text-gray-900 mb-3">
                {product.name}
              </h1>
              
              {/* Rating & Recent Activity */}
              <div className="flex items-center gap-4 mb-4">
                <div className="flex items-center gap-1">
                  {[...Array(5)].map((_, i) => (
                    <svg key={i} className="w-4 h-4 fill-yellow-400" viewBox="0 0 20 20">
                      <path d="M10 15l-5.878 3.09 1.123-6.545L.489 6.91l6.572-.955L10 0l2.939 5.955 6.572.955-4.756 4.635 1.123 6.545z" />
                    </svg>
                  ))}
                  <span className="text-sm text-gray-600 ml-1">(3 reviews)</span>
                </div>
                <div className="flex items-center gap-2 text-sm text-red-600">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
                  </svg>
                  6 people just added this product to their cart
                </div>
              </div>
            </div>

            {/* Price */}
            <div className="flex items-center gap-4">
              {product.sale_price ? (
                <>
                  <span className="text-4xl font-bold text-gray-900">
                    ${product.sale_price}
                  </span>
                  <span className="text-2xl text-gray-400 line-through">
                    ${product.price}
                  </span>
                </>
              ) : (
                <span className="text-4xl font-bold text-gray-900">${product.price}</span>
              )}
              {product.sale_price && (
                <div className="flex items-center gap-2 text-red-600">
                  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                    <path d="M8.433 7.418c.155-.103.346-.196.567-.267v1.698a2.305 2.305 0 01-.567-.267C8.07 8.34 8 8.114 8 8c0-.114.07-.34.433-.582zM11 12.849v-1.698c.22.071.412.164.567.267.364.243.433.468.433.582 0 .114-.07.34-.433.582a2.305 2.305 0 01-.567.267z" />
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-13a1 1 0 10-2 0v.092a4.535 4.535 0 00-1.676.662C6.602 6.234 6 7.009 6 8c0 .99.602 1.765 1.324 2.246.48.32 1.054.545 1.676.662v1.941c-.391-.127-.68-.317-.843-.504a1 1 0 10-1.51 1.31c.562.649 1.413 1.076 2.353 1.253V15a1 1 0 102 0v-.092a4.535 4.535 0 001.676-.662C13.398 13.766 14 12.991 14 12c0-.99-.602-1.765-1.324-2.246A4.535 4.535 0 0011 9.092V7.151c.391.127.68.317.843.504a1 1 0 101.511-1.31c-.563-.649-1.413-1.076-2.354-1.253V5z" clipRule="evenodd" />
                  </svg>
                  <span className="font-medium">Sold in last 9 hours</span>
                </div>
              )}
            </div>

            {/* Stock Status */}
            <div>
              {product.in_stock ? (
                <span className="inline-flex items-center px-3 py-1 rounded border border-gray-900 text-sm font-medium text-gray-900">
                  IN STOCK
                </span>
              ) : (
                <span className="inline-flex items-center px-3 py-1 rounded border border-red-600 text-sm font-medium text-red-600">
                  OUT OF STOCK
                </span>
              )}
            </div>

            {/* Description */}
            {product.short_description && (
              <div className="border-t border-b border-gray-200 py-4">
                <p className="text-sm text-gray-600 leading-relaxed">
                  <span className="font-medium text-gray-900">Contents:</span> {product.short_description}
                </p>
              </div>
            )}

            {/* Countdown Timer */}
            {product.sale_price && (
              <div className="bg-gray-50 rounded-lg p-4">
                <div className="flex items-center gap-2 mb-2">
                  <svg className="w-5 h-5 text-gray-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <span className="font-medium text-gray-900">Hurry up offer ends in:</span>
                </div>
                <div className="flex gap-4">
                  <div className="text-center">
                    <div className="text-2xl font-bold text-gray-900">{timeLeft.days}</div>
                    <div className="text-xs text-gray-600">Days</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-gray-900">{String(timeLeft.hours).padStart(2, '0')}</div>
                    <div className="text-xs text-gray-600">Hours</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-gray-900">{String(timeLeft.minutes).padStart(2, '0')}</div>
                    <div className="text-xs text-gray-600">Mins</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-gray-900">{String(timeLeft.seconds).padStart(2, '0')}</div>
                    <div className="text-xs text-gray-600">Secs</div>
                  </div>
                </div>
              </div>
            )}

            {/* Colors */}
            <div>
              <div className="flex items-center justify-between mb-3">
                <label className="text-sm font-medium text-gray-900">Colors: {selectedColor}</label>
              </div>
              <div className="flex gap-3">
                {colors.map((color) => (
                  <button
                    key={color.value}
                    onClick={() => setSelectedColor(color.value)}
                    className={`w-10 h-10 rounded-full border-2 transition-all ${
                      selectedColor === color.value
                        ? 'border-gray-900 scale-110'
                        : 'border-gray-300 hover:border-gray-400'
                    }`}
                    style={{ backgroundColor: color.hex }}
                    title={color.name}
                  >
                    {selectedColor === color.value && (
                      <svg className="w-5 h-5 mx-auto text-gray-900" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                      </svg>
                    )}
                  </button>
                ))}
              </div>
            </div>

            {/* Size */}
            <div>
              <div className="flex items-center justify-between mb-3">
                <label className="text-sm font-medium text-gray-900">Size: {selectedSize}</label>
                <button className="text-sm text-gray-600 hover:text-gray-900 flex items-center gap-1">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 8V4m0 0h4M4 4l5 5m11-1V4m0 0h-4m4 0l-5 5M4 16v4m0 0h4m-4 0l5-5m11 5l-5-5m5 5v-4m0 4h-4" />
                  </svg>
                  Size Guide
                </button>
              </div>
              <div className="flex gap-3">
                {sizes.map((size) => (
                  <button
                    key={size}
                    onClick={() => setSelectedSize(size)}
                    className={`px-6 py-3 rounded-lg border-2 font-medium transition-all ${
                      selectedSize === size
                        ? 'border-gray-900 bg-gray-900 text-white'
                        : 'border-gray-300 hover:border-gray-400 text-gray-700'
                    }`}
                  >
                    {size}
                  </button>
                ))}
                <button className="px-6 py-3 rounded-lg border-2 border-gray-300 text-gray-400 cursor-not-allowed">
                  Clear
                </button>
              </div>
            </div>

            {/* Quantity */}
            <div>
              <label className="text-sm font-medium text-gray-900 block mb-3">Quantity:</label>
              <div className="flex items-center border-2 border-gray-300 rounded-lg w-fit">
                <button
                  onClick={() => setQuantity(Math.max(1, quantity - 1))}
                  className="px-5 py-3 hover:bg-gray-100 font-medium text-lg"
                  disabled={!product.in_stock}
                >
                  -
                </button>
                <span className="px-8 py-3 border-x-2 border-gray-300 font-medium min-w-[60px] text-center">
                  {quantity}
                </span>
                <button
                  onClick={() => setQuantity(Math.min(product.stock_quantity, quantity + 1))}
                  className="px-5 py-3 hover:bg-gray-100 font-medium text-lg"
                  disabled={!product.in_stock}
                >
                  +
                </button>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="space-y-3 pt-4">
              <button
                onClick={handleAddToCart}
                disabled={!product.in_stock || isAdding}
                className="w-full px-6 py-4 bg-gray-900 text-white rounded-lg hover:bg-gray-800 transition-colors font-medium text-lg disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
                </svg>
                {isAdding ? 'Adding...' : product.in_stock ? 'Add to Cart' : 'Out of Stock'}
              </button>
              
              {justAdded && (
                <Link href="/cart">
                  <button className="w-full px-6 py-4 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors font-medium text-lg flex items-center justify-center gap-2">
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                    View Cart
                  </button>
                </Link>
              )}

              <button
                onClick={handleWishlistToggle}
                disabled={isAddingToWishlist}
                className={`w-full px-6 py-4 border-2 rounded-lg transition-colors font-medium text-lg flex items-center justify-center gap-2 ${
                  inWishlist
                    ? 'border-red-500 bg-red-50 text-red-600 hover:bg-red-100'
                    : 'border-gray-300 text-gray-900 hover:bg-gray-50'
                } disabled:opacity-50 disabled:cursor-not-allowed`}
              >
                <svg 
                  className={`w-5 h-5 ${inWishlist ? 'fill-red-600' : 'fill-none'}`} 
                  stroke="currentColor" 
                  viewBox="0 0 24 24"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                </svg>
                {isAddingToWishlist 
                  ? 'Updating...' 
                  : inWishlist 
                    ? 'Remove from Wishlist' 
                    : 'Add to Wishlist'
                }
              </button>
            </div>

            {/* Additional Info */}
            {product.description && (
              <div className="border-t border-gray-200 pt-6 mt-6">
                <h2 className="text-lg font-semibold mb-3 text-gray-900">Product Details</h2>
                <div className="text-sm text-gray-600 leading-relaxed">
                  {product.description}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
