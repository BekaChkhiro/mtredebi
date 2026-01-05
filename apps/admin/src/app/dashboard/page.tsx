'use client';

import { useQuery } from '@tanstack/react-query';
import {
  Users,
  Store,
  Truck,
  ShoppingBag,
  TrendingUp,
  Clock,
  CheckCircle,
  XCircle,
} from 'lucide-react';
import { adminApi } from '@/lib/api';

interface DashboardStats {
  totalUsers: number;
  totalRestaurants: number;
  totalDrivers: number;
  totalOrders: number;
  todayOrders: number;
  todayRevenue: number;
  activeDrivers: number;
  pendingOrders: number;
}

export default function DashboardPage() {
  const { data: dashboard, isLoading } = useQuery({
    queryKey: ['dashboard'],
    queryFn: async () => {
      const response = await adminApi.getDashboard();
      return response.data as DashboardStats;
    },
  });

  if (isLoading) {
    return (
      <div className="p-8">
        <div className="animate-pulse space-y-6">
          <div className="h-8 bg-gray-200 rounded w-48"></div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="h-32 bg-gray-200 rounded-xl"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  const stats = [
    {
      label: 'მომხმარებლები',
      value: dashboard?.totalUsers || 0,
      icon: Users,
      color: 'bg-blue-500',
      subtext: 'სულ რეგისტრირებული',
    },
    {
      label: 'რესტორნები',
      value: dashboard?.totalRestaurants || 0,
      icon: Store,
      color: 'bg-orange-500',
      subtext: 'სულ დარეგისტრირებული',
    },
    {
      label: 'მძღოლები',
      value: dashboard?.totalDrivers || 0,
      icon: Truck,
      color: 'bg-green-500',
      subtext: `${dashboard?.activeDrivers || 0} ონლაინ`,
    },
    {
      label: 'შეკვეთები',
      value: dashboard?.totalOrders || 0,
      icon: ShoppingBag,
      color: 'bg-purple-500',
      subtext: `${dashboard?.todayOrders || 0} დღეს`,
    },
  ];

  const orderStats = [
    {
      label: 'მოლოდინში',
      value: dashboard?.pendingOrders || 0,
      icon: Clock,
      color: 'text-yellow-600',
      bg: 'bg-yellow-50',
    },
    {
      label: 'დღეს შეკვეთები',
      value: dashboard?.todayOrders || 0,
      icon: CheckCircle,
      color: 'text-green-600',
      bg: 'bg-green-50',
    },
    {
      label: 'დღეს შემოსავალი',
      value: `${(dashboard?.todayRevenue || 0).toFixed(2)} ₾`,
      icon: TrendingUp,
      color: 'text-blue-600',
      bg: 'bg-blue-50',
    },
  ];

  return (
    <div className="p-8">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900">დაშბორდი</h1>
        <p className="text-gray-500 mt-1">პლატფორმის ზოგადი სტატისტიკა</p>
      </div>

      {/* Main Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {stats.map((stat) => (
          <div
            key={stat.label}
            className="bg-white rounded-xl shadow-sm p-6 border border-gray-100"
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500">{stat.label}</p>
                <p className="text-3xl font-bold text-gray-900 mt-1">
                  {stat.value.toLocaleString()}
                </p>
                <p className="text-sm text-gray-400 mt-1">{stat.subtext}</p>
              </div>
              <div className={`w-14 h-14 ${stat.color} rounded-xl flex items-center justify-center`}>
                <stat.icon className="w-7 h-7 text-white" />
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Revenue & Orders */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        {/* Revenue Card */}
        <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-lg font-semibold text-gray-900">შემოსავალი</h2>
            <TrendingUp className="w-5 h-5 text-green-500" />
          </div>
          <div className="space-y-4">
            <div>
              <p className="text-sm text-gray-500">დღევანდელი შემოსავალი</p>
              <p className="text-3xl font-bold text-gray-900">
                {(dashboard?.todayRevenue || 0).toFixed(2)} ₾
              </p>
            </div>
            <div className="pt-4 border-t border-gray-100">
              <p className="text-sm text-gray-500">დღეს შეკვეთები</p>
              <p className="text-2xl font-bold text-green-600">
                {dashboard?.todayOrders || 0}
              </p>
            </div>
          </div>
        </div>

        {/* Order Status Card */}
        <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
          <h2 className="text-lg font-semibold text-gray-900 mb-6">
            შეკვეთების სტატუსი
          </h2>
          <div className="space-y-4">
            {orderStats.map((stat) => (
              <div
                key={stat.label}
                className={`flex items-center justify-between p-4 rounded-lg ${stat.bg}`}
              >
                <div className="flex items-center gap-3">
                  <stat.icon className={`w-5 h-5 ${stat.color}`} />
                  <span className="text-gray-700">{stat.label}</span>
                </div>
                <span className={`text-xl font-bold ${stat.color}`}>
                  {stat.value}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Quick Links */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <a
          href="/dashboard/users"
          className="bg-white rounded-xl shadow-sm p-6 border border-gray-100 hover:border-primary-300 transition group"
        >
          <Users className="w-8 h-8 text-primary-600 mb-3" />
          <h3 className="font-semibold text-gray-900 group-hover:text-primary-600 transition">
            მომხმარებლების მართვა
          </h3>
          <p className="text-sm text-gray-500 mt-1">
            როლების მინიჭება, პროფილების რედაქტირება
          </p>
        </a>
        <a
          href="/dashboard/restaurants"
          className="bg-white rounded-xl shadow-sm p-6 border border-gray-100 hover:border-primary-300 transition group"
        >
          <Store className="w-8 h-8 text-orange-500 mb-3" />
          <h3 className="font-semibold text-gray-900 group-hover:text-orange-500 transition">
            რესტორნების მართვა
          </h3>
          <p className="text-sm text-gray-500 mt-1">
            ახალი რესტორნების დამატება, პარამეტრები
          </p>
        </a>
        <a
          href="/dashboard/orders"
          className="bg-white rounded-xl shadow-sm p-6 border border-gray-100 hover:border-primary-300 transition group"
        >
          <ShoppingBag className="w-8 h-8 text-purple-500 mb-3" />
          <h3 className="font-semibold text-gray-900 group-hover:text-purple-500 transition">
            შეკვეთების ნახვა
          </h3>
          <p className="text-sm text-gray-500 mt-1">
            ყველა შეკვეთის მონიტორინგი
          </p>
        </a>
      </div>
    </div>
  );
}
