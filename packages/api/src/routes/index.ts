import { Router } from 'express';
import { authRoutes } from './auth.routes.js';
import { restaurantRoutes, restaurantDashboardRoutes } from './restaurant.routes.js';
import { orderRoutes, orderDashboardRoutes } from './order.routes.js';

const router = Router();

// API info
router.get('/', (req, res) => {
  res.json({
    name: 'MTREDEBI API',
    version: '1.0.0',
    endpoints: {
      auth: '/api/v1/auth',
      restaurants: '/api/v1/restaurants',
      orders: '/api/v1/orders',
      driver: '/api/v1/driver',
      restaurant: '/api/v1/restaurant',
      admin: '/api/v1/admin',
    },
  });
});

// Routes
router.use('/auth', authRoutes);
router.use('/restaurants', restaurantRoutes);
router.use('/restaurant', restaurantDashboardRoutes);
router.use('/restaurant', orderDashboardRoutes);
router.use('/orders', orderRoutes);
// router.use('/driver', driverRoutes);
// router.use('/admin', adminRoutes);

export { router };
