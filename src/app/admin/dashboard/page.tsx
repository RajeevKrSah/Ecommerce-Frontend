'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useToast } from '@/components/ui/Toast';
import { adminService, AdminDashboardStats } from '@/services/admin.service';

export default function AdminDashboardPage() {
  const router = useRouter();
  const { addToast } = useToast();
  const [stats, setStats] = useState<AdminDashboardStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [adminInfo, setAdminInfo] = useState<any>(null);
  const [timeFilter, setTimeFilter] = useState<'today' | 'week' | 'month' | 'year'>('month');

  useEffect(() => {
    const admin = localStorage.getItem('admin_data');
    
    if (!admin) {
      router.push('/admin/login');
      return;
    }
    
    if (admin) {
      setAdminInfo(JSON.parse(admin));
    }
    
    fetchDashboardStats();
  }, []);

  const fetchDashboardStats = async () => {
    try {
      const data = await adminService.getDashboardStats();
      setStats(data);
    } catch (error: any) {
      console.error('Failed to fetch dashboard stats:', error);
      addToast({
        type: 'error',
        message: error?.message || 'Failed to load dashboard statistics',
      });
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="p-6 flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  const totalRevenue = stats?.stats.total_revenue || 0;
  const revenueGrowth = 5.27;
  const ordersGrowth = 25.08;

  return (
    <div className="p-6">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
        <p className="text-gray-600 mt-1">Welcome back, {adminInfo?.name || 'Admin'}!</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
        <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-xl p-6 border border-blue-200">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-sm font-medium text-blue-600 uppercase tracking-wide">Orders</p>
              <h3 className="text-3xl font-bold text-blue-900 mt-2">{stats?.stats.total_orders || 0}</h3>
              <p className="text-xs text-blue-600 mt-2">
                <span className="text-green-600">↑ {ordersGrowth}%</span> Since last month
              </p>
            </div>
            <div className="bg-blue-500 p-3 rounded-lg">
              <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
              </svg>
            </div>
          </div>
        </div>

        <div className="bg-gradient-to-br from-green-50 to-green-100 rounded-xl p-6 border border-green-200">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-sm font-medium text-green-600 uppercase tracking-wide">Revenue</p>
              <h3 className="text-3xl font-bold text-green-900 mt-2">${totalRevenue.toFixed(2)}</h3>
              <p className="text-xs text-green-600 mt-2">
                <span className="text-green-600">↑ {revenueGrowth}%</span> Since last month
              </p>
            </div>
            <div className="bg-green-500 p-3 rounded-lg">
              <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
          </div>
        </div>

        <div className="bg-gradient-to-br from-purple-50 to-purple-100 rounded-xl p-6 border border-purple-200">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-sm font-medium text-purple-600 uppercase tracking-wide">Products</p>
              <h3 className="text-3xl font-bold text-purple-900 mt-2">{stats?.stats.total_products || 0}</h3>
              <p className="text-xs text-purple-600 mt-2">
                <span className="text-orange-600">{stats?.stats.low_stock_products || 0}</span> Low stock
              </p>
            </div>
            <div className="bg-purple-500 p-3 rounded-lg">
              <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
              </svg>
            </div>
          </div>
        </div>

        <div className="bg-gradient-to-br from-orange-50 to-orange-100 rounded-xl p-6 border border-orange-200">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-sm font-medium text-orange-600 uppercase tracking-wide">Users</p>
              <h3 className="text-3xl font-bold text-orange-900 mt-2">{stats?.stats.total_users || 0}</h3>
              <p className="text-xs text-orange-600 mt-2">
                <span className="text-green-600">Active</span> customers
              </p>
            </div>
            <div className="bg-orange-500 p-3 rounded-lg">
              <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
              </svg>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-white rounded-xl shadow-sm border p-6">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h2 className="text-lg font-semibold text-gray-900">Sales Report</h2>
                <p className="text-sm text-gray-500 mt-1">Latest Orders</p>
              </div>
              <div className="flex gap-2">
                <button
                  onClick={() => setTimeFilter('today')}
                  className={`px-3 py-1 text-xs font-medium rounded-lg ${
                    timeFilter === 'today'
                      ? 'bg-blue-100 text-blue-700'
                      : 'text-gray-600 hover:bg-gray-100'
                  }`}
                >
                  Today
                </button>
                <button
                  onClick={() => setTimeFilter('week')}
                  className={`px-3 py-1 text-xs font-medium rounded-lg ${
                    timeFilter === 'week'
                      ? 'bg-blue-100 text-blue-700'
                      : 'text-gray-600 hover:bg-gray-100'
                  }`}
                >
                  Weekly
                </button>
                <button
                  onClick={() => setTimeFilter('month')}
                  className={`px-3 py-1 text-xs font-medium rounded-lg ${
                    timeFilter === 'month'
                      ? 'bg-blue-100 text-blue-700'
                      : 'text-gray-600 hover:bg-gray-100'
                  }`}
                >
                  Monthly
                </button>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4 mb-6">
              <div className="bg-blue-50 rounded-lg p-4">
                <div className="flex items-center gap-2 mb-2">
                  <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                  <span className="text-xs text-gray-600">Revenue</span>
                </div>
                <p className="text-2xl font-bold text-gray-900">${totalRevenue.toFixed(2)}</p>
                <p className="text-xs text-green-600 mt-1">↑ {revenueGrowth}% growth</p>
              </div>
              <div className="bg-purple-50 rounded-lg p-4">
                <div className="flex items-center gap-2 mb-2">
                  <div className="w-2 h-2 bg-purple-500 rounded-full"></div>
                  <span className="text-xs text-gray-600">Orders</span>
                </div>
                <p className="text-2xl font-bold text-gray-900">{stats?.stats.total_orders || 0}</p>
                <p className="text-xs text-green-600 mt-1">↑ {ordersGrowth}% growth</p>
              </div>
            </div>

            <div className="h-64 bg-gradient-to-br from-blue-50 to-purple-50 rounded-lg flex items-center justify-center border border-blue-100">
              <div className="text-center">
                <svg className="w-16 h-16 text-blue-300 mx-auto mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                </svg>
                <p className="text-sm text-gray-500">Sales Chart</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm border p-6">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-lg font-semibold text-gray-900">Top Selling Products</h2>
            </div>

            <div className="space-y-3">
              {stats?.top_products && stats.top_products.length > 0 ? (
                stats.top_products.slice(0, 5).map((product: any, index: number) => (
                  <div
                    key={product.id}
                    className="flex items-center justify-between p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
                  >
                    <div className="flex items-center gap-4 flex-1">
                      <div className="w-12 h-12 bg-gradient-to-br from-blue-400 to-purple-500 rounded-lg flex items-center justify-center">
                        <span className="text-white font-bold">{index + 1}</span>
                      </div>
                      <div className="flex-1">
                        <p className="text-sm font-semibold text-gray-900">{product.name}</p>
                        <p className="text-xs text-gray-500">Sold: {product.total_sold} units</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-bold text-gray-900">${product.revenue}</p>
                      <span className="inline-block px-2 py-1 text-xs font-medium bg-green-100 text-green-700 rounded-full">
                        In Stock
                      </span>
                    </div>
                  </div>
                ))
              ) : (
                <p className="text-sm text-gray-500 text-center py-8">No sales data available</p>
              )}
            </div>
          </div>
        </div>

        <div className="space-y-6">
          <div className="bg-white rounded-xl shadow-sm border p-6">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-lg font-semibold text-gray-900">Store Performance</h2>
            </div>

            <div className="flex items-center justify-center mb-6">
              <div className="relative w-40 h-40">
                <svg className="w-full h-full transform -rotate-90">
                  <circle
                    cx="80"
                    cy="80"
                    r="70"
                    fill="none"
                    stroke="#e5e7eb"
                    strokeWidth="20"
                  />
                  <circle
                    cx="80"
                    cy="80"
                    r="70"
                    fill="none"
                    stroke="#3b82f6"
                    strokeWidth="20"
                    strokeDasharray={`${(stats?.stats.total_orders || 0) * 2} 440`}
                    strokeLinecap="round"
                  />
                </svg>
                <div className="absolute inset-0 flex flex-col items-center justify-center">
                  <p className="text-3xl font-bold text-gray-900">{stats?.stats.total_orders || 0}</p>
                  <p className="text-xs text-gray-500">Total Orders</p>
                </div>
              </div>
            </div>

            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">Pending</span>
                <span className="text-sm font-semibold text-gray-900">{stats?.stats.pending_orders || 0}</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div
                  className="bg-yellow-500 h-2 rounded-full"
                  style={{ width: `${((stats?.stats.pending_orders || 0) / (stats?.stats.total_orders || 1)) * 100}%` }}
                ></div>
              </div>

              <div className="flex items-center justify-between mt-4">
                <span className="text-sm text-gray-600">Processing</span>
                <span className="text-sm font-semibold text-gray-900">{stats?.stats.processing_orders || 0}</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div
                  className="bg-blue-500 h-2 rounded-full"
                  style={{ width: `${((stats?.stats.processing_orders || 0) / (stats?.stats.total_orders || 1)) * 100}%` }}
                ></div>
              </div>

              <div className="flex items-center justify-between mt-4">
                <span className="text-sm text-gray-600">Delivered</span>
                <span className="text-sm font-semibold text-gray-900">{stats?.stats.delivered_orders || 0}</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div
                  className="bg-green-500 h-2 rounded-full"
                  style={{ width: `${((stats?.stats.delivered_orders || 0) / (stats?.stats.total_orders || 1)) * 100}%` }}
                ></div>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm border p-6">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-lg font-semibold text-gray-900">Recent Orders</h2>
              <Link href="/admin/orders" className="text-xs text-blue-600 hover:text-blue-700">
                View All →
              </Link>
            </div>

            <div className="space-y-3">
              {stats?.recent_orders && stats.recent_orders.length > 0 ? (
                stats.recent_orders.slice(0, 5).map((order: any) => (
                  <div
                    key={order.id}
                    className="flex items-center justify-between p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
                  >
                    <div className="flex-1">
                      <p className="text-sm font-medium text-gray-900">#{order.id}</p>
                      <p className="text-xs text-gray-500">{order.user?.name || 'Guest'}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-semibold text-gray-900">${order.total}</p>
                      <span
                        className={`text-xs px-2 py-1 rounded-full ${
                          order.status === 'delivered'
                            ? 'bg-green-100 text-green-700'
                            : order.status === 'cancelled'
                            ? 'bg-red-100 text-red-700'
                            : 'bg-yellow-100 text-yellow-700'
                        }`}
                      >
                        {order.status}
                      </span>
                    </div>
                  </div>
                ))
              ) : (
                <p className="text-sm text-gray-500 text-center py-4">No recent orders</p>
              )}
            </div>
          </div>

          <div className="bg-gradient-to-br from-blue-500 to-purple-600 rounded-xl shadow-lg p-6 text-white">
            <h3 className="text-lg font-semibold mb-4">Quick Actions</h3>
            <div className="space-y-2">
              <Link
                href="/admin/products"
                className="block w-full text-left px-4 py-3 bg-white bg-opacity-20 hover:bg-opacity-30 rounded-lg transition-all"
              >
                <span className="text-sm font-medium">Manage Products</span>
              </Link>
              <Link
                href="/admin/orders"
                className="block w-full text-left px-4 py-3 bg-white bg-opacity-20 hover:bg-opacity-30 rounded-lg transition-all"
              >
                <span className="text-sm font-medium">View Orders</span>
              </Link>
              <Link
                href="/admin/users"
                className="block w-full text-left px-4 py-3 bg-white bg-opacity-20 hover:bg-opacity-30 rounded-lg transition-all"
              >
                <span className="text-sm font-medium">Manage Users</span>
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
