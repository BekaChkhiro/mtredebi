import { useEffect, useRef } from "react";
import { io, Socket } from "socket.io-client";
import { useAuthStore } from "@/store/auth.store";
import { SOCKET_URL } from "@/constants/api";

let socket: Socket | null = null;

export function getSocket(): Socket | null {
  return socket;
}

export function SocketProvider({ children }: { children: React.ReactNode }) {
  const token = useAuthStore((state) => state.token);
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
  const socketRef = useRef<Socket | null>(null);

  useEffect(() => {
    if (!isAuthenticated || !token) {
      if (socketRef.current) {
        socketRef.current.disconnect();
        socketRef.current = null;
        socket = null;
        console.log("[Socket] Disconnected - not authenticated");
      }
      return;
    }

    // Create socket connection
    socketRef.current = io(SOCKET_URL, {
      auth: { token },
      transports: ["websocket"],
      reconnection: true,
      reconnectionAttempts: 5,
      reconnectionDelay: 1000,
    });

    socket = socketRef.current;

    socketRef.current.on("connect", () => {
      console.log("[Socket] Connected:", socketRef.current?.id);
    });

    socketRef.current.on("disconnect", (reason) => {
      console.log("[Socket] Disconnected:", reason);
    });

    socketRef.current.on("connect_error", (error) => {
      console.error("[Socket] Connection error:", error.message);
    });

    return () => {
      if (socketRef.current) {
        socketRef.current.disconnect();
        socketRef.current = null;
        socket = null;
      }
    };
  }, [isAuthenticated, token]);

  return <>{children}</>;
}
