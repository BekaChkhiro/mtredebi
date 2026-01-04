import { Request, Response } from 'express';
import { z } from 'zod';
import { OrderStatus } from '@prisma/client';
import * as orderService from '../services/order.service.js';
import { emitNewOrder, emitOrderUpdate, emitOrderReady } from '../socket/index.js';

// ==================== VALIDATION SCHEMAS ====================

const orderItemSchema = z.object({
  menuItemId: z.string().uuid('არასწორი menuItemId'),
  quantity: z.number().int().min(1, 'რაოდენობა მინიმუმ 1'),
  notes: z.string().max(200).optional(),
});

const createOrderSchema = z.object({
  restaurantId: z.string().uuid('არასწორი restaurantId'),
  items: z.array(orderItemSchema).min(1, 'შეკვეთაში მინიმუმ 1 პროდუქტია საჭირო'),
  deliveryAddress: z.string().min(5, 'მისამართი ძალიან მოკლეა'),
  deliveryLat: z.number(),
  deliveryLng: z.number(),
  customerNotes: z.string().max(500).optional(),
});

const paginationSchema = z.object({
  page: z.coerce.number().int().positive().optional(),
  limit: z.coerce.number().int().min(1).max(100).optional(),
  status: z.nativeEnum(OrderStatus).optional(),
});

const updateStatusSchema = z.object({
  status: z.nativeEnum(OrderStatus),
});

// ==================== CUSTOMER ENDPOINTS ====================

// POST /api/v1/orders - შეკვეთის შექმნა
export async function createOrder(req: Request, res: Response): Promise<void> {
  try {
    const validation = createOrderSchema.safeParse(req.body);

    if (!validation.success) {
      res.status(400).json({
        success: false,
        error: {
          code: 'VALIDATION_ERROR',
          message: validation.error.errors[0].message,
        },
      });
      return;
    }

    const customerId = req.user!.id;
    const order = await orderService.createOrder(customerId, validation.data);

    // Emit new order to restaurant via socket
    emitNewOrder(order.restaurantId, order);

    res.status(201).json({
      success: true,
      data: { order },
    });
  } catch (error: any) {
    console.error('createOrder error:', error);

    const errorMessages: Record<string, { status: number; code: string; message: string }> = {
      RESTAURANT_NOT_FOUND: { status: 404, code: 'RESTAURANT_NOT_FOUND', message: 'რესტორანი ვერ მოიძებნა' },
      RESTAURANT_NOT_ACTIVE: { status: 400, code: 'RESTAURANT_NOT_ACTIVE', message: 'რესტორანი არ არის აქტიური' },
      INVALID_MENU_ITEMS: { status: 400, code: 'INVALID_MENU_ITEMS', message: 'ზოგიერთი პროდუქტი მიუწვდომელია' },
      MIN_ORDER_AMOUNT: { status: 400, code: 'MIN_ORDER_AMOUNT', message: 'შეკვეთა ვერ აღწევს მინიმალურ თანხას' },
    };

    const errorInfo = errorMessages[error.message];
    if (errorInfo) {
      res.status(errorInfo.status).json({
        success: false,
        error: { code: errorInfo.code, message: errorInfo.message },
      });
      return;
    }

    res.status(500).json({
      success: false,
      error: { code: 'SERVER_ERROR', message: 'სერვერის შეცდომა' },
    });
  }
}

// GET /api/v1/orders - მომხმარებლის შეკვეთები
export async function getMyOrders(req: Request, res: Response): Promise<void> {
  try {
    const validation = paginationSchema.safeParse(req.query);

    if (!validation.success) {
      res.status(400).json({
        success: false,
        error: {
          code: 'VALIDATION_ERROR',
          message: validation.error.errors[0].message,
        },
      });
      return;
    }

    const customerId = req.user!.id;
    const result = await orderService.getCustomerOrders(customerId, validation.data);

    res.json({
      success: true,
      data: result,
    });
  } catch (error) {
    console.error('getMyOrders error:', error);
    res.status(500).json({
      success: false,
      error: { code: 'SERVER_ERROR', message: 'სერვერის შეცდომა' },
    });
  }
}

