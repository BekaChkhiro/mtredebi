import { PrismaClient, Restaurant, Category, MenuItem } from '@prisma/client';

const prisma = new PrismaClient();

// ==================== RESTAURANT QUERIES ====================

interface WorkingHoursData {
  dayOfWeek: number;
  openTime: string;
  closeTime: string;
  isClosed: boolean;
}

interface RestaurantWithDetails extends Restaurant {
  categories: (Category & {
    menuItems: MenuItem[];
  })[];
  workingHours: WorkingHoursData[];
}

interface GetRestaurantsOptions {
  page?: number;
  limit?: number;
  search?: string;
  isActive?: boolean;
}

// Get all restaurants (public list)
export async function getRestaurants(options: GetRestaurantsOptions = {}) {
  const { page = 1, limit = 20, search, isActive = true } = options;
  const skip = (page - 1) * limit;

  const where: any = { isActive };

  if (search) {
    where.OR = [
      { name: { contains: search, mode: 'insensitive' } },
      { description: { contains: search, mode: 'insensitive' } },
    ];
  }

  const [restaurants, total] = await Promise.all([
    prisma.restaurant.findMany({
      where,
      skip,
      take: limit,
      orderBy: { name: 'asc' },
      select: {
        id: true,
        name: true,
        description: true,
        address: true,
        imageUrl: true,
        isActive: true,
        minOrderAmount: true,
        deliveryFee: true,
        avgPrepTime: true,
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

// Get restaurant by ID with full menu
export async function getRestaurantById(
  id: string
): Promise<RestaurantWithDetails | null> {
  return prisma.restaurant.findUnique({
    where: { id },
    include: {
      categories: {
        where: { isActive: true },
        orderBy: { sortOrder: 'asc' },
        include: {
          menuItems: {
            where: { isAvailable: true },
            orderBy: { sortOrder: 'asc' },
          },
        },
      },
      workingHours: {
        orderBy: { dayOfWeek: 'asc' },
      },
    },
  });
}

// Check if restaurant is currently open
export function isRestaurantOpen(
  workingHours: { dayOfWeek: number; openTime: string; closeTime: string; isClosed: boolean }[]
): boolean {
  const now = new Date();
  const currentDay = now.getDay(); // 0 = Sunday
  const currentTime = `${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')}`;

  const todayHours = workingHours.find((h) => h.dayOfWeek === currentDay);

  if (!todayHours || todayHours.isClosed) {
    return false;
  }

  return currentTime >= todayHours.openTime && currentTime <= todayHours.closeTime;
}

// ==================== RESTAURANT ADMIN OPERATIONS ====================

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

// Create new restaurant (admin only)
export async function createRestaurant(
  data: CreateRestaurantInput
): Promise<Restaurant> {
  return prisma.restaurant.create({
    data: {
      ...data,
      minOrderAmount: data.minOrderAmount ?? 0,
      deliveryFee: data.deliveryFee ?? 0,
      avgPrepTime: data.avgPrepTime ?? 30,
    },
  });
}

// Update restaurant
export async function updateRestaurant(
  id: string,
  data: Partial<CreateRestaurantInput & { isActive: boolean }>
): Promise<Restaurant | null> {
  try {
    return await prisma.restaurant.update({
      where: { id },
      data,
    });
  } catch {
    return null;
  }
}

// ==================== MENU OPERATIONS ====================

interface CreateCategoryInput {
  name: string;
  sortOrder?: number;
}

// Add category to restaurant
export async function addCategory(
  restaurantId: string,
  data: CreateCategoryInput
): Promise<Category> {
  return prisma.category.create({
    data: {
      restaurantId,
      name: data.name,
      sortOrder: data.sortOrder ?? 0,
    },
  });
}

// Update category
export async function updateCategory(
  categoryId: string,
  data: Partial<CreateCategoryInput & { isActive: boolean }>
): Promise<Category | null> {
  try {
    return await prisma.category.update({
      where: { id: categoryId },
      data,
    });
  } catch {
    return null;
  }
}

// Delete category
export async function deleteCategory(categoryId: string): Promise<boolean> {
  try {
    await prisma.category.delete({
      where: { id: categoryId },
    });
    return true;
  } catch {
    return false;
  }
}

interface CreateMenuItemInput {
  name: string;
  description?: string;
  price: number;
  imageUrl?: string;
  sortOrder?: number;
}

// Add menu item to category
export async function addMenuItem(
  categoryId: string,
  data: CreateMenuItemInput
): Promise<MenuItem> {
  return prisma.menuItem.create({
    data: {
      categoryId,
      name: data.name,
      description: data.description,
      price: data.price,
      imageUrl: data.imageUrl,
      sortOrder: data.sortOrder ?? 0,
    },
  });
}

// Update menu item
export async function updateMenuItem(
  menuItemId: string,
  data: Partial<CreateMenuItemInput & { isAvailable: boolean }>
): Promise<MenuItem | null> {
  try {
    return await prisma.menuItem.update({
      where: { id: menuItemId },
      data,
    });
  } catch {
    return null;
  }
}

// Delete menu item
export async function deleteMenuItem(menuItemId: string): Promise<boolean> {
  try {
    await prisma.menuItem.delete({
      where: { id: menuItemId },
    });
    return true;
  } catch {
    return false;
  }
}

// Get category with restaurant info (for permission checks)
export async function getCategoryWithRestaurant(categoryId: string) {
  return prisma.category.findUnique({
    where: { id: categoryId },
    include: { restaurant: true },
  });
}

// Get menu item with full hierarchy (for permission checks)
export async function getMenuItemWithRestaurant(menuItemId: string) {
  return prisma.menuItem.findUnique({
    where: { id: menuItemId },
    include: {
      category: {
        include: { restaurant: true },
      },
    },
  });
}
