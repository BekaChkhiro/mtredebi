'use client';

import { useQuery } from '@tanstack/react-query';
import {
  TrendingUp,
  BarChart3,
  PieChart,
  Store,
  ShoppingBag,
} from 'lucide-react';
import { adminApi } from '@/lib/api';

interface RevenueData {
  totalRevenue: number;
  totalDeliveryFees: number;
  orderCount: number;
  averageOrderValue: number;
}

interface OrdersByStatus {
  status: string;
  count: number;
}

interface OrdersByHour {
  hour: number;
  count: number;
}

interface TopRestaurant {
  id: string;
  name: string;
  imageUrl: string | null;
  ordersCount: number;
  revenue: number;
}

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

const STATUS_COLORS: Record<string, string> = {
  PENDING: '#EAB308',
  ACCEPTED: '#3B82F6',
  PREPARING: '#F97316',
  READY: '#22C55E',
  DRIVER_ASSIGNED: '#8B5CF6',
  PICKED_UP: '#6366F1',
  DELIVERING: '#06B6D4',
  DELIVERED: '#10B981',
  CANCELLED: '#EF4444',
};

export default function AnalyticsPage() {
  // Calculate date range
  const to = new Date();
  const from = new Date();
  from.setDate(from.getDate() - 30);
  const dateParams = {
    from: from.toISOString(),
    to: to.toISOString(),
  };

  const { data: revenueData, isLoading: loadingRevenue } = useQuery({
    queryKey: ['analytics-revenue'],
    queryFn: async () => {
      const response = await adminApi.getRevenueAnalytics(dateParams);
      return response.data as RevenueData;
    },
  });

  const { data: ordersData, isLoading: loadingOrders } = useQuery({
    queryKey: ['analytics-orders'],
    queryFn: async () => {
      const response = await adminApi.getOrdersAnalytics(dateParams);
      return response.data as {
        byStatus: OrdersByStatus[];
        byHour: OrdersByHour[];
      };
    },
  });

  const { data: topRestaurants, isLoading: loadingTop } = useQuery({
    queryKey: ['analytics-top-restaurants'],
    queryFn: async () => {
      const response = await adminApi.getTopRestaurants({ ...dateParams, limit: 5 });
      return response.data as TopRestaurant[];
    },
  });

  const totalRevenue = revenueData?.totalRevenue || 0;
  const totalOrders = revenueData?.orderCount || 0;
  const avgOrderValue = revenueData?.averageOrderValue || 0;

  const isLoading = loadingRevenue || loadingOrders || loadingTop;

  if (isLoading) {
    return (
      <div className="p-8">
        <div className="animate-pulse space-y-6">
          <div className="h-8 bg-gray-200 rounded w-48"></div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="h-32 bg-gray-200 rounded-xl"></div>
            ))}
          </div>
          <div className="h-80 bg-gray-200 rounded-xl"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-8">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900">ანალიტიკა</h1>
        <p className="text-gray-500 mt-1">ბოლო 30 დღის სტატისტიკა</p>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
          <div className="flex items-center justify-between mb-4">
            <span className="text-sm text-gray-500">სულ შემოსავალი</span>
            <TrendingUp className="w-5 h-5 text-green-600" />
          </div>
          <p className="text-3xl font-bold text-gray-900">
            {totalRevenue.toFixed(2)} ₾
          </p>
          <p className="text-sm text-gray-500 mt-1">ბოლო 30 დღე</p>
        </div>

        <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
          <div className="flex items-center justify-between mb-4">
            <span className="text-sm text-gray-500">სულ შეკვეთები</span>
            <ShoppingBag className="w-5 h-5 text-purple-600" />
          </div>
          <p className="text-3xl font-bold text-gray-900">{totalOrders}</p>
          <p className="text-sm text-gray-500 mt-1">ბოლო 30 დღე</p>
        </div>

        <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
          <div className="flex items-center justify-between mb-4">
            <span className="text-sm text-gray-500">საშუალო შეკვეთა</span>
            <BarChart3 className="w-5 h-5 text-blue-600" />
          </div>
          <p className="text-3xl font-bold text-gray-900">
            {totalOrders > 0 ? (totalRevenue / totalOrders).toFixed(2) : '0.00'} ₾
          </p>
          <p className="text-sm text-gray-500 mt-1">ბოლო 30 დღე</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        {/* Revenue Summary */}
        <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
          <h2 className="text-lg font-semibold text-gray-900 mb-6">
            შემოსავლის დეტალები
          </h2>
          <div className="space-y-4">
            <div className="flex items-center justify-between p-4 bg-green-50 rounded-lg">
              <span className="text-gray-600">სულ შემოსავალი</span>
              <span className="text-xl font-bold text-green-600">
                {totalRevenue.toFixed(2)} ₾
              </span>
            </div>
            <div className="flex items-center justify-between p-4 bg-blue-50 rounded-lg">
              <span className="text-gray-600">მიტანის საკომისიო</span>
              <span className="text-xl font-bold text-blue-600">
                {(revenueData?.totalDeliveryFees || 0).toFixed(2)} ₾
              </span>
            </div>
            <div className="flex items-center justify-between p-4 bg-purple-50 rounded-lg">
              <span className="text-gray-600">საშუალო შეკვეთა</span>
              <span className="text-xl font-bold text-purple-600">
                {avgOrderValue.toFixed(2)} ₾
              </span>
            </div>
            <div className="flex items-center justify-between p-4 bg-orange-50 rounded-lg">
              <span className="text-gray-600">შეკვეთების რაოდენობა</span>
              <span className="text-xl font-bold text-orange-600">
                {totalOrders}
              </span>
            </div>
          </div>
        </div>

        {/* Orders by Status */}
        <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
          <div className="flex items-center gap-2 mb-6">
            <PieChart className="w-5 h-5 text-gray-400" />
            <h2 className="text-lg font-semibold text-gray-900">
              შეკვეთები სტატუსის მიხედვით
            </h2>
          </div>
          <div className="space-y-3">
            {ordersData?.byStatus.map((item) => {
              const total = ordersData.byStatus.reduce((sum, s) => sum + s.count, 0);
              const percentage = total > 0 ? (item.count / total) * 100 : 0;
              return (
                <div key={item.status}>
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-sm text-gray-600">
                      {STATUS_LABELS[item.status] || item.status}
                    </span>
                    <span className="text-sm font-medium text-gray-900">
                      {item.count}
                    </span>
                  </div>
                  <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                    <div
                      className="h-full rounded-full transition-all"
                      style={{
                        width: `${percentage}%`,
                        backgroundColor: STATUS_COLORS[item.status] || '#6B7280',
                      }}
                    ></div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Orders by Hour */}
        <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
          <h2 className="text-lg font-semibold text-gray-900 mb-6">
            შეკვეთები საათების მიხედვით
          </h2>
          <div className="h-48 flex items-end gap-1">
            {ordersData?.byHour.map((hour) => {
              const maxCount = Math.max(...(ordersData?.byHour.map((h) => h.count) || [1]));
              const height = maxCount > 0 ? (hour.count / maxCount) * 100 : 0;
              return (
                <div
                  key={hour.hour}
                  className="flex-1 flex flex-col items-center gap-1"
                >
                  <div
                    className="w-full bg-green-500 rounded-t transition-all hover:bg-green-600"
                    style={{ height: `${Math.max(height, 2)}%` }}
                    title={`${hour.count} შეკვეთა`}
                  ></div>
                  {hour.hour % 3 === 0 && (
                    <span className="text-xs text-gray-400">{hour.hour}</span>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* Top Restaurants */}
        <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
          <h2 className="text-lg font-semibold text-gray-900 mb-6">
            ტოპ რესტორნები
          </h2>
          <div className="space-y-4">
            {topRestaurants?.map((restaurant, i) => (
              <div
                key={restaurant.id}
                className="flex items-center gap-4 p-3 bg-gray-50 rounded-lg"
              >
                <span className="text-lg font-bold text-gray-400 w-6">
                  {i + 1}
                </span>
                <div className="w-12 h-12 bg-gray-200 rounded-lg overflow-hidden flex-shrink-0">
                  {restaurant.imageUrl ? (
                    <img
                      src={restaurant.imageUrl}
                      alt={restaurant.name}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center">
                      <Store className="w-6 h-6 text-gray-400" />
                    </div>
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-gray-900 truncate">
                    {restaurant.name}
                  </p>
                  <p className="text-sm text-gray-500">
                    {restaurant.ordersCount} შეკვეთა
                  </p>
                </div>
                <div className="text-right">
                  <p className="font-semibold text-gray-900">
                    {restaurant.revenue.toFixed(2)} ₾
                  </p>
                </div>
              </div>
            ))}
            {(!topRestaurants || topRestaurants.length === 0) && (
              <p className="text-center text-gray-500 py-4">
                მონაცემები არ არის
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
