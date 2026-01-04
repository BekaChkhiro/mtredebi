import { useEffect, useRef, createContext, useContext } from "react";
import { io, Socket } from "socket.io-client";
import { QueryClient } from "@tanstack/react-query";
import { useAuthStore } from "@/store/auth.store";
import { SOCKET_URL } from "@/constants/api";

let socketInstance: Socket | null = null;
let queryClientRef: QueryClient | null = null;

interface SocketContextValue {
  socket: Socket | null;
}

const SocketContext = createContext<SocketContextValue>({ socket: null });

export function useSocketContext() {
  return useContext(SocketContext);
}

interface SocketProviderProps {
  children: React.ReactNode;
  queryClient: QueryClient;
}

export function SocketProvider({ children, queryClient }: SocketProviderProps) {
  const { token, isAuthenticated } = useAuthStore();
  const isConnecting = useRef(false);

  useEffect(() => {
    queryClientRef = queryClient;
  }, [queryClient]);

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
    socketInstance.on("order:updated", (data: { orderId: string; status: string }) => {
      console.log("[Socket] Order updated:", data);
      if (queryClientRef) {
        queryClientRef.invalidateQueries({ queryKey: ["order", data.orderId] });
        queryClientRef.invalidateQueries({ queryKey: ["orders"] });
      }
    });

    // Listen for driver assignment
    socketInstance.on("driver:assigned", (data: { orderId: string }) => {
      console.log("[Socket] Driver assigned:", data);
      if (queryClientRef) {
        queryClientRef.invalidateQueries({ queryKey: ["order", data.orderId] });
      }
    });

    return () => {
      if (socketInstance) {
        socketInstance.disconnect();
        socketInstance = null;
        isConnecting.current = false;
      }
    };
  }, [isAuthenticated, token]);

  return (
    <SocketContext.Provider value={{ socket: socketInstance }}>
      {children}
    </SocketContext.Provider>
  );
}

export function getSocket(): Socket | null {
  return socketInstance;
}
