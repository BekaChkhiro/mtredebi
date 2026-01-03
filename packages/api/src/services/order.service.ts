import { PrismaClient, Order, OrderStatus, OrderItem } from '@prisma/client';

const prisma = new PrismaClient();

// ==================== ORDER OPERATIONS ====================

interface OrderItemInput {
  menuItemId: string;
  quantity: number;
  notes?: string;
}

interface CreateOrderInput {
  restaurantId: string;
  items: OrderItemInput[];
  deliveryAddress: string;
  deliveryLat: number;
  deliveryLng: number;
  customerNotes?: string;
}

interface OrderWithDetails extends Order {
  items: OrderItem[];
  restaurant: {
    id: string;
    name: string;
    phone: string;
    address: string;
  };
  customer: {
    id: string;
    name: string | null;
    phone: string;
  };
}

// Generate unique order number (e.g., MTR-240103-0001)
function generateOrderNumber(): string {
  const now = new Date();
  const dateStr = now.toISOString().slice(2, 10).replace(/-/g, '');
  const random = Math.floor(Math.random() * 10000)
    .toString()
    .padStart(4, '0');
  return `MTR-${dateStr}-${random}`;
}

// Create new order
export async function createOrder(
  customerId: string,
  input: CreateOrderInput
): Promise<OrderWithDetails> {
  const { restaurantId, items, deliveryAddress, deliveryLat, deliveryLng, customerNotes } = input;

  // Get restaurant for delivery fee
  const restaurant = await prisma.restaurant.findUnique({
    where: { id: restaurantId },
    select: { id: true, name: true, deliveryFee: true, minOrderAmount: true, isActive: true },
  });

  if (!restaurant) {
    throw new Error('RESTAURANT_NOT_FOUND');
  }

  if (!restaurant.isActive) {
    throw new Error('RESTAURANT_NOT_ACTIVE');
  }

  // Get menu items with prices
  const menuItemIds = items.map((item) => item.menuItemId);
  const menuItems = await prisma.menuItem.findMany({
    where: {
      id: { in: menuItemIds },
      isAvailable: true,
      category: {
        restaurantId,
        isActive: true,
      },
    },
    select: { id: true, name: true, price: true },
  });

  // Validate all items exist
  if (menuItems.length !== items.length) {
    throw new Error('INVALID_MENU_ITEMS');
  }

  // Create menu items map
  const menuItemMap = new Map(menuItems.map((item) => [item.id, item]));

  // Calculate subtotal
  let subtotal = 0;
  const orderItems = items.map((item) => {
    const menuItem = menuItemMap.get(item.menuItemId)!;
    subtotal += menuItem.price * item.quantity;
    return {
      menuItemId: item.menuItemId,
      name: menuItem.name,
      price: menuItem.price,
      quantity: item.quantity,
      notes: item.notes,
    };
  });

  // Check minimum order amount
  if (subtotal < restaurant.minOrderAmount) {
    throw new Error('MIN_ORDER_AMOUNT');
  }

  const deliveryFee = restaurant.deliveryFee;
  const totalAmount = subtotal + deliveryFee;

  // Create order with items
  const order = await prisma.order.create({
    data: {
      orderNumber: generateOrderNumber(),
      customerId,
      restaurantId,
      subtotal,
      deliveryFee,
      totalAmount,
      deliveryAddress,
      deliveryLat,
      deliveryLng,
      customerNotes,
      items: {
        create: orderItems,
      },
    },
    include: {
      items: true,
      restaurant: {
        select: { id: true, name: true, phone: true, address: true },
      },
      customer: {
        select: { id: true, name: true, phone: true },
      },
    },
  });

  return order;
}

// Get order by ID
export async function getOrderById(orderId: string): Promise<OrderWithDetails | null> {
  return prisma.order.findUnique({
    where: { id: orderId },
    include: {
      items: true,
      restaurant: {
        select: { id: true, name: true, phone: true, address: true },
      },
      customer: {
        select: { id: true, name: true, phone: true },
      },
    },
  });
}

// Get customer orders
interface GetOrdersOptions {
  page?: number;
  limit?: number;
  status?: OrderStatus;
}

