import { Request, Response } from 'express';
import { z } from 'zod';
import * as restaurantService from '../services/restaurant.service.js';
import * as uploadService from '../services/upload.service.js';

// ==================== VALIDATION SCHEMAS ====================

const paginationSchema = z.object({
  page: z.coerce.number().int().positive().optional(),
  limit: z.coerce.number().int().min(1).max(100).optional(),
  search: z.string().optional(),
});

const createCategorySchema = z.object({
  name: z.string().min(1, 'კატეგორიის სახელი სავალდებულოა').max(100),
  sortOrder: z.number().int().optional(),
});

const updateCategorySchema = z.object({
  name: z.string().min(1).max(100).optional(),
  sortOrder: z.number().int().optional(),
  isActive: z.boolean().optional(),
});

const createMenuItemSchema = z.object({
  name: z.string().min(1, 'პროდუქტის სახელი სავალდებულოა').max(100),
  description: z.string().max(500).optional(),
  price: z.number().positive('ფასი უნდა იყოს დადებითი'),
  imageUrl: z.string().url().optional(),
  sortOrder: z.number().int().optional(),
});

const updateMenuItemSchema = z.object({
  name: z.string().min(1).max(100).optional(),
  description: z.string().max(500).optional(),
  price: z.number().positive().optional(),
  imageUrl: z.string().url().optional(),
  sortOrder: z.number().int().optional(),
  isAvailable: z.boolean().optional(),
});

// ==================== PUBLIC ENDPOINTS ====================

// GET /api/v1/restaurants
export async function getRestaurants(req: Request, res: Response): Promise<void> {
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

    const result = await restaurantService.getRestaurants(validation.data);

    res.json({
      success: true,
      data: result,
    });
  } catch (error) {
    console.error('getRestaurants error:', error);
    res.status(500).json({
      success: false,
      error: { code: 'SERVER_ERROR', message: 'სერვერის შეცდომა' },
    });
  }
}

// GET /api/v1/restaurants/:id
export async function getRestaurant(req: Request, res: Response): Promise<void> {
  try {
    const { id } = req.params;
    const restaurant = await restaurantService.getRestaurantById(id);

    if (!restaurant) {
      res.status(404).json({
        success: false,
        error: { code: 'NOT_FOUND', message: 'რესტორანი ვერ მოიძებნა' },
      });
      return;
    }

    // Check if currently open
    const isOpen = restaurant.workingHours
      ? restaurantService.isRestaurantOpen(restaurant.workingHours)
      : false;

    res.json({
      success: true,
      data: {
        restaurant: {
          ...restaurant,
          isOpen,
        },
      },
    });
  } catch (error) {
    console.error('getRestaurant error:', error);
    res.status(500).json({
      success: false,
      error: { code: 'SERVER_ERROR', message: 'სერვერის შეცდომა' },
    });
  }
}

// ==================== RESTAURANT ADMIN ENDPOINTS ====================

// POST /api/v1/restaurant/categories
export async function addCategory(req: Request, res: Response): Promise<void> {
  try {
    const validation = createCategorySchema.safeParse(req.body);

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

    // Get restaurantId from authenticated user
    const restaurantId = req.user?.restaurantId;

    if (!restaurantId) {
      res.status(403).json({
        success: false,
        error: { code: 'NO_RESTAURANT', message: 'რესტორანი არ არის მინიჭებული' },
      });
      return;
    }

    const category = await restaurantService.addCategory(restaurantId, validation.data);

    res.status(201).json({
      success: true,
      data: { category },
    });
  } catch (error) {
    console.error('addCategory error:', error);
    res.status(500).json({
      success: false,
      error: { code: 'SERVER_ERROR', message: 'სერვერის შეცდომა' },
    });
  }
}

// PUT /api/v1/restaurant/categories/:id
export async function updateCategory(req: Request, res: Response): Promise<void> {
  try {
    const { id } = req.params;
    const validation = updateCategorySchema.safeParse(req.body);

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

    const category = await restaurantService.updateCategory(id, validation.data);

    if (!category) {
      res.status(404).json({
        success: false,
        error: { code: 'NOT_FOUND', message: 'კატეგორია ვერ მოიძებნა' },
      });
      return;
    }

    res.json({
      success: true,
      data: { category },
    });
  } catch (error) {
    console.error('updateCategory error:', error);
    res.status(500).json({
      success: false,
      error: { code: 'SERVER_ERROR', message: 'სერვერის შეცდომა' },
    });
  }
}

