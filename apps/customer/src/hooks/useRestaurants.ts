import { useQuery } from "@tanstack/react-query";
import { getRestaurants, getRestaurantById } from "@/api/restaurants";

export const useRestaurants = (search?: string) => {
  return useQuery({
    queryKey: ["restaurants", search],
    queryFn: () => getRestaurants({ search: search || undefined }),
  });
};

export const useRestaurant = (id: string) => {
  return useQuery({
    queryKey: ["restaurant", id],
    queryFn: () => getRestaurantById(id),
    enabled: !!id,
  });
};
