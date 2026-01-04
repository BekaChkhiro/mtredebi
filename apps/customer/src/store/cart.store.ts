import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import AsyncStorage from "@react-native-async-storage/async-storage";

interface CartItem {
  menuItemId: string;
  name: string;
  price: number;
  quantity: number;
  notes?: string;
}

interface Restaurant {
  id: string;
  name: string;
  deliveryFee: number;
  minOrderAmount: number;
}

interface CartState {
  restaurantId: string | null;
  restaurantName: string | null;
  deliveryFee: number;
  minOrderAmount: number;
  items: CartItem[];

  // Actions
  addItem: (item: CartItem, restaurant: Restaurant) => void;
  updateQuantity: (menuItemId: string, quantity: number) => void;
  updateNotes: (menuItemId: string, notes: string) => void;
  removeItem: (menuItemId: string) => void;
  clearCart: () => void;
}

// Simple in-memory storage as fallback
const memoryStorage: Record<string, string> = {};

const storage = {
  getItem: async (name: string): Promise<string | null> => {
    try {
      if (typeof AsyncStorage !== "undefined") {
        return await AsyncStorage.getItem(name);
      }
    } catch {
      // Fall back to memory
    }
    return memoryStorage[name] || null;
  },
  setItem: async (name: string, value: string): Promise<void> => {
    try {
      if (typeof AsyncStorage !== "undefined") {
        await AsyncStorage.setItem(name, value);
        return;
      }
    } catch {
      // Fall back to memory
    }
    memoryStorage[name] = value;
  },
  removeItem: async (name: string): Promise<void> => {
    try {
      if (typeof AsyncStorage !== "undefined") {
        await AsyncStorage.removeItem(name);
        return;
      }
    } catch {
      // Fall back to memory
    }
    delete memoryStorage[name];
  },
};

export const useCartStore = create<CartState>()(
  persist(
    (set, get) => ({
      restaurantId: null,
      restaurantName: null,
      deliveryFee: 0,
      minOrderAmount: 0,
      items: [],

      addItem: (item, restaurant) =>
        set((state) => {
          // If cart has items from different restaurant, clear first
          if (state.restaurantId && state.restaurantId !== restaurant.id) {
            return {
              restaurantId: restaurant.id,
              restaurantName: restaurant.name,
              deliveryFee: restaurant.deliveryFee ?? 0,
              minOrderAmount: restaurant.minOrderAmount ?? 0,
              items: [item],
            };
          }

          // Check if item already exists
          const existingIndex = state.items.findIndex(
            (i) => i.menuItemId === item.menuItemId
          );

          if (existingIndex >= 0) {
            const newItems = [...state.items];
            newItems[existingIndex] = {
              ...newItems[existingIndex],
              quantity: newItems[existingIndex].quantity + item.quantity,
            };
            return { items: newItems };
          }

          return {
            restaurantId: restaurant.id,
            restaurantName: restaurant.name,
            deliveryFee: restaurant.deliveryFee ?? 0,
            minOrderAmount: restaurant.minOrderAmount ?? 0,
            items: [...state.items, item],
          };
        }),

      updateQuantity: (menuItemId, quantity) =>
        set((state) => {
          if (quantity <= 0) {
            return {
              items: state.items.filter((i) => i.menuItemId !== menuItemId),
            };
          }

          return {
            items: state.items.map((item) =>
              item.menuItemId === menuItemId ? { ...item, quantity } : item
            ),
          };
        }),

      updateNotes: (menuItemId, notes) =>
        set((state) => ({
          items: state.items.map((item) =>
            item.menuItemId === menuItemId ? { ...item, notes } : item
          ),
        })),

      removeItem: (menuItemId) =>
        set((state) => ({
          items: state.items.filter((i) => i.menuItemId !== menuItemId),
        })),

      clearCart: () =>
        set({
          restaurantId: null,
          restaurantName: null,
          deliveryFee: 0,
          minOrderAmount: 0,
          items: [],
        }),
    }),
    {
      name: "cart-storage",
      storage: createJSONStorage(() => storage),
    }
  )
);

// Selectors - use these to compute values
export const useCartItemCount = () =>
  useCartStore((state) => state.items.reduce((sum, item) => sum + item.quantity, 0));

export const useCartSubtotal = () =>
  useCartStore((state) => state.items.reduce((sum, item) => sum + item.price * item.quantity, 0));

export const useCartTotal = () =>
  useCartStore((state) =>
    state.items.reduce((sum, item) => sum + item.price * item.quantity, 0) + state.deliveryFee
  );

export const useIsMinOrderMet = () =>
  useCartStore((state) =>
    state.items.reduce((sum, item) => sum + item.price * item.quantity, 0) >= state.minOrderAmount
  );
