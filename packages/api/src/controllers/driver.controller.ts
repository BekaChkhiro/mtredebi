import { Request, Response } from 'express';
import { z } from 'zod';
import * as driverService from '../services/driver.service.js';
import { emitOrderUpdate, emitDriverAssigned } from '../socket/index.js';

// ==================== VALIDATION SCHEMAS ====================

const updateStatusSchema = z.object({
  isOnline: z.boolean(),
});

const updateLocationSchema = z.object({
  lat: z.number().min(-90).max(90),
  lng: z.number().min(-180).max(180),
});

const paginationSchema = z.object({
  page: z.coerce.number().int().positive().optional(),
  limit: z.coerce.number().int().min(1).max(100).optional(),
});

// ==================== DRIVER STATUS ENDPOINTS ====================

// PUT /api/v1/driver/status - ონლაინ/ოფლაინ სტატუსი
export async function updateStatus(req: Request, res: Response): Promise<void> {
  try {
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

    const userId = req.user!.id;
    const driver = await driverService.updateOnlineStatus(userId, validation.data.isOnline);

    res.json({
      success: true,
      data: { driver },
    });
  } catch (error) {
    console.error('updateStatus error:', error);
    res.status(500).json({
      success: false,
      error: { code: 'SERVER_ERROR', message: 'სერვერის შეცდომა' },
    });
  }
}

// PUT /api/v1/driver/location - ლოკაციის განახლება
export async function updateLocation(req: Request, res: Response): Promise<void> {
  try {
    const validation = updateLocationSchema.safeParse(req.body);

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

    const userId = req.user!.id;
    const driver = await driverService.updateLocation(userId, validation.data.lat, validation.data.lng);

    res.json({
      success: true,
      data: { driver },
    });
  } catch (error) {
    console.error('updateLocation error:', error);
    res.status(500).json({
      success: false,
      error: { code: 'SERVER_ERROR', message: 'სერვერის შეცდომა' },
    });
  }
}

// ==================== DRIVER ORDER ENDPOINTS ====================

// GET /api/v1/driver/orders - ხელმისაწვდომი შეკვეთები
export async function getAvailableOrders(req: Request, res: Response): Promise<void> {
  try {
    const userId = req.user!.id;
    const driver = await driverService.getOrCreateDriver(userId);
    const orders = await driverService.getAvailableOrders(driver.id);

    res.json({
      success: true,
      data: { orders },
    });
  } catch (error) {
    console.error('getAvailableOrders error:', error);
    res.status(500).json({
      success: false,
      error: { code: 'SERVER_ERROR', message: 'სერვერის შეცდომა' },
    });
  }
}

// GET /api/v1/driver/orders/my - მძღოლის აქტიური შეკვეთები
export async function getMyOrders(req: Request, res: Response): Promise<void> {
  try {
    const userId = req.user!.id;
    const orders = await driverService.getMyOrders(userId);

    res.json({
      success: true,
      data: { orders },
    });
  } catch (error) {
    console.error('getMyOrders error:', error);
    res.status(500).json({
      success: false,
      error: { code: 'SERVER_ERROR', message: 'სერვერის შეცდომა' },
    });
  }
}

// GET /api/v1/driver/orders/history - მძღოლის შეკვეთების ისტორია
export async function getOrderHistory(req: Request, res: Response): Promise<void> {
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

    const userId = req.user!.id;
    const { page, limit } = validation.data;
    const result = await driverService.getOrderHistory(userId, page, limit);

    res.json({
      success: true,
      data: result,
    });
  } catch (error) {
    console.error('getOrderHistory error:', error);
    res.status(500).json({
      success: false,
      error: { code: 'SERVER_ERROR', message: 'სერვერის შეცდომა' },
    });
  }
}

