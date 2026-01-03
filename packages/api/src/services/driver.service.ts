import { PrismaClient, Driver, Order, OrderStatus } from '@prisma/client';

const prisma = new PrismaClient();

// ==================== DRIVER STATUS ====================

// Get or create driver profile
export async function getOrCreateDriver(userId: string): Promise<Driver> {
  let driver = await prisma.driver.findUnique({
    where: { userId },
  });

  if (!driver) {
    driver = await prisma.driver.create({
      data: {
        userId,
        vehicleType: 'SCOOTER',
      },
    });
  }

  return driver;
}

// Update online status
export async function updateOnlineStatus(
  userId: string,
  isOnline: boolean
): Promise<Driver> {
  const driver = await getOrCreateDriver(userId);

  return prisma.driver.update({
    where: { id: driver.id },
    data: {
      isOnline,
      isAvailable: isOnline,
    },
  });
}

// Update location
export async function updateLocation(
  userId: string,
  lat: number,
  lng: number
): Promise<Driver> {
  const driver = await getOrCreateDriver(userId);

  return prisma.driver.update({
    where: { id: driver.id },
    data: {
      currentLat: lat,
      currentLng: lng,
    },
  });
}

// ==================== DRIVER ORDERS ====================

// Get available orders (READY status, no driver assigned)
export async function getAvailableOrders(driverId: string) {
  return prisma.order.findMany({
    where: {
      status: 'READY',
      driverId: null,
    },
    orderBy: { createdAt: 'desc' },
    include: {
      restaurant: {
        select: { id: true, name: true, address: true, lat: true, lng: true },
      },
      items: true,
    },
  });
}

// Get driver's active orders
export async function getMyOrders(userId: string) {
  const driver = await getOrCreateDriver(userId);

  return prisma.order.findMany({
    where: {
      driverId: driver.id,
      status: {
        in: ['DRIVER_ASSIGNED', 'PICKED_UP', 'DELIVERING'],
      },
    },
    orderBy: { createdAt: 'desc' },
    include: {
      restaurant: {
        select: { id: true, name: true, address: true, lat: true, lng: true, phone: true },
      },
      customer: {
        select: { id: true, name: true, phone: true },
      },
      items: true,
    },
  });
}

// Get driver's order history
export async function getOrderHistory(userId: string, page = 1, limit = 20) {
  const driver = await getOrCreateDriver(userId);
  const skip = (page - 1) * limit;

  const [orders, total] = await Promise.all([
    prisma.order.findMany({
      where: {
        driverId: driver.id,
        status: { in: ['DELIVERED', 'CANCELLED'] },
      },
      skip,
      take: limit,
      orderBy: { createdAt: 'desc' },
      include: {
        restaurant: {
          select: { id: true, name: true },
        },
      },
    }),
    prisma.order.count({
      where: {
        driverId: driver.id,
        status: { in: ['DELIVERED', 'CANCELLED'] },
      },
    }),
  ]);

  return {
    orders,
    pagination: { page, limit, total, totalPages: Math.ceil(total / limit) },
  };
}

// Accept order
export async function acceptOrder(
  userId: string,
  orderId: string
): Promise<Order> {
  const driver = await getOrCreateDriver(userId);

  const order = await prisma.order.findUnique({
    where: { id: orderId },
    select: { status: true, driverId: true },
  });

  if (!order) {
    throw new Error('ORDER_NOT_FOUND');
  }

  if (order.status !== 'READY') {
    throw new Error('ORDER_NOT_READY');
  }

  if (order.driverId) {
    throw new Error('ORDER_ALREADY_TAKEN');
  }

  // Update driver availability
  await prisma.driver.update({
    where: { id: driver.id },
    data: { isAvailable: false },
  });

  return prisma.order.update({
    where: { id: orderId },
    data: {
      driverId: driver.id,
      status: 'DRIVER_ASSIGNED',
    },
  });
}

// Mark order as picked up
export async function pickUpOrder(
  userId: string,
  orderId: string
): Promise<Order> {
  const driver = await getOrCreateDriver(userId);

  const order = await prisma.order.findUnique({
    where: { id: orderId },
    select: { status: true, driverId: true },
  });

  if (!order) {
    throw new Error('ORDER_NOT_FOUND');
  }

  if (order.driverId !== driver.id) {
    throw new Error('NOT_YOUR_ORDER');
  }

  if (order.status !== 'DRIVER_ASSIGNED') {
    throw new Error('INVALID_STATUS');
  }

  return prisma.order.update({
    where: { id: orderId },
    data: {
      status: 'PICKED_UP',
      pickedUpAt: new Date(),
    },
  });
}

// Mark order as delivering
export async function startDelivering(
  userId: string,
  orderId: string
): Promise<Order> {
  const driver = await getOrCreateDriver(userId);

  const order = await prisma.order.findUnique({
    where: { id: orderId },
    select: { status: true, driverId: true },
  });

  if (!order) {
    throw new Error('ORDER_NOT_FOUND');
  }

  if (order.driverId !== driver.id) {
    throw new Error('NOT_YOUR_ORDER');
  }

  if (order.status !== 'PICKED_UP') {
    throw new Error('INVALID_STATUS');
  }

  return prisma.order.update({
    where: { id: orderId },
    data: {
      status: 'DELIVERING',
    },
  });
}

// Mark order as delivered
export async function deliverOrder(
  userId: string,
  orderId: string
): Promise<Order> {
  const driver = await getOrCreateDriver(userId);

  const order = await prisma.order.findUnique({
    where: { id: orderId },
    select: { status: true, driverId: true },
  });

  if (!order) {
    throw new Error('ORDER_NOT_FOUND');
  }

  if (order.driverId !== driver.id) {
    throw new Error('NOT_YOUR_ORDER');
  }

  if (order.status !== 'DELIVERING') {
    throw new Error('INVALID_STATUS');
  }

  // Make driver available again
  await prisma.driver.update({
    where: { id: driver.id },
    data: { isAvailable: true },
  });

  return prisma.order.update({
    where: { id: orderId },
    data: {
      status: 'DELIVERED',
      deliveredAt: new Date(),
    },
  });
}
