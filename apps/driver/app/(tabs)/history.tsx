import { useState } from "react";
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  RefreshControl,
  ActivityIndicator,
} from "react-native";
import { router } from "expo-router";
import {
  Package,
  MapPin,
  Clock,
  ChevronRight,
  CheckCircle,
  XCircle,
} from "lucide-react-native";
import { useOrderHistory } from "@/hooks/useDriver";
import { Order } from "@/api/driver";

function formatCurrency(amount: number) {
  return `${amount.toFixed(2)} GEL`;
}

function formatDate(date: string) {
  return new Date(date).toLocaleDateString("ka-GE", {
    day: "numeric",
    month: "short",
    hour: "2-digit",
    minute: "2-digit",
  });
}

function HistoryCard({ order }: { order: Order }) {
  const isDelivered = order.status === "DELIVERED";
  const isCancelled = order.status === "CANCELLED";

  return (
    <TouchableOpacity
      className="bg-white rounded-xl shadow-sm mx-4 mb-3 overflow-hidden"
      onPress={() => router.push(`/order/${order.id}`)}
    >
      <View className="p-4">
        {/* Header */}
        <View className="flex-row items-center justify-between mb-3">
          <View className="flex-row items-center">
            <View
              className={`w-8 h-8 rounded-full items-center justify-center mr-2 ${
                isDelivered
                  ? "bg-green-100"
                  : isCancelled
                  ? "bg-red-100"
                  : "bg-gray-100"
              }`}
            >
              {isDelivered ? (
                <CheckCircle size={18} color="#22C55E" strokeWidth={2} />
              ) : isCancelled ? (
                <XCircle size={18} color="#EF4444" strokeWidth={2} />
              ) : (
                <Package size={18} color="#9CA3AF" strokeWidth={2} />
              )}
            </View>
            <Text className="text-lg font-bold text-gray-900">
              #{order.orderNumber}
            </Text>
          </View>
          <Text
            className={`text-sm font-semibold ${
              isDelivered
                ? "text-green-600"
                : isCancelled
                ? "text-red-600"
                : "text-gray-600"
            }`}
          >
            {isDelivered ? "ჩაბარებული" : isCancelled ? "გაუქმებული" : order.status}
          </Text>
        </View>

        {/* Restaurant */}
        <View className="flex-row items-center mb-2">
          <Package size={16} color="#9CA3AF" strokeWidth={2} />
          <Text className="text-sm text-gray-700 ml-2">
            {order.restaurant.name}
          </Text>
        </View>

        {/* Address */}
        <View className="flex-row items-start mb-2">
          <MapPin size={16} color="#9CA3AF" strokeWidth={2} />
          <Text className="text-sm text-gray-600 ml-2 flex-1" numberOfLines={1}>
            {order.deliveryAddress}
          </Text>
        </View>

        {/* Footer */}
        <View className="flex-row items-center justify-between mt-2 pt-2 border-t border-gray-100">
          <View className="flex-row items-center">
            <Clock size={14} color="#9CA3AF" strokeWidth={2} />
            <Text className="text-xs text-gray-500 ml-1">
              {formatDate(order.updatedAt)}
            </Text>
          </View>
          <View className="flex-row items-center">
            <Text className="text-base font-bold text-gray-900 mr-1">
              {formatCurrency(order.totalAmount)}
            </Text>
            <ChevronRight size={16} color="#9CA3AF" strokeWidth={2} />
          </View>
        </View>
      </View>
    </TouchableOpacity>
  );
}

export default function HistoryScreen() {
  const [page, setPage] = useState(1);
  const { data, isLoading, refetch } = useOrderHistory(page, 20);
  const [refreshing, setRefreshing] = useState(false);

  const orders = data?.data || [];
  const pagination = data?.pagination;

  const onRefresh = async () => {
    setRefreshing(true);
    setPage(1);
    await refetch();
    setRefreshing(false);
  };

  const loadMore = () => {
    if (pagination && page < pagination.pages) {
      setPage(page + 1);
    }
  };

  if (isLoading && !refreshing) {
    return (
      <View className="flex-1 items-center justify-center bg-gray-50">
        <ActivityIndicator size="large" color="#0EA5E9" />
      </View>
    );
  }

  if (orders.length === 0) {
    return (
      <View className="flex-1 items-center justify-center bg-gray-50 px-6">
        <View className="w-20 h-20 bg-gray-100 rounded-full items-center justify-center mb-4">
          <Package size={40} color="#9CA3AF" strokeWidth={2} />
        </View>
        <Text className="text-xl font-bold text-gray-900 mb-2">
          ისტორია ცარიელია
        </Text>
        <Text className="text-base text-gray-500 text-center">
          აქ გამოჩნდება თქვენი შეკვეთების ისტორია
        </Text>
      </View>
    );
  }

  return (
    <View className="flex-1 bg-gray-50">
      <FlatList
        data={orders}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => <HistoryCard order={item} />}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
        onEndReached={loadMore}
        onEndReachedThreshold={0.5}
        contentContainerStyle={{ paddingVertical: 16 }}
        ListFooterComponent={
          pagination && page < pagination.pages ? (
            <View className="py-4 items-center">
              <ActivityIndicator size="small" color="#0EA5E9" />
            </View>
          ) : null
        }
      />
    </View>
  );
}
