import { useEffect, useCallback } from "react";
import { Socket } from "socket.io-client";
import { useQueryClient } from "@tanstack/react-query";
import { getSocket } from "@/components/SocketProvider";
import { Order } from "@/api/driver";

interface OrderReadyEvent {
  order: Order;
}

interface OrderAssignedEvent {
  orderId: string;
  order: Order;
}

export function useSocket(): Socket | null {
  return getSocket();
}

export function useDriverSocket() {
  const socket = useSocket();
  const queryClient = useQueryClient();

  // Handle new ready orders
  const handleOrderReady = useCallback(
    (data: OrderReadyEvent) => {
      console.log("[Socket] Order ready:", data.order.id);
      queryClient.invalidateQueries({ queryKey: ["available-orders"] });
    },
    [queryClient]
  );

  // Handle order assignment
  const handleOrderAssigned = useCallback(
    (data: OrderAssignedEvent) => {
      console.log("[Socket] Order assigned:", data.orderId);
      queryClient.invalidateQueries({ queryKey: ["my-orders"] });
      queryClient.invalidateQueries({ queryKey: ["available-orders"] });
    },
    [queryClient]
  );

  // Handle order updates
  const handleOrderUpdated = useCallback(
    (data: { order: Order }) => {
      console.log("[Socket] Order updated:", data.order.id, data.order.status);
      queryClient.invalidateQueries({ queryKey: ["my-orders"] });
      queryClient.invalidateQueries({ queryKey: ["available-orders"] });
    },
    [queryClient]
  );

  useEffect(() => {
    if (!socket) return;

    socket.on("order:ready", handleOrderReady);
    socket.on("driver:assigned", handleOrderAssigned);
    socket.on("order:updated", handleOrderUpdated);

    return () => {
      socket.off("order:ready", handleOrderReady);
      socket.off("driver:assigned", handleOrderAssigned);
      socket.off("order:updated", handleOrderUpdated);
    };
  }, [socket, handleOrderReady, handleOrderAssigned, handleOrderUpdated]);

  // Send location update
  const sendLocationUpdate = useCallback(
    (lat: number, lng: number, orderId?: string) => {
      if (socket?.connected) {
        socket.emit("driver:location", { lat, lng, orderId });
      }
    },
    [socket]
  );

  return {
    socket,
    sendLocationUpdate,
  };
}
