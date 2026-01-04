import { useState } from "react";
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  RefreshControl,
  ActivityIndicator,
  Alert,
  Linking,
  Platform,
} from "react-native";
import { router } from "expo-router";
import {
  Power,
  MapPin,
  Phone,
  Clock,
  ChevronRight,
  Navigation,
  Package,
} from "lucide-react-native";
import { useAuthStore } from "@/store/auth.store";
import {
  useAvailableOrders,
  useMyOrders,
  useUpdateDriverStatus,
  useAcceptOrder,
  usePickUpOrder,
  useStartDelivering,
  useDeliverOrder,
} from "@/hooks/useDriver";
import { Order } from "@/api/driver";

function formatCurrency(amount: number) {
  return `${amount.toFixed(2)} GEL`;
}

function formatTime(date: string) {
  return new Date(date).toLocaleTimeString("ka-GE", {
    hour: "2-digit",
    minute: "2-digit",
  });
}

function getStatusText(status: string) {
  const statusMap: Record<string, string> = {
    READY: "მზადაა აღებისთვის",
    DRIVER_ASSIGNED: "მინიჭებულია",
    PICKED_UP: "აღებულია",
    DELIVERING: "მიწოდების პროცესში",
  };
  return statusMap[status] || status;
}

function getStatusColor(status: string) {
  const colorMap: Record<string, string> = {
    READY: "bg-yellow-100 text-yellow-700",
    DRIVER_ASSIGNED: "bg-blue-100 text-blue-700",
    PICKED_UP: "bg-purple-100 text-purple-700",
    DELIVERING: "bg-primary-100 text-primary-700",
  };
  return colorMap[status] || "bg-gray-100 text-gray-700";
}

function OrderCard({
  order,
  isActive,
  onAccept,
  onPickUp,
  onDeliver,
}: {
  order: Order;
  isActive: boolean;
  onAccept: () => void;
  onPickUp: () => void;
  onDeliver: () => void;
}) {
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

  return (
    <View className="bg-white rounded-xl shadow-sm mx-4 mb-3 overflow-hidden">
      {/* Header */}
      <View className="flex-row items-center justify-between p-4 border-b border-gray-100">
        <View>
          <Text className="text-lg font-bold text-gray-900">
            #{order.orderNumber}
          </Text>
          <Text className="text-sm text-gray-500">
            {formatTime(order.createdAt)}
          </Text>
        </View>
        <View className={`px-3 py-1 rounded-full ${getStatusColor(order.status)}`}>
          <Text className="text-xs font-semibold">
            {getStatusText(order.status)}
          </Text>
        </View>
      </View>

      {/* Restaurant Info */}
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
          <Text className="text-sm text-gray-600" numberOfLines={1}>
            {order.restaurant.address}
          </Text>
        </View>
        <Navigation size={20} color="#9CA3AF" strokeWidth={2} />
      </TouchableOpacity>

      {/* Delivery Address */}
      <TouchableOpacity
        className="flex-row items-center p-4 border-b border-gray-100"
        onPress={() => openMaps(order.deliveryLat, order.deliveryLng, "მიტანის ადგილი")}
      >
        <View className="w-10 h-10 bg-secondary-100 rounded-full items-center justify-center mr-3">
          <MapPin size={20} color="#10b981" strokeWidth={2} />
        </View>
        <View className="flex-1">
          <Text className="text-sm text-gray-500">მიტანის მისამართი</Text>
          <Text className="text-base font-semibold text-gray-900" numberOfLines={2}>
            {order.deliveryAddress}
          </Text>
        </View>
        <Navigation size={20} color="#9CA3AF" strokeWidth={2} />
      </TouchableOpacity>

      {/* Customer Info */}
      <View className="flex-row items-center p-4 border-b border-gray-100">
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

      {/* Items Summary */}
      <View className="p-4 border-b border-gray-100">
        <Text className="text-sm text-gray-500 mb-2">
          {order.items.length} პროდუქტი
        </Text>
        {order.items.slice(0, 2).map((item) => (
          <Text key={item.id} className="text-sm text-gray-700">
            {item.quantity}x {item.name || item.menuItem?.name}
          </Text>
        ))}
        {order.items.length > 2 && (
          <Text className="text-sm text-gray-400">
            +{order.items.length - 2} სხვა
          </Text>
        )}
      </View>

      {/* Total & Actions */}
      <View className="p-4">
        <View className="flex-row items-center justify-between mb-3">
          <Text className="text-lg font-bold text-gray-900">
            {formatCurrency(order.totalAmount)}
          </Text>
          <Text className="text-sm text-gray-500">
            მიტანა: {formatCurrency(order.deliveryFee)}
          </Text>
        </View>

        {!isActive && order.status === "READY" && (
          <TouchableOpacity
            className="bg-primary-500 py-3 rounded-xl items-center"
            onPress={onAccept}
          >
            <Text className="text-white font-semibold text-base">
              შეკვეთის მიღება
            </Text>
          </TouchableOpacity>
        )}

        {isActive && order.status === "DRIVER_ASSIGNED" && (
          <TouchableOpacity
            className="bg-purple-500 py-3 rounded-xl items-center"
            onPress={onPickUp}
          >
            <Text className="text-white font-semibold text-base">
              შეკვეთა ავიღე
            </Text>
          </TouchableOpacity>
        )}

        {isActive && order.status === "PICKED_UP" && (
          <TouchableOpacity
            className="bg-primary-500 py-3 rounded-xl items-center"
            onPress={() => {
              openMaps(order.deliveryLat, order.deliveryLng, "მიტანის ადგილი");
            }}
          >
            <Text className="text-white font-semibold text-base">
              ნავიგაცია
            </Text>
          </TouchableOpacity>
        )}

        {isActive && (order.status === "PICKED_UP" || order.status === "DELIVERING") && (
          <TouchableOpacity
            className="bg-green-500 py-3 rounded-xl items-center mt-2"
            onPress={onDeliver}
          >
            <Text className="text-white font-semibold text-base">
              შეკვეთა ჩავაბარე
            </Text>
          </TouchableOpacity>
        )}
      </View>
    </View>
  );
}

