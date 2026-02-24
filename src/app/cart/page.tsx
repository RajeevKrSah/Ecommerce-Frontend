'use client';

import { useState } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { useCart } from '@/hooks/useCart';
import { useToast } from '@/components/ui/Toast';
import { ConfirmModal } from '@/components/ui/ConfirmModal';
import GuestCartView from '@/components/GuestCartView';
import Link from 'next/link';
import { Trash2, ShoppingBag, ArrowRight, Plus, Minus } from 'lucide-react';

export default function CartPage() {
  const { isAuthenticated, isLoading: authLoading } = useAuth();
  const { cart, isLoading, updateQuantity, removeItem } = useCart();
  const { addToast } = useToast();
  const [itemToRemove, setItemToRemove] = useState<{ id: number; name: string } | null>(null);
  const [isRemoving, setIsRemoving] = useState(false);

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
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900 mx-auto"></div>
          <p className="mt-4 text-sm text-gray-600">Loading your cart...</p>
        </div>
      </div>
    );
  }

  if (!cart || cart.items.length === 0) {
    return (
      <div className="min-h-screen bg-white py-16">
        <div className="container mx-auto px-4 md:px-12 lg:px-24">
          <div className="max-w-md mx-auto text-center">
            <div className="w-24 h-24 mx-auto mb-6 rounded-full bg-gray-100 flex items-center justify-center">
              <ShoppingBag className="w-12 h-12 text-gray-400" />
            </div>
            <h2 className="text-2xl font-bold text-gray-900 mb-2">Your cart is empty</h2>
            <p className="text-gray-600 mb-8">Looks like you haven't added anything to your cart yet</p>
            <Link href="/products">
              <button className="px-6 py-3 bg-gray-900 text-white rounded-lg hover:bg-gray-800 transition-colors font-medium inline-flex items-center gap-2">
                Start Shopping
                <ArrowRight className="w-4 h-4" />
              </button>
            </Link>
          </div>
        </div>
      </div>
    );
  }

  const handleQuantityChange = async (itemId: number, newQuantity: number) => {
    if (newQuantity < 1) return;
    try {
      await updateQuantity(itemId, newQuantity);
      addToast({
        type: 'success',
        message: 'Quantity updated successfully',
        duration: 2000,
      });
    } catch (error: any) {
      const errorMessage = error.response?.data?.message || error.message || 'Failed to update quantity';
      addToast({
        type: 'error',
        title: 'Update Failed',
        message: errorMessage,
        duration: 4000,
      });
    }
  };

  const handleRemoveClick = (itemId: number, itemName: string) => {
    setItemToRemove({ id: itemId, name: itemName });
  };

  const handleConfirmRemove = async () => {
    if (!itemToRemove) return;

    setIsRemoving(true);
    try {
      await removeItem(itemToRemove.id);
      addToast({
        type: 'success',
        message: 'Item removed from cart',
        duration: 2000,
      });
      setItemToRemove(null);
    } catch (error: any) {
      const errorMessage = error.response?.data?.message || error.message || 'Failed to remove item';
      addToast({
        type: 'error',
        title: 'Remove Failed',
        message: errorMessage,
        duration: 4000,
      });
    } finally {
      setIsRemoving(false);
    }
  };

  const handleCancelRemove = () => {
    if (!isRemoving) {
      setItemToRemove(null);
    }
  };

  const subtotal = Number(cart.subtotal);
  const shipping = subtotal >= 100 ? 0 : 10;
  const tax = subtotal * 0.08;
  const total = subtotal + shipping + tax;

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-white border-b border-gray-200">
        <div className="container mx-auto px-4 md:px-12 lg:px-24 py-6">
          <h1 className="text-2xl font-bold text-gray-900">Shopping Cart</h1>
          <p className="text-sm text-gray-600 mt-1">{cart.total_items} {cart.total_items === 1 ? 'item' : 'items'}</p>
        </div>
      </div>

      <div className="container mx-auto px-4 md:px-12 lg:px-24 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Cart Items */}
          <div className="lg:col-span-2 space-y-4">
            {cart.items.map((item) => {
              // Skip items without product data
              if (!item.product) return null;
              
              const product = item.product; // TypeScript narrowing
              
              return (
              <div key={item.id} className="bg-white rounded-lg border border-gray-200 p-6 hover:shadow-md transition-shadow">
                <div className="flex gap-6">
                  {/* Product Image */}
                  <Link href={`/products/${product.slug}`} className="flex-shrink-0">
                    {product.image ? (
                      <img
                        src={getImageUrl(product.image)}
                        alt={product.name}
                        className="w-28 h-28 rounded-lg object-cover border border-gray-200"
                      />
                    ) : (
                      <div className="w-28 h-28 bg-gray-100 rounded-lg flex items-center justify-center border border-gray-200">
                        <ShoppingBag className="w-8 h-8 text-gray-400" />
                      </div>
                    )}
                  </Link>

                  {/* Product Details */}
                  <div className="flex-1 min-w-0">
                    <Link href={`/products/${product.slug}`}>
                      <h3 className="text-lg font-semibold text-gray-900 hover:text-gray-700 transition-colors truncate">
                        {product.name}
                      </h3>
                    </Link>
                    
                    {/* Size and Color */}
                    {item.metadata && (item.metadata.size || item.metadata.color) && (
                      <div className="flex items-center gap-3 mt-2">
                        {item.metadata.size && (
                          <span className="text-xs text-gray-600 bg-gray-100 px-2 py-1 rounded">
                            Size: {item.metadata.size}
                          </span>
                        )}
                        {item.metadata.color && (
                          <span className="flex items-center gap-1.5 text-xs text-gray-600 bg-gray-100 px-2 py-1 rounded">
                            {item.metadata.color_hex && (
                              <span
                                className="w-3 h-3 rounded-full border border-gray-300"
                                style={{ backgroundColor: item.metadata.color_hex }}
                              />
                            )}
                            {item.metadata.color}
                          </span>
                        )}
                      </div>
                    )}
                    
                    <div className="flex items-center gap-3 mt-2">
                      <p className="text-lg font-semibold text-gray-900">
                        ${Number(item.price).toFixed(2)}
                      </p>
                      {product.sale_price && product.sale_price < product.price && (
                        <p className="text-sm text-gray-500 line-through">
                          ${Number(product.price).toFixed(2)}
                        </p>
                      )}
                    </div>

                    {/* Stock Status */}
                    <div className="flex items-center gap-2 mt-2">
                      {product.in_stock ? (
                        <>
                          <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                          <span className="text-xs text-gray-600">In Stock</span>
                        </>
                      ) : (
                        <>
                          <div className="w-2 h-2 bg-red-500 rounded-full"></div>
                          <span className="text-xs text-red-600">Out of Stock</span>
                        </>
                      )}
                    </div>

                    {/* Quantity Controls */}
                    <div className="flex items-center gap-4 mt-4">
                      <div className="inline-flex items-center bg-gray-50 rounded-lg border border-gray-200">
                        <button
                          onClick={() => handleQuantityChange(item.id, item.quantity - 1)}
                          className="p-2 hover:bg-gray-100 transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
                          disabled={item.quantity <= 1}
                          aria-label="Decrease quantity"
                        >
                          <Minus className="w-4 h-4 text-gray-700" />
                        </button>
                        <span className="px-4 py-2 text-sm font-medium text-gray-900 min-w-[40px] text-center">
                          {item.quantity}
                        </span>
                        <button
                          onClick={() => handleQuantityChange(item.id, item.quantity + 1)}
                          className="p-2 hover:bg-gray-100 transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
                          disabled={item.quantity >= product.stock_quantity}
                          aria-label="Increase quantity"
                        >
                          <Plus className="w-4 h-4 text-gray-700" />
                        </button>
                      </div>

                      <button
                        onClick={() => handleRemoveClick(item.id, product.name)}
                        className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                        aria-label="Remove item"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>

                    {item.quantity >= product.stock_quantity && (
                      <p className="text-xs text-orange-600 mt-2 flex items-center gap-1">
                        <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                        </svg>
                        Maximum stock reached
                      </p>
                    )}
                  </div>

                  {/* Item Total */}
                  <div className="text-right flex-shrink-0">
                    <p className="text-xl font-bold text-gray-900">
                      ${Number(item.total).toFixed(2)}
                    </p>
                  </div>
                </div>
              </div>
            );
            })}
          </div>

          {/* Order Summary */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-lg border border-gray-200 p-6 sticky top-4">
              <h2 className="text-lg font-bold text-gray-900 mb-6">Order Summary</h2>

              <div className="space-y-3 mb-6">
                <div className="flex justify-between text-sm text-gray-600">
                  <span>Subtotal ({cart.total_items} {cart.total_items === 1 ? 'item' : 'items'})</span>
                  <span className="font-medium text-gray-900">${subtotal.toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-sm text-gray-600">
                  <span>Shipping</span>
                  <span className="font-medium text-gray-900">
                    {shipping === 0 ? (
                      <span className="text-green-600">FREE</span>
                    ) : (
                      `$${shipping.toFixed(2)}`
                    )}
                  </span>
                </div>
                <div className="flex justify-between text-sm text-gray-600">
                  <span>Tax (8%)</span>
                  <span className="font-medium text-gray-900">${tax.toFixed(2)}</span>
                </div>
                
                <div className="border-t border-gray-200 pt-3 mt-3">
                  <div className="flex justify-between">
                    <span className="text-base font-bold text-gray-900">Total</span>
                    <span className="text-xl font-bold text-gray-900">${total.toFixed(2)}</span>
                  </div>
                </div>
              </div>

              {subtotal < 100 && (
                <div className="mb-6 p-3 bg-blue-50 rounded-lg border border-blue-100">
                  <p className="text-xs text-blue-900">
                    <span className="font-semibold">Add ${(100 - subtotal).toFixed(2)} more</span> for free shipping!
                  </p>
                  <div className="mt-2 w-full bg-blue-200 rounded-full h-1.5">
                    <div 
                      className="bg-blue-600 h-1.5 rounded-full transition-all duration-300"
                      style={{ width: `${Math.min((subtotal / 100) * 100, 100)}%` }}
                    ></div>
                  </div>
                </div>
              )}

              <Link href="/checkout" className="block w-full mb-3">
                <button className="w-full px-6 py-3 bg-gray-900 text-white rounded-lg hover:bg-gray-800 transition-colors font-medium flex items-center justify-center gap-2">
                  Proceed to Checkout
                  <ArrowRight className="w-4 h-4" />
                </button>
              </Link>

              <Link href="/products">
                <button className="w-full px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors font-medium">
                  Continue Shopping
                </button>
              </Link>

              {/* Trust Badges */}
              <div className="mt-6 pt-6 border-t border-gray-200 space-y-3">
                <div className="flex items-center gap-3 text-xs text-gray-600">
                  <svg className="w-5 h-5 text-green-600 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                  </svg>
                  <span>Secure checkout</span>
                </div>
                <div className="flex items-center gap-3 text-xs text-gray-600">
                  <svg className="w-5 h-5 text-blue-600 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 8h14M5 8a2 2 0 110-4h14a2 2 0 110 4M5 8v10a2 2 0 002 2h10a2 2 0 002-2V8m-9 4h4" />
                  </svg>
                  <span>Free returns within 30 days</span>
                </div>
                <div className="flex items-center gap-3 text-xs text-gray-600">
                  <svg className="w-5 h-5 text-purple-600 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <span>Fast delivery in 2-5 business days</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Confirm Remove Modal */}
      <ConfirmModal
        isOpen={!!itemToRemove}
        onClose={handleCancelRemove}
        onConfirm={handleConfirmRemove}
        title="Remove Item"
        message={`Are you sure you want to remove "${itemToRemove?.name}" from your cart?`}
        confirmText="Remove"
        cancelText="Cancel"
        confirmVariant="danger"
        isLoading={isRemoving}
      />
    </div>
  );
}
