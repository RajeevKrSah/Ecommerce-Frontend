'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { GuestCartItem, guestCartManager } from '@/lib/guestCart';
import { productService } from '@/services/product.service';
import { Product } from '@/types/product';
import Button from '@/components/ui/Button';
import { Card, CardContent } from '@/components/ui/Card';

export default function GuestCartView() {
  const router = useRouter();
  const [guestCart, setGuestCart] = useState<GuestCartItem[]>([]);
  const [products, setProducts] = useState<Map<number, Product>>(new Map());
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadGuestCart();
  }, []);

  const loadGuestCart = async () => {
    const cart = guestCartManager.getCart();
    setGuestCart(cart);

    // Fetch product details for each item
    const productMap = new Map<number, Product>();
    
    for (const item of cart) {
      try {
        const product = await productService.getProductById(item.productId);
        productMap.set(item.productId, product);
      } catch (error) {
        console.error(`Failed to load product ${item.productId}:`, error);
      }
    }

    setProducts(productMap);
    setLoading(false);
  };

  const handleUpdateQuantity = (productId: number, newQuantity: number) => {
    if (newQuantity < 1) return;
    
    guestCartManager.updateItem(productId, newQuantity);
    setGuestCart(guestCartManager.getCart());
  };

  const handleRemove = (productId: number) => {
    guestCartManager.removeItem(productId);
    setGuestCart(guestCartManager.getCart());
  };

  const getImageUrl = (url: string) => {
    if (!url) return '';
    if (url.startsWith('http')) return url;
    const baseUrl = process.env.NEXT_PUBLIC_API_URL?.replace('/api', '') || 'http://localhost:8000';
    return `${baseUrl}${url}`;
  };

  const calculateSubtotal = () => {
    return guestCart.reduce((total, item) => {
      const product = products.get(item.productId);
      if (!product) return total;
      const price = product.sale_price || product.price;
      return total + (price * item.quantity);
    }, 0);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (guestCart.length === 0) {
    return (
      <div className="min-h-screen bg-gray-50 py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <Card>
            <CardContent className="p-12 text-center">
              <svg
                className="mx-auto h-24 w-24 text-gray-400 mb-4"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={1.5}
                  d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z"
                />
              </svg>
              <h2 className="text-2xl font-bold text-gray-900 mb-2">Your cart is empty</h2>
              <p className="text-gray-600 mb-6">Add some products to get started</p>
              <Link href="/products">
                <Button>Browse Products</Button>
              </Link>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  const subtotal = calculateSubtotal();
  const shipping = subtotal >= 100 ? 0 : 10;
  const tax = subtotal * 0.08;
  const total = subtotal + shipping + tax;

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-8">Shopping Cart</h1>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Cart Items */}
          <div className="lg:col-span-2 space-y-4">
            {guestCart.map((item) => {
              const product = products.get(item.productId);
              if (!product) return null;

              const price = product.sale_price || product.price;
              const itemTotal = price * item.quantity;

              return (
                <Card key={item.productId}>
                  <CardContent className="p-6">
                    <div className="flex gap-6">
                      {/* Product Image */}
                      <div className="flex-shrink-0">
                        {product.images?.[0] ? (
                          <img
                            src={getImageUrl(product.images[0].image_url)}
                            alt={product.name}
                            className="w-[120px] h-[120px] rounded-lg object-cover"
                          />
                        ) : (
                          <div className="w-[120px] h-[120px] bg-gray-200 rounded-lg flex items-center justify-center">
                            <span className="text-gray-400 text-sm">No image</span>
                          </div>
                        )}
                      </div>

                      {/* Product Details */}
                      <div className="flex-1">
                        <Link href={`/products/${product.slug}`}>
                          <h3 className="text-lg font-semibold text-gray-900 hover:text-blue-600">
                            {product.name}
                          </h3>
                        </Link>
                        <p className="text-gray-600 mt-1">
                          ${Number(price).toFixed(2)} each
                        </p>

                        {/* Quantity Controls */}
                        <div className="flex items-center gap-4 mt-4">
                          <div className="flex items-center border border-gray-300 rounded-lg">
                            <button
                              onClick={() => handleUpdateQuantity(item.productId, item.quantity - 1)}
                              className="px-3 py-1 hover:bg-gray-100"
                              disabled={item.quantity <= 1}
                            >
                              -
                            </button>
                            <span className="px-4 py-1 border-x border-gray-300">
                              {item.quantity}
                            </span>
                            <button
                              onClick={() => handleUpdateQuantity(item.productId, item.quantity + 1)}
                              className="px-3 py-1 hover:bg-gray-100"
                              disabled={item.quantity >= product.stock_quantity}
                            >
                              +
                            </button>
                          </div>

                          <button
                            onClick={() => handleRemove(item.productId)}
                            className="text-red-600 hover:text-red-700 text-sm font-medium"
                          >
                            Remove
                          </button>
                        </div>
                      </div>

                      {/* Item Total */}
                      <div className="text-right">
                        <p className="text-xl font-bold text-gray-900">
                          ${itemTotal.toFixed(2)}
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>

          {/* Order Summary */}
          <div className="lg:col-span-1">
            <Card className="sticky top-4">
              <CardContent className="p-6">
                <h2 className="text-xl font-bold text-gray-900 mb-4">Order Summary</h2>

                <div className="space-y-3 mb-6">
                  <div className="flex justify-between text-gray-600">
                    <span>Subtotal ({guestCart.length} items)</span>
                    <span>${subtotal.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between text-gray-600">
                    <span>Shipping</span>
                    <span>{shipping === 0 ? 'FREE' : `$${shipping.toFixed(2)}`}</span>
                  </div>
                  <div className="flex justify-between text-gray-600">
                    <span>Tax (8%)</span>
                    <span>${tax.toFixed(2)}</span>
                  </div>
                  <div className="border-t pt-3 flex justify-between text-lg font-bold text-gray-900">
                    <span>Total</span>
                    <span>${total.toFixed(2)}</span>
                  </div>
                </div>

                {subtotal < 100 && (
                  <p className="text-sm text-gray-600 mb-4">
                    Add ${(100 - subtotal).toFixed(2)} more for free shipping!
                  </p>
                )}

                <div className="space-y-3">
                  <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-4">
                    <p className="text-sm text-yellow-800">
                      <strong>Login required:</strong> Please login or create an account to proceed to checkout.
                    </p>
                  </div>

                  <Link href="/login?redirect=/cart" className="block">
                    <Button className="w-full" size="lg">
                      Login to Checkout
                    </Button>
                  </Link>

                  <Link href="/signup?redirect=/cart" className="block">
                    <Button variant="outline" className="w-full">
                      Create Account
                    </Button>
                  </Link>

                  <Link href="/products" className="block">
                    <Button variant="outline" className="w-full">
                      Continue Shopping
                    </Button>
                  </Link>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
