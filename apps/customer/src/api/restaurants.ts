import apiClient from "./client";

export interface Restaurant {
  id: string;
  name: string;
  description: string | null;
  address: string;
  phone: string;
  lat: number;
  lng: number;
  imageUrl: string | null;
  coverImageUrl: string | null;
  minOrderAmount: number;
  deliveryFee: number;
  avgPrepTime: number;
  isActive: boolean;
}

export interface MenuItem {
  id: string;
  name: string;
  description: string | null;
  price: number;
  imageUrl: string | null;
  sortOrder: number;
  isAvailable: boolean;
}

export interface Category {
  id: string;
  name: string;
  sortOrder: number;
  isActive: boolean;
  menuItems: MenuItem[];
}

export interface RestaurantWithMenu extends Restaurant {
  categories: Category[];
}

export interface GetRestaurantsResponse {
  success: boolean;
  data: Restaurant[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

export interface GetRestaurantResponse {
  success: boolean;
  data: RestaurantWithMenu;
}

export const getRestaurants = async (params?: {
  page?: number;
  limit?: number;
  search?: string;
}): Promise<GetRestaurantsResponse> => {
  const response = await apiClient.get("/restaurants", { params });
  return response.data;
};

export const getRestaurantById = async (
  id: string
): Promise<GetRestaurantResponse> => {
  const response = await apiClient.get(`/restaurants/${id}`);
  return response.data;
};
