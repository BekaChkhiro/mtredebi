import { create } from 'zustand';

interface User {
  id: string;
  phone: string;
  name: string | null;
  role: string;
}

interface AuthState {
  token: string | null;
  user: User | null;
  isAuthenticated: boolean;
  isInitialized: boolean;

  initialize: () => void;
  setAuth: (token: string, user: User) => void;
  logout: () => void;
}

const STORAGE_KEY = 'admin-auth';

function saveToStorage(data: { token: string; user: User }) {
  if (typeof window !== 'undefined') {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
  }
}

function loadFromStorage(): { token: string; user: User } | null {
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

function clearStorage() {
  if (typeof window !== 'undefined') {
    localStorage.removeItem(STORAGE_KEY);
  }
}

export const useAuthStore = create<AuthState>((set) => ({
  token: null,
  user: null,
  isAuthenticated: false,
  isInitialized: false,

  initialize: () => {
    const stored = loadFromStorage();
    if (stored && stored.user.role === 'ADMIN') {
      set({
        token: stored.token,
        user: stored.user,
        isAuthenticated: true,
        isInitialized: true,
      });
    } else {
      clearStorage();
      set({ isInitialized: true });
    }
  },

  setAuth: (token, user) => {
    if (user.role !== 'ADMIN') {
      throw new Error('მხოლოდ ადმინისტრატორებისთვის');
    }
    saveToStorage({ token, user });
    set({
      token,
      user,
      isAuthenticated: true,
    });
  },

  logout: () => {
    clearStorage();
    set({
      token: null,
      user: null,
      isAuthenticated: false,
    });
  },
}));
