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
      const token = localStorage.getItem('token');
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
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
        localStorage.removeItem('token');
        localStorage.removeItem('user');
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

// Restaurant API
export const restaurantApi = {
  // Get own restaurant with menu (using public endpoint with restaurantId from store)
  getMyRestaurant: (restaurantId: string) => api.get(`/restaurants/${restaurantId}`),

  // Categories
  getCategories: () => api.get('/restaurant/categories'),
  createCategory: (data: { name: string; sortOrder?: number }) =>
    api.post('/restaurant/categories', data),
  updateCategory: (id: string, data: { name?: string; sortOrder?: number; isActive?: boolean }) =>
    api.put(`/restaurant/categories/${id}`, data),
  deleteCategory: (id: string) => api.delete(`/restaurant/categories/${id}`),

  // Menu items
  createMenuItem: (data: {
    categoryId: string;
    name: string;
    description?: string;
    price: number;
  }) => api.post('/restaurant/menu', data),
  updateMenuItem: (id: string, data: {
    name?: string;
    description?: string;
    price?: number;
    isAvailable?: boolean;
    sortOrder?: number;
  }) => api.put(`/restaurant/menu/${id}`, data),
  deleteMenuItem: (id: string) => api.delete(`/restaurant/menu/${id}`),

  // Image upload
  uploadImage: (file: File) => {
    const formData = new FormData();
    formData.append('image', file);
    return api.post('/restaurant/upload/image', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
  },
  uploadCover: (file: File) => {
    const formData = new FormData();
    formData.append('image', file);
    return api.post('/restaurant/upload/cover', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
  },
  uploadMenuItemImage: (id: string, file: File) => {
    const formData = new FormData();
    formData.append('image', file);
    return api.post(`/restaurant/menu/${id}/upload`, formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
  },
};

// Orders API
export const ordersApi = {
  getOrders: (params?: { page?: number; limit?: number; status?: string }) =>
    api.get('/restaurant/orders', { params }),
  updateStatus: (id: string, status: string) =>
    api.put(`/restaurant/orders/${id}/status`, { status }),
};

export default api;
