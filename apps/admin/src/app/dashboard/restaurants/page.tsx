'use client';

import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  Search,
  Plus,
  Edit,
  Trash2,
  Store,
  MapPin,
  Phone,
  ChevronLeft,
  ChevronRight,
  X,
  Check,
} from 'lucide-react';
import { adminApi } from '@/lib/api';

interface Restaurant {
  id: string;
  name: string;
  description: string | null;
  address: string;
  phone: string;
  imageUrl: string | null;
  isActive: boolean;
  minOrderAmount: number;
  deliveryFee: number;
  avgPrepTime: number;
  createdAt: string;
  adminUser?: {
    id: string;
    name: string | null;
    phone: string;
  };
  _count?: {
    orders: number;
    menuItems: number;
  };
}

interface RestaurantForm {
  name: string;
  description: string;
  address: string;
  phone: string;
  minOrderAmount: number;
  deliveryFee: number;
  avgPrepTime: number;
  isActive: boolean;
  adminUserId: string;
}

const initialForm: RestaurantForm = {
  name: '',
  description: '',
  address: '',
  phone: '',
  minOrderAmount: 10,
  deliveryFee: 3,
  avgPrepTime: 30,
  isActive: true,
  adminUserId: '',
};

export default function RestaurantsPage() {
  const queryClient = useQueryClient();
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [editingRestaurant, setEditingRestaurant] = useState<Restaurant | null>(null);
  const [form, setForm] = useState<RestaurantForm>(initialForm);
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);

  const { data, isLoading } = useQuery({
    queryKey: ['restaurants', page, search],
    queryFn: async () => {
      const response = await adminApi.getRestaurants({
        page,
        limit: 10,
        search: search || undefined,
      });
      return response.data;
    },
  });

  const { data: restaurantAdmins } = useQuery({
    queryKey: ['restaurant-admins'],
    queryFn: async () => {
      const response = await adminApi.getUsers({ role: 'RESTAURANT_ADMIN', limit: 100 });
      return response.data.users;
    },
  });

  const createMutation = useMutation({
    mutationFn: (data: {
      name: string;
      description?: string;
      address: string;
      phone: string;
      minOrderAmount?: number;
      deliveryFee?: number;
      avgPrepTime?: number;
      adminUserId?: string;
    }) => adminApi.createRestaurant(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['restaurants'] });
      setShowModal(false);
      setForm(initialForm);
    },
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<RestaurantForm> }) =>
      adminApi.updateRestaurant(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['restaurants'] });
      setShowModal(false);
      setEditingRestaurant(null);
      setForm(initialForm);
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => adminApi.deleteRestaurant(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['restaurants'] });
      setDeleteConfirm(null);
    },
  });

  const handleCreate = () => {
    setEditingRestaurant(null);
    setForm(initialForm);
    setShowModal(true);
  };

  const handleEdit = (restaurant: Restaurant) => {
    setEditingRestaurant(restaurant);
    setForm({
      name: restaurant.name,
      description: restaurant.description || '',
      address: restaurant.address,
      phone: restaurant.phone,
      minOrderAmount: restaurant.minOrderAmount,
      deliveryFee: restaurant.deliveryFee,
      avgPrepTime: restaurant.avgPrepTime,
      isActive: restaurant.isActive,
      adminUserId: restaurant.adminUser?.id || '',
    });
    setShowModal(true);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (editingRestaurant) {
      updateMutation.mutate({
        id: editingRestaurant.id,
        data: {
          name: form.name,
          description: form.description || undefined,
          address: form.address,
          phone: form.phone,
          minOrderAmount: form.minOrderAmount,
          deliveryFee: form.deliveryFee,
          avgPrepTime: form.avgPrepTime,
          isActive: form.isActive,
          adminUserId: form.adminUserId || undefined,
        },
      });
    } else {
      createMutation.mutate({
        name: form.name,
        description: form.description || undefined,
        address: form.address,
        phone: form.phone,
        minOrderAmount: form.minOrderAmount,
        deliveryFee: form.deliveryFee,
        avgPrepTime: form.avgPrepTime,
        adminUserId: form.adminUserId || undefined,
      });
    }
  };

  const restaurants: Restaurant[] = data?.restaurants || [];
  const pagination = data?.pagination || { total: 0, pages: 1 };

  return (
    <div className="p-8">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">რესტორნები</h1>
          <p className="text-gray-500 mt-1">რესტორნების მართვა</p>
        </div>
        <button
          onClick={handleCreate}
          className="flex items-center gap-2 px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition"
        >
          <Plus className="w-5 h-5" />
          ახალი რესტორანი
        </button>
      </div>

      {/* Search */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4 mb-6">
        <div className="relative max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
          <input
            type="text"
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setPage(1);
            }}
            placeholder="ძებნა სახელით ან მისამართით..."
            className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
          />
        </div>
      </div>

      {/* Restaurants Grid */}
      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[...Array(6)].map((_, i) => (
            <div key={i} className="bg-gray-200 rounded-xl h-64 animate-pulse"></div>
          ))}
        </div>
      ) : restaurants.length === 0 ? (
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-12 text-center">
          <Store className="w-12 h-12 text-gray-300 mx-auto mb-4" />
          <p className="text-gray-500">რესტორნები ვერ მოიძებნა</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {restaurants.map((restaurant) => (
            <div
              key={restaurant.id}
              className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden"
            >
              {/* Image */}
              <div className="h-40 bg-gray-100 relative">
                {restaurant.imageUrl ? (
                  <img
                    src={restaurant.imageUrl}
                    alt={restaurant.name}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center">
                    <Store className="w-12 h-12 text-gray-300" />
                  </div>
                )}
                <span
                  className={`absolute top-3 right-3 px-2 py-1 rounded-full text-xs font-medium ${
                    restaurant.isActive
                      ? 'bg-green-100 text-green-700'
                      : 'bg-red-100 text-red-700'
                  }`}
                >
                  {restaurant.isActive ? 'აქტიური' : 'გამორთული'}
                </span>
              </div>

              {/* Content */}
              <div className="p-4">
                <h3 className="font-semibold text-gray-900 text-lg mb-2">
                  {restaurant.name}
                </h3>
                <div className="space-y-1 text-sm text-gray-500 mb-4">
                  <div className="flex items-center gap-2">
                    <MapPin className="w-4 h-4" />
                    <span className="truncate">{restaurant.address}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Phone className="w-4 h-4" />
                    <span>{restaurant.phone}</span>
                  </div>
                </div>

                {/* Stats */}
                <div className="flex items-center gap-4 text-sm text-gray-500 mb-4">
                  <span>{restaurant._count?.menuItems || 0} პროდუქტი</span>
                  <span>{restaurant._count?.orders || 0} შეკვეთა</span>
                </div>

                {/* Actions */}
                <div className="flex items-center gap-2 pt-4 border-t border-gray-100">
                  <button
                    onClick={() => handleEdit(restaurant)}
                    className="flex-1 flex items-center justify-center gap-2 px-4 py-2 text-primary-600 hover:bg-primary-50 rounded-lg transition"
                  >
                    <Edit className="w-4 h-4" />
                    რედაქტირება
                  </button>
                  <button
                    onClick={() => setDeleteConfirm(restaurant.id)}
                    className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Pagination */}
      {pagination.pages > 1 && (
        <div className="flex items-center justify-center gap-4 mt-8">
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
      )}

      {/* Create/Edit Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl w-full max-w-lg max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-gray-100">
              <h2 className="text-lg font-semibold text-gray-900">
                {editingRestaurant ? 'რესტორნის რედაქტირება' : 'ახალი რესტორანი'}
              </h2>
            </div>

            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  სახელი *
                </label>
                <input
                  type="text"
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                  required
                  className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  აღწერა
                </label>
                <textarea
                  value={form.description}
                  onChange={(e) => setForm({ ...form, description: e.target.value })}
                  rows={3}
                  className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  მისამართი *
                </label>
                <input
                  type="text"
                  value={form.address}
                  onChange={(e) => setForm({ ...form, address: e.target.value })}
                  required
                  className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  ტელეფონი *
                </label>
                <input
                  type="tel"
                  value={form.phone}
                  onChange={(e) => setForm({ ...form, phone: e.target.value })}
                  required
                  className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                />
              </div>

              <div className="grid grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    მინ. შეკვეთა
                  </label>
                  <input
                    type="number"
                    value={form.minOrderAmount}
                    onChange={(e) =>
                      setForm({ ...form, minOrderAmount: Number(e.target.value) })
                    }
                    min={0}
                    className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    მიტანა
                  </label>
                  <input
                    type="number"
                    value={form.deliveryFee}
                    onChange={(e) =>
                      setForm({ ...form, deliveryFee: Number(e.target.value) })
                    }
                    min={0}
                    className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    დრო (წთ)
                  </label>
                  <input
                    type="number"
                    value={form.avgPrepTime}
                    onChange={(e) =>
                      setForm({ ...form, avgPrepTime: Number(e.target.value) })
                    }
                    min={0}
                    className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  ადმინისტრატორი
                </label>
                <select
                  value={form.adminUserId}
                  onChange={(e) => setForm({ ...form, adminUserId: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                >
                  <option value="">აირჩიეთ...</option>
                  {restaurantAdmins?.map((user: { id: string; name: string | null; phone: string }) => (
                    <option key={user.id} value={user.id}>
                      {user.name || user.phone}
                    </option>
                  ))}
                </select>
              </div>

              {editingRestaurant && (
                <div className="flex items-center gap-3">
                  <input
                    type="checkbox"
                    id="isActive"
                    checked={form.isActive}
                    onChange={(e) => setForm({ ...form, isActive: e.target.checked })}
                    className="w-4 h-4 text-primary-600 rounded focus:ring-primary-500"
                  />
                  <label htmlFor="isActive" className="text-sm text-gray-700">
                    აქტიური რესტორანი
                  </label>
                </div>
              )}

              <div className="flex justify-end gap-3 pt-4">
                <button
                  type="button"
                  onClick={() => {
                    setShowModal(false);
                    setEditingRestaurant(null);
                    setForm(initialForm);
                  }}
                  className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-lg transition"
                >
                  გაუქმება
                </button>
                <button
                  type="submit"
                  disabled={createMutation.isPending || updateMutation.isPending}
                  className="px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition disabled:opacity-50 flex items-center gap-2"
                >
                  <Check className="w-5 h-5" />
                  {createMutation.isPending || updateMutation.isPending
                    ? 'ინახება...'
                    : 'შენახვა'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {deleteConfirm && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl w-full max-w-sm p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-2">
              წაშლის დადასტურება
            </h2>
            <p className="text-gray-500 mb-6">
              ნამდვილად გინდათ ამ რესტორნის წაშლა?
            </p>
            <div className="flex justify-end gap-3">
              <button
                onClick={() => setDeleteConfirm(null)}
                className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-lg transition"
              >
                გაუქმება
              </button>
              <button
                onClick={() => deleteMutation.mutate(deleteConfirm)}
                disabled={deleteMutation.isPending}
                className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition disabled:opacity-50"
              >
                {deleteMutation.isPending ? 'იშლება...' : 'წაშლა'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
