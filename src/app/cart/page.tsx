'use client';

import { useRouter } from 'next/navigation';
import { useAuth } from '@/hooks/useAuth';
import { useCart } from '@/hooks/useCart';
import MainLayout from '@/components/layouts/MainLayout';
import GuestCartView from '@/components/GuestCartView';
import Link from 'next/link';
import Button from '@/components/ui/Button';
import { Card, CardContent } from '@/components/ui/Card';

export default function CartPage() {
  const router = useRouter();
  const { isAuthenticated, isLoading: authLoading } = useAuth();
  const { cart, isLoading, updateQuantity, removeItem } = useCart();

  const getImageUrl = (url: string) => {
    if (!url) return '';
    if (url.startsWith('http')) return url;
    const baseUrl = process.env.NEXT_PUBLIC_API_URL?.replace('/api', '') || 'http://localhost:8000';
    return `${baseUrl}${url}`;
  };

  // Show guest cart if not authenticated
  if (!authLoading && !isAuthenticated) {
    return <GuestCartView />;
  }

  if (authLoading || isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (!cart || cart.items.length === 0) {
    return (
      <div className="min-h-screen bg-gray-50 py-12">
        <div className="container mx-auto px-4 md:px-12 lg:px-24">
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

  const handleQuantityChange = async (itemId: number, newQuantity: number) => {
    if (newQuantity < 1) return;
    try {
      await updateQuantity(itemId, newQuantity);
    } catch (error: any) {
      alert(error.response?.data?.message || 'Failed to update quantity');
    }
  };

  const handleRemove = async (itemId: number) => {
    try {
      await removeItem(itemId);
    } catch (error) {
      alert('Failed to remove item');
    }
  };

  return (
    <MainLayout>
      <div className="min-h-screen bg-gray-50 py-12">
        <div className="container mx-auto px-4 md:px-12 lg:px-24">
          <h1 className="text-3xl font-bold text-gray-900 mb-8">Shopping Cart</h1>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Cart Items */}
            <div className="lg:col-span-2 space-y-4">
              {cart.items.map((item) => (
                <Card key={item.id}>
                  <CardContent className="p-6">
                    <div className="flex gap-6">
                      {/* Product Image */}
                      <div className="flex-shrink-0">
                        {item.product.image ? (
                          <img
                            src={getImageUrl(item.product.image)}
                            alt={item.product.name}
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
                        <Link href={`/products/${item.product.slug}`}>
                          <h3 className="text-lg font-semibold text-gray-900 hover:text-blue-600">
                            {item.product.name}
                          </h3>
                        </Link>
                        <p className="text-gray-600 mt-1">
                          ${Number(item.price).toFixed(2)} each
                        </p>

                        {/* Quantity Controls */}
                        <div className="flex items-center gap-4 mt-4">
                          <div className="flex items-center border border-gray-300 rounded-lg">
                            <button
                              onClick={() => handleQuantityChange(item.id, item.quantity - 1)}
                              className="px-3 py-1 hover:bg-gray-100"
                              disabled={item.quantity <= 1}
                            >
                              -
                            </button>
                            <span className="px-4 py-1 border-x border-gray-300">
                              {item.quantity}
                            </span>
                            <button
                              onClick={() => handleQuantityChange(item.id, item.quantity + 1)}
                              className="px-3 py-1 hover:bg-gray-100"
                              disabled={item.quantity >= item.product.stock_quantity}
                            >
                              +
                            </button>
                          </div>

                          <button
                            onClick={() => handleRemove(item.id)}
                            className="text-red-600 hover:text-red-700 text-sm font-medium"
                          >
                            Remove
                          </button>
                        </div>

                        {item.quantity >= item.product.stock_quantity && (
                          <p className="text-sm text-orange-600 mt-2">
                            Maximum stock reached
                          </p>
                        )}
                      </div>

                      {/* Item Total */}
                      <div className="text-right">
                        <p className="text-xl font-bold text-gray-900">
                          ${Number(item.total).toFixed(2)}
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>

            {/* Order Summary */}
            <div className="lg:col-span-1">
              <Card className="sticky top-4">
                <CardContent className="p-6">
                  <h2 className="text-xl font-bold text-gray-900 mb-4">Order Summary</h2>

                  <div className="space-y-3 mb-6">
                    <div className="flex justify-between text-gray-600">
                      <span>Subtotal ({cart.total_items} items)</span>
                      <span>${Number(cart.subtotal).toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between text-gray-600">
                      <span>Shipping</span>
                      <span>{Number(cart.subtotal) >= 100 ? 'FREE' : '$10.00'}</span>
                    </div>
                    <div className="flex justify-between text-gray-600">
                      <span>Tax (8%)</span>
                      <span>${(Number(cart.subtotal) * 0.08).toFixed(2)}</span>
                    </div>
                    <div className="border-t pt-3 flex justify-between text-lg font-bold text-gray-900">
                      <span>Total</span>
                      <span>
                        ${(
                          Number(cart.subtotal) +
                          (Number(cart.subtotal) >= 100 ? 0 : 10) +
                          Number(cart.subtotal) * 0.08
                        ).toFixed(2)}
                      </span>
                    </div>
                  </div>

                  {Number(cart.subtotal) < 100 && (
                    <p className="text-sm text-gray-600 mb-4">
                      Add ${(100 - Number(cart.subtotal)).toFixed(2)} more for free shipping!
                    </p>
                  )}

                  <Link href="/checkout" className="block w-full">
                    <Button className="w-full" size="lg">
                      Proceed to Checkout
                    </Button>
                  </Link>

                  <Link href="/products">
                    <Button variant="outline" className="w-full mt-3">
                      Continue Shopping
                    </Button>
                  </Link>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </div>
    </MainLayout>
  );
}
