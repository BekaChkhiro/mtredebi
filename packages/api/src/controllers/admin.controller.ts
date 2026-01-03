import { Request, Response, NextFunction } from 'express';
import { z } from 'zod';
import * as adminService from '../services/admin.service.js';

// ==================== DASHBOARD ====================

export async function getDashboard(req: Request, res: Response, next: NextFunction) {
  try {
    const stats = await adminService.getDashboardStats();
    res.json(stats);
  } catch (error) {
    next(error);
  }
}

// ==================== USER MANAGEMENT ====================

const getUsersSchema = z.object({
  page: z.coerce.number().min(1).default(1),
  limit: z.coerce.number().min(1).max(100).default(20),
  role: z.enum(['CUSTOMER', 'DRIVER', 'RESTAURANT_ADMIN', 'ADMIN']).optional(),
  search: z.string().optional(),
  isActive: z.enum(['true', 'false']).transform((v) => v === 'true').optional(),
});

export async function getUsers(req: Request, res: Response, next: NextFunction) {
  try {
    const query = getUsersSchema.parse(req.query);
    const result = await adminService.getUsers({
      page: query.page,
      limit: query.limit,
      role: query.role,
      search: query.search,
      isActive: query.isActive,
    });
    res.json(result);
  } catch (error) {
    next(error);
  }
}

export async function getUserById(req: Request, res: Response, next: NextFunction) {
  try {
    const { id } = req.params;
    const user = await adminService.getUserById(id);

    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    res.json(user);
  } catch (error) {
    next(error);
  }
}

const updateUserSchema = z.object({
  name: z.string().min(1).optional(),
  role: z.enum(['CUSTOMER', 'DRIVER', 'RESTAURANT_ADMIN', 'ADMIN']).optional(),
  isActive: z.boolean().optional(),
});

export async function updateUser(req: Request, res: Response, next: NextFunction) {
  try {
    const { id } = req.params;
    const data = updateUserSchema.parse(req.body);

    const user = await adminService.updateUser(id, data);

    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    res.json(user);
  } catch (error) {
    next(error);
  }
}

// ==================== RESTAURANT MANAGEMENT ====================

const getRestaurantsSchema = z.object({
  page: z.coerce.number().min(1).default(1),
  limit: z.coerce.number().min(1).max(100).default(20),
  search: z.string().optional(),
  isActive: z.enum(['true', 'false']).transform((v) => v === 'true').optional(),
});

export async function getRestaurants(req: Request, res: Response, next: NextFunction) {
  try {
    const query = getRestaurantsSchema.parse(req.query);
    const result = await adminService.getRestaurantsAdmin({
      page: query.page,
      limit: query.limit,
      search: query.search,
      isActive: query.isActive,
    });
    res.json(result);
  } catch (error) {
    next(error);
  }
}

const createRestaurantSchema = z.object({
  name: z.string().min(1),
  description: z.string().optional(),
  address: z.string().min(1),
  lat: z.number(),
  lng: z.number(),
  phone: z.string().min(1),
  imageUrl: z.string().url().optional(),
  coverImageUrl: z.string().url().optional(),
  minOrderAmount: z.number().min(0).optional(),
  deliveryFee: z.number().min(0).optional(),
  avgPrepTime: z.number().min(1).optional(),
});

export async function createRestaurant(req: Request, res: Response, next: NextFunction) {
  try {
    const data = createRestaurantSchema.parse(req.body);
    const restaurant = await adminService.createRestaurant(data);
    res.status(201).json(restaurant);
  } catch (error) {
    next(error);
  }
}

const updateRestaurantSchema = z.object({
  name: z.string().min(1).optional(),
  description: z.string().optional(),
  address: z.string().min(1).optional(),
  lat: z.number().optional(),
  lng: z.number().optional(),
  phone: z.string().min(1).optional(),
  imageUrl: z.string().url().optional(),
  coverImageUrl: z.string().url().optional(),
  minOrderAmount: z.number().min(0).optional(),
  deliveryFee: z.number().min(0).optional(),
  avgPrepTime: z.number().min(1).optional(),
  isActive: z.boolean().optional(),
});

export async function updateRestaurant(req: Request, res: Response, next: NextFunction) {
  try {
    const { id } = req.params;
    const data = updateRestaurantSchema.parse(req.body);

    const restaurant = await adminService.updateRestaurant(id, data);

    if (!restaurant) {
      return res.status(404).json({ error: 'Restaurant not found' });
    }

    res.json(restaurant);
  } catch (error) {
    next(error);
  }
}

