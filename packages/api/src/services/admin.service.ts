import { PrismaClient, UserRole, VehicleType, OrderStatus } from '@prisma/client';

const prisma = new PrismaClient();

// ==================== DASHBOARD STATS ====================

export interface DashboardStats {
  totalUsers: number;
  totalRestaurants: number;
  totalDrivers: number;
  totalOrders: number;
  todayOrders: number;
  todayRevenue: number;
  activeDrivers: number;
  pendingOrders: number;
}

export async function getDashboardStats(): Promise<DashboardStats> {
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const [
    totalUsers,
    totalRestaurants,
    totalDrivers,
    totalOrders,
    todayOrdersData,
    activeDrivers,
    pendingOrders,
  ] = await Promise.all([
    prisma.user.count(),
    prisma.restaurant.count(),
    prisma.driver.count(),
    prisma.order.count(),
    prisma.order.findMany({
      where: { createdAt: { gte: today } },
      select: { totalAmount: true },
    }),
    prisma.driver.count({ where: { isOnline: true } }),
    prisma.order.count({ where: { status: 'PENDING' } }),
  ]);

  const todayOrders = todayOrdersData.length;
  const todayRevenue = todayOrdersData.reduce((sum, order) => sum + order.totalAmount, 0);

  return {
    totalUsers,
    totalRestaurants,
    totalDrivers,
    totalOrders,
    todayOrders,
    todayRevenue,
    activeDrivers,
    pendingOrders,
  };
}

// ==================== USER MANAGEMENT ====================

interface GetUsersOptions {
  page?: number;
  limit?: number;
  role?: UserRole;
  search?: string;
  isActive?: boolean;
}

export async function getUsers(options: GetUsersOptions = {}) {
  const { page = 1, limit = 20, role, search, isActive } = options;
  const skip = (page - 1) * limit;

  const where: any = {};

  if (role) {
    where.role = role;
  }

  if (typeof isActive === 'boolean') {
    where.isActive = isActive;
  }

  if (search) {
    where.OR = [
      { name: { contains: search, mode: 'insensitive' } },
      { phone: { contains: search } },
    ];
  }

  const [users, total] = await Promise.all([
    prisma.user.findMany({
      where,
      skip,
      take: limit,
      orderBy: { createdAt: 'desc' },
      select: {
        id: true,
        phone: true,
        name: true,
        role: true,
        isActive: true,
        createdAt: true,
        _count: {
          select: { orders: true },
        },
      },
    }),
    prisma.user.count({ where }),
  ]);

  return {
    users,
    pagination: {
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit),
    },
  };
}

export async function getUserById(userId: string) {
  return prisma.user.findUnique({
    where: { id: userId },
    include: {
      addresses: true,
      driver: true,
      _count: {
        select: { orders: true },
      },
    },
  });
}

interface UpdateUserInput {
  name?: string;
  role?: UserRole;
  isActive?: boolean;
}

export async function updateUser(userId: string, data: UpdateUserInput) {
  try {
    return await prisma.user.update({
      where: { id: userId },
      data,
    });
  } catch {
    return null;
  }
}

// ==================== RESTAURANT MANAGEMENT ====================

interface GetRestaurantsOptions {
  page?: number;
  limit?: number;
  search?: string;
  isActive?: boolean;
}

export async function getRestaurantsAdmin(options: GetRestaurantsOptions = {}) {
  const { page = 1, limit = 20, search, isActive } = options;
  const skip = (page - 1) * limit;

  const where: any = {};

  if (typeof isActive === 'boolean') {
    where.isActive = isActive;
  }

  if (search) {
    where.OR = [
      { name: { contains: search, mode: 'insensitive' } },
      { address: { contains: search, mode: 'insensitive' } },
    ];
  }

  const [restaurants, total] = await Promise.all([
    prisma.restaurant.findMany({
      where,
      skip,
      take: limit,
      orderBy: { createdAt: 'desc' },
      include: {
        _count: {
          select: { orders: true, categories: true },
        },
      },
    }),
    prisma.restaurant.count({ where }),
  ]);

  return {
    restaurants,
    pagination: {
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit),
    },
  };
}