// DELETE /api/v1/restaurant/categories/:id
export async function deleteCategory(req: Request, res: Response): Promise<void> {
  try {
    const { id } = req.params;
    const deleted = await restaurantService.deleteCategory(id);

    if (!deleted) {
      res.status(404).json({
        success: false,
        error: { code: 'NOT_FOUND', message: 'კატეგორია ვერ მოიძებნა' },
      });
      return;
    }

    res.json({
      success: true,
      data: { message: 'კატეგორია წაიშალა' },
    });
  } catch (error) {
    console.error('deleteCategory error:', error);
    res.status(500).json({
      success: false,
      error: { code: 'SERVER_ERROR', message: 'სერვერის შეცდომა' },
    });
  }
}

// POST /api/v1/restaurant/menu
export async function addMenuItem(req: Request, res: Response): Promise<void> {
  try {
    const validation = createMenuItemSchema.safeParse(req.body);

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

    const categoryId = req.body.categoryId;

    if (!categoryId) {
      res.status(400).json({
        success: false,
        error: { code: 'MISSING_CATEGORY', message: 'categoryId სავალდებულოა' },
      });
      return;
    }

    // Verify category exists
    const category = await restaurantService.getCategoryWithRestaurant(categoryId);
    if (!category) {
      res.status(404).json({
        success: false,
        error: { code: 'NOT_FOUND', message: 'კატეგორია ვერ მოიძებნა' },
      });
      return;
    }

    const menuItem = await restaurantService.addMenuItem(categoryId, validation.data);

    res.status(201).json({
      success: true,
      data: { menuItem },
    });
  } catch (error) {
    console.error('addMenuItem error:', error);
    res.status(500).json({
      success: false,
      error: { code: 'SERVER_ERROR', message: 'სერვერის შეცდომა' },
    });
  }
}

// PUT /api/v1/restaurant/menu/:id
export async function updateMenuItem(req: Request, res: Response): Promise<void> {
  try {
    const { id } = req.params;
    const validation = updateMenuItemSchema.safeParse(req.body);

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

    const menuItem = await restaurantService.updateMenuItem(id, validation.data);

    if (!menuItem) {
      res.status(404).json({
        success: false,
        error: { code: 'NOT_FOUND', message: 'პროდუქტი ვერ მოიძებნა' },
      });
      return;
    }

    res.json({
      success: true,
      data: { menuItem },
    });
  } catch (error) {
    console.error('updateMenuItem error:', error);
    res.status(500).json({
      success: false,
      error: { code: 'SERVER_ERROR', message: 'სერვერის შეცდომა' },
    });
  }
}

// DELETE /api/v1/restaurant/menu/:id
export async function deleteMenuItem(req: Request, res: Response): Promise<void> {
  try {
    const { id } = req.params;
    const deleted = await restaurantService.deleteMenuItem(id);

    if (!deleted) {
      res.status(404).json({
        success: false,
        error: { code: 'NOT_FOUND', message: 'პროდუქტი ვერ მოიძებნა' },
      });
      return;
    }

    res.json({
      success: true,
      data: { message: 'პროდუქტი წაიშალა' },
    });
  } catch (error) {
    console.error('deleteMenuItem error:', error);
    res.status(500).json({
      success: false,
      error: { code: 'SERVER_ERROR', message: 'სერვერის შეცდომა' },
    });
  }
}

// ==================== IMAGE UPLOAD ENDPOINTS ====================

