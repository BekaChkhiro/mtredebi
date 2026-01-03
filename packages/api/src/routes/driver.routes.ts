import { Router } from 'express';
import * as driverController from '../controllers/driver.controller.js';
import { authenticate, requireDriver } from '../middleware/auth.middleware.js';

const router = Router();

// All routes require authentication and driver role

// ==================== DRIVER STATUS ROUTES ====================

// Update online/offline status
router.put('/status', authenticate, requireDriver, driverController.updateStatus);

// Update current location
router.put('/location', authenticate, requireDriver, driverController.updateLocation);

// ==================== DRIVER ORDER ROUTES ====================

// Get available orders (ready for pickup)
router.get('/orders', authenticate, requireDriver, driverController.getAvailableOrders);

// Get my active orders
router.get('/orders/my', authenticate, requireDriver, driverController.getMyOrders);

// Get order history
router.get('/orders/history', authenticate, requireDriver, driverController.getOrderHistory);

// Accept order
router.post('/orders/:id/accept', authenticate, requireDriver, driverController.acceptOrder);

// Mark order as picked up from restaurant
router.put('/orders/:id/picked-up', authenticate, requireDriver, driverController.pickUpOrder);

// Mark order as delivering (started delivery)
router.put('/orders/:id/delivering', authenticate, requireDriver, driverController.startDelivering);

// Mark order as delivered
router.put('/orders/:id/delivered', authenticate, requireDriver, driverController.deliverOrder);

export { router as driverRoutes };
