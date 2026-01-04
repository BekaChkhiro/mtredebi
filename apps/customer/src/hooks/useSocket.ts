import { useEffect, useRef, useCallback } from "react";
import { io, Socket } from "socket.io-client";
import { useQueryClient } from "@tanstack/react-query";
import { useAuthStore } from "@/store/auth.store";
import { SOCKET_URL } from "@/constants/api";

let socketInstance: Socket | null = null;

interface OrderUpdateEvent {
  orderId: string;
  status: string;
  updatedAt: string;
}

interface DriverLocationEvent {
  driverId: string;
  lat: number;
  lng: number;
  orderId?: string;
}

interface DriverAssignedEvent {
  orderId: string;
  driver: {
    id: string;
    name: string;
    phone: string;
  };
}

export function useSocket() {
  const { token, isAuthenticated } = useAuthStore();
  const queryClient = useQueryClient();
  const isConnecting = useRef(false);

  useEffect(() => {
    if (!isAuthenticated || !token || isConnecting.current) return;

    if (socketInstance?.connected) return;

    isConnecting.current = true;

    socketInstance = io(SOCKET_URL, {
      auth: { token },
      transports: ["websocket"],
      reconnection: true,
      reconnectionAttempts: 5,
      reconnectionDelay: 1000,
    });

    socketInstance.on("connect", () => {
      console.log("[Socket] Connected");
      isConnecting.current = false;
    });

    socketInstance.on("disconnect", (reason) => {
      console.log("[Socket] Disconnected:", reason);
    });

    socketInstance.on("connect_error", (error) => {
      console.log("[Socket] Connection error:", error.message);
      isConnecting.current = false;
    });

    // Listen for order updates
    socketInstance.on("order:updated", (data: OrderUpdateEvent) => {
      console.log("[Socket] Order updated:", data);
      // Invalidate specific order query
      queryClient.invalidateQueries({ queryKey: ["order", data.orderId] });
      // Invalidate orders list
      queryClient.invalidateQueries({ queryKey: ["orders"] });
    });

    // Listen for driver assignment
    socketInstance.on("driver:assigned", (data: DriverAssignedEvent) => {
      console.log("[Socket] Driver assigned:", data);
      queryClient.invalidateQueries({ queryKey: ["order", data.orderId] });
    });

    return () => {
      if (socketInstance) {
        socketInstance.disconnect();
        socketInstance = null;
        isConnecting.current = false;
      }
    };
  }, [isAuthenticated, token, queryClient]);

  return socketInstance;
}

export function useOrderSocket(orderId: string | undefined) {
  const socket = useSocket();
  const queryClient = useQueryClient();
  const driverLocationRef = useRef<DriverLocationEvent | null>(null);

  const joinOrderRoom = useCallback(() => {
    if (socket?.connected && orderId) {
      socket.emit("join:order", orderId);
      console.log("[Socket] Joined order room:", orderId);
    }
  }, [socket, orderId]);

  const leaveOrderRoom = useCallback(() => {
    if (socket?.connected && orderId) {
      socket.emit("leave:order", orderId);
      console.log("[Socket] Left order room:", orderId);
    }
  }, [socket, orderId]);

  useEffect(() => {
    if (!socket || !orderId) return;

    // Join order room when connected
    if (socket.connected) {
      joinOrderRoom();
    }

    socket.on("connect", joinOrderRoom);

    // Handle driver location updates
    const handleDriverLocation = (data: DriverLocationEvent) => {
      if (data.orderId === orderId) {
        driverLocationRef.current = data;
        // Trigger re-render by invalidating query
        queryClient.setQueryData(["driver-location", orderId], data);
      }
    };

    socket.on("driver:location", handleDriverLocation);

    return () => {
      leaveOrderRoom();
      socket.off("connect", joinOrderRoom);
      socket.off("driver:location", handleDriverLocation);
    };
  }, [socket, orderId, joinOrderRoom, leaveOrderRoom, queryClient]);

  return {
    socket,
    driverLocation: driverLocationRef.current,
  };
}

export function useDriverTracking(driverId: string | undefined) {
  const socket = useSocket();
  const queryClient = useQueryClient();

  useEffect(() => {
    if (!socket?.connected || !driverId) return;

    socket.emit("track:driver", driverId);
    console.log("[Socket] Started tracking driver:", driverId);

    const handleLocation = (data: DriverLocationEvent) => {
      if (data.driverId === driverId) {
        queryClient.setQueryData(["driver-location", driverId], data);
      }
    };

    socket.on("driver:location", handleLocation);

    return () => {
      socket.emit("untrack:driver", driverId);
      socket.off("driver:location", handleLocation);
      console.log("[Socket] Stopped tracking driver:", driverId);
    };
  }, [socket, driverId, queryClient]);

  return queryClient.getQueryData<DriverLocationEvent>(["driver-location", driverId]);
}

export function getSocket(): Socket | null {
  return socketInstance;
}