// GET /api/v1/orders/:id - კონკრეტული შეკვეთა
export async function getOrder(req: Request, res: Response): Promise<void> {
  try {
    const { id } = req.params;
    const order = await orderService.getOrderById(id);

    if (!order) {
      res.status(404).json({
        success: false,
        error: { code: 'NOT_FOUND', message: 'შეკვეთა ვერ მოიძებნა' },
      });
      return;
    }

    // Check access - customer can only see their own orders
    const user = req.user!;
    if (user.role === 'CUSTOMER' && order.customerId !== user.id) {
      res.status(403).json({
        success: false,
        error: { code: 'FORBIDDEN', message: 'წვდომა აკრძალულია' },
      });
      return;
    }

    res.json({
      success: true,
      data: { order },
    });
  } catch (error) {
    console.error('getOrder error:', error);
    res.status(500).json({
      success: false,
      error: { code: 'SERVER_ERROR', message: 'სერვერის შეცდომა' },
    });
  }
}

// PUT /api/v1/orders/:id/cancel - შეკვეთის გაუქმება
export async function cancelOrder(req: Request, res: Response): Promise<void> {
  try {
    const { id } = req.params;
    const user = req.user!;

    const order = await orderService.cancelOrder(id, user.id, user.role);

    if (!order) {
      res.status(404).json({
        success: false,
        error: { code: 'NOT_FOUND', message: 'შეკვეთა ვერ მოიძებნა' },
      });
      return;
    }

    // Emit order cancellation via socket
    emitOrderUpdate(id, order);

    res.json({
      success: true,
      data: { order },
    });
  } catch (error: any) {
    console.error('cancelOrder error:', error);

    if (error.message === 'CANNOT_CANCEL') {
      res.status(403).json({
        success: false,
        error: { code: 'CANNOT_CANCEL', message: 'შეკვეთის გაუქმება შეუძლებელია' },
      });
      return;
    }

    if (error.message === 'INVALID_STATUS_TRANSITION') {
      res.status(400).json({
        success: false,
        error: { code: 'INVALID_STATUS', message: 'შეკვეთა უკვე დასრულებულია ან გაუქმებულია' },
      });
      return;
    }

    res.status(500).json({
      success: false,
      error: { code: 'SERVER_ERROR', message: 'სერვერის შეცდომა' },
    });
  }
}

// ==================== RESTAURANT DASHBOARD ENDPOINTS ====================

// GET /api/v1/restaurant/orders - რესტორნის შეკვეთები
export async function getRestaurantOrders(req: Request, res: Response): Promise<void> {
  try {
    const validation = paginationSchema.safeParse(req.query);

    if (!validation.success) {
      res.status(400).json({
        success: false,
        error: {
          code: 'VALIDATION_ERROR',
          message: validation.error.errors[0].message,
        },
      });
      return;
    }

    // Get restaurantId from authenticated restaurant admin
    const restaurantId = req.user?.restaurantId;

    if (!restaurantId) {
      res.status(403).json({
        success: false,
        error: { code: 'MISSING_RESTAURANT', message: 'რესტორანი არ არის მინიჭებული თქვენს ანგარიშზე' },
      });
      return;
    }

    const result = await orderService.getRestaurantOrders(restaurantId, validation.data);

    res.json({
      success: true,
      data: result,
    });
  } catch (error) {
    console.error('getRestaurantOrders error:', error);
    res.status(500).json({
      success: false,
      error: { code: 'SERVER_ERROR', message: 'სერვერის შეცდომა' },
    });
  }
}

// PUT /api/v1/restaurant/orders/:id/status - სტატუსის ცვლილება
export async function updateOrderStatus(req: Request, res: Response): Promise<void> {
  try {
    const { id } = req.params;
    const validation = updateStatusSchema.safeParse(req.body);

    if (!validation.success) {
      res.status(400).json({
        success: false,
        error: {
          code: 'VALIDATION_ERROR',
          message: validation.error.errors[0].message,
        },
      });
      return;
    }

    const order = await orderService.updateOrderStatus(id, validation.data.status);

    if (!order) {
      res.status(404).json({
        success: false,
        error: { code: 'NOT_FOUND', message: 'შეკვეთა ვერ მოიძებნა' },
      });
      return;
    }

    // Emit order status update via socket
    emitOrderUpdate(id, order);

    // If order is READY, notify all available drivers
    if (validation.data.status === 'READY') {
      emitOrderReady(order);
    }

    res.json({
      success: true,
      data: { order },
    });
  } catch (error: any) {
    console.error('updateOrderStatus error:', error);

    if (error.message === 'INVALID_STATUS_TRANSITION') {
      res.status(400).json({
        success: false,
        error: { code: 'INVALID_TRANSITION', message: 'არასწორი სტატუსის გადასვლა' },
      });
      return;
    }

    res.status(500).json({
      success: false,
      error: { code: 'SERVER_ERROR', message: 'სერვერის შეცდომა' },
    });
  }
}
