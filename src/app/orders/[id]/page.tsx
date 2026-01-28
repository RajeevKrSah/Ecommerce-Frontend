'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '@/hooks/useAuth';
import { orderService } from '@/services/order.service';
import { paymentService, PaymentTransaction } from '@/services/payment.service';
import { Order } from '@/types/order';
import Button from '@/components/ui/Button';
import { Card, CardContent } from '@/components/ui/Card';
import Badge from '@/components/ui/Badge';
import { useToast } from '@/components/ui/Toast';

export default function OrderDetailsPage() {
  const params = useParams();
  const router = useRouter();
  const { user, isAuthenticated, isLoading: authLoading } = useAuth();
  const { addToast } = useToast();
  const orderId = params.id as string;
  
  const [order, setOrder] = useState<Order | null>(null);
  const [transactions, setTransactions] = useState<PaymentTransaction[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showRefundModal, setShowRefundModal] = useState(false);
  const [refundType, setRefundType] = useState<'full' | 'partial'>('full');
  const [refundAmount, setRefundAmount] = useState('');
  const [refundReason, setRefundReason] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);

  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      router.push('/login');
    }
  }, [isAuthenticated, authLoading, router]);

  const fetchOrder = async () => {
    try {
      const data = await orderService.getOrder(Number(orderId));
      setOrder(data);
    } catch (error: any) {
      addToast({
        type: 'error',
        message: error.response?.data?.message || 'Failed to load order',
      });
    }
  };

  const fetchTransactions = async () => {
    try {
      const data = await paymentService.getTransactions(Number(orderId));
      setTransactions(data);
    } catch (error) {
      console.error('Failed to load transactions:', error);
    }
  };

  useEffect(() => {
    const loadData = async () => {
      setIsLoading(true);
      await Promise.all([fetchOrder(), fetchTransactions()]);
      setIsLoading(false);
    };

    if (isAuthenticated) {
      loadData();
    }
  }, [isAuthenticated, orderId]);

  const handleRefund = async () => {
    if (!order) return;

    setIsProcessing(true);
    try {
      if (refundType === 'full') {
        await paymentService.refundOrder(order.id, { reason: refundReason });
        addToast({
          type: 'success',
          message: 'Full refund processed successfully',
        });
      } else {
        const amount = parseFloat(refundAmount);
        if (isNaN(amount) || amount <= 0) {
          addToast({
            type: 'error',
            message: 'Please enter a valid refund amount',
          });
          return;
        }
        await paymentService.partialRefund(order.id, { amount, reason: refundReason });
        addToast({
          type: 'success',
          message: 'Partial refund processed successfully',
        });
      }
      
      setShowRefundModal(false);
      setRefundAmount('');
      setRefundReason('');
      await Promise.all([fetchOrder(), fetchTransactions()]);
    } catch (error: any) {
      addToast({
        type: 'error',
        message: error.response?.data?.message || 'Refund failed',
      });
    } finally {
      setIsProcessing(false);
    }
  };

  if (authLoading || isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (!order) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Order Not Found</h2>
          <Link href="/orders">
            <Button>Back to Orders</Button>
          </Link>
        </div>
      </div>
    );
  }

  const isAdmin = user?.role === 'admin';
  const canRefund = isAdmin && order.payment_status === 'paid' && 
    (Number(order.refunded_amount) || 0) < Number(order.total);
  const remainingRefundable = Number(order.total) - (Number(order.refunded_amount) || 0);

  const getStatusColor = (status: string) => {
    const colors: Record<string, 'default' | 'success' | 'warning' | 'error'> = {
      pending: 'warning',
      processing: 'default',
      shipped: 'default',
      delivered: 'success',
      cancelled: 'error',
    };
    return colors[status] || 'default';
  };

  const getPaymentStatusColor = (status: string) => {
    const colors: Record<string, 'default' | 'success' | 'warning' | 'error'> = {
      pending: 'warning',
      paid: 'success',
      failed: 'error',
      expired: 'error',
      refunded: 'default',
      partially_refunded: 'warning',
    };
    return colors[status] || 'default';
  };

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Order #{order.order_number}</h1>
            <p className="text-gray-600 mt-1">
              Placed on {new Date(order.created_at).toLocaleDateString()}
            </p>
          </div>
          <div className="flex gap-3">
            <Button
              variant="outline"
              onClick={async () => {
                setIsLoading(true);
                await Promise.all([fetchOrder(), fetchTransactions()]);
                setIsLoading(false);
                addToast({ type: 'success', message: 'Order refreshed' });
              }}
              disabled={isLoading}
            >
              <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
              </svg>
              Refresh
            </Button>
            {canRefund && (
              <Button onClick={() => setShowRefundModal(true)} variant="outline">
                Process Refund
              </Button>
            )}
            <Link href={isAdmin ? '/admin/orders' : '/orders'}>
              <Button variant="outline">Back to Orders</Button>
            </Link>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Order Status */}
            <Card>
              <CardContent className="p-6">
                <h2 className="text-xl font-bold text-gray-900 mb-4">Order Status</h2>
                <div className="flex gap-4">
                  <div>
                    <p className="text-sm text-gray-600 mb-1">Order Status</p>
                    <Badge variant={getStatusColor(order.status)}>
                      {order.status.toUpperCase()}
                    </Badge>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600 mb-1">Payment Status</p>
                    <Badge variant={getPaymentStatusColor(order.payment_status || 'pending')}>
                      {(order.payment_status || 'pending').toUpperCase()}
                    </Badge>
                  </div>
                </div>

                {order.payment_status === 'pending' && order.payment_intent_id && (
                  <div className="mt-4">
                    <Link href={`/payment/${order.id}`}>
                      <Button className="w-full">Complete Payment</Button>
                    </Link>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Order Items */}
            <Card>
              <CardContent className="p-6">
                <h2 className="text-xl font-bold text-gray-900 mb-4">Order Items</h2>
                <div className="space-y-4">
                  {order.items.map((item) => (
                    <div key={item.id} className="flex gap-4 pb-4 border-b border-gray-200 last:border-0">
                      <div className="flex-1">
                        <h3 className="font-medium text-gray-900">{item.product_name}</h3>
                        <p className="text-sm text-gray-600">Quantity: {item.quantity}</p>
                        <p className="text-sm text-gray-600">Price: ${Number(item.price).toFixed(2)}</p>
                      </div>
                      <div className="text-right">
                        <p className="font-semibold text-gray-900">
                          ${Number(item.total).toFixed(2)}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Payment Transactions */}
            {transactions.length > 0 && (
              <Card>
                <CardContent className="p-6">
                  <h2 className="text-xl font-bold text-gray-900 mb-4">Payment History</h2>
                  <div className="space-y-3">
                    {transactions.map((transaction) => (
                      <div key={transaction.id} className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                        <div>
                          <p className="font-medium text-gray-900 capitalize">
                            {transaction.transaction_type}
                          </p>
                          <p className="text-sm text-gray-600">
                            {new Date(transaction.created_at).toLocaleString()}
                          </p>
                          {transaction.failure_reason && (
                            <p className="text-sm text-red-600 mt-1">{transaction.failure_reason}</p>
                          )}
                        </div>
                        <div className="text-right">
                          <p className={`font-semibold ${
                            transaction.transaction_type === 'refund' ? 'text-red-600' : 'text-green-600'
                          }`}>
                            {transaction.transaction_type === 'refund' ? '-' : '+'}
                            ${Number(transaction.amount).toFixed(2)}
                          </p>
                          <Badge variant={transaction.status === 'succeeded' ? 'success' : 'error'}>
                            {transaction.status}
                          </Badge>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Order Summary */}
            <Card>
              <CardContent className="p-6">
                <h2 className="text-xl font-bold text-gray-900 mb-4">Order Summary</h2>
                <div className="space-y-3">
                  <div className="flex justify-between text-gray-600">
                    <span>Subtotal</span>
                    <span>${Number(order.subtotal).toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between text-gray-600">
                    <span>Shipping</span>
                    <span>${Number(order.shipping).toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between text-gray-600">
                    <span>Tax</span>
                    <span>${Number(order.tax).toFixed(2)}</span>
                  </div>
                  {Number(order.refunded_amount) > 0 && (
                    <div className="flex justify-between text-red-600">
                      <span>Refunded</span>
                      <span>-${Number(order.refunded_amount).toFixed(2)}</span>
                    </div>
                  )}
                  <div className="border-t pt-3 flex justify-between text-lg font-bold text-gray-900">
                    <span>Total</span>
                    <span>${Number(order.total).toFixed(2)}</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Shipping Information */}
            <Card>
              <CardContent className="p-6">
                <h2 className="text-xl font-bold text-gray-900 mb-4">Shipping Information</h2>
                <div className="space-y-2 text-sm text-gray-600">
                  <p className="font-medium text-gray-900">{order.shipping_name}</p>
                  <p>{order.shipping_email}</p>
                  <p>{order.shipping_phone}</p>
                  <p className="pt-2">{order.shipping_address}</p>
                  <p>{order.shipping_city}, {order.shipping_state} {order.shipping_zip}</p>
                  <p>{order.shipping_country}</p>
                </div>
              </CardContent>
            </Card>

            {order.notes && (
              <Card>
                <CardContent className="p-6">
                  <h2 className="text-xl font-bold text-gray-900 mb-4">Order Notes</h2>
                  <p className="text-sm text-gray-600">{order.notes}</p>
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </div>

      {/* Refund Modal */}
      {showRefundModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg max-w-md w-full p-6">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">Process Refund</h2>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Refund Type
                </label>
                <div className="flex gap-4">
                  <label className="flex items-center">
                    <input
                      type="radio"
                      value="full"
                      checked={refundType === 'full'}
                      onChange={(e) => setRefundType(e.target.value as 'full' | 'partial')}
                      className="mr-2"
                    />
                    Full Refund (${remainingRefundable.toFixed(2)})
                  </label>
                  <label className="flex items-center">
                    <input
                      type="radio"
                      value="partial"
                      checked={refundType === 'partial'}
                      onChange={(e) => setRefundType(e.target.value as 'full' | 'partial')}
                      className="mr-2"
                    />
                    Partial Refund
                  </label>
                </div>
              </div>

              {refundType === 'partial' && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Refund Amount (Max: ${remainingRefundable.toFixed(2)})
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    min="0.01"
                    max={remainingRefundable}
                    value={refundAmount}
                    onChange={(e) => setRefundAmount(e.target.value)}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="0.00"
                  />
                </div>
              )}

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Reason (Optional)
                </label>
                <textarea
                  value={refundReason}
                  onChange={(e) => setRefundReason(e.target.value)}
                  rows={3}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Enter refund reason..."
                />
              </div>

              <div className="flex gap-3 pt-4">
                <Button
                  variant="outline"
                  onClick={() => setShowRefundModal(false)}
                  disabled={isProcessing}
                  className="flex-1"
                >
                  Cancel
                </Button>
                <Button
                  onClick={handleRefund}
                  disabled={isProcessing || (refundType === 'partial' && !refundAmount)}
                  className="flex-1"
                >
                  {isProcessing ? 'Processing...' : 'Process Refund'}
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
