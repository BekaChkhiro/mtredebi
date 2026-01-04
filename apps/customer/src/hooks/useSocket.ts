import { useEffect, useRef, useCallback } from "react";
import { Socket } from "socket.io-client";
import { useQueryClient } from "@tanstack/react-query";
import { getSocket } from "@/components/SocketProvider";

interface DriverLocationEvent {
  driverId: string;
  lat: number;
  lng: number;
  orderId?: string;
}

export function useSocket(): Socket | null {
  return getSocket();
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
