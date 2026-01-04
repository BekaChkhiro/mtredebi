import { View, Text, ScrollView, TouchableOpacity } from "react-native";
import { router } from "expo-router";
import { useCartStore, useCartSubtotal, useCartTotal, useIsMinOrderMet } from "@/store/cart.store";
import { Plus, Minus, Trash2, ShoppingCart, AlertTriangle } from "lucide-react-native";

function CartItem({
  item,
  onUpdateQuantity,
  onRemove,
}: {
  item: {
    menuItemId: string;
    name: string;
    price: number;
    quantity: number;
    notes?: string;
  };
  onUpdateQuantity: (quantity: number) => void;
  onRemove: () => void;
}) {
  return (
    <View className="bg-white rounded-2xl p-4 mb-3">
      <View className="flex-row items-start justify-between mb-2">
        <View className="flex-1">
          <Text className="text-base font-semibold text-gray-900">
            {item.name}
          </Text>
          <Text className="text-sm text-primary-500">
            {(item.price ?? 0).toFixed(2)}₾
          </Text>
        </View>
        <View className="flex-row items-center">
          <TouchableOpacity
            onPress={() =>
              item.quantity > 1 ? onUpdateQuantity(item.quantity - 1) : onRemove()
            }
            className="w-9 h-9 rounded-full bg-gray-100 items-center justify-center"
          >
            {item.quantity > 1 ? (
              <Minus size={18} color="#6B7280" strokeWidth={2} />
            ) : (
              <Trash2 size={18} color="#EF4444" strokeWidth={2} />
            )}
          </TouchableOpacity>
          <Text className="text-base font-semibold mx-4">{item.quantity}</Text>
          <TouchableOpacity
            onPress={() => onUpdateQuantity(item.quantity + 1)}
            className="w-9 h-9 rounded-full bg-primary-500 items-center justify-center"
          >
            <Plus size={18} color="#ffffff" strokeWidth={2} />
          </TouchableOpacity>
        </View>
      </View>
      <View className="flex-row justify-between pt-3 border-t border-gray-100">
        <Text className="text-sm text-gray-500">ჯამი</Text>
        <Text className="text-base font-semibold text-gray-900">
          {((item.price ?? 0) * (item.quantity ?? 0)).toFixed(2)}₾
        </Text>
      </View>
    </View>
  );
}

export default function CartScreen() {
  const items = useCartStore((state) => state.items);
  const restaurantName = useCartStore((state) => state.restaurantName);
  const deliveryFee = useCartStore((state) => state.deliveryFee);
  const minOrderAmount = useCartStore((state) => state.minOrderAmount);
  const updateQuantity = useCartStore((state) => state.updateQuantity);
  const removeItem = useCartStore((state) => state.removeItem);
  const clearCart = useCartStore((state) => state.clearCart);

  const subtotal = useCartSubtotal();
  const total = useCartTotal();
  const isMinOrderMet = useIsMinOrderMet();

  if (items.length === 0) {
    return (
      <View className="flex-1 bg-gray-50 items-center justify-center px-6">
        <View className="w-20 h-20 rounded-full bg-primary-50 items-center justify-center mb-4">
          <ShoppingCart size={40} color="#10b981" strokeWidth={1.5} />
        </View>
        <Text className="text-xl font-semibold text-gray-900 mb-2">
          კალათა ცარიელია
        </Text>
        <Text className="text-gray-500 text-center mb-6">
          დაამატეთ პროდუქტები კალათაში
        </Text>
        <TouchableOpacity
          onPress={() => router.back()}
          className="bg-primary-500 px-6 py-3 rounded-xl"
        >
          <Text className="text-white font-semibold">რესტორნების ნახვა</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View className="flex-1 bg-gray-50">
      <ScrollView className="flex-1" contentContainerStyle={{ padding: 16 }}>
        <View className="flex-row items-center justify-between mb-4">
          <View>
            <Text className="text-lg font-semibold text-gray-900">
              {restaurantName}
            </Text>
            <Text className="text-sm text-gray-500">
              {items.length} ნივთი კალათაში
            </Text>
          </View>
          <TouchableOpacity
            onPress={clearCart}
            className="flex-row items-center"
          >
            <Trash2 size={16} color="#EF4444" strokeWidth={2} />
            <Text className="text-red-500 text-sm ml-1">გასუფთავება</Text>
          </TouchableOpacity>
        </View>

        {items.map((item) => (
          <CartItem
            key={item.menuItemId}
            item={item}
            onUpdateQuantity={(qty) => updateQuantity(item.menuItemId, qty)}
            onRemove={() => removeItem(item.menuItemId)}
          />
        ))}

        <View className="bg-white rounded-2xl p-4 mt-4">
          <View className="flex-row justify-between mb-2">
            <Text className="text-gray-600">ქვეჯამი</Text>
            <Text className="text-gray-900">{(subtotal ?? 0).toFixed(2)}₾</Text>
          </View>
          <View className="flex-row justify-between mb-2">
            <Text className="text-gray-600">მიტანა</Text>
            <Text className="text-gray-900">{(deliveryFee ?? 0).toFixed(2)}₾</Text>
          </View>
          <View className="flex-row justify-between pt-3 border-t border-gray-100">
            <Text className="text-lg font-semibold text-gray-900">სულ</Text>
            <Text className="text-lg font-semibold text-primary-500">
              {(total ?? 0).toFixed(2)}₾
            </Text>
          </View>
        </View>

        {!isMinOrderMet && (
          <View className="bg-amber-50 rounded-2xl p-4 mt-4 border border-amber-200 flex-row items-center">
            <AlertTriangle size={20} color="#F59E0B" strokeWidth={2} />
            <View className="ml-3 flex-1">
              <Text className="text-amber-700">
                მინიმალური შეკვეთა: {(minOrderAmount ?? 0).toFixed(0)}₾
              </Text>
              <Text className="text-amber-600 text-sm mt-1">
                დარჩა: {((minOrderAmount ?? 0) - (subtotal ?? 0)).toFixed(2)}₾
              </Text>
            </View>
          </View>
        )}
      </ScrollView>

      <View className="p-4 bg-white border-t border-gray-100">
        <TouchableOpacity
          onPress={() => router.push("/checkout")}
          disabled={!isMinOrderMet}
          className={`py-4 rounded-xl items-center ${
            isMinOrderMet ? "bg-primary-500" : "bg-gray-200"
          }`}
        >
          <Text
            className={`text-lg font-semibold ${
              isMinOrderMet ? "text-white" : "text-gray-400"
            }`}
          >
            გაგრძელება - {(total ?? 0).toFixed(2)}₾
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}