interface CreateRestaurantInput {
  name: string;
  description?: string;
  address: string;
  lat: number;
  lng: number;
  phone: string;
  imageUrl?: string;
  coverImageUrl?: string;
  minOrderAmount?: number;
  deliveryFee?: number;
  avgPrepTime?: number;
}

export async function createRestaurant(data: CreateRestaurantInput) {
  return prisma.restaurant.create({
    data: {
      ...data,
      minOrderAmount: data.minOrderAmount ?? 0,
      deliveryFee: data.deliveryFee ?? 0,
      avgPrepTime: data.avgPrepTime ?? 30,
    },
  });
}

export async function updateRestaurant(
  id: string,
  data: Partial<CreateRestaurantInput & { isActive: boolean }>
) {
  try {
    return await prisma.restaurant.update({
      where: { id },
      data,
    });
  } catch {
    return null;
  }
}

export async function deleteRestaurant(id: string) {
  try {
    await prisma.restaurant.delete({
      where: { id },
    });
    return true;
  } catch {
    return false;
  }
}

// ==================== DRIVER MANAGEMENT ====================

interface GetDriversOptions {
  page?: number;
  limit?: number;
  isOnline?: boolean;
  isAvailable?: boolean;
  vehicleType?: VehicleType;
}

export async function getDrivers(options: GetDriversOptions = {}) {
  const { page = 1, limit = 20, isOnline, isAvailable, vehicleType } = options;
  const skip = (page - 1) * limit;

  const where: any = {};

  if (typeof isOnline === 'boolean') {
    where.isOnline = isOnline;
  }

  if (typeof isAvailable === 'boolean') {
    where.isAvailable = isAvailable;
  }

  if (vehicleType) {
    where.vehicleType = vehicleType;
  }

  const [drivers, total] = await Promise.all([
    prisma.driver.findMany({
      where,
      skip,
      take: limit,
      orderBy: { createdAt: 'desc' },
      include: {
        user: {
          select: {
            id: true,
            phone: true,
            name: true,
            isActive: true,
          },
        },
        _count: {
          select: { orders: true },
        },
      },
    }),
    prisma.driver.count({ where }),
  ]);

  return {
    drivers,
    pagination: {
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit),
    },
  };
}

interface CreateDriverInput {
  phone: string;
  name?: string;
  vehicleType: VehicleType;
}

export async function createDriver(data: CreateDriverInput) {
  // Create user with DRIVER role and driver record
  return prisma.user.create({
    data: {
      phone: data.phone,
      name: data.name,
      role: 'DRIVER',
      driver: {
        create: {
          vehicleType: data.vehicleType,
        },
      },
    },
    include: {
      driver: true,
    },
  });
}

interface UpdateDriverInput {
  vehicleType?: VehicleType;
  isAvailable?: boolean;
}

export async function updateDriver(driverId: string, data: UpdateDriverInput) {
  try {
    return await prisma.driver.update({
      where: { id: driverId },
      data,
    });
  } catch {
    return null;
  }
}

// ==================== ORDER MANAGEMENT ====================

interface GetOrdersOptions {
  page?: number;
  limit?: number;
  status?: OrderStatus;
  restaurantId?: string;
  driverId?: string;
  customerId?: string;
  dateFrom?: Date;
  dateTo?: Date;
}