export default function OrdersScreen() {
  const driverStatus = useAuthStore((state) => state.driverStatus);
  const updateStatus = useUpdateDriverStatus();
  const acceptOrder = useAcceptOrder();
  const pickUpOrder = usePickUpOrder();
  const deliverOrder = useDeliverOrder();

  const isOnline = driverStatus === "ONLINE" || driverStatus === "BUSY";
  const { data: availableOrders, isLoading: loadingAvailable, refetch: refetchAvailable } =
    useAvailableOrders(isOnline && driverStatus === "ONLINE");
  const { data: myOrders, isLoading: loadingMy, refetch: refetchMy } = useMyOrders();

  const [refreshing, setRefreshing] = useState(false);

  const activeOrder = myOrders?.data?.[0];
  const hasActiveOrder = !!activeOrder;

  const handleToggleStatus = () => {
    const newStatus = isOnline ? "OFFLINE" : "ONLINE";
    updateStatus.mutate(newStatus);
  };

  const handleAcceptOrder = (orderId: string) => {
    Alert.alert("შეკვეთის მიღება", "ნამდვილად გსურთ ამ შეკვეთის მიღება?", [
      { text: "გაუქმება", style: "cancel" },
      {
        text: "დიახ",
        onPress: () => acceptOrder.mutate(orderId),
      },
    ]);
  };

  const handlePickUpOrder = (orderId: string) => {
    Alert.alert("შეკვეთის აღება", "დაადასტურეთ რომ შეკვეთა აიღეთ", [
      { text: "გაუქმება", style: "cancel" },
      {
        text: "დადასტურება",
        onPress: () => pickUpOrder.mutate(orderId),
      },
    ]);
  };

  const handleDeliverOrder = (orderId: string) => {
    Alert.alert("შეკვეთის ჩაბარება", "დაადასტურეთ რომ შეკვეთა ჩააბარეთ", [
      { text: "გაუქმება", style: "cancel" },
      {
        text: "დადასტურება",
        onPress: () => deliverOrder.mutate(orderId),
      },
    ]);
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await Promise.all([refetchAvailable(), refetchMy()]);
    setRefreshing(false);
  };

  const renderContent = () => {
    if (!isOnline) {
      return (
        <View className="flex-1 items-center justify-center px-6">
          <View className="w-20 h-20 bg-gray-100 rounded-full items-center justify-center mb-4">
            <Power size={40} color="#9CA3AF" strokeWidth={2} />
          </View>
          <Text className="text-xl font-bold text-gray-900 mb-2">
            თქვენ ოფლაინ ხართ
          </Text>
          <Text className="text-base text-gray-500 text-center mb-6">
            ჩართეთ ონლაინ რეჟიმი შეკვეთების მისაღებად
          </Text>
        </View>
      );
    }

    // Show active order first if exists
    if (hasActiveOrder) {
      return (
        <FlatList
          data={[activeOrder]}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => (
            <OrderCard
              order={item}
              isActive={true}
              onAccept={() => {}}
              onPickUp={() => handlePickUpOrder(item.id)}
              onDeliver={() => handleDeliverOrder(item.id)}
            />
          )}
          ListHeaderComponent={
            <View className="px-4 py-3 bg-primary-500">
              <Text className="text-white font-bold text-lg">
                აქტიური შეკვეთა
              </Text>
            </View>
          }
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
          }
          contentContainerStyle={{ paddingBottom: 20 }}
        />
      );
    }

    // Show available orders
    if (loadingAvailable) {
      return (
        <View className="flex-1 items-center justify-center">
          <ActivityIndicator size="large" color="#0EA5E9" />
        </View>
      );
    }

    const orders = availableOrders?.data || [];

    if (orders.length === 0) {
      return (
        <View className="flex-1 items-center justify-center px-6">
          <View className="w-20 h-20 bg-primary-100 rounded-full items-center justify-center mb-4">
            <Package size={40} color="#0EA5E9" strokeWidth={2} />
          </View>
          <Text className="text-xl font-bold text-gray-900 mb-2">
            შეკვეთები არ არის
          </Text>
          <Text className="text-base text-gray-500 text-center">
            ახალი შეკვეთები მალე გამოჩნდება
          </Text>
        </View>
      );
    }

    return (
      <FlatList
        data={orders}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <OrderCard
            order={item}
            isActive={false}
            onAccept={() => handleAcceptOrder(item.id)}
            onPickUp={() => {}}
            onDeliver={() => {}}
          />
        )}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
        contentContainerStyle={{ paddingVertical: 16 }}
      />
    );
  };

  return (
    <View className="flex-1 bg-gray-50">
      {/* Status Toggle */}
      <View className="bg-white px-4 py-3 flex-row items-center justify-between border-b border-gray-200">
        <View className="flex-row items-center">
          <View
            className={`w-3 h-3 rounded-full mr-2 ${
              isOnline ? "bg-green-500" : "bg-gray-400"
            }`}
          />
          <Text className="text-base font-semibold text-gray-900">
            {isOnline ? "ონლაინ" : "ოფლაინ"}
          </Text>
        </View>
        <TouchableOpacity
          onPress={handleToggleStatus}
          disabled={updateStatus.isPending || hasActiveOrder}
          className={`px-4 py-2 rounded-full ${
            isOnline ? "bg-red-100" : "bg-green-100"
          } ${hasActiveOrder ? "opacity-50" : ""}`}
        >
          {updateStatus.isPending ? (
            <ActivityIndicator size="small" color={isOnline ? "#EF4444" : "#22C55E"} />
          ) : (
            <Text
              className={`font-semibold ${
                isOnline ? "text-red-600" : "text-green-600"
              }`}
            >
              {isOnline ? "გამორთვა" : "ჩართვა"}
            </Text>
          )}
        </TouchableOpacity>
      </View>

      {renderContent()}
    </View>
  );
}
