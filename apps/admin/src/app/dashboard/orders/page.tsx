'use client';

import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import {
  Search,
  Filter,
  ChevronLeft,
  ChevronRight,
  ShoppingBag,
  Clock,
  User,
  Store,
  Truck,
  MapPin,
  Eye,
  X,
} from 'lucide-react';
import { adminApi } from '@/lib/api';

interface OrderItem {
  id: string;
  name: string;
  quantity: number;
  price: number;
}

interface Order {
  id: string;
  orderNumber: string;
  status: string;
  totalAmount: number;
  deliveryFee: number;
  deliveryAddress: string;
  createdAt: string;
  customer: {
    id: string;
    name: string | null;
    phone: string;
  };
  restaurant: {
    id: string;
    name: string;
  };
  driver?: {
    user: {
      id: string;
      name: string | null;
      phone: string;
    };
  };
  items: OrderItem[];
}

const ORDER_STATUSES = [
  { value: '', label: 'ყველა სტატუსი' },
  { value: 'PENDING', label: 'მოლოდინში' },
  { value: 'ACCEPTED', label: 'მიღებული' },
  { value: 'PREPARING', label: 'მზადდება' },
  { value: 'READY', label: 'მზადაა' },
  { value: 'DRIVER_ASSIGNED', label: 'მძღოლი მინიჭებული' },
  { value: 'PICKED_UP', label: 'აიღო მძღოლმა' },
  { value: 'DELIVERING', label: 'მიტანის გზაზე' },
  { value: 'DELIVERED', label: 'მიტანილი' },
  { value: 'CANCELLED', label: 'გაუქმებული' },
];

const STATUS_COLORS: Record<string, string> = {
  PENDING: 'bg-yellow-100 text-yellow-700',
  ACCEPTED: 'bg-blue-100 text-blue-700',
  PREPARING: 'bg-orange-100 text-orange-700',
  READY: 'bg-green-100 text-green-700',
  DRIVER_ASSIGNED: 'bg-purple-100 text-purple-700',
  PICKED_UP: 'bg-indigo-100 text-indigo-700',
  DELIVERING: 'bg-cyan-100 text-cyan-700',
  DELIVERED: 'bg-green-100 text-green-700',
  CANCELLED: 'bg-red-100 text-red-700',
};

const STATUS_LABELS: Record<string, string> = {
  PENDING: 'მოლოდინში',
  ACCEPTED: 'მიღებული',
  PREPARING: 'მზადდება',
  READY: 'მზადაა',
  DRIVER_ASSIGNED: 'მძღოლი მინიჭებული',
  PICKED_UP: 'აიღო მძღოლმა',
  DELIVERING: 'მიტანის გზაზე',
  DELIVERED: 'მიტანილი',
  CANCELLED: 'გაუქმებული',
};