export async function getOrdersAdmin(options: GetOrdersOptions = {}) {
  const { page = 1, limit = 20, status, restaurantId, driverId, customerId, dateFrom, dateTo } = options;
  const skip = (page - 1) * limit;

  const where: any = {};

  if (status) {
    where.status = status;
  }

  if (restaurantId) {
    where.restaurantId = restaurantId;
  }

  if (driverId) {
    where.driverId = driverId;
  }

  if (customerId) {
    where.customerId = customerId;
  }

  if (dateFrom || dateTo) {
    where.createdAt = {};
    if (dateFrom) {
      where.createdAt.gte = dateFrom;
    }
    if (dateTo) {
      where.createdAt.lte = dateTo;
    }
  }

  const [orders, total] = await Promise.all([
    prisma.order.findMany({
      where,
      skip,
      take: limit,
      orderBy: { createdAt: 'desc' },
      include: {
        customer: {
          select: { id: true, name: true, phone: true },
        },
        restaurant: {
          select: { id: true, name: true },
        },
        driver: {
          include: {
            user: {
              select: { id: true, name: true, phone: true },
            },
          },
        },
        items: true,
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

// ==================== ANALYTICS ====================

interface DateRange {
  from: Date;
  to: Date;
}

export async function getRevenueAnalytics(range: DateRange) {
  const orders = await prisma.order.findMany({
    where: {
      createdAt: {
        gte: range.from,
        lte: range.to,
      },
      status: 'DELIVERED',
    },
    select: {
      totalAmount: true,
      deliveryFee: true,
      createdAt: true,
    },
  });

  const totalRevenue = orders.reduce((sum, o) => sum + o.totalAmount, 0);
  const totalDeliveryFees = orders.reduce((sum, o) => sum + o.deliveryFee, 0);
  const orderCount = orders.length;
  const averageOrderValue = orderCount > 0 ? totalRevenue / orderCount : 0;

  return {
    totalRevenue,
    totalDeliveryFees,
    orderCount,
    averageOrderValue,
    period: {
      from: range.from,
      to: range.to,
    },
  };
}

export async function getOrderAnalytics(range: DateRange) {
  const [statusCounts, hourlyDistribution] = await Promise.all([
    prisma.order.groupBy({
      by: ['status'],
      where: {
        createdAt: {
          gte: range.from,
          lte: range.to,
        },
      },
      _count: true,
    }),
    prisma.order.findMany({
      where: {
        createdAt: {
          gte: range.from,
          lte: range.to,
        },
      },
      select: {
        createdAt: true,
      },
    }),
  ]);

  // Calculate hourly distribution
  const hourlyData: Record<number, number> = {};
  for (let i = 0; i < 24; i++) {
    hourlyData[i] = 0;
  }

  hourlyDistribution.forEach((order) => {
    const hour = order.createdAt.getHours();
    hourlyData[hour]++;
  });

  return {
    byStatus: statusCounts.map((s) => ({
      status: s.status,
      count: s._count,
    })),
    byHour: Object.entries(hourlyData).map(([hour, count]) => ({
      hour: parseInt(hour),
      count,
    })),
    period: {
      from: range.from,
      to: range.to,
    },
  };
}

export async function getTopRestaurants(range: DateRange, limit: number = 10) {
  const restaurants = await prisma.order.groupBy({
    by: ['restaurantId'],
    where: {
      createdAt: {
        gte: range.from,
        lte: range.to,
      },
      status: 'DELIVERED',
    },
    _count: true,
    _sum: {
      totalAmount: true,
    },
    orderBy: {
      _sum: {
        totalAmount: 'desc',
      },
    },
    take: limit,
  });

  // Get restaurant details
  const restaurantIds = restaurants.map((r) => r.restaurantId);
  const restaurantDetails = await prisma.restaurant.findMany({
    where: { id: { in: restaurantIds } },
    select: { id: true, name: true, imageUrl: true },
  });

  const detailsMap = new Map(restaurantDetails.map((r) => [r.id, r]));

  return restaurants.map((r) => ({
    restaurant: detailsMap.get(r.restaurantId),
    orderCount: r._count,
    revenue: r._sum.totalAmount ?? 0,
  }));
}
