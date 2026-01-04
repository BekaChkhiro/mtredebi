import { PrismaClient, OrderStatus } from '@prisma/client';

const prisma = new PrismaClient();

const EXPO_PUSH_URL = 'https://exp.host/--/api/v2/push/send';

interface ExpoPushMessage {
  to: string;
  title: string;
  body: string;
  data?: Record<string, unknown>;
  sound?: 'default' | null;
  badge?: number;
  channelId?: string;
}

interface ExpoPushResponse {
  data: Array<{
    status: 'ok' | 'error';
    id?: string;
    message?: string;
    details?: Record<string, unknown>;
  }>;
}

// Send push notification via Expo Push Service
async function sendPushNotification(messages: ExpoPushMessage[]): Promise<void> {
  if (messages.length === 0) return;

  try {
    const response = await fetch(EXPO_PUSH_URL, {
      method: 'POST',
      headers: {
        'Accept': 'application/json',
        'Accept-Encoding': 'gzip, deflate',
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(messages),
    });

    const result = await response.json() as ExpoPushResponse;

    // Log any errors
    result.data.forEach((item, index) => {
      if (item.status === 'error') {
        console.error(`[Push] Error sending to ${messages[index].to}:`, item.message);
      }
    });
  } catch (error) {
    console.error('[Push] Failed to send notifications:', error);
  }
}

// Get order status message in Georgian
function getOrderStatusMessage(status: OrderStatus): { title: string; body: string } {
  const messages: Record<OrderStatus, { title: string; body: string }> = {
    PENDING: {
      title: 'შეკვეთა მიღებულია',
      body: 'თქვენი შეკვეთა წარმატებით გაიგზავნა.',
    },
    ACCEPTED: {
      title: 'შეკვეთა მიღებულია',
      body: 'რესტორანმა მიიღო თქვენი შეკვეთა.',
    },
    PREPARING: {
      title: 'მზადდება',
      body: 'თქვენი შეკვეთა მზადდება.',
    },
    READY: {
      title: 'შეკვეთა მზადაა',
      body: 'თქვენი შეკვეთა მზადაა კურიერისთვის.',
    },
    DRIVER_ASSIGNED: {
      title: 'კურიერი მინიჭებულია',
      body: 'კურიერი მალე წამოიღებს თქვენს შეკვეთას.',
    },
    PICKED_UP: {
      title: 'კურიერი გზაშია',
      body: 'კურიერმა აიღო შეკვეთა და მოგემართება.',
    },
    DELIVERING: {
      title: 'მიტანის პროცესი',
      body: 'თქვენი შეკვეთა მოგემართება.',
    },
    DELIVERED: {
      title: 'მიტანილია',
      body: 'თქვენი შეკვეთა წარმატებით მიიტანა. გემრიელად!',
    },
    CANCELLED: {
      title: 'შეკვეთა გაუქმებულია',
      body: 'თქვენი შეკვეთა გაუქმებულია.',
    },
  };

  return messages[status] || { title: 'შეკვეთის განახლება', body: 'თქვენი შეკვეთის სტატუსი შეიცვალა.' };
}

// Notify customer about order status change
export async function notifyOrderStatusChange(orderId: string, status: OrderStatus): Promise<void> {
  const order = await prisma.order.findUnique({
    where: { id: orderId },
    include: {
      customer: {
        select: { pushToken: true },
      },
    },
  });

  if (!order?.customer.pushToken) {
    console.log('[Push] No push token for customer');
    return;
  }

  const { title, body } = getOrderStatusMessage(status);

  await sendPushNotification([
    {
      to: order.customer.pushToken,
      title,
      body,
      data: {
        type: 'order_status',
        orderId,
        status,
      },
      sound: 'default',
      channelId: 'orders',
    },
  ]);

  console.log(`[Push] Sent notification for order ${orderId}: ${status}`);
}

// Notify customer about driver assignment
export async function notifyDriverAssigned(orderId: string, driverName: string): Promise<void> {
  const order = await prisma.order.findUnique({
    where: { id: orderId },
    include: {
      customer: {
        select: { pushToken: true },
      },
    },
  });

  if (!order?.customer.pushToken) {
    console.log('[Push] No push token for customer');
    return;
  }

  await sendPushNotification([
    {
      to: order.customer.pushToken,
      title: 'კურიერი მინიჭებულია',
      body: `${driverName} მალე მოგიტანთ შეკვეთას.`,
      data: {
        type: 'driver_assigned',
        orderId,
      },
      sound: 'default',
      channelId: 'orders',
    },
  ]);

  console.log(`[Push] Sent driver assigned notification for order ${orderId}`);
}

// Notify restaurant about new order
export async function notifyNewOrder(orderId: string, restaurantId: string): Promise<void> {
  // In the future, we can add push tokens for restaurant admins
  console.log(`[Push] New order ${orderId} for restaurant ${restaurantId}`);
}

// Notify drivers about available order
export async function notifyDriversOrderReady(orderId: string): Promise<void> {
  // Get all online drivers with push tokens
  const drivers = await prisma.driver.findMany({
    where: {
      isOnline: true,
      isAvailable: true,
      user: {
        pushToken: { not: null },
      },
    },
    include: {
      user: {
        select: { pushToken: true },
      },
    },
  });

  if (drivers.length === 0) {
    console.log('[Push] No online drivers with push tokens');
    return;
  }

  const messages: ExpoPushMessage[] = drivers
    .filter((driver) => driver.user.pushToken)
    .map((driver) => ({
      to: driver.user.pushToken!,
      title: 'ახალი შეკვეთა ხელმისაწვდომია',
      body: 'ახალი შეკვეთა მზადაა აღებისთვის.',
      data: {
        type: 'order_ready',
        orderId,
      },
      sound: 'default',
      channelId: 'orders',
    }));

  await sendPushNotification(messages);

  console.log(`[Push] Sent order ready notification to ${messages.length} drivers`);
}