export default function OrdersPage() {
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);

  const { data, isLoading } = useQuery({
    queryKey: ['orders', page, search, statusFilter],
    queryFn: async () => {
      const response = await adminApi.getOrders({
        page,
        limit: 10,
        status: statusFilter || undefined,
      });
      return response.data;
    },
  });

  const orders: Order[] = data?.orders || [];
  const pagination = data?.pagination || { total: 0, pages: 1 };

  return (
    <div className="p-8">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900">შეკვეთები</h1>
        <p className="text-gray-500 mt-1">ყველა შეკვეთის მონიტორინგი</p>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4 mb-6">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="text"
              value={search}
              onChange={(e) => {
                setSearch(e.target.value);
                setPage(1);
              }}
              placeholder="ძებნა შეკვეთის ნომრით..."
              className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
            />
          </div>
          <div className="relative">
            <Filter className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
            <select
              value={statusFilter}
              onChange={(e) => {
                setStatusFilter(e.target.value);
                setPage(1);
              }}
              className="pl-10 pr-8 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 appearance-none bg-white"
            >
              {ORDER_STATUSES.map((status) => (
                <option key={status.value} value={status.value}>
                  {status.label}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Table */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        {isLoading ? (
          <div className="p-8 text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600 mx-auto"></div>
          </div>
        ) : orders.length === 0 ? (
          <div className="p-8 text-center text-gray-500">
            <ShoppingBag className="w-12 h-12 text-gray-300 mx-auto mb-4" />
            <p>შეკვეთები ვერ მოიძებნა</p>
          </div>
        ) : (
          <table className="w-full">
            <thead className="bg-gray-50 border-b border-gray-100">
              <tr>
                <th className="text-left px-6 py-4 text-sm font-medium text-gray-500">
                  შეკვეთა
                </th>
                <th className="text-left px-6 py-4 text-sm font-medium text-gray-500">
                  კლიენტი
                </th>
                <th className="text-left px-6 py-4 text-sm font-medium text-gray-500">
                  რესტორანი
                </th>
                <th className="text-left px-6 py-4 text-sm font-medium text-gray-500">
                  სტატუსი
                </th>
                <th className="text-left px-6 py-4 text-sm font-medium text-gray-500">
                  თანხა
                </th>
                <th className="text-left px-6 py-4 text-sm font-medium text-gray-500">
                  თარიღი
                </th>
                <th className="text-right px-6 py-4 text-sm font-medium text-gray-500">
                  მოქმედება
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {orders.map((order) => (
                <tr key={order.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center">
                        <ShoppingBag className="w-5 h-5 text-purple-600" />
                      </div>
                      <span className="font-medium text-gray-900">
                        #{order.orderNumber}
                      </span>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div>
                      <p className="text-gray-900">{order.customer?.name || 'უსახელო'}</p>
                      <p className="text-sm text-gray-500">{order.customer?.phone}</p>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <span className="text-gray-600">{order.restaurant.name}</span>
                  </td>
                  <td className="px-6 py-4">
                    <span
                      className={`inline-flex px-3 py-1 rounded-full text-sm font-medium ${
                        STATUS_COLORS[order.status] || 'bg-gray-100 text-gray-700'
                      }`}
                    >
                      {STATUS_LABELS[order.status] || order.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 font-medium text-gray-900">
                    {order.totalAmount.toFixed(2)} ₾
                  </td>
                  <td className="px-6 py-4 text-gray-500 text-sm">
                    {new Date(order.createdAt).toLocaleString('ka-GE', {
                      day: '2-digit',
                      month: '2-digit',
                      year: 'numeric',
                      hour: '2-digit',
                      minute: '2-digit',
                    })}
                  </td>
                  <td className="px-6 py-4 text-right">
                    <button
                      onClick={() => setSelectedOrder(order)}
                      className="p-2 text-gray-400 hover:text-primary-600 hover:bg-primary-50 rounded-lg transition"
                    >
                      <Eye className="w-5 h-5" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}

        {/* Pagination */}
        {pagination.pages > 1 && (
          <div className="flex items-center justify-between px-6 py-4 border-t border-gray-100">
            <p className="text-sm text-gray-500">
              სულ {pagination.total} შეკვეთა
            </p>
            <div className="flex items-center gap-2">
              <button
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                disabled={page === 1}
                className="p-2 text-gray-400 hover:text-gray-600 disabled:opacity-50"
              >
                <ChevronLeft className="w-5 h-5" />
              </button>
              <span className="text-sm text-gray-600">
                {page} / {pagination.pages}
              </span>
              <button
                onClick={() => setPage((p) => Math.min(pagination.pages, p + 1))}
                disabled={page === pagination.pages}
                className="p-2 text-gray-400 hover:text-gray-600 disabled:opacity-50"
              >
                <ChevronRight className="w-5 h-5" />
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Order Details Modal */}
      {selectedOrder && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl w-full max-w-lg max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-gray-100 flex items-center justify-between">
              <h2 className="text-lg font-semibold text-gray-900">
                შეკვეთა #{selectedOrder.orderNumber}
              </h2>
              <button
                onClick={() => setSelectedOrder(null)}
                className="p-2 text-gray-400 hover:text-gray-600 rounded-lg"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-6 space-y-6">
              {/* Status */}
              <div className="flex items-center justify-between">
                <span className="text-gray-500">სტატუსი</span>
                <span
                  className={`inline-flex px-3 py-1 rounded-full text-sm font-medium ${
                    STATUS_COLORS[selectedOrder.status] || 'bg-gray-100 text-gray-700'
                  }`}
                >
                  {STATUS_LABELS[selectedOrder.status] || selectedOrder.status}
                </span>
              </div>

              {/* Customer */}
              <div className="flex items-start gap-3">
                <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center flex-shrink-0">
                  <User className="w-5 h-5 text-blue-600" />
                </div>
                <div>
                  <p className="text-sm text-gray-500">კლიენტი</p>
                  <p className="font-medium text-gray-900">
                    {selectedOrder.customer?.name || 'უსახელო'}
                  </p>
                  <p className="text-sm text-gray-500">{selectedOrder.customer?.phone}</p>
                </div>
              </div>

              {/* Restaurant */}
              <div className="flex items-start gap-3">
                <div className="w-10 h-10 bg-orange-100 rounded-lg flex items-center justify-center flex-shrink-0">
                  <Store className="w-5 h-5 text-orange-600" />
                </div>
                <div>
                  <p className="text-sm text-gray-500">რესტორანი</p>
                  <p className="font-medium text-gray-900">
                    {selectedOrder.restaurant.name}
                  </p>
                </div>
              </div>

              {/* Driver */}
              {selectedOrder.driver && (
                <div className="flex items-start gap-3">
                  <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center flex-shrink-0">
                    <Truck className="w-5 h-5 text-green-600" />
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">მძღოლი</p>
                    <p className="font-medium text-gray-900">
                      {selectedOrder.driver.user.name || 'უსახელო'}
                    </p>
                    <p className="text-sm text-gray-500">
                      {selectedOrder.driver.user.phone}
                    </p>
                  </div>
                </div>
              )}

              {/* Address */}
              <div className="flex items-start gap-3">
                <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center flex-shrink-0">
                  <MapPin className="w-5 h-5 text-purple-600" />
                </div>
                <div>
                  <p className="text-sm text-gray-500">მისამართი</p>
                  <p className="font-medium text-gray-900">
                    {selectedOrder.deliveryAddress}
                  </p>
                </div>
              </div>

              {/* Items */}
              <div>
                <p className="text-sm text-gray-500 mb-3">პროდუქტები</p>
                <div className="space-y-2">
                  {selectedOrder.items.map((item) => (
                    <div
                      key={item.id}
                      className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
                    >
                      <div>
                        <span className="font-medium text-gray-900">
                          {item.name}
                        </span>
                        <span className="text-gray-500 ml-2">x{item.quantity}</span>
                      </div>
                      <span className="text-gray-900">
                        {(item.price * item.quantity).toFixed(2)} ₾
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Total */}
              <div className="pt-4 border-t border-gray-100">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-gray-500">მიტანა</span>
                  <span className="text-gray-900">
                    {selectedOrder.deliveryFee.toFixed(2)} ₾
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="font-medium text-gray-900">სულ</span>
                  <span className="text-xl font-bold text-gray-900">
                    {selectedOrder.totalAmount.toFixed(2)} ₾
                  </span>
                </div>
              </div>

              {/* Time */}
              <div className="flex items-center gap-2 text-sm text-gray-500">
                <Clock className="w-4 h-4" />
                <span>
                  {new Date(selectedOrder.createdAt).toLocaleString('ka-GE', {
                    day: '2-digit',
                    month: '2-digit',
                    year: 'numeric',
                    hour: '2-digit',
                    minute: '2-digit',
                  })}
                </span>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
