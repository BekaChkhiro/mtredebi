'use client';

import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { ordersApi } from '@/lib/api';
import {
  Loader2,
  Phone,
  MapPin,
  Clock,
  ChevronDown,
  ChevronUp,
  CheckCircle,
} from 'lucide-react';

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
  PENDING: 'bg-yellow-100 text-yellow-800 border-yellow-200',
  ACCEPTED: 'bg-blue-100 text-blue-800 border-blue-200',
  PREPARING: 'bg-purple-100 text-purple-800 border-purple-200',
  READY: 'bg-green-100 text-green-800 border-green-200',
  DRIVER_ASSIGNED: 'bg-indigo-100 text-indigo-800 border-indigo-200',
  PICKED_UP: 'bg-cyan-100 text-cyan-800 border-cyan-200',
  DELIVERING: 'bg-orange-100 text-orange-800 border-orange-200',
  DELIVERED: 'bg-emerald-100 text-emerald-800 border-emerald-200',
  CANCELLED: 'bg-red-100 text-red-800 border-red-200',
};

const nextStatus: Record<string, string> = {
  PENDING: 'ACCEPTED',
  ACCEPTED: 'PREPARING',
  PREPARING: 'READY',
};

const statusButtonLabels: Record<string, string> = {
  PENDING: 'მიღება',
  ACCEPTED: 'მომზადების დაწყება',
  PREPARING: 'მზადაა',
};

type FilterStatus = 'all' | 'active' | 'completed';

