import { create } from 'zustand';
import { persist } from 'zustand/middleware';

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
  isLoading: boolean;

  setAuth: (token: string, user: User) => void;
  setRestaurant: (restaurant: Restaurant) => void;
  logout: () => void;
  setLoading: (loading: boolean) => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      token: null,
      user: null,
      restaurant: null,
      isAuthenticated: false,
      isLoading: true,

      setAuth: (token, user) =>
        set({
          token,
          user,
          isAuthenticated: true,
          isLoading: false,
        }),

      setRestaurant: (restaurant) =>
        set({ restaurant }),

      logout: () => {
        set({
          token: null,
          user: null,
          restaurant: null,
          isAuthenticated: false,
          isLoading: false,
        });
      },

      setLoading: (isLoading) => set({ isLoading }),
    }),
    {
      name: 'restaurant-auth',
      partialize: (state) => ({
        token: state.token,
        user: state.user,
        restaurant: state.restaurant,
        isAuthenticated: state.isAuthenticated,
      }),
    }
  )
);