export async function getCustomerOrders(
  customerId: string,
  options: GetOrdersOptions = {}
) {
  const { page = 1, limit = 20, status } = options;
  const skip = (page - 1) * limit;

  const where: any = { customerId };
  if (status) {
    where.status = status;
  }

  const [orders, total] = await Promise.all([
    prisma.order.findMany({
      where,
      skip,
      take: limit,
      orderBy: { createdAt: 'desc' },
      include: {
        items: true,
        restaurant: {
          select: { id: true, name: true, imageUrl: true },
        },
      },
    }),
    prisma.order.count({ where }),
  ]);

  return {
    orders,
    pagination: {
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit),
    },
  };
}

// Get restaurant orders
export async function getRestaurantOrders(
  restaurantId: string,
  options: GetOrdersOptions = {}
) {
  const { page = 1, limit = 20, status } = options;
  const skip = (page - 1) * limit;

  const where: any = { restaurantId };
  if (status) {
    where.status = status;
  }

  const [orders, total] = await Promise.all([
    prisma.order.findMany({
      where,
      skip,
      take: limit,
      orderBy: { createdAt: 'desc' },
      include: {
        items: true,
        customer: {
          select: { id: true, name: true, phone: true },
        },
      },
    }),
    prisma.order.count({ where }),
  ]);

  return {
    orders,
    pagination: {
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit),
    },
  };
}

// Status transition rules
const statusTransitions: Record<OrderStatus, OrderStatus[]> = {
  PENDING: ['ACCEPTED', 'CANCELLED'],
  ACCEPTED: ['PREPARING', 'CANCELLED'],
  PREPARING: ['READY', 'CANCELLED'],
  READY: ['DRIVER_ASSIGNED', 'PICKED_UP', 'CANCELLED'],
  DRIVER_ASSIGNED: ['PICKED_UP', 'CANCELLED'],
  PICKED_UP: ['DELIVERING'],
  DELIVERING: ['DELIVERED'],
  DELIVERED: [],
  CANCELLED: [],
};

// Update order status
export async function updateOrderStatus(
  orderId: string,
  newStatus: OrderStatus
): Promise<Order | null> {
  const order = await prisma.order.findUnique({
    where: { id: orderId },
    select: { status: true },
  });

  if (!order) {
    return null;
  }

  // Check if transition is valid
  const allowedTransitions = statusTransitions[order.status];
  if (!allowedTransitions.includes(newStatus)) {
    throw new Error('INVALID_STATUS_TRANSITION');
  }

  // Timestamp updates based on status
  const timestampUpdates: any = {};
  switch (newStatus) {
    case 'ACCEPTED':
      timestampUpdates.acceptedAt = new Date();
      break;
    case 'PREPARING':
      timestampUpdates.preparingAt = new Date();
      break;
    case 'READY':
      timestampUpdates.readyAt = new Date();
      break;
    case 'PICKED_UP':
      timestampUpdates.pickedUpAt = new Date();
      break;
    case 'DELIVERED':
      timestampUpdates.deliveredAt = new Date();
      break;
    case 'CANCELLED':
      timestampUpdates.cancelledAt = new Date();
      break;
  }

  return prisma.order.update({
    where: { id: orderId },
    data: {
      status: newStatus,
      ...timestampUpdates,
    },
  });
}

// Assign driver to order
export async function assignDriver(
  orderId: string,
  driverId: string
): Promise<Order | null> {
  const order = await prisma.order.findUnique({
    where: { id: orderId },
    select: { status: true },
  });

  if (!order) {
    return null;
  }

  if (order.status !== 'READY') {
    throw new Error('ORDER_NOT_READY');
  }

  return prisma.order.update({
    where: { id: orderId },
    data: {
      driverId,
      status: 'DRIVER_ASSIGNED',
    },
  });
}

// Cancel order (customer can only cancel pending orders)
export async function cancelOrder(
  orderId: string,
  userId: string,
  userRole: string
): Promise<Order | null> {
  const order = await prisma.order.findUnique({
    where: { id: orderId },
    select: { status: true, customerId: true, restaurantId: true },
  });

  if (!order) {
    return null;
  }

  // Check cancellation permission
  const canCancel =
    (userRole === 'CUSTOMER' && order.customerId === userId && order.status === 'PENDING') ||
    userRole === 'RESTAURANT_ADMIN' ||
    userRole === 'ADMIN';

  if (!canCancel) {
    throw new Error('CANNOT_CANCEL');
  }

  if (order.status === 'DELIVERED' || order.status === 'CANCELLED') {
    throw new Error('INVALID_STATUS_TRANSITION');
  }

  return prisma.order.update({
    where: { id: orderId },
    data: {
      status: 'CANCELLED',
      cancelledAt: new Date(),
    },
  });
}