export default function OrdersPage() {
  const queryClient = useQueryClient();
  const [filter, setFilter] = useState<FilterStatus>('active');
  const [expandedOrder, setExpandedOrder] = useState<string | null>(null);

  const { data, isLoading } = useQuery({
    queryKey: ['orders'],
    queryFn: () => ordersApi.getOrders({ limit: 100 }),
    refetchInterval: 10000, // Refetch every 10 seconds
  });

  const updateStatusMutation = useMutation({
    mutationFn: ({ id, status }: { id: string; status: string }) =>
      ordersApi.updateStatus(id, status),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['orders'] });
    },
  });

  const orders = data?.data?.data?.orders || [];

  const filteredOrders = orders.filter((order: any) => {
    if (filter === 'active') {
      return ['PENDING', 'ACCEPTED', 'PREPARING', 'READY', 'DRIVER_ASSIGNED', 'PICKED_UP', 'DELIVERING'].includes(order.status);
    }
    if (filter === 'completed') {
      return ['DELIVERED', 'CANCELLED'].includes(order.status);
    }
    return true;
  });

  const handleStatusUpdate = (orderId: string, status: string) => {
    updateStatusMutation.mutate({ id: orderId, status });
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="w-8 h-8 animate-spin text-primary-500" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900">შეკვეთები</h1>
        <div className="flex gap-2">
          {(['active', 'completed', 'all'] as FilterStatus[]).map((f) => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                filter === f
                  ? 'bg-primary-500 text-white'
                  : 'bg-white text-gray-600 hover:bg-gray-100'
              }`}
            >
              {f === 'active' ? 'აქტიური' : f === 'completed' ? 'დასრულებული' : 'ყველა'}
            </button>
          ))}
        </div>
      </div>

      {filteredOrders.length === 0 ? (
        <div className="bg-white rounded-xl p-8 text-center text-gray-500 shadow-sm">
          შეკვეთები არ არის
        </div>
      ) : (
        <div className="space-y-4">
          {filteredOrders.map((order: any) => {
            const isExpanded = expandedOrder === order.id;
            const canProgress = nextStatus[order.status];

            return (
              <div
                key={order.id}
                className={`bg-white rounded-xl shadow-sm border ${
                  statusColors[order.status]?.split(' ')[2] || 'border-gray-100'
                } overflow-hidden`}
              >
                {/* Order Header */}
                <div
                  className="p-4 cursor-pointer"
                  onClick={() => setExpandedOrder(isExpanded ? null : order.id)}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <span
                        className={`px-3 py-1 rounded-full text-xs font-medium ${
                          statusColors[order.status] || 'bg-gray-100 text-gray-800'
                        }`}
                      >
                        {statusLabels[order.status]}
                      </span>
                      <span className="font-bold text-gray-900">#{order.orderNumber}</span>
                    </div>
                    <div className="flex items-center gap-4">
                      <span className="text-lg font-bold text-gray-900">
                        {order.totalAmount?.toFixed(2)} ₾
                      </span>
                      {isExpanded ? (
                        <ChevronUp className="w-5 h-5 text-gray-400" />
                      ) : (
                        <ChevronDown className="w-5 h-5 text-gray-400" />
                      )}
                    </div>
                  </div>

                  <div className="flex items-center gap-4 mt-2 text-sm text-gray-500">
                    <span className="flex items-center gap-1">
                      <Clock className="w-4 h-4" />
                      {new Date(order.createdAt).toLocaleString('ka-GE', {
                        hour: '2-digit',
                        minute: '2-digit',
                        day: '2-digit',
                        month: '2-digit',
                      })}
                    </span>
                    <span>{order.items?.length || 0} პროდუქტი</span>
                  </div>
                </div>

                {/* Expanded Content */}
                {isExpanded && (
                  <div className="border-t border-gray-100">
                    {/* Customer Info */}
                    <div className="p-4 bg-gray-50">
                      <h4 className="text-sm font-medium text-gray-700 mb-2">კლიენტი</h4>
                      <div className="flex items-center gap-4 text-sm">
                        <span className="flex items-center gap-1">
                          <Phone className="w-4 h-4 text-gray-400" />
                          {order.customer?.phone}
                        </span>
                        {order.customer?.name && (
                          <span>{order.customer.name}</span>
                        )}
                      </div>
                      <div className="flex items-start gap-1 mt-2 text-sm text-gray-600">
                        <MapPin className="w-4 h-4 text-gray-400 mt-0.5 flex-shrink-0" />
                        <span>{order.deliveryAddress}</span>
                      </div>
                      {order.customerNotes && (
                        <p className="mt-2 text-sm text-gray-600 italic">
                          "{order.customerNotes}"
                        </p>
                      )}
                    </div>

                    {/* Order Items */}
                    <div className="p-4">
                      <h4 className="text-sm font-medium text-gray-700 mb-2">პროდუქტები</h4>
                      <div className="space-y-2">
                        {order.items?.map((item: any) => (
                          <div
                            key={item.id}
                            className="flex items-center justify-between text-sm"
                          >
                            <div>
                              <span className="font-medium">{item.quantity}x</span>{' '}
                              <span>{item.name}</span>
                              {item.notes && (
                                <p className="text-gray-500 text-xs ml-5">{item.notes}</p>
                              )}
                            </div>
                            <span className="text-gray-600">
                              {(item.price * item.quantity).toFixed(2)} ₾
                            </span>
                          </div>
                        ))}
                      </div>

                      <div className="border-t border-gray-100 mt-4 pt-4 space-y-1 text-sm">
                        <div className="flex justify-between">
                          <span className="text-gray-500">ჯამი</span>
                          <span>{order.subtotal?.toFixed(2)} ₾</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-500">მიტანა</span>
                          <span>{order.deliveryFee?.toFixed(2)} ₾</span>
                        </div>
                        <div className="flex justify-between font-bold text-base">
                          <span>სულ</span>
                          <span>{order.totalAmount?.toFixed(2)} ₾</span>
                        </div>
                      </div>
                    </div>

                    {/* Action Buttons */}
                    {canProgress && (
                      <div className="p-4 bg-gray-50 border-t border-gray-100">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleStatusUpdate(order.id, nextStatus[order.status]);
                          }}
                          disabled={updateStatusMutation.isPending}
                          className="w-full bg-primary-500 text-white py-3 rounded-xl font-medium flex items-center justify-center gap-2 hover:bg-primary-600 transition-colors disabled:opacity-50"
                        >
                          {updateStatusMutation.isPending ? (
                            <Loader2 className="w-5 h-5 animate-spin" />
                          ) : (
                            <>
                              <CheckCircle className="w-5 h-5" />
                              {statusButtonLabels[order.status]}
                            </>
                          )}
                        </button>
                      </div>
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
