import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  getOrders,
  getOrderById,
  createOrder,
  cancelOrder,
  CreateOrderInput,
} from "@/api/orders";

export const useOrders = (status?: string) => {
  return useQuery({
    queryKey: ["orders", status],
    queryFn: () => getOrders({ status: status || undefined }),
  });
};

export const useOrder = (id: string) => {
  return useQuery({
    queryKey: ["order", id],
    queryFn: () => getOrderById(id),
    enabled: !!id,
    refetchInterval: 10000, // Refetch every 10 seconds for status updates
  });
};

export const useCreateOrder = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: CreateOrderInput) => createOrder(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["orders"] });
    },
  });
};

export const useCancelOrder = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: cancelOrder,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["orders"] });
    },
  });
};
