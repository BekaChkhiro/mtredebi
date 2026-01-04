'use client';

import { useEffect, useRef, useCallback } from 'react';
import { io, Socket } from 'socket.io-client';
import { useQueryClient } from '@tanstack/react-query';
import { useAuthStore } from '@/store/auth';

const SOCKET_URL = process.env.NEXT_PUBLIC_SOCKET_URL || 'http://localhost:3001';

let socketInstance: Socket | null = null;

interface OrderEvent {
  orderId: string;
  status: string;
  updatedAt: string;
}

export function useSocket() {
  const { token, isAuthenticated, restaurant } = useAuthStore();
  const queryClient = useQueryClient();
  const isConnecting = useRef(false);

  useEffect(() => {
    if (!isAuthenticated || !token || !restaurant || isConnecting.current) return;

    if (socketInstance?.connected) return;

    isConnecting.current = true;

    socketInstance = io(SOCKET_URL, {
      auth: { token },
      transports: ['websocket'],
      reconnection: true,
      reconnectionAttempts: 5,
      reconnectionDelay: 1000,
    });

    socketInstance.on('connect', () => {
      console.log('[Socket] Connected');
      isConnecting.current = false;
    });

    socketInstance.on('disconnect', (reason) => {
      console.log('[Socket] Disconnected:', reason);
    });

    socketInstance.on('connect_error', (error) => {
      console.log('[Socket] Connection error:', error.message);
      isConnecting.current = false;
    });

    // Listen for new orders
    socketInstance.on('order:new', (data: OrderEvent) => {
      console.log('[Socket] New order:', data);
      queryClient.invalidateQueries({ queryKey: ['orders'] });

      // Play notification sound
      playNotificationSound();
    });

    // Listen for order updates
    socketInstance.on('order:updated', (data: OrderEvent) => {
      console.log('[Socket] Order updated:', data);
      queryClient.invalidateQueries({ queryKey: ['orders'] });
    });

    return () => {
      if (socketInstance) {
        socketInstance.disconnect();
        socketInstance = null;
        isConnecting.current = false;
      }
    };
  }, [isAuthenticated, token, restaurant, queryClient]);

  return socketInstance;
}

function playNotificationSound() {
  try {
    const audio = new Audio('/notification.mp3');
    audio.volume = 0.5;
    audio.play().catch(() => {
      // Ignore autoplay errors
    });
  } catch {
    // Ignore audio errors
  }
}

export function getSocket(): Socket | null {
  return socketInstance;
}
