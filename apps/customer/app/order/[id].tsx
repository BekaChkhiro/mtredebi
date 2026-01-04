import { useEffect } from "react";
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
} from "react-native";
import { useLocalSearchParams, router } from "expo-router";
import { useOrder, useCancelOrder } from "@/hooks/useOrders";
import { ORDER_STATUS_LABELS } from "@mtredebi/shared";
import { Check, AlertCircle, Bike, MapPin, XCircle, UtensilsCrossed, Phone } from "lucide-react-native";

interface OrderItem {
  id: string;
  name: string;
  price: number;
  quantity: number;
  notes: string | null;
}

interface Order {
  id: string;
  orderNumber: string;
  status: string;
  subtotal: number;
  deliveryFee: number;
  totalAmount: number;
  deliveryAddress: string;
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
    name: string;
    address: string;
    phone: string;
  };
  driver: {
    user: {
      name: string;
      phone: string;
    };
  } | null;
  items: OrderItem[];
}

const STATUS_STEPS = [
  "PENDING",
  "ACCEPTED",
  "PREPARING",
  "READY",
  "DRIVER_ASSIGNED",
  "PICKED_UP",
  "DELIVERING",
  "DELIVERED",
];

function OrderTimeline({ status }: { status: string }) {
  const currentIndex = STATUS_STEPS.indexOf(status);
  const isCancelled = status === "CANCELLED";

  if (isCancelled) {
    return (
      <View className="bg-red-50 rounded-2xl p-4 mb-4 flex-row items-center justify-center">
        <XCircle size={20} color="#EF4444" strokeWidth={2} />
        <Text className="text-red-700 font-semibold ml-2">
          შეკვეთა გაუქმებულია
        </Text>
      </View>
    );
  }

  const visibleSteps = STATUS_STEPS.filter(
    (s) => !["DRIVER_ASSIGNED", "PICKED_UP"].includes(s)
  );

  return (
    <View className="bg-white rounded-2xl p-4 mb-4">
      {visibleSteps.map((step, index) => {
        const stepIndex = STATUS_STEPS.indexOf(step);
        const isCompleted = currentIndex >= stepIndex;
        const isCurrent = status === step;
        const label = ORDER_STATUS_LABELS[step as keyof typeof ORDER_STATUS_LABELS] || step;

        return (
          <View key={step} className="flex-row items-start mb-4 last:mb-0">
            <View className="items-center mr-4">
              <View
                className={`w-7 h-7 rounded-full items-center justify-center ${
                  isCompleted
                    ? "bg-primary-500"
                    : "bg-gray-200"
                }`}
              >
                {isCompleted && (
                  <Check size={14} color="#ffffff" strokeWidth={3} />
                )}
              </View>
              {index < visibleSteps.length - 1 && (
                <View
                  className={`w-0.5 h-8 ${
                    isCompleted ? "bg-primary-500" : "bg-gray-200"
                  }`}
                />
              )}
            </View>
            <View className="flex-1 pt-1">
              <Text
                className={`text-base ${
                  isCurrent
                    ? "font-semibold text-primary-500"
                    : isCompleted
                    ? "font-medium text-gray-900"
                    : "text-gray-400"
                }`}
              >
                {label}
              </Text>
            </View>
          </View>
        );
      })}
    </View>
  );
}

