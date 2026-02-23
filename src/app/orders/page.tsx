'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '@/hooks/useAuth';
import { orderService } from '@/services/order.service';
import { Order } from '@/types/order';
import Button from '@/components/ui/Button';
import { Card, CardContent } from '@/components/ui/Card';
import Badge from '@/components/ui/Badge';

export default function OrdersPage() {
  const router = useRouter();
  const { isAuthenticated, isLoading: authLoading } = useAuth();
  const [orders, setOrders] = useState<Order[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [filter, setFilter] = useState<string>('all');

  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      router.push('/login');
    }
  }, [isAuthenticated, authLoading, router]);

  useEffect(() => {
    const fetchOrders = async () => {
      if (!isAuthenticated) return;
      try {
        const data = await orderService.getOrders();
        setOrders(data);
      } catch (error) {
        console.error('Failed to fetch orders:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchOrders();
  }, [isAuthenticated]);

  if (authLoading || isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

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

  const filteredOrders = filter === 'all'
    ? orders
    : orders.filter(order => order.status === filter);

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="container mx-auto px-4 md:px-12 lg:px-24">
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">My Orders</h1>
            <p className="text-gray-600 mt-1">View and track your order history</p>
          </div>
          <Link href="/products">
            <Button>Continue Shopping</Button>
          </Link>
        </div>

        {/* Filter Tabs */}
        <div className="mb-6 flex gap-2 overflow-x-auto pb-2">
          {['all', 'pending', 'processing', 'shipped', 'delivered', 'cancelled'].map((status) => (
            <button
              key={status}
              onClick={() => setFilter(status)}
              className={`px-4 py-2 rounded-lg font-medium whitespace-nowrap transition-colors ${filter === status
                ? 'bg-blue-600 text-white'
                : 'bg-white text-gray-700 hover:bg-gray-100'
                }`}
            >
              {status.charAt(0).toUpperCase() + status.slice(1)}
            </button>
          ))}
        </div>

        {filteredOrders.length === 0 ? (
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
              <h2 className="text-2xl font-bold text-gray-900 mb-2">No orders found</h2>
              <p className="text-gray-600 mb-6">
                {filter === 'all'
                  ? "You haven't placed any orders yet"
                  : `No ${filter} orders found`}
              </p>
              <Link href="/products">
                <Button>Start Shopping</Button>
              </Link>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-4">
            {filteredOrders.map((order) => (
              <Card key={order.id} className="hover:shadow-md transition-shadow">
                <CardContent className="p-6">
                  <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <h3 className="text-lg font-semibold text-gray-900">
                          Order #{order.order_number}
                        </h3>
                        <Badge variant={getStatusColor(order.status)}>
                          {order.status.toUpperCase()}
                        </Badge>
                      </div>
                      <div className="text-sm text-gray-600 space-y-1">
                        <p>
                          <span className="font-medium">Date:</span>{' '}
                          {new Date(order.created_at).toLocaleDateString('en-US', {
                            year: 'numeric',
                            month: 'long',
                            day: 'numeric',
                          })}
                        </p>
                        <p>
                          <span className="font-medium">Items:</span> {order.items.length}
                        </p>
                        <p>
                          <span className="font-medium">Total:</span> ${Number(order.total).toFixed(2)}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-3">
                      <Link href={`/orders/${order.id}`}>
                        <Button variant="outline">View Details</Button>
                      </Link>
                    </div>
                  </div>

                  {/* Order Items Preview */}
                  <div className="mt-4 pt-4 border-t border-gray-200">
                    <div className="flex gap-2 overflow-x-auto">
                      {order.items.slice(0, 3).map((item) => (
                        <div
                          key={item.id}
                          className="flex-shrink-0 text-sm text-gray-600"
                        >
                          {item.product_name} × {item.quantity}
                        </div>
                      ))}
                      {order.items.length > 3 && (
                        <div className="flex-shrink-0 text-sm text-gray-500">
                          +{order.items.length - 3} more
                        </div>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
