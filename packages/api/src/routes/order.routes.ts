import { Router } from 'express';
import * as orderController from '../controllers/order.controller.js';
import { authenticate, requireRestaurantAdmin } from '../middleware/auth.middleware.js';

const router = Router();

// ==================== CUSTOMER ORDER ROUTES ====================
// All routes require authentication

// Create new order
router.post('/', authenticate, orderController.createOrder);

// Get my orders (with pagination)
router.get('/', authenticate, orderController.getMyOrders);

// Get specific order
router.get('/:id', authenticate, orderController.getOrder);

// Cancel order (customers can only cancel pending orders)
router.put('/:id/cancel', authenticate, orderController.cancelOrder);

// ==================== RESTAURANT DASHBOARD ORDER ROUTES ====================
// Under /api/v1/restaurant/orders

const dashboardRouter = Router();

// Get restaurant orders
dashboardRouter.get('/orders', authenticate, requireRestaurantAdmin, orderController.getRestaurantOrders);

// Update order status
dashboardRouter.put('/orders/:id/status', authenticate, requireRestaurantAdmin, orderController.updateOrderStatus);

export { router as orderRoutes, dashboardRouter as orderDashboardRoutes };
