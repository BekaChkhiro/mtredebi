import { Router } from 'express';
import * as restaurantController from '../controllers/restaurant.controller.js';
import { authenticate, requireRestaurantAdmin } from '../middleware/auth.middleware.js';

const router = Router();

// ==================== PUBLIC ROUTES ====================

// Get all restaurants (with pagination & search)
router.get('/', restaurantController.getRestaurants);

// Get single restaurant with full menu
router.get('/:id', restaurantController.getRestaurant);

// ==================== RESTAURANT ADMIN ROUTES ====================

// These routes are under /api/v1/restaurant (singular) for restaurant dashboard
const dashboardRouter = Router();

// Category management
dashboardRouter.post('/categories', authenticate, requireRestaurantAdmin, restaurantController.addCategory);
dashboardRouter.put('/categories/:id', authenticate, requireRestaurantAdmin, restaurantController.updateCategory);
dashboardRouter.delete('/categories/:id', authenticate, requireRestaurantAdmin, restaurantController.deleteCategory);

// Menu item management
dashboardRouter.post('/menu', authenticate, requireRestaurantAdmin, restaurantController.addMenuItem);
dashboardRouter.put('/menu/:id', authenticate, requireRestaurantAdmin, restaurantController.updateMenuItem);
dashboardRouter.delete('/menu/:id', authenticate, requireRestaurantAdmin, restaurantController.deleteMenuItem);

export { router as restaurantRoutes, dashboardRouter as restaurantDashboardRoutes };
