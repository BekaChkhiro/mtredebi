import axios from "axios";
import { useAuthStore } from "@/store/auth.store";
import { API_BASE_URL } from "@/constants/api";

export const apiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    "Content-Type": "application/json",
  },
  timeout: 10000,
});

// Request interceptor - add auth token
apiClient.interceptors.request.use(
  (config) => {
    const token = useAuthStore.getState().token;
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor - handle errors
apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    // Handle 401 Unauthorized
    if (error.response?.status === 401) {
      useAuthStore.getState().logout();
    }

    // Extract error message
    const message =
      error.response?.data?.error?.message ||
      error.message ||
      "შეცდომა მოხდა";

    return Promise.reject({
      ...error,
      message,
    });
  }
);

export default apiClient;
