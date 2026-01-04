'use client';

import { useQuery } from '@tanstack/react-query';
import { ordersApi } from '@/lib/api';
import { ShoppingBag, Clock, CheckCircle, XCircle, Loader2 } from 'lucide-react';
import Link from 'next/link';

const statusLabels: Record<string, string> = {
  PENDING: 'მოლოდინში',
  ACCEPTED: 'მიღებული',
  PREPARING: 'მზადდება',
  READY: 'მზადაა',
  DRIVER_ASSIGNED: 'კურიერი მინიჭებული',
  PICKED_UP: 'აღებული',
  DELIVERING: 'მიტანის პროცესი',
  DELIVERED: 'მიტანილი',
  CANCELLED: 'გაუქმებული',
};

const statusColors: Record<string, string> = {
  PENDING: 'bg-yellow-100 text-yellow-800',
  ACCEPTED: 'bg-blue-100 text-blue-800',
  PREPARING: 'bg-purple-100 text-purple-800',
  READY: 'bg-green-100 text-green-800',
  DRIVER_ASSIGNED: 'bg-indigo-100 text-indigo-800',
  PICKED_UP: 'bg-cyan-100 text-cyan-800',
  DELIVERING: 'bg-orange-100 text-orange-800',
  DELIVERED: 'bg-emerald-100 text-emerald-800',
  CANCELLED: 'bg-red-100 text-red-800',
};

export default function DashboardPage() {
  const { data, isLoading } = useQuery({
    queryKey: ['orders'],
    queryFn: () => ordersApi.getOrders({ limit: 50 }),
  });

  const orders = data?.data?.data?.orders || [];

  // Calculate stats
  const pendingOrders = orders.filter((o: any) => o.status === 'PENDING').length;
  const activeOrders = orders.filter((o: any) =>
    ['ACCEPTED', 'PREPARING', 'READY'].includes(o.status)
  ).length;
  const todayOrders = orders.filter((o: any) => {
    const orderDate = new Date(o.createdAt).toDateString();
    const today = new Date().toDateString();
    return orderDate === today;
  }).length;
  const todayRevenue = orders
    .filter((o: any) => {
      const orderDate = new Date(o.createdAt).toDateString();
      const today = new Date().toDateString();
      return orderDate === today && o.status === 'DELIVERED';
    })
    .reduce((sum: number, o: any) => sum + o.totalAmount, 0);

  const recentOrders = orders.slice(0, 5);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="w-8 h-8 animate-spin text-primary-500" />
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <h1 className="text-2xl font-bold text-gray-900">მთავარი</h1>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-yellow-100 rounded-xl">
              <Clock className="w-6 h-6 text-yellow-600" />
            </div>
            <div>
              <p className="text-sm text-gray-500">მოლოდინში</p>
              <p className="text-2xl font-bold text-gray-900">{pendingOrders}</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-blue-100 rounded-xl">
              <ShoppingBag className="w-6 h-6 text-blue-600" />
            </div>
            <div>
              <p className="text-sm text-gray-500">აქტიური</p>
              <p className="text-2xl font-bold text-gray-900">{activeOrders}</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-green-100 rounded-xl">
              <CheckCircle className="w-6 h-6 text-green-600" />
            </div>
            <div>
              <p className="text-sm text-gray-500">დღეს</p>
              <p className="text-2xl font-bold text-gray-900">{todayOrders}</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-primary-100 rounded-xl">
              <span className="text-primary-600 font-bold text-lg">₾</span>
            </div>
            <div>
              <p className="text-sm text-gray-500">დღის შემოსავალი</p>
              <p className="text-2xl font-bold text-gray-900">{todayRevenue.toFixed(2)} ₾</p>
            </div>
          </div>
        </div>
      </div>

      {/* Recent Orders */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100">
        <div className="p-6 border-b border-gray-100 flex items-center justify-between">
          <h2 className="text-lg font-semibold text-gray-900">ბოლო შეკვეთები</h2>
          <Link
            href="/dashboard/orders"
            className="text-primary-500 text-sm font-medium hover:text-primary-600"
          >
            ყველას ნახვა
          </Link>
        </div>

        {recentOrders.length === 0 ? (
          <div className="p-8 text-center text-gray-500">
            შეკვეთები არ არის
          </div>
        ) : (
          <div className="divide-y divide-gray-100">
            {recentOrders.map((order: any) => (
              <div key={order.id} className="p-4 hover:bg-gray-50">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium text-gray-900">#{order.orderNumber}</p>
                    <p className="text-sm text-gray-500">
                      {order.items?.length || 0} პროდუქტი • {order.totalAmount?.toFixed(2)} ₾
                    </p>
                  </div>
                  <div className="text-right">
                    <span
                      className={`inline-block px-3 py-1 rounded-full text-xs font-medium ${
                        statusColors[order.status] || 'bg-gray-100 text-gray-800'
                      }`}
                    >
                      {statusLabels[order.status] || order.status}
                    </span>
                    <p className="text-xs text-gray-400 mt-1">
                      {new Date(order.createdAt).toLocaleTimeString('ka-GE', {
                        hour: '2-digit',
                        minute: '2-digit',
                      })}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
