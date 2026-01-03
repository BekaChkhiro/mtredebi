import { Server, Socket } from 'socket.io';

export const setupSocket = (io: Server) => {
  io.on('connection', (socket: Socket) => {
    console.log(`[Socket] Client connected: ${socket.id}`);

    // Join order room for tracking
    socket.on('join:order', (orderId: string) => {
      socket.join(`order:${orderId}`);
      console.log(`[Socket] ${socket.id} joined order:${orderId}`);
    });

    // Leave order room
    socket.on('leave:order', (orderId: string) => {
      socket.leave(`order:${orderId}`);
      console.log(`[Socket] ${socket.id} left order:${orderId}`);
    });

    // Driver location update
    socket.on('location:update', (data: { orderId: string; lat: number; lng: number }) => {
      io.to(`order:${data.orderId}`).emit('driver:location', {
        lat: data.lat,
        lng: data.lng,
      });
    });

    // Disconnect
    socket.on('disconnect', () => {
      console.log(`[Socket] Client disconnected: ${socket.id}`);
    });
  });
};

// Helper functions to emit events
export const emitOrderUpdate = (io: Server, orderId: string, data: any) => {
  io.to(`order:${orderId}`).emit('order:updated', data);
};

export const emitNewOrder = (io: Server, restaurantId: string, order: any) => {
  io.to(`restaurant:${restaurantId}`).emit('order:new', order);
};
