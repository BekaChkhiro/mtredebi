import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import * as SecureStore from "expo-secure-store";
import { DriverStatus } from "@/api/driver";

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
  isLoading: boolean;
  driverStatus: DriverStatus;

  setAuth: (token: string, user: User) => void;
  updateUser: (user: Partial<User>) => void;
  setDriverStatus: (status: DriverStatus) => void;
  logout: () => void;
  setLoading: (loading: boolean) => void;
}

const secureStorage = {
  getItem: async (name: string): Promise<string | null> => {
    try {
      return await SecureStore.getItemAsync(name);
    } catch {
      return null;
    }
  },
  setItem: async (name: string, value: string): Promise<void> => {
    try {
      await SecureStore.setItemAsync(name, value);
    } catch {
      // Ignore storage errors
    }
  },
  removeItem: async (name: string): Promise<void> => {
    try {
      await SecureStore.deleteItemAsync(name);
    } catch {
      // Ignore storage errors
    }
  },
};

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      token: null,
      user: null,
      isAuthenticated: false,
      isLoading: true,
      driverStatus: "OFFLINE",

      setAuth: (token, user) =>
        set({
          token,
          user,
          isAuthenticated: true,
          isLoading: false,
        }),

      updateUser: (userData) =>
        set((state) => ({
          user: state.user ? { ...state.user, ...userData } : null,
        })),

      setDriverStatus: (driverStatus) => set({ driverStatus }),

      logout: () =>
        set({
          token: null,
          user: null,
          isAuthenticated: false,
          isLoading: false,
          driverStatus: "OFFLINE",
        }),

      setLoading: (isLoading) => set({ isLoading }),
    }),
    {
      name: "driver-auth-storage",
      storage: createJSONStorage(() => secureStorage),
      onRehydrateStorage: () => (state) => {
        state?.setLoading(false);
      },
    }
  )
);
