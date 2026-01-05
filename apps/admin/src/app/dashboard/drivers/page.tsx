'use client';

import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  Search,
  Plus,
  Edit,
  Truck,
  ChevronLeft,
  ChevronRight,
  X,
  Check,
  Circle,
  Phone,
} from 'lucide-react';
import { adminApi } from '@/lib/api';

interface Driver {
  id: string;
  phone: string;
  name: string | null;
  isActive: boolean;
  createdAt: string;
  driver?: {
    isOnline: boolean;
    currentLat: number | null;
    currentLng: number | null;
    _count?: {
      deliveries: number;
    };
  };
}

interface DriverForm {
  phone: string;
  name: string;
}

const initialForm: DriverForm = {
  phone: '',
  name: '',
};

export default function DriversPage() {
  const queryClient = useQueryClient();
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState('');
  const [onlineFilter, setOnlineFilter] = useState<'all' | 'online' | 'offline'>('all');
  const [showModal, setShowModal] = useState(false);
  const [editingDriver, setEditingDriver] = useState<Driver | null>(null);
  const [form, setForm] = useState<DriverForm>(initialForm);

  const { data, isLoading } = useQuery({
    queryKey: ['drivers', page, search, onlineFilter],
    queryFn: async () => {
      const params: { page: number; limit: number; search?: string; isOnline?: boolean } = {
        page,
        limit: 10,
        search: search || undefined,
      };
      if (onlineFilter === 'online') params.isOnline = true;
      if (onlineFilter === 'offline') params.isOnline = false;

      const response = await adminApi.getDrivers(params);
      return response.data;
    },
  });

  const createMutation = useMutation({
    mutationFn: (data: { phone: string; name?: string }) => adminApi.createDriver(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['drivers'] });
      setShowModal(false);
      setForm(initialForm);
    },
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: { name?: string; isActive?: boolean } }) =>
      adminApi.updateDriver(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['drivers'] });
      setShowModal(false);
      setEditingDriver(null);
      setForm(initialForm);
    },
  });

  const handleCreate = () => {
    setEditingDriver(null);
    setForm(initialForm);
    setShowModal(true);
  };

  const handleEdit = (driver: Driver) => {
    setEditingDriver(driver);
    setForm({
      phone: driver.phone,
      name: driver.name || '',
    });
    setShowModal(true);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (editingDriver) {
      updateMutation.mutate({
        id: editingDriver.id,
        data: { name: form.name || undefined },
      });
    } else {
      const driverData: { phone: string; name?: string } = {
        phone: form.phone.startsWith('+995') ? form.phone : `+995${form.phone.replace(/\s/g, '')}`,
      };
      if (form.name) driverData.name = form.name;
      createMutation.mutate(driverData);
    }
  };

  const handleToggleActive = (driver: Driver) => {
    updateMutation.mutate({
      id: driver.id,
      data: { isActive: !driver.isActive },
    });
  };

  const drivers: Driver[] = data?.drivers || [];
  const pagination = data?.pagination || { total: 0, pages: 1 };

  return (
    <div className="p-8">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">მძღოლები</h1>
          <p className="text-gray-500 mt-1">მძღოლების მართვა</p>
        </div>
        <button
          onClick={handleCreate}
          className="flex items-center gap-2 px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition"
        >
          <Plus className="w-5 h-5" />
          ახალი მძღოლი
        </button>
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
              placeholder="ძებნა ტელეფონით ან სახელით..."
              className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
            />
          </div>
          <div className="flex gap-2">
            {(['all', 'online', 'offline'] as const).map((filter) => (
              <button
                key={filter}
                onClick={() => {
                  setOnlineFilter(filter);
                  setPage(1);
                }}
                className={`px-4 py-2 rounded-lg transition ${
                  onlineFilter === filter
                    ? 'bg-primary-600 text-white'
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}
              >
                {filter === 'all' ? 'ყველა' : filter === 'online' ? 'ონლაინ' : 'ოფლაინ'}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Table */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        {isLoading ? (
          <div className="p-8 text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600 mx-auto"></div>
          </div>
        ) : drivers.length === 0 ? (
          <div className="p-8 text-center text-gray-500">
            <Truck className="w-12 h-12 text-gray-300 mx-auto mb-4" />
            <p>მძღოლები ვერ მოიძებნა</p>
          </div>
        ) : (
          <table className="w-full">
            <thead className="bg-gray-50 border-b border-gray-100">
              <tr>
                <th className="text-left px-6 py-4 text-sm font-medium text-gray-500">
                  მძღოლი
                </th>
                <th className="text-left px-6 py-4 text-sm font-medium text-gray-500">
                  სტატუსი
                </th>
                <th className="text-left px-6 py-4 text-sm font-medium text-gray-500">
                  ონლაინ
                </th>
                <th className="text-left px-6 py-4 text-sm font-medium text-gray-500">
                  მიტანები
                </th>
                <th className="text-left px-6 py-4 text-sm font-medium text-gray-500">
                  რეგისტრაცია
                </th>
                <th className="text-right px-6 py-4 text-sm font-medium text-gray-500">
                  მოქმედება
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {drivers.map((driver) => (
                <tr key={driver.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center">
                        <Truck className="w-5 h-5 text-green-600" />
                      </div>
                      <div>
                        <p className="font-medium text-gray-900">
                          {driver.name || 'უსახელო'}
                        </p>
                        <p className="text-sm text-gray-500">{driver.phone}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <button
                      onClick={() => handleToggleActive(driver)}
                      disabled={updateMutation.isPending}
                      className={`inline-flex px-3 py-1 rounded-full text-sm font-medium ${
                        driver.isActive
                          ? 'bg-green-100 text-green-700 hover:bg-green-200'
                          : 'bg-red-100 text-red-700 hover:bg-red-200'
                      } transition`}
                    >
                      {driver.isActive ? 'აქტიური' : 'დაბლოკილი'}
                    </button>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-2">
                      <Circle
                        className={`w-3 h-3 ${
                          driver.driver?.isOnline
                            ? 'fill-green-500 text-green-500'
                            : 'fill-gray-300 text-gray-300'
                        }`}
                      />
                      <span className="text-gray-600">
                        {driver.driver?.isOnline ? 'ონლაინ' : 'ოფლაინ'}
                      </span>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-gray-600">
                    {driver.driver?._count?.deliveries || 0}
                  </td>
                  <td className="px-6 py-4 text-gray-500 text-sm">
                    {new Date(driver.createdAt).toLocaleDateString('ka-GE')}
                  </td>
                  <td className="px-6 py-4 text-right">
                    <button
                      onClick={() => handleEdit(driver)}
                      className="p-2 text-gray-400 hover:text-primary-600 hover:bg-primary-50 rounded-lg transition"
                    >
                      <Edit className="w-5 h-5" />
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
              სულ {pagination.total} მძღოლი
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

      {/* Create/Edit Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl w-full max-w-md p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">
              {editingDriver ? 'მძღოლის რედაქტირება' : 'ახალი მძღოლი'}
            </h2>

            <form onSubmit={handleSubmit} className="space-y-4">
              {!editingDriver && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    ტელეფონი *
                  </label>
                  <div className="relative">
                    <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                    <input
                      type="tel"
                      value={form.phone}
                      onChange={(e) => setForm({ ...form, phone: e.target.value })}
                      required
                      placeholder="+995 555 123 456"
                      className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                    />
                  </div>
                </div>
              )}

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  სახელი
                </label>
                <input
                  type="text"
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                  placeholder="სახელი გვარი"
                  className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                />
              </div>

              <div className="flex justify-end gap-3 pt-4">
                <button
                  type="button"
                  onClick={() => {
                    setShowModal(false);
                    setEditingDriver(null);
                    setForm(initialForm);
                  }}
                  className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-lg transition"
                >
                  <X className="w-5 h-5" />
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
    </div>
  );
}
