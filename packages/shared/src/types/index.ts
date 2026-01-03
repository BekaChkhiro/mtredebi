// User types
export type UserRole = 'CUSTOMER' | 'DRIVER' | 'RESTAURANT_ADMIN' | 'ADMIN';

export interface User {
  id: string;
  phone: string;
  name: string | null;
  avatarUrl: string | null;
  role: UserRole;
}

// Order types
export type OrderStatus =
  | 'PENDING'
  | 'ACCEPTED'
  | 'PREPARING'
  | 'READY'
  | 'DRIVER_ASSIGNED'
  | 'PICKED_UP'
  | 'DELIVERING'
  | 'DELIVERED'
  | 'CANCELLED';

export interface OrderItem {
  id: string;
  menuItemId: string;
  name: string;
  price: number;
  quantity: number;
  notes?: string;
}

export interface Order {
  id: string;
  orderNumber: string;
  status: OrderStatus;
  items: OrderItem[];
  subtotal: number;
  deliveryFee: number;
  totalAmount: number;
  deliveryAddress: string;
  customerNotes?: string;
  createdAt: string;
}

// Restaurant types
export interface Restaurant {
  id: string;
  name: string;
  description: string | null;
  address: string;
  lat: number;
  lng: number;
  phone: string;
  imageUrl: string | null;
  coverImageUrl: string | null;
  minOrderAmount: number;
  deliveryFee: number;
  avgPrepTime: number;
  isActive: boolean;
}

export interface MenuItem {
  id: string;
  categoryId: string;
  name: string;
  description: string | null;
  price: number;
  imageUrl: string | null;
  isAvailable: boolean;
}

export interface Category {
  id: string;
  name: string;
  sortOrder: number;
  items: MenuItem[];
}

// API Response types
export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  error?: {
    code: string;
    message: string;
  };
}

// Socket event types
export interface DriverLocation {
  lat: number;
  lng: number;
}

export interface OrderUpdateEvent {
  orderId: string;
  status: OrderStatus;
  driver?: {
    id: string;
    name: string;
    phone: string;
    lat?: number;
    lng?: number;
  };
}
