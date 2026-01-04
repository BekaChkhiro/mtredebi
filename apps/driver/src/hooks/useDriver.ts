import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  updateDriverStatus,
  updateDriverLocation,
  getAvailableOrders,
  getMyOrders,
  getOrderHistory,
  acceptOrder,
  pickUpOrder,
  startDelivering,
  deliverOrder,
  DriverStatus,
} from "@/api/driver";
import { useAuthStore } from "@/store/auth.store";

export const useUpdateDriverStatus = () => {
  const setDriverStatus = useAuthStore((state) => state.setDriverStatus);
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (status: DriverStatus) => updateDriverStatus(status),
    onSuccess: (response, variables) => {
      // Use the variables (requested status) since backend returns driver object
      setDriverStatus(variables);
      // Refetch available orders when going online
      if (variables === "ONLINE") {
        queryClient.invalidateQueries({ queryKey: ["available-orders"] });
      }
    },
  });
};

export const useUpdateDriverLocation = () => {
  return useMutation({
    mutationFn: ({ lat, lng }: { lat: number; lng: number }) =>
      updateDriverLocation(lat, lng),
  });
};

export const useAvailableOrders = (enabled: boolean = true) => {
  return useQuery({
    queryKey: ["available-orders"],
    queryFn: getAvailableOrders,
    enabled,
    refetchInterval: 30000, // Refetch every 30 seconds
  });
};

export const useMyOrders = () => {
  return useQuery({
    queryKey: ["my-orders"],
    queryFn: getMyOrders,
    refetchInterval: 10000, // Refetch every 10 seconds
  });
};

export const useOrderHistory = (page: number = 1, limit: number = 20) => {
  return useQuery({
    queryKey: ["order-history", page, limit],
    queryFn: () => getOrderHistory({ page, limit }),
  });
};

export const useAcceptOrder = () => {
  const queryClient = useQueryClient();
  const setDriverStatus = useAuthStore((state) => state.setDriverStatus);

  return useMutation({
    mutationFn: (orderId: string) => acceptOrder(orderId),
    onSuccess: () => {
      setDriverStatus("BUSY");
      queryClient.invalidateQueries({ queryKey: ["available-orders"] });
      queryClient.invalidateQueries({ queryKey: ["my-orders"] });
    },
  });
};

export const usePickUpOrder = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (orderId: string) => pickUpOrder(orderId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["my-orders"] });
    },
  });
};

export const useStartDelivering = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (orderId: string) => startDelivering(orderId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["my-orders"] });
    },
  });
};

export const useDeliverOrder = () => {
  const queryClient = useQueryClient();
  const setDriverStatus = useAuthStore((state) => state.setDriverStatus);

  return useMutation({
    mutationFn: (orderId: string) => deliverOrder(orderId),
    onSuccess: () => {
      setDriverStatus("ONLINE");
      queryClient.invalidateQueries({ queryKey: ["my-orders"] });
      queryClient.invalidateQueries({ queryKey: ["available-orders"] });
      queryClient.invalidateQueries({ queryKey: ["order-history"] });
    },
  });
};