export default function OrderScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { data, isLoading, isError, refetch } = useOrder(id);
  const cancelOrder = useCancelOrder();

  // TODO: Add socket connection for real-time updates

  if (isLoading) {
    return (
      <View className="flex-1 items-center justify-center bg-white">
        <ActivityIndicator size="large" color="#10b981" />
      </View>
    );
  }

  if (isError || !data?.data?.order) {
    return (
      <View className="flex-1 items-center justify-center bg-white px-6">
        <View className="w-16 h-16 rounded-full bg-red-50 items-center justify-center mb-4">
          <AlertCircle size={32} color="#EF4444" strokeWidth={2} />
        </View>
        <Text className="text-gray-500 text-center mb-4">
          შეკვეთა ვერ მოიძებნა
        </Text>
        <TouchableOpacity
          onPress={() => router.back()}
          className="bg-primary-500 px-6 py-3 rounded-xl"
        >
          <Text className="text-white font-semibold">უკან</Text>
        </TouchableOpacity>
      </View>
    );
  }

  const order: Order = data.data.order;

  const handleCancel = () => {
    Alert.alert(
      "შეკვეთის გაუქმება",
      "ნამდვილად გსურთ შეკვეთის გაუქმება?",
      [
        { text: "არა", style: "cancel" },
        {
          text: "დიახ",
          style: "destructive",
          onPress: () => {
            cancelOrder.mutate(order.id, {
              onSuccess: () => refetch(),
              onError: (error: any) => {
                Alert.alert(
                  "შეცდომა",
                  error.response?.data?.error?.message || "შეკვეთა ვერ გაუქმდა"
                );
              },
            });
          },
        },
      ]
    );
  };

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    return date.toLocaleDateString("ka-GE", {
      day: "numeric",
      month: "short",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  return (
    <ScrollView className="flex-1 bg-gray-50" contentContainerStyle={{ padding: 16 }}>
      <View className="bg-white rounded-2xl p-4 mb-4">
        <View className="flex-row justify-between items-start mb-2">
          <Text className="text-lg font-semibold text-gray-900">
            {order.orderNumber}
          </Text>
          <Text className="text-sm text-gray-500">{formatDate(order.createdAt)}</Text>
        </View>
        <View className="flex-row items-center">
          <UtensilsCrossed size={16} color="#6B7280" strokeWidth={2} />
          <Text className="text-base text-gray-700 ml-2">{order.restaurant.name}</Text>
        </View>
      </View>

      <OrderTimeline status={order.status} />

      {order.driver && (
        <View className="bg-white rounded-2xl p-4 mb-4">
          <Text className="text-sm text-gray-500 mb-3">მძღოლი</Text>
          <View className="flex-row items-center">
            <View className="w-12 h-12 bg-primary-100 rounded-full items-center justify-center mr-3">
              <Bike size={24} color="#10b981" strokeWidth={2} />
            </View>
            <View className="flex-1">
              <Text className="text-base font-semibold text-gray-900">
                {order.driver.user.name}
              </Text>
              <View className="flex-row items-center mt-1">
                <Phone size={14} color="#6B7280" strokeWidth={2} />
                <Text className="text-sm text-gray-500 ml-1">
                  {order.driver.user.phone}
                </Text>
              </View>
            </View>
          </View>
        </View>
      )}

      <View className="bg-white rounded-2xl p-4 mb-4">
        <View className="flex-row items-center mb-3">
          <MapPin size={16} color="#10b981" strokeWidth={2} />
          <Text className="text-sm text-gray-500 ml-2">მიტანის მისამართი</Text>
        </View>
        <Text className="text-base text-gray-900">{order.deliveryAddress}</Text>
        {order.customerNotes && (
          <Text className="text-sm text-gray-500 mt-2">
            {order.customerNotes}
          </Text>
        )}
      </View>

      <View className="bg-white rounded-2xl p-4 mb-4">
        <Text className="text-sm text-gray-500 mb-3">შეკვეთის დეტალები</Text>
        {(order.items || []).map((item) => (
          <View key={item.id} className="flex-row justify-between py-2">
            <Text className="text-gray-700">
              {item.quantity}x {item.name}
            </Text>
            <Text className="text-gray-900">
              {((item.price ?? 0) * (item.quantity ?? 0)).toFixed(2)}₾
            </Text>
          </View>
        ))}
        <View className="border-t border-gray-100 mt-2 pt-2">
          <View className="flex-row justify-between mb-1">
            <Text className="text-gray-600">ქვეჯამი</Text>
            <Text className="text-gray-900">{(order.subtotal ?? 0).toFixed(2)}₾</Text>
          </View>
          <View className="flex-row justify-between mb-1">
            <Text className="text-gray-600">მიტანა</Text>
            <Text className="text-gray-900">{(order.deliveryFee ?? 0).toFixed(2)}₾</Text>
          </View>
          <View className="flex-row justify-between pt-2 border-t border-gray-100">
            <Text className="text-lg font-semibold text-gray-900">სულ</Text>
            <Text className="text-lg font-semibold text-primary-500">
              {(order.totalAmount ?? 0).toFixed(2)}₾
            </Text>
          </View>
        </View>
      </View>

      {order.status === "PENDING" && (
        <TouchableOpacity
          onPress={handleCancel}
          disabled={cancelOrder.isPending}
          className="bg-red-50 py-4 rounded-xl items-center border border-red-200"
        >
          {cancelOrder.isPending ? (
            <ActivityIndicator color="#EF4444" />
          ) : (
            <Text className="text-red-500 font-semibold">შეკვეთის გაუქმება</Text>
          )}
        </TouchableOpacity>
      )}

      <View className="h-8" />
    </ScrollView>
  );
}