// POST /api/v1/restaurant/upload/image
export async function uploadRestaurantImage(req: Request, res: Response): Promise<void> {
  try {
    if (!req.file) {
      res.status(400).json({
        success: false,
        error: { code: 'NO_FILE', message: 'სურათი არ არის ატვირთული' },
      });
      return;
    }

    const restaurantId = req.user?.restaurantId;
    if (!restaurantId) {
      res.status(403).json({
        success: false,
        error: { code: 'NO_RESTAURANT', message: 'რესტორანი არ არის მინიჭებული' },
      });
      return;
    }

    // Get current restaurant to delete old image
    const restaurant = await restaurantService.getRestaurantById(restaurantId);
    if (!restaurant) {
      res.status(404).json({
        success: false,
        error: { code: 'NOT_FOUND', message: 'რესტორანი ვერ მოიძებნა' },
      });
      return;
    }

    // Upload new image
    const { url } = await uploadService.uploadAndReplace(
      req.file,
      'restaurants',
      restaurant.imageUrl
    );

    // Update restaurant
    const updatedRestaurant = await restaurantService.updateRestaurant(restaurantId, {
      imageUrl: url,
    });

    res.json({
      success: true,
      data: {
        imageUrl: url,
        restaurant: updatedRestaurant,
      },
    });
  } catch (error) {
    console.error('uploadRestaurantImage error:', error);
    res.status(500).json({
      success: false,
      error: { code: 'SERVER_ERROR', message: 'სურათის ატვირთვა ვერ მოხერხდა' },
    });
  }
}

// POST /api/v1/restaurant/upload/cover
export async function uploadRestaurantCover(req: Request, res: Response): Promise<void> {
  try {
    if (!req.file) {
      res.status(400).json({
        success: false,
        error: { code: 'NO_FILE', message: 'სურათი არ არის ატვირთული' },
      });
      return;
    }

    const restaurantId = req.user?.restaurantId;
    if (!restaurantId) {
      res.status(403).json({
        success: false,
        error: { code: 'NO_RESTAURANT', message: 'რესტორანი არ არის მინიჭებული' },
      });
      return;
    }

    // Get current restaurant to delete old image
    const restaurant = await restaurantService.getRestaurantById(restaurantId);
    if (!restaurant) {
      res.status(404).json({
        success: false,
        error: { code: 'NOT_FOUND', message: 'რესტორანი ვერ მოიძებნა' },
      });
      return;
    }

    // Upload new image
    const { url } = await uploadService.uploadAndReplace(
      req.file,
      'restaurants',
      restaurant.coverImageUrl
    );

    // Update restaurant
    const updatedRestaurant = await restaurantService.updateRestaurant(restaurantId, {
      coverImageUrl: url,
    });

    res.json({
      success: true,
      data: {
        coverImageUrl: url,
        restaurant: updatedRestaurant,
      },
    });
  } catch (error) {
    console.error('uploadRestaurantCover error:', error);
    res.status(500).json({
      success: false,
      error: { code: 'SERVER_ERROR', message: 'სურათის ატვირთვა ვერ მოხერხდა' },
    });
  }
}

// POST /api/v1/restaurant/menu/:id/upload
export async function uploadMenuItemImage(req: Request, res: Response): Promise<void> {
  try {
    if (!req.file) {
      res.status(400).json({
        success: false,
        error: { code: 'NO_FILE', message: 'სურათი არ არის ატვირთული' },
      });
      return;
    }

    const { id } = req.params;

    // Get current menu item to delete old image
    const menuItem = await restaurantService.getMenuItemWithRestaurant(id);
    if (!menuItem) {
      res.status(404).json({
        success: false,
        error: { code: 'NOT_FOUND', message: 'პროდუქტი ვერ მოიძებნა' },
      });
      return;
    }

    // Upload new image
    const { url } = await uploadService.uploadAndReplace(
      req.file,
      'menu-items',
      menuItem.imageUrl
    );

    // Update menu item
    const updatedMenuItem = await restaurantService.updateMenuItem(id, {
      imageUrl: url,
    });

    res.json({
      success: true,
      data: {
        imageUrl: url,
        menuItem: updatedMenuItem,
      },
    });
  } catch (error) {
    console.error('uploadMenuItemImage error:', error);
    res.status(500).json({
      success: false,
      error: { code: 'SERVER_ERROR', message: 'სურათის ატვირთვა ვერ მოხერხდა' },
    });
  }
}