// POST /api/v1/driver/orders/:id/accept - შეკვეთის მიღება
export async function acceptOrder(req: Request, res: Response): Promise<void> {
  try {
    const { id } = req.params;
    const userId = req.user!.id;
    const order = await driverService.acceptOrder(userId, id);

    // Get driver info for socket event
    const driver = await driverService.getOrCreateDriver(userId);

    // Emit driver assigned event
    emitDriverAssigned(id, driver);
    emitOrderUpdate(id, order);

    res.json({
      success: true,
      data: { order },
    });
  } catch (error: any) {
    console.error('acceptOrder error:', error);

    const errorMessages: Record<string, { status: number; code: string; message: string }> = {
      ORDER_NOT_FOUND: { status: 404, code: 'ORDER_NOT_FOUND', message: 'შეკვეთა ვერ მოიძებნა' },
      ORDER_NOT_READY: { status: 400, code: 'ORDER_NOT_READY', message: 'შეკვეთა ჯერ არ არის მზად' },
      ORDER_ALREADY_TAKEN: { status: 400, code: 'ORDER_ALREADY_TAKEN', message: 'შეკვეთა უკვე აიღო სხვა მძღოლმა' },
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

// PUT /api/v1/driver/orders/:id/picked-up - შეკვეთა აიღო რესტორნიდან
export async function pickUpOrder(req: Request, res: Response): Promise<void> {
  try {
    const { id } = req.params;
    const userId = req.user!.id;
    const order = await driverService.pickUpOrder(userId, id);

    // Emit order update via socket
    emitOrderUpdate(id, order);

    res.json({
      success: true,
      data: { order },
    });
  } catch (error: any) {
    console.error('pickUpOrder error:', error);

    const errorMessages: Record<string, { status: number; code: string; message: string }> = {
      ORDER_NOT_FOUND: { status: 404, code: 'ORDER_NOT_FOUND', message: 'შეკვეთა ვერ მოიძებნა' },
      NOT_YOUR_ORDER: { status: 403, code: 'NOT_YOUR_ORDER', message: 'ეს თქვენი შეკვეთა არ არის' },
      INVALID_STATUS: { status: 400, code: 'INVALID_STATUS', message: 'შეკვეთის სტატუსი არასწორია' },
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

// PUT /api/v1/driver/orders/:id/delivering - მიტანა დაიწყო
export async function startDelivering(req: Request, res: Response): Promise<void> {
  try {
    const { id } = req.params;
    const userId = req.user!.id;
    const order = await driverService.startDelivering(userId, id);

    // Emit order update via socket
    emitOrderUpdate(id, order);

    res.json({
      success: true,
      data: { order },
    });
  } catch (error: any) {
    console.error('startDelivering error:', error);

    const errorMessages: Record<string, { status: number; code: string; message: string }> = {
      ORDER_NOT_FOUND: { status: 404, code: 'ORDER_NOT_FOUND', message: 'შეკვეთა ვერ მოიძებნა' },
      NOT_YOUR_ORDER: { status: 403, code: 'NOT_YOUR_ORDER', message: 'ეს თქვენი შეკვეთა არ არის' },
      INVALID_STATUS: { status: 400, code: 'INVALID_STATUS', message: 'შეკვეთის სტატუსი არასწორია' },
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

// PUT /api/v1/driver/orders/:id/delivered - მიტანილი
export async function deliverOrder(req: Request, res: Response): Promise<void> {
  try {
    const { id } = req.params;
    const userId = req.user!.id;
    const order = await driverService.deliverOrder(userId, id);

    // Emit order update via socket
    emitOrderUpdate(id, order);

    res.json({
      success: true,
      data: { order },
    });
  } catch (error: any) {
    console.error('deliverOrder error:', error);

    const errorMessages: Record<string, { status: number; code: string; message: string }> = {
      ORDER_NOT_FOUND: { status: 404, code: 'ORDER_NOT_FOUND', message: 'შეკვეთა ვერ მოიძებნა' },
      NOT_YOUR_ORDER: { status: 403, code: 'NOT_YOUR_ORDER', message: 'ეს თქვენი შეკვეთა არ არის' },
      INVALID_STATUS: { status: 400, code: 'INVALID_STATUS', message: 'შეკვეთის სტატუსი არასწორია' },
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
