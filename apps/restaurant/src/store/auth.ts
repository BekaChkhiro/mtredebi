import { create } from 'zustand';

interface User {
  id: string;
  phone: string;
  name: string | null;
  role: string;
  restaurantId?: string;
}

interface Restaurant {
  id: string;
  name: string;
  description: string | null;
  address: string;
  phone: string;
  imageUrl: string | null;
  coverImageUrl: string | null;
  isActive: boolean;
  minOrderAmount: number;
  deliveryFee: number;
  avgPrepTime: number;
}

interface AuthState {
  token: string | null;
  user: User | null;
  restaurant: Restaurant | null;
  isAuthenticated: boolean;
  isInitialized: boolean;

  initialize: () => void;
  setAuth: (token: string, user: User, restaurant: Restaurant) => void;
  logout: () => void;
}

const STORAGE_KEY = 'restaurant-auth';

// Helper to save to localStorage
function saveToStorage(data: { token: string; user: User; restaurant: Restaurant }) {
  if (typeof window !== 'undefined') {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
  }
}

// Helper to load from localStorage
function loadFromStorage(): { token: string; user: User; restaurant: Restaurant } | null {
  if (typeof window === 'undefined') return null;
  try {
    const data = localStorage.getItem(STORAGE_KEY);
    if (data) {
      return JSON.parse(data);
    }
  } catch (e) {
    console.error('Failed to load auth from storage:', e);
  }
  return null;
}

// Helper to clear localStorage
function clearStorage() {
  if (typeof window !== 'undefined') {
    localStorage.removeItem(STORAGE_KEY);
  }
}

export const useAuthStore = create<AuthState>((set) => ({
  token: null,
  user: null,
  restaurant: null,
  isAuthenticated: false,
  isInitialized: false,

  initialize: () => {
    const stored = loadFromStorage();
    if (stored) {
      set({
        token: stored.token,
        user: stored.user,
        restaurant: stored.restaurant,
        isAuthenticated: true,
        isInitialized: true,
      });
    } else {
      set({ isInitialized: true });
    }
  },

  setAuth: (token, user, restaurant) => {
    saveToStorage({ token, user, restaurant });
    set({
      token,
      user,
      restaurant,
      isAuthenticated: true,
    });
  },

  logout: () => {
    clearStorage();
    set({
      token: null,
      user: null,
      restaurant: null,
      isAuthenticated: false,
    });
  },
}));
