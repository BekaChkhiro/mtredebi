import apiClient from "./client";

export interface OrderItem {
  id: string;
  name: string;
  price: number;
  quantity: number;
  notes: string | null;
}

export interface Order {
  id: string;
  orderNumber: string;
  status: string;
  subtotal: number;
  deliveryFee: number;
  totalAmount: number;
  deliveryAddress: string;
  deliveryLat: number;
  deliveryLng: number;
  customerNotes: string | null;
  createdAt: string;
  acceptedAt: string | null;
  preparingAt: string | null;
  readyAt: string | null;
  pickedUpAt: string | null;
  deliveringAt: string | null;
  deliveredAt: string | null;
  cancelledAt: string | null;
  restaurant: {
    id: string;
    name: string;
    address: string;
    phone: string;
  };
  driver: {
    id: string;
    user: {
      name: string;
      phone: string;
    };
  } | null;
  items: OrderItem[];
}

export interface GetOrdersResponse {
  success: boolean;
  data: Order[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

export interface GetOrderResponse {
  success: boolean;
  data: Order;
}

export interface CreateOrderInput {
  restaurantId: string;
  items: Array<{
    menuItemId: string;
    quantity: number;
    notes?: string;
  }>;
  deliveryAddress: string;
  deliveryLat: number;
  deliveryLng: number;
  customerNotes?: string;
}

export const getOrders = async (params?: {
  page?: number;
  limit?: number;
  status?: string;
}): Promise<GetOrdersResponse> => {
  const response = await apiClient.get("/orders", { params });
  return response.data;
};

export const getOrderById = async (id: string): Promise<GetOrderResponse> => {
  const response = await apiClient.get(`/orders/${id}`);
  return response.data;
};

export const createOrder = async (
  data: CreateOrderInput
): Promise<GetOrderResponse> => {
  const response = await apiClient.post("/orders", data);
  return response.data;
};

export const cancelOrder = async (id: string): Promise<GetOrderResponse> => {
  const response = await apiClient.put(`/orders/${id}/cancel`);
  return response.data;
};
