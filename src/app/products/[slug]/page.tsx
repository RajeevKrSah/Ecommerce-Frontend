'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { productService } from '@/services/product.service';
import { Product } from '@/types/product';
import { useAuth } from '@/hooks/useAuth';
import { useCart } from '@/hooks/useCart';
import { useToast } from '@/components/ui/Toast';

export default function ProductDetailPage() {
  const params = useParams();
  const router = useRouter();
  const slug = params.slug as string;
  const { isAuthenticated } = useAuth();
  const { addToCart } = useCart();
  const { addToast } = useToast();
  
  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedImage, setSelectedImage] = useState(0);
  const [quantity, setQuantity] = useState(1);
  const [isAdding, setIsAdding] = useState(false);
  const [justAdded, setJustAdded] = useState(false);

  useEffect(() => {
    loadProduct();
  }, [slug]);

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

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <Link href="/products" className="text-blue-600 hover:underline mb-4 inline-block">
          ← Back to Products
        </Link>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Images */}
          <div>
            <div className="bg-white rounded-lg shadow-md p-4">
              <div className="aspect-square bg-gray-200 rounded-lg overflow-hidden mb-4">
                {currentImage ? (
                  <img
                    src={getImageUrl(currentImage)}
                    alt={product.name}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-gray-400">
                    No Image Available
                  </div>
                )}
              </div>
              {images.length > 1 && (
                <div className="grid grid-cols-4 gap-2">
                  {images.map((image, index) => (
                    <button
                      key={image.id}
                      onClick={() => setSelectedImage(index)}
                      className={`aspect-square rounded-lg overflow-hidden border-2 ${
                        selectedImage === index
                          ? 'border-blue-600'
                          : 'border-gray-200'
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
            </div>
          </div>

          {/* Product Info */}
          <div>
            <h1 className="text-3xl font-bold text-gray-900 mb-4">
              {product.name}
            </h1>

            {product.category && (
              <div className="mb-4">
                <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-blue-100 text-blue-800">
                  {product.category.name}
                </span>
              </div>
            )}

            <div className="mb-6">
              {product.sale_price ? (
                <div className="flex items-center gap-3">
                  <span className="text-3xl font-bold text-red-600">
                    ${product.sale_price}
                  </span>
                  <span className="text-xl text-gray-500 line-through">
                    ${product.price}
                  </span>
                  <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800">
                    Save ${(product.price - product.sale_price).toFixed(2)}
                  </span>
                </div>
              ) : (
                <span className="text-3xl font-bold">${product.price}</span>
              )}
            </div>

            <div className="mb-6">
              <p className="text-sm text-gray-600 mb-2">SKU: {product.sku}</p>
              <div className="flex items-center gap-2">
                {product.in_stock ? (
                  <>
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                      In Stock
                    </span>
                    <span className="text-sm text-gray-600">
                      {product.stock_quantity} available
                    </span>
                  </>
                ) : (
                  <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800">
                    Out of Stock
                  </span>
                )}
              </div>
            </div>

            {product.short_description && (
              <p className="text-lg text-gray-700 mb-6">
                {product.short_description}
              </p>
            )}

            <div className="mb-8">
              <div className="flex items-center gap-4 mb-4">
                <label className="text-sm font-medium text-gray-700">Quantity:</label>
                <div className="flex items-center border border-gray-300 rounded-lg">
                  <button
                    onClick={() => setQuantity(Math.max(1, quantity - 1))}
                    className="px-4 py-2 hover:bg-gray-100"
                    disabled={!product.in_stock}
                  >
                    -
                  </button>
                  <span className="px-6 py-2 border-x border-gray-300">
                    {quantity}
                  </span>
                  <button
                    onClick={() => setQuantity(Math.min(product.stock_quantity, quantity + 1))}
                    className="px-4 py-2 hover:bg-gray-100"
                    disabled={!product.in_stock}
                  >
                    +
                  </button>
                </div>
              </div>
              
              <div className="space-y-3">
                <button
                  onClick={handleAddToCart}
                  disabled={!product.in_stock || isAdding}
                  className="w-full px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium text-lg disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isAdding ? 'Adding...' : product.in_stock ? 'Add to Cart' : 'Out of Stock'}
                </button>
                
                {justAdded && (
                  <Link href="/cart">
                    <button className="w-full px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors font-medium text-lg">
                      View Cart
                    </button>
                  </Link>
                )}
              </div>
              
              {/* Debug info */}
              <div className="mt-2 text-xs text-gray-500">
                <p>Product ID: {product.id}</p>
                <p>Authenticated: {isAuthenticated ? 'Yes' : 'No'}</p>
                <p>In Stock: {product.in_stock ? 'Yes' : 'No'}</p>
              </div>
            </div>

            {product.description && (
              <div className="bg-white rounded-lg shadow-md p-6">
                <h2 className="text-xl font-semibold mb-4">Description</h2>
                <div className="prose prose-sm max-w-none text-gray-700">
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
