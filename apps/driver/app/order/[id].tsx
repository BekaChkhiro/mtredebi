import { useEffect } from "react";
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
  Linking,
  Platform,
} from "react-native";
import { useLocalSearchParams, router } from "expo-router";
import {
  Package,
  MapPin,
  Phone,
  Clock,
  Navigation,
  User,
  CheckCircle,
  XCircle,
} from "lucide-react-native";
import { useQuery } from "@tanstack/react-query";
import apiClient from "@/api/client";
import { Order } from "@/api/driver";

function formatCurrency(amount: number) {
  return `${amount.toFixed(2)} GEL`;
}

function formatDate(date: string) {
  return new Date(date).toLocaleDateString("ka-GE", {
    day: "numeric",
    month: "long",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

function getStatusInfo(status: string): { text: string; color: string; bgColor: string } {
  const statusMap: Record<string, { text: string; color: string; bgColor: string }> = {
    PENDING: { text: "მოლოდინში", color: "text-yellow-700", bgColor: "bg-yellow-100" },
    ACCEPTED: { text: "მიღებული", color: "text-blue-700", bgColor: "bg-blue-100" },
    PREPARING: { text: "მზადდება", color: "text-purple-700", bgColor: "bg-purple-100" },
    READY: { text: "მზადაა", color: "text-green-700", bgColor: "bg-green-100" },
    DRIVER_ASSIGNED: { text: "მძღოლი მინიჭებულია", color: "text-blue-700", bgColor: "bg-blue-100" },
    PICKED_UP: { text: "აღებულია", color: "text-purple-700", bgColor: "bg-purple-100" },
    DELIVERING: { text: "მიწოდების პროცესში", color: "text-primary-700", bgColor: "bg-primary-100" },
    DELIVERED: { text: "ჩაბარებული", color: "text-green-700", bgColor: "bg-green-100" },
    CANCELLED: { text: "გაუქმებული", color: "text-red-700", bgColor: "bg-red-100" },
  };
  return statusMap[status] || { text: status, color: "text-gray-700", bgColor: "bg-gray-100" };
}

export default function OrderDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();

  const { data, isLoading, error } = useQuery({
    queryKey: ["order-detail", id],
    queryFn: async () => {
      // Try to find in history first
      const historyResponse = await apiClient.get(`/driver/orders/history?limit=100`);
      const historyOrders = historyResponse.data.data?.orders || [];
      let order = historyOrders.find((o: Order) => o.id === id);

      if (!order) {
        // Try active orders
        const myOrdersResponse = await apiClient.get(`/driver/orders/my`);
        const myOrders = myOrdersResponse.data.data?.orders || [];
        order = myOrders.find((o: Order) => o.id === id);
      }

      return order || null;
    },
    enabled: !!id,
  });

  const order = data;

  const openMaps = (lat: number, lng: number, label: string) => {
    const url = Platform.select({
      ios: `maps:0,0?q=${label}@${lat},${lng}`,
      android: `geo:0,0?q=${lat},${lng}(${label})`,
    });
    if (url) Linking.openURL(url);
  };

  const callPhone = (phone: string) => {
    Linking.openURL(`tel:${phone}`);
  };

  if (isLoading) {
    return (
      <View className="flex-1 items-center justify-center bg-gray-50">
        <ActivityIndicator size="large" color="#0EA5E9" />
      </View>
    );
  }

  if (!order) {
    return (
      <View className="flex-1 items-center justify-center bg-gray-50 px-6">
        <XCircle size={48} color="#EF4444" strokeWidth={2} />
        <Text className="text-xl font-bold text-gray-900 mt-4">
          შეკვეთა ვერ მოიძებნა
        </Text>
        <TouchableOpacity
          className="mt-4 px-6 py-2 bg-primary-500 rounded-lg"
          onPress={() => router.back()}
        >
          <Text className="text-white font-semibold">უკან დაბრუნება</Text>
        </TouchableOpacity>
      </View>
    );
  }

  const statusInfo = getStatusInfo(order.status);

  return (
    <ScrollView className="flex-1 bg-gray-50">
      {/* Status Header */}
      <View className={`${statusInfo.bgColor} px-4 py-6`}>
        <View className="flex-row items-center justify-center">
          {order.status === "DELIVERED" ? (
            <CheckCircle size={24} color="#22C55E" strokeWidth={2} />
          ) : order.status === "CANCELLED" ? (
            <XCircle size={24} color="#EF4444" strokeWidth={2} />
          ) : (
            <Clock size={24} color="#0EA5E9" strokeWidth={2} />
          )}
          <Text className={`text-lg font-bold ml-2 ${statusInfo.color}`}>
            {statusInfo.text}
          </Text>
        </View>
      </View>

      {/* Order Info */}
      <View className="bg-white mx-4 mt-4 rounded-xl overflow-hidden">
        <View className="p-4 border-b border-gray-100">
          <Text className="text-sm text-gray-500">შეკვეთის ნომერი</Text>
          <Text className="text-2xl font-bold text-gray-900">
            #{order.orderNumber}
          </Text>
          <Text className="text-sm text-gray-500 mt-1">
            {formatDate(order.createdAt)}
          </Text>
        </View>

        {/* Restaurant */}
        <TouchableOpacity
          className="flex-row items-center p-4 border-b border-gray-100"
          onPress={() => openMaps(order.restaurant.lat, order.restaurant.lng, order.restaurant.name)}
        >
          <View className="w-10 h-10 bg-primary-100 rounded-full items-center justify-center mr-3">
            <Package size={20} color="#0EA5E9" strokeWidth={2} />
          </View>
          <View className="flex-1">
            <Text className="text-sm text-gray-500">რესტორანი</Text>
            <Text className="text-base font-semibold text-gray-900">
              {order.restaurant.name}
            </Text>
            <Text className="text-sm text-gray-600">{order.restaurant.address}</Text>
          </View>
          <Navigation size={20} color="#9CA3AF" strokeWidth={2} />
        </TouchableOpacity>

        {/* Delivery Address */}
        <TouchableOpacity
          className="flex-row items-center p-4 border-b border-gray-100"
          onPress={() => openMaps(order.deliveryLat, order.deliveryLng, "მიტანის ადგილი")}
        >
          <View className="w-10 h-10 bg-green-100 rounded-full items-center justify-center mr-3">
            <MapPin size={20} color="#22C55E" strokeWidth={2} />
          </View>
          <View className="flex-1">
            <Text className="text-sm text-gray-500">მიტანის მისამართი</Text>
            <Text className="text-base font-semibold text-gray-900">
              {order.deliveryAddress}
            </Text>
          </View>
          <Navigation size={20} color="#9CA3AF" strokeWidth={2} />
        </TouchableOpacity>

        {/* Customer */}
        <View className="flex-row items-center p-4">
          <View className="w-10 h-10 bg-gray-100 rounded-full items-center justify-center mr-3">
            <User size={20} color="#6B7280" strokeWidth={2} />
          </View>
          <View className="flex-1">
            <Text className="text-sm text-gray-500">კლიენტი</Text>
            <Text className="text-base font-semibold text-gray-900">
              {order.customer.name || "კლიენტი"}
            </Text>
          </View>
          <TouchableOpacity
            className="w-10 h-10 bg-green-100 rounded-full items-center justify-center"
            onPress={() => callPhone(order.customer.phone)}
          >
            <Phone size={20} color="#22C55E" strokeWidth={2} />
          </TouchableOpacity>
        </View>
      </View>

      {/* Order Items */}
      <View className="bg-white mx-4 mt-4 rounded-xl overflow-hidden">
        <View className="p-4 border-b border-gray-100">
          <Text className="text-base font-bold text-gray-900">
            შეკვეთის შემადგენლობა
          </Text>
        </View>
        {order.items.map((item) => (
          <View
            key={item.id}
            className="flex-row items-center p-4 border-b border-gray-100"
          >
            <Text className="w-8 text-lg font-bold text-primary-500">
              {item.quantity}x
            </Text>
            <View className="flex-1">
              <Text className="text-base text-gray-900">{item.name || item.menuItem?.name}</Text>
            </View>
            <Text className="text-base font-semibold text-gray-900">
              {formatCurrency(item.price * item.quantity)}
            </Text>
          </View>
        ))}

        {/* Note */}
        {order.customerNotes && (
          <View className="p-4 border-b border-gray-100 bg-yellow-50">
            <Text className="text-sm text-yellow-700">
              შენიშვნა: {order.customerNotes}
            </Text>
          </View>
        )}

        {/* Total */}
        <View className="p-4">
          <View className="flex-row justify-between mb-2">
            <Text className="text-gray-600">მიტანის საფასური</Text>
            <Text className="text-gray-900">{formatCurrency(order.deliveryFee)}</Text>
          </View>
          <View className="flex-row justify-between pt-2 border-t border-gray-200">
            <Text className="text-lg font-bold text-gray-900">ჯამი</Text>
            <Text className="text-lg font-bold text-gray-900">
              {formatCurrency(order.totalAmount)}
            </Text>
          </View>
        </View>
      </View>

      <View className="h-8" />
    </ScrollView>
  );
}
