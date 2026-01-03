import { Server, Socket } from 'socket.io';
import jwt from 'jsonwebtoken';
import { config } from '../config/index.js';

interface AuthenticatedSocket extends Socket {
  userId?: string;
  userRole?: string;
  restaurantId?: string;
}

interface JwtPayload {
  userId: string;
  phone: string;
  role: string;
  restaurantId?: string;
}

let ioInstance: Server | null = null;

export const setupSocket = (io: Server) => {
  ioInstance = io;

  // Authentication middleware
  io.use((socket: AuthenticatedSocket, next) => {
    const token = socket.handshake.auth.token || socket.handshake.headers.authorization?.replace('Bearer ', '');

    if (!token) {
      // Allow unauthenticated connections for order tracking
      return next();
    }

    try {
      const decoded = jwt.verify(token, config.jwt.secret) as JwtPayload;
      socket.userId = decoded.userId;
      socket.userRole = decoded.role;
      socket.restaurantId = decoded.restaurantId;
      next();
    } catch {
      next(new Error('Invalid token'));
    }
  });

  io.on('connection', (socket: AuthenticatedSocket) => {
    console.log(`[Socket] Client connected: ${socket.id} (userId: ${socket.userId || 'anonymous'})`);

    // === ROOM MANAGEMENT ===

    // Join restaurant room (for restaurant admins)
    if (socket.userRole === 'RESTAURANT_ADMIN' && socket.restaurantId) {
      socket.join(`restaurant:${socket.restaurantId}`);
      console.log(`[Socket] ${socket.id} auto-joined restaurant:${socket.restaurantId}`);
    }

    // Join driver room (for drivers)
    if (socket.userRole === 'DRIVER') {
      socket.join('drivers');
      socket.join(`driver:${socket.userId}`);
      console.log(`[Socket] ${socket.id} auto-joined drivers room`);
    }

    // Join customer room
    if (socket.userRole === 'CUSTOMER' && socket.userId) {
      socket.join(`customer:${socket.userId}`);
      console.log(`[Socket] ${socket.id} auto-joined customer:${socket.userId}`);
    }

    // === ORDER TRACKING ===

    // Join order room for tracking (anyone can track with orderId)
    socket.on('join:order', (orderId: string) => {
      socket.join(`order:${orderId}`);
      console.log(`[Socket] ${socket.id} joined order:${orderId}`);
    });

    // Leave order room
    socket.on('leave:order', (orderId: string) => {
      socket.leave(`order:${orderId}`);
      console.log(`[Socket] ${socket.id} left order:${orderId}`);
    });

    // === DRIVER EVENTS ===

    // Driver location update (real-time)
    socket.on('driver:location', (data: { lat: number; lng: number; orderId?: string }) => {
      if (socket.userRole !== 'DRIVER' || !socket.userId) return;

      // Broadcast to specific order room if orderId provided
      if (data.orderId) {
        io.to(`order:${data.orderId}`).emit('driver:location', {
          driverId: socket.userId,
          lat: data.lat,
          lng: data.lng,
          timestamp: new Date().toISOString(),
        });
      }

      // Broadcast to all subscribers of this driver
      io.to(`driver:${socket.userId}:tracking`).emit('driver:location', {
        driverId: socket.userId,
        lat: data.lat,
        lng: data.lng,
        timestamp: new Date().toISOString(),
      });
    });

    // Subscribe to driver tracking
    socket.on('track:driver', (driverId: string) => {
      socket.join(`driver:${driverId}:tracking`);
      console.log(`[Socket] ${socket.id} tracking driver:${driverId}`);
    });

    // Unsubscribe from driver tracking
    socket.on('untrack:driver', (driverId: string) => {
      socket.leave(`driver:${driverId}:tracking`);
      console.log(`[Socket] ${socket.id} stopped tracking driver:${driverId}`);
    });

    // === DISCONNECT ===

    socket.on('disconnect', () => {
      console.log(`[Socket] Client disconnected: ${socket.id}`);
    });
  });
};

// === EMIT HELPERS (used by controllers/services) ===

// Get io instance
export const getIO = (): Server | null => ioInstance;

// Emit order status update to all relevant parties
export const emitOrderUpdate = (orderId: string, order: any) => {
  if (!ioInstance) return;

  const data = {
    orderId,
    status: order.status,
    order,
    updatedAt: new Date().toISOString(),
  };

  // Emit to order room (anyone tracking this order)
  ioInstance.to(`order:${orderId}`).emit('order:updated', data);

  // Emit to customer
  if (order.customerId) {
    ioInstance.to(`customer:${order.customerId}`).emit('order:updated', data);
  }

  // Emit to restaurant
  if (order.restaurantId) {
    ioInstance.to(`restaurant:${order.restaurantId}`).emit('order:updated', data);
  }

  // Emit to assigned driver
  if (order.driverId) {
    ioInstance.to(`driver:${order.driverId}`).emit('order:updated', data);
  }

  console.log(`[Socket] Emitted order:updated for ${orderId}`);
};

// Emit new order to restaurant
export const emitNewOrder = (restaurantId: string, order: any) => {
  if (!ioInstance) return;

  ioInstance.to(`restaurant:${restaurantId}`).emit('order:new', {
    order,
    createdAt: new Date().toISOString(),
  });

  console.log(`[Socket] Emitted order:new to restaurant:${restaurantId}`);
};

// Emit to all available drivers (order ready for pickup)
export const emitOrderReady = (order: any) => {
  if (!ioInstance) return;

  ioInstance.to('drivers').emit('order:ready', {
    orderId: order.id,
    orderNumber: order.orderNumber,
    restaurant: order.restaurant,
    deliveryAddress: order.deliveryAddress,
    totalAmount: order.totalAmount,
    createdAt: new Date().toISOString(),
  });

  console.log(`[Socket] Emitted order:ready to drivers`);
};

// Emit driver assigned to order
export const emitDriverAssigned = (orderId: string, driver: any) => {
  if (!ioInstance) return;

  ioInstance.to(`order:${orderId}`).emit('driver:assigned', {
    orderId,
    driver: {
      id: driver.id,
      name: driver.user?.name,
      phone: driver.user?.phone,
      vehicleType: driver.vehicleType,
    },
    assignedAt: new Date().toISOString(),
  });

  console.log(`[Socket] Emitted driver:assigned for order:${orderId}`);
};
