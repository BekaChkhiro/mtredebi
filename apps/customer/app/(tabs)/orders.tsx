import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  RefreshControl,
  ActivityIndicator,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { router } from "expo-router";
import { useOrders } from "@/hooks/useOrders";
import { ORDER_STATUS_LABELS } from "@mtredebi/shared";
import { Package, AlertCircle } from "lucide-react-native";

interface Order {
  id: string;
  orderNumber: string;
  status: string;
  totalAmount: number;
  createdAt: string;
  restaurant: {
    name: string;
  };
}

type ListItem =
  | { type: "header"; title: string }
  | { type: "order"; data: Order };

const STATUS_COLORS: Record<string, { bg: string; text: string }> = {
  PENDING: { bg: "bg-amber-100", text: "text-amber-700" },
  ACCEPTED: { bg: "bg-blue-100", text: "text-blue-700" },
  PREPARING: { bg: "bg-orange-100", text: "text-orange-700" },
  READY: { bg: "bg-purple-100", text: "text-purple-700" },
  DRIVER_ASSIGNED: { bg: "bg-indigo-100", text: "text-indigo-700" },
  PICKED_UP: { bg: "bg-cyan-100", text: "text-cyan-700" },
  DELIVERING: { bg: "bg-primary-100", text: "text-primary-700" },
  DELIVERED: { bg: "bg-primary-100", text: "text-primary-700" },
  CANCELLED: { bg: "bg-red-100", text: "text-red-700" },
};

function OrderCard({ order }: { order: Order }) {
  const statusColor = STATUS_COLORS[order.status] || STATUS_COLORS.PENDING;
  const statusLabel = ORDER_STATUS_LABELS[order.status as keyof typeof ORDER_STATUS_LABELS] || order.status;
  const date = new Date(order.createdAt);
  const formattedDate = date.toLocaleDateString("ka-GE", {
    day: "numeric",
    month: "short",
    hour: "2-digit",
    minute: "2-digit",
  });

  return (
    <TouchableOpacity
      onPress={() => router.push(`/order/${order.id}`)}
      className="bg-white rounded-2xl p-4 mb-3 border border-gray-100"
    >
      <View className="flex-row justify-between items-start mb-2">
        <View className="flex-1">
          <Text className="text-base font-semibold text-gray-900">
            {order.restaurant.name}
          </Text>
          <Text className="text-sm text-gray-500">{order.orderNumber}</Text>
        </View>
        <View className={`px-3 py-1.5 rounded-full ${statusColor.bg}`}>
          <Text className={`text-xs font-medium ${statusColor.text}`}>
            {statusLabel}
          </Text>
        </View>
      </View>
      <View className="flex-row justify-between items-center mt-3 pt-3 border-t border-gray-100">
        <Text className="text-sm text-gray-500">{formattedDate}</Text>
        <Text className="text-base font-semibold text-gray-900">
          {(order.totalAmount ?? 0).toFixed(2)}₾
        </Text>
      </View>
    </TouchableOpacity>
  );
}

export default function OrdersScreen() {
  const { data, isLoading, isError, refetch, isRefetching } = useOrders();

  const orders: Order[] = Array.isArray(data?.data?.orders) ? data.data.orders : [];
  const activeOrders = orders.filter(
    (o) => !["DELIVERED", "CANCELLED"].includes(o.status)
  );
  const pastOrders = orders.filter((o) =>
    ["DELIVERED", "CANCELLED"].includes(o.status)
  );

  return (
    <SafeAreaView className="flex-1 bg-gray-50" edges={["top"]}>
      <View className="px-4 pt-4 pb-2">
        <Text className="text-2xl font-bold text-gray-900">შეკვეთები</Text>
      </View>

      {isLoading ? (
        <View className="flex-1 items-center justify-center">
          <ActivityIndicator size="large" color="#10b981" />
        </View>
      ) : isError ? (
        <View className="flex-1 items-center justify-center px-6">
          <View className="w-16 h-16 rounded-full bg-red-50 items-center justify-center mb-4">
            <AlertCircle size={32} color="#EF4444" strokeWidth={2} />
          </View>
          <Text className="text-gray-500 text-center mb-4">
            შეცდომა მოხდა შეკვეთების ჩატვირთვისას
          </Text>
          <TouchableOpacity
            onPress={() => refetch()}
            className="bg-primary-500 px-6 py-3 rounded-xl"
          >
            <Text className="text-white font-semibold">თავიდან ცდა</Text>
          </TouchableOpacity>
        </View>
      ) : orders.length === 0 ? (
        <View className="flex-1 items-center justify-center px-6">
          <View className="w-16 h-16 rounded-full bg-primary-50 items-center justify-center mb-4">
            <Package size={32} color="#10b981" strokeWidth={1.5} />
          </View>
          <Text className="text-gray-500 text-center mb-4">
            შეკვეთები ჯერ არ გაქვთ
          </Text>
          <TouchableOpacity
            onPress={() => router.push("/(tabs)")}
            className="bg-primary-500 px-6 py-3 rounded-xl"
          >
            <Text className="text-white font-semibold">რესტორნების ნახვა</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <FlatList<ListItem>
          data={[
            ...(activeOrders.length > 0
              ? [{ type: "header" as const, title: "აქტიური" }]
              : []),
            ...activeOrders.map((o: Order) => ({ type: "order" as const, data: o })),
            ...(pastOrders.length > 0
              ? [{ type: "header" as const, title: "ისტორია" }]
              : []),
            ...pastOrders.map((o: Order) => ({ type: "order" as const, data: o })),
          ]}
          keyExtractor={(item, index) =>
            item.type === "header" ? `header-${index}` : item.data.id
          }
          renderItem={({ item }) => {
            if (item.type === "header") {
              return (
                <Text className="text-sm font-semibold text-gray-500 uppercase mb-2 mt-4">
                  {item.title}
                </Text>
              );
            }
            return <OrderCard order={item.data} />;
          }}
          contentContainerStyle={{ padding: 16 }}
          refreshControl={
            <RefreshControl
              refreshing={isRefetching}
              onRefresh={refetch}
              tintColor="#10b981"
            />
          }
        />
      )}
    </SafeAreaView>
  );
}