export async function deleteRestaurant(req: Request, res: Response, next: NextFunction) {
  try {
    const { id } = req.params;
    const deleted = await adminService.deleteRestaurant(id);

    if (!deleted) {
      return res.status(404).json({ error: 'Restaurant not found' });
    }

    res.json({ message: 'Restaurant deleted successfully' });
  } catch (error) {
    next(error);
  }
}

// ==================== DRIVER MANAGEMENT ====================

const getDriversSchema = z.object({
  page: z.coerce.number().min(1).default(1),
  limit: z.coerce.number().min(1).max(100).default(20),
  isOnline: z.enum(['true', 'false']).transform((v) => v === 'true').optional(),
  isAvailable: z.enum(['true', 'false']).transform((v) => v === 'true').optional(),
  vehicleType: z.enum(['WALKING', 'BICYCLE', 'SCOOTER', 'CAR']).optional(),
});

export async function getDrivers(req: Request, res: Response, next: NextFunction) {
  try {
    const query = getDriversSchema.parse(req.query);
    const result = await adminService.getDrivers({
      page: query.page,
      limit: query.limit,
      isOnline: query.isOnline,
      isAvailable: query.isAvailable,
      vehicleType: query.vehicleType,
    });
    res.json(result);
  } catch (error) {
    next(error);
  }
}

const createDriverSchema = z.object({
  phone: z.string().min(1),
  name: z.string().optional(),
  vehicleType: z.enum(['WALKING', 'BICYCLE', 'SCOOTER', 'CAR']),
});

export async function createDriver(req: Request, res: Response, next: NextFunction) {
  try {
    const data = createDriverSchema.parse(req.body);
    const driver = await adminService.createDriver(data);
    res.status(201).json(driver);
  } catch (error) {
    next(error);
  }
}

const updateDriverSchema = z.object({
  vehicleType: z.enum(['WALKING', 'BICYCLE', 'SCOOTER', 'CAR']).optional(),
  isAvailable: z.boolean().optional(),
});

export async function updateDriver(req: Request, res: Response, next: NextFunction) {
  try {
    const { id } = req.params;
    const data = updateDriverSchema.parse(req.body);

    const driver = await adminService.updateDriver(id, data);

    if (!driver) {
      return res.status(404).json({ error: 'Driver not found' });
    }

    res.json(driver);
  } catch (error) {
    next(error);
  }
}

// ==================== ORDER MANAGEMENT ====================

const getOrdersSchema = z.object({
  page: z.coerce.number().min(1).default(1),
  limit: z.coerce.number().min(1).max(100).default(20),
  status: z.enum([
    'PENDING', 'ACCEPTED', 'PREPARING', 'READY',
    'DRIVER_ASSIGNED', 'PICKED_UP', 'DELIVERING', 'DELIVERED', 'CANCELLED'
  ]).optional(),
  restaurantId: z.string().uuid().optional(),
  driverId: z.string().uuid().optional(),
  customerId: z.string().uuid().optional(),
  dateFrom: z.coerce.date().optional(),
  dateTo: z.coerce.date().optional(),
});

export async function getOrders(req: Request, res: Response, next: NextFunction) {
  try {
    const query = getOrdersSchema.parse(req.query);
    const result = await adminService.getOrdersAdmin({
      page: query.page,
      limit: query.limit,
      status: query.status,
      restaurantId: query.restaurantId,
      driverId: query.driverId,
      customerId: query.customerId,
      dateFrom: query.dateFrom,
      dateTo: query.dateTo,
    });
    res.json(result);
  } catch (error) {
    next(error);
  }
}

// ==================== ANALYTICS ====================

const analyticsSchema = z.object({
  from: z.coerce.date(),
  to: z.coerce.date(),
});

export async function getRevenueAnalytics(req: Request, res: Response, next: NextFunction) {
  try {
    const query = analyticsSchema.parse(req.query);
    const analytics = await adminService.getRevenueAnalytics({
      from: query.from,
      to: query.to,
    });
    res.json(analytics);
  } catch (error) {
    next(error);
  }
}

export async function getOrderAnalytics(req: Request, res: Response, next: NextFunction) {
  try {
    const query = analyticsSchema.parse(req.query);
    const analytics = await adminService.getOrderAnalytics({
      from: query.from,
      to: query.to,
    });
    res.json(analytics);
  } catch (error) {
    next(error);
  }
}

const topRestaurantsSchema = z.object({
  from: z.coerce.date(),
  to: z.coerce.date(),
  limit: z.coerce.number().min(1).max(50).default(10),
});

export async function getTopRestaurants(req: Request, res: Response, next: NextFunction) {
  try {
    const query = topRestaurantsSchema.parse(req.query);
    const topRestaurants = await adminService.getTopRestaurants(
      { from: query.from, to: query.to },
      query.limit
    );
    res.json(topRestaurants);
  } catch (error) {
    next(error);
  }
}
