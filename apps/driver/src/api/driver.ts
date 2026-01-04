import apiClient from "./client";

export type DriverStatus = "ONLINE" | "OFFLINE" | "BUSY";

export type OrderStatus =
  | "PENDING"
  | "ACCEPTED"
  | "PREPARING"
  | "READY"
  | "DRIVER_ASSIGNED"
  | "PICKED_UP"
  | "DELIVERING"
  | "DELIVERED"
  | "CANCELLED";

export interface OrderItem {
  id: string;
  name: string;
  quantity: number;
  price: number;
  notes: string | null;
  menuItem?: {
    id: string;
    name: string;
    imageUrl: string | null;
  };
}

export interface Order {
  id: string;
  orderNumber: string;
  status: OrderStatus;
  subtotal: number;
  deliveryFee: number;
  totalAmount: number;
  deliveryAddress: string;
  deliveryLat: number;
  deliveryLng: number;
  customerNotes: string | null;
  createdAt: string;
  updatedAt: string;
  restaurant: {
    id: string;
    name: string;
    imageUrl: string | null;
    address: string;
    lat: number;
    lng: number;
    phone: string | null;
  };
  customer: {
    id: string;
    name: string | null;
    phone: string;
  };
  items: OrderItem[];
}

export interface UpdateStatusResponse {
  success: boolean;
  data: {
    id: string;
    status: DriverStatus;
  };
}

export interface UpdateLocationResponse {
  success: boolean;
  message: string;
}

export interface OrdersResponse {
  success: boolean;
  data: Order[];
  pagination?: {
    page: number;
    limit: number;
    total: number;
    pages: number;
  };
}

export interface OrderResponse {
  success: boolean;
  data: Order;
}

// Update driver status (online/offline)
export const updateDriverStatus = async (
  status: DriverStatus
): Promise<UpdateStatusResponse> => {
  const isOnline = status === "ONLINE" || status === "BUSY";
  const response = await apiClient.put("/driver/status", { isOnline });
  return response.data;
};

// Update driver location
export const updateDriverLocation = async (
  lat: number,
  lng: number
): Promise<UpdateLocationResponse> => {
  const response = await apiClient.put("/driver/location", { lat, lng });
  return response.data;
};

// Get available orders (READY status)
export const getAvailableOrders = async (): Promise<OrdersResponse> => {
  const response = await apiClient.get("/driver/orders");
  // Backend returns { success, data: { orders } }, normalize to { success, data: orders }
  return {
    success: response.data.success,
    data: response.data.data.orders || [],
  };
};

// Get my active orders
export const getMyOrders = async (): Promise<OrdersResponse> => {
  const response = await apiClient.get("/driver/orders/my");
  // Backend returns { success, data: { orders } }, normalize to { success, data: orders }
  return {
    success: response.data.success,
    data: response.data.data.orders || [],
  };
};

// Get order history
export const getOrderHistory = async (params?: {
  page?: number;
  limit?: number;
}): Promise<OrdersResponse> => {
  const response = await apiClient.get("/driver/orders/history", { params });
  // Backend returns { success, data: { orders, pagination } }
  return {
    success: response.data.success,
    data: response.data.data.orders || [],
    pagination: response.data.data.pagination,
  };
};

// Accept an order
export const acceptOrder = async (orderId: string): Promise<OrderResponse> => {
  const response = await apiClient.post(`/driver/orders/${orderId}/accept`);
  return {
    success: response.data.success,
    data: response.data.data.order,
  };
};

// Mark order as picked up
export const pickUpOrder = async (orderId: string): Promise<OrderResponse> => {
  const response = await apiClient.put(`/driver/orders/${orderId}/picked-up`);
  return {
    success: response.data.success,
    data: response.data.data.order,
  };
};

// Start delivering
export const startDelivering = async (orderId: string): Promise<OrderResponse> => {
  const response = await apiClient.put(`/driver/orders/${orderId}/delivering`);
  return {
    success: response.data.success,
    data: response.data.data.order,
  };
};

// Mark order as delivered
export const deliverOrder = async (orderId: string): Promise<OrderResponse> => {
  const response = await apiClient.put(`/driver/orders/${orderId}/delivered`);
  return {
    success: response.data.success,
    data: response.data.data.order,
  };
};
