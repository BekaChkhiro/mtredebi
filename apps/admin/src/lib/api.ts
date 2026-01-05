import axios from 'axios';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api/v1';

export const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 10000,
});

// Request interceptor - add auth token
api.interceptors.request.use(
  (config) => {
    if (typeof window !== 'undefined') {
      try {
        const authData = localStorage.getItem('admin-auth');
        if (authData) {
          const parsed = JSON.parse(authData);
          if (parsed.token) {
            config.headers.Authorization = `Bearer ${parsed.token}`;
          }
        }
      } catch (e) {
        console.error('Failed to get auth token:', e);
      }
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor - handle errors
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      if (typeof window !== 'undefined') {
        localStorage.removeItem('admin-auth');
        window.location.href = '/login';
      }
    }

    const message = error.response?.data?.error?.message || error.message || 'შეცდომა მოხდა';
    return Promise.reject({ ...error, message });
  }
);

// Auth API
export const authApi = {
  sendOtp: (phone: string) => api.post('/auth/send-otp', { phone }),
  verifyOtp: (phone: string, code: string) => api.post('/auth/verify-otp', { phone, code }),
  getMe: () => api.get('/auth/me'),
};

// Admin API
export const adminApi = {
  // Dashboard
  getDashboard: () => api.get('/admin/dashboard'),

  // Users
  getUsers: (params?: { page?: number; limit?: number; role?: string; search?: string }) =>
    api.get('/admin/users', { params }),
  getUser: (id: string) => api.get(`/admin/users/${id}`),
  updateUser: (id: string, data: { name?: string; role?: string; isActive?: boolean }) =>
    api.put(`/admin/users/${id}`, data),

  // Restaurants
  getRestaurants: (params?: { page?: number; limit?: number; search?: string; isActive?: boolean }) =>
    api.get('/admin/restaurants', { params }),
  createRestaurant: (data: {
    name: string;
    description?: string;
    address: string;
    phone: string;
    minOrderAmount?: number;
    deliveryFee?: number;
    avgPrepTime?: number;
    adminUserId?: string;
  }) => api.post('/admin/restaurants', data),
  updateRestaurant: (id: string, data: {
    name?: string;
    description?: string;
    address?: string;
    phone?: string;
    isActive?: boolean;
    minOrderAmount?: number;
    deliveryFee?: number;
    avgPrepTime?: number;
    adminUserId?: string;
  }) => api.put(`/admin/restaurants/${id}`, data),
  deleteRestaurant: (id: string) => api.delete(`/admin/restaurants/${id}`),

  // Drivers
  getDrivers: (params?: { page?: number; limit?: number; isOnline?: boolean; search?: string }) =>
    api.get('/admin/drivers', { params }),
  createDriver: (data: { phone: string; name?: string }) =>
    api.post('/admin/drivers', data),
  updateDriver: (id: string, data: { name?: string; isActive?: boolean }) =>
    api.put(`/admin/drivers/${id}`, data),

  // Orders
  getOrders: (params?: { page?: number; limit?: number; status?: string; restaurantId?: string }) =>
    api.get('/admin/orders', { params }),

  // Analytics
  getRevenueAnalytics: (params?: { from?: string; to?: string }) =>
    api.get('/admin/analytics/revenue', { params }),
  getOrdersAnalytics: (params?: { from?: string; to?: string }) =>
    api.get('/admin/analytics/orders', { params }),
  getTopRestaurants: (params?: { from?: string; to?: string; limit?: number }) =>
    api.get('/admin/analytics/top-restaurants', { params }),
};

export default api;
