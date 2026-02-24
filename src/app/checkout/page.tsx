'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '@/hooks/useAuth';
import { useCart } from '@/hooks/useCart';
import { orderService } from '@/services/order.service';
import { addressService, Address } from '@/services/address.service';
import { CheckoutFormData } from '@/types/order';
import Button from '@/components/ui/Button';
import Input from '@/components/ui/Input';
import { Card, CardContent } from '@/components/ui/Card';

export default function CheckoutPage() {
  const router = useRouter();
  const { isAuthenticated, isLoading: authLoading, user } = useAuth();
  const { cart, isLoading: cartLoading } = useCart();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [addresses, setAddresses] = useState<Address[]>([]);
  const [selectedAddressId, setSelectedAddressId] = useState<number | null>(null);
  const [showAddressForm, setShowAddressForm] = useState(false);
  const [loadingAddresses, setLoadingAddresses] = useState(true);

  const [formData, setFormData] = useState<CheckoutFormData>({
    shipping_name: '',
    shipping_email: '',
    shipping_phone: '',
    shipping_address: '',
    shipping_city: '',
    shipping_state: '',
    shipping_zip: '',
    shipping_country: 'US',
    notes: '',
  });

  // Handle authentication redirect
  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      console.log('Not authenticated, redirecting to login');
      router.push('/login?redirect=/checkout');
    }
  }, [isAuthenticated, authLoading, router]);

  // Fetch saved addresses
  useEffect(() => {
    const fetchAddresses = async () => {
      if (!isAuthenticated) return;

      try {
        const data = await addressService.getAddresses();
        setAddresses(data);

        // Auto-select default address
        const defaultAddress = data.find(addr => addr.is_default);
        if (defaultAddress) {
          setSelectedAddressId(defaultAddress.id);
          populateFormFromAddress(defaultAddress);
        } else if (data.length > 0) {
          setSelectedAddressId(data[0].id);
          populateFormFromAddress(data[0]);
        } else {
          setShowAddressForm(true);
        }
      } catch (err) {
        console.error('Failed to fetch addresses:', err);
      } finally {
        setLoadingAddresses(false);
      }
    };

    fetchAddresses();
  }, [isAuthenticated]);

  // Pre-fill user data
  useEffect(() => {
    if (user) {
      console.log('Setting user data:', user.name, user.email);
      setFormData((prev) => ({
        ...prev,
        shipping_name: user.name || '',
        shipping_email: user.email || '',
      }));
    }
  }, [user]);

  // Only redirect to cart if loading is complete and cart is confirmed empty
  useEffect(() => {
    // Don't do anything while still loading
    if (authLoading || cartLoading || loadingAddresses) {
      return;
    }

    // Don't redirect if not authenticated (auth redirect will handle it)
    if (!isAuthenticated) {
      return;
    }

    // Only redirect if cart is loaded and confirmed empty
    // Don't redirect if cart is null/undefined (still loading)
    if (cart && cart.items && cart.items.length === 0) {
      console.log('Cart is empty, redirecting to cart page');
      const timer = setTimeout(() => {
        router.push('/cart');
      }, 500); // Increased delay to prevent race condition
      return () => clearTimeout(timer);
    }
  }, [cartLoading, authLoading, loadingAddresses, isAuthenticated, cart, router]);

  const populateFormFromAddress = (address: Address) => {
    setFormData(prev => ({
      ...prev,
      shipping_address: address.address_line1 + (address.address_line2 ? `, ${address.address_line2}` : ''),
      shipping_city: address.city,
      shipping_state: address.state,
      shipping_zip: address.postal_code,
      shipping_country: address.country,
    }));
  };

  const handleAddressSelect = (addressId: number) => {
    setSelectedAddressId(addressId);
    const address = addresses.find(a => a.id === addressId);
    if (address) {
      populateFormFromAddress(address);
    }
    // Keep the phone number from user data when switching addresses
    setShowAddressForm(false);
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsSubmitting(true);

    console.log('Submitting order with data:', formData);

    try {
      const order = await orderService.createOrder(formData);
      console.log('Order created successfully:', order);
      router.push(`/payment/${order.id}`);
    } catch (err: any) {
      console.error('Order creation failed:', err);
      const errorMessage = err.response?.data?.message || err.message || 'Failed to place order';
      setError(errorMessage);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (authLoading || cartLoading || loadingAddresses) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading checkout...</p>
        </div>
      </div>
    );
  }

  // Show loading while cart is still undefined/null
  if (!cart) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading cart...</p>
        </div>
      </div>
    );
  }

  // Only show this after we know cart is loaded and empty
  if (cart.items.length === 0) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  const subtotal = Number(cart.subtotal);
  const shipping = subtotal >= 100 ? 0 : 10;
  const tax = subtotal * 0.08;
  const total = subtotal + shipping + tax;

  const getImageUrl = (url: string) => {
    if (!url) return '';
    if (url.startsWith('http')) return url;
    const baseUrl = process.env.NEXT_PUBLIC_API_URL?.replace('/api', '') || 'http://localhost:8000';
    return `${baseUrl}${url}`;
  };

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-8">Checkout</h1>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2">
            <Card>
              <CardContent className="p-6">
                <form onSubmit={handleSubmit} className="space-y-6">
                  {/* Order Items Review */}
                  <div>
                    <h2 className="text-xl font-bold text-gray-900 mb-4">Review Your Order</h2>
                    <div className="space-y-3">
                      {cart.items.map((item) => {
                        // Skip items without product data
                        if (!item.product) return null;
                        
                        const product = item.product;
                        
                        return (
                        <div
                          key={item.id}
                          className="flex gap-4 p-4 bg-gray-50 rounded-lg border border-gray-200"
                        >
                          {/* Product Image */}
                          <div className="flex-shrink-0">
                            {product.image ? (
                              <img
                                src={getImageUrl(product.image)}
                                alt={product.name}
                                className="w-20 h-20 rounded-lg object-cover"
                              />
                            ) : (
                              <div className="w-20 h-20 bg-gray-200 rounded-lg flex items-center justify-center">
                                <span className="text-gray-400 text-xs">No image</span>
                              </div>
                            )}
                          </div>

                          {/* Product Details */}
                          <div className="flex-1 min-w-0">
                            <h3 className="font-semibold text-gray-900 truncate">
                              {product.name}
                            </h3>
                            <p className="text-sm text-gray-600 mt-1">
                              ${Number(item.price).toFixed(2)} × {item.quantity}
                            </p>
                          </div>

                          {/* Item Total */}
                          <div className="flex-shrink-0 text-right">
                            <p className="font-bold text-gray-900">
                              ${Number(item.total).toFixed(2)}
                            </p>
                          </div>
                        </div>
                        );
                      })}
                    </div>

                    {/* Quick Summary */}
                    <div className="mt-4 p-4 bg-blue-50 border border-blue-200 rounded-lg">
                      <div className="flex justify-between items-center">
                        <div>
                          <p className="text-sm text-gray-600">
                            {cart.total_items} {cart.total_items === 1 ? 'item' : 'items'}
                          </p>
                          <p className="text-lg font-bold text-gray-900">
                            ${total.toFixed(2)}
                          </p>
                        </div>
                        {shipping === 0 && (
                          <div className="flex items-center gap-2 text-green-600">
                            <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                              <path d="M8 16.5a1.5 1.5 0 11-3 0 1.5 1.5 0 013 0zM15 16.5a1.5 1.5 0 11-3 0 1.5 1.5 0 013 0z" />
                              <path d="M3 4a1 1 0 00-1 1v10a1 1 0 001 1h1.05a2.5 2.5 0 014.9 0H10a1 1 0 001-1V5a1 1 0 00-1-1H3zM14 7a1 1 0 00-1 1v6.05A2.5 2.5 0 0115.95 16H17a1 1 0 001-1v-5a1 1 0 00-.293-.707l-2-2A1 1 0 0015 7h-1z" />
                            </svg>
                            <span className="text-sm font-medium">FREE Shipping</span>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Divider */}
                  <div className="border-t border-gray-200"></div>

                  {/* Contact Information - Always Visible */}
                  <div>
                    <h2 className="text-xl font-bold text-gray-900 mb-4">Contact Information</h2>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Full Name *
                        </label>
                        <Input
                          name="shipping_name"
                          value={formData.shipping_name}
                          onChange={handleChange}
                          required
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Email *
                        </label>
                        <Input
                          type="email"
                          name="shipping_email"
                          value={formData.shipping_email}
                          onChange={handleChange}
                          required
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Phone *
                        </label>
                        <Input
                          type="tel"
                          name="shipping_phone"
                          value={formData.shipping_phone}
                          onChange={handleChange}
                          required
                          placeholder="(555) 123-4567"
                        />
                      </div>
                    </div>
                  </div>

                  {/* Divider */}
                  <div className="border-t border-gray-200"></div>

                  {/* Saved Addresses Section */}
                  {addresses.length > 0 && !showAddressForm && (
                    <div>
                      <div className="flex items-center justify-between mb-4">
                        <h2 className="text-xl font-bold text-gray-900">
                          Select Shipping Address
                        </h2>
                        <Button
                          type="button"
                          variant="outline"
                          onClick={() => setShowAddressForm(true)}
                        >
                          + Add New Address
                        </Button>
                      </div>

                      <div className="space-y-3">
                        {addresses.map((address) => (
                          <div
                            key={address.id}
                            onClick={() => handleAddressSelect(address.id)}
                            className={`p-4 border-2 rounded-lg cursor-pointer transition-all ${selectedAddressId === address.id
                              ? 'border-blue-500 bg-blue-50'
                              : 'border-gray-200 hover:border-gray-300'
                              }`}
                          >
                            <div className="flex items-start justify-between">
                              <div className="flex-1">
                                <div className="flex items-center gap-2 mb-1">
                                  <span className="font-semibold text-gray-900">
                                    {address.label}
                                  </span>
                                  {address.is_default && (
                                    <span className="px-2 py-0.5 bg-green-100 text-green-700 text-xs rounded-full">
                                      Default
                                    </span>
                                  )}
                                </div>
                                <p className="text-sm text-gray-600">
                                  {address.address_line1}
                                  {address.address_line2 && `, ${address.address_line2}`}
                                </p>
                                <p className="text-sm text-gray-600">
                                  {address.city}, {address.state} {address.postal_code}
                                </p>
                                <p className="text-sm text-gray-600">{address.country}</p>
                              </div>
                              <div className="ml-4">
                                {selectedAddressId === address.id && (
                                  <div className="w-6 h-6 bg-blue-500 rounded-full flex items-center justify-center">
                                    <svg className="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 20 20">
                                      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                                    </svg>
                                  </div>
                                )}
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Address Form */}
                  {(showAddressForm || addresses.length === 0) && (
                    <div>
                      <div className="flex items-center justify-between mb-4">
                        <h2 className="text-xl font-bold text-gray-900">
                          {addresses.length > 0 ? 'Add New Address' : 'Shipping Information'}
                        </h2>
                        {addresses.length > 0 && (
                          <Button
                            type="button"
                            variant="outline"
                            onClick={() => {
                              setShowAddressForm(false);
                              if (addresses.length > 0) {
                                const defaultAddr = addresses.find(a => a.is_default) || addresses[0];
                                setSelectedAddressId(defaultAddr.id);
                                populateFormFromAddress(defaultAddr);
                              }
                            }}
                          >
                            Use Saved Address
                          </Button>
                        )}
                      </div>

                      {error && (
                        <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-lg text-red-600">
                          {error}
                        </div>
                      )}

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="md:col-span-2">
                          <label className="block text-sm font-medium text-gray-700 mb-1">
                            Address *
                          </label>
                          <Input
                            name="shipping_address"
                            value={formData.shipping_address}
                            onChange={handleChange}
                            required
                          />
                        </div>

                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">
                            City *
                          </label>
                          <Input
                            name="shipping_city"
                            value={formData.shipping_city}
                            onChange={handleChange}
                            required
                          />
                        </div>

                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">
                            State *
                          </label>
                          <Input
                            name="shipping_state"
                            value={formData.shipping_state}
                            onChange={handleChange}
                            required
                          />
                        </div>

                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">
                            ZIP Code *
                          </label>
                          <Input
                            name="shipping_zip"
                            value={formData.shipping_zip}
                            onChange={handleChange}
                            required
                          />
                        </div>

                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">
                            Country
                          </label>
                          <Input
                            name="shipping_country"
                            value={formData.shipping_country}
                            onChange={handleChange}
                            maxLength={2}
                          />
                        </div>

                        <div className="md:col-span-2">
                          <label className="block text-sm font-medium text-gray-700 mb-1">
                            Order Notes (Optional)
                          </label>
                          <textarea
                            name="notes"
                            value={formData.notes}
                            onChange={handleChange}
                            rows={3}
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                          />
                        </div>
                      </div>
                    </div>
                  )}

                  <div className="flex gap-4">
                    <Link href="/cart" className="flex-1">
                      <Button type="button" variant="outline" className="w-full">
                        Back to Cart
                      </Button>
                    </Link>
                    <Button
                      type="submit"
                      disabled={isSubmitting}
                      className="flex-1"
                    >
                      {isSubmitting ? 'Creating Order...' : 'Continue to Payment'}
                    </Button>
                  </div>
                </form>
              </CardContent>
            </Card>
          </div>

          {/* Order Summary */}
          <div className="lg:col-span-1">
            <Card className="sticky top-4">
              <CardContent className="p-6">
                <h2 className="text-xl font-bold text-gray-900 mb-4">Order Summary</h2>

                {/* Items List */}
                <div className="space-y-3 mb-6 max-h-64 overflow-y-auto">
                  {cart.items.map((item) => {
                    // Skip items without product data
                    if (!item.product) return null;
                    
                    const product = item.product;
                    
                    return (
                    <div key={item.id} className="flex gap-3">
                      <div className="relative flex-shrink-0">
                        {product.image ? (
                          <img
                            src={getImageUrl(product.image)}
                            alt={product.name}
                            className="w-16 h-16 rounded object-cover"
                          />
                        ) : (
                          <div className="w-16 h-16 bg-gray-200 rounded flex items-center justify-center">
                            <span className="text-gray-400 text-xs">No img</span>
                          </div>
                        )}
                        <span className="absolute -top-2 -right-2 bg-blue-600 text-white text-xs font-bold rounded-full w-5 h-5 flex items-center justify-center">
                          {item.quantity}
                        </span>
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-gray-900 truncate">
                          {product.name}
                        </p>
                        <p className="text-xs text-gray-500">
                          ${Number(item.price).toFixed(2)} each
                        </p>
                        <p className="text-sm font-semibold text-gray-900 mt-1">
                          ${Number(item.total).toFixed(2)}
                        </p>
                      </div>
                    </div>
                    );
                  })}
                </div>

                {/* Price Breakdown */}
                <div className="border-t pt-4 space-y-3">
                  <div className="flex justify-between text-gray-600">
                    <span>Subtotal ({cart.total_items} items)</span>
                    <span>${subtotal.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between text-gray-600">
                    <span>Shipping</span>
                    <span className={shipping === 0 ? 'text-green-600 font-medium' : ''}>
                      {shipping === 0 ? 'FREE' : `$${shipping.toFixed(2)}`}
                    </span>
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

                {/* Free Shipping Progress */}
                {subtotal < 100 && (
                  <div className="mt-4 p-3 bg-orange-50 border border-orange-200 rounded-lg">
                    <p className="text-xs text-orange-800 mb-2">
                      Add <span className="font-bold">${(100 - subtotal).toFixed(2)}</span> more for FREE shipping!
                    </p>
                    <div className="w-full bg-orange-200 rounded-full h-2">
                      <div
                        className="bg-orange-500 h-2 rounded-full transition-all"
                        style={{ width: `${Math.min((subtotal / 100) * 100, 100)}%` }}
                      ></div>
                    </div>
                  </div>
                )}

                {/* Security Badge */}
                <div className="mt-6 pt-6 border-t">
                  <div className="flex items-center gap-2 text-sm text-gray-600">
                    <svg className="w-5 h-5 text-green-600" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M2.166 4.999A11.954 11.954 0 0010 1.944 11.954 11.954 0 0017.834 5c.11.65.166 1.32.166 2.001 0 5.225-3.34 9.67-8 11.317C5.34 16.67 2 12.225 2 7c0-.682.057-1.35.166-2.001zm11.541 3.708a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                    </svg>
                    <span>Secure Checkout</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
