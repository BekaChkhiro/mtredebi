import { useState } from "react";
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  TextInput,
  ActivityIndicator,
  Alert,
} from "react-native";
import { router } from "expo-router";
import { useCartStore, useCartSubtotal, useCartTotal } from "@/store/cart.store";
import { useCreateOrder } from "@/hooks/useOrders";
import { MapPin, FileText, CreditCard, UtensilsCrossed } from "lucide-react-native";

export default function CheckoutScreen() {
  const items = useCartStore((state) => state.items);
  const restaurantId = useCartStore((state) => state.restaurantId);
  const restaurantName = useCartStore((state) => state.restaurantName);
  const deliveryFee = useCartStore((state) => state.deliveryFee);
  const clearCart = useCartStore((state) => state.clearCart);

  const subtotal = useCartSubtotal();
  const total = useCartTotal();

  const [address, setAddress] = useState("");
  const [notes, setNotes] = useState("");
  const createOrder = useCreateOrder();

  if (items.length === 0) {
    router.back();
    return null;
  }

  const handleOrder = () => {
    if (!address.trim()) {
      Alert.alert("შეცდომა", "გთხოვთ შეიყვანოთ მიტანის მისამართი");
      return;
    }

    createOrder.mutate(
      {
        restaurantId: restaurantId!,
        items: items.map((item) => ({
          menuItemId: item.menuItemId,
          quantity: item.quantity,
          notes: item.notes,
        })),
        deliveryAddress: address,
        deliveryLat: 42.1434, // TODO: Get from location
        deliveryLng: 42.3537, // TODO: Get from location
        customerNotes: notes || undefined,
      },
      {
        onSuccess: (data) => {
          clearCart();
          router.replace(`/order/${data.data.order.id}`);
        },
        onError: (error: any) => {
          Alert.alert(
            "შეცდომა",
            error.response?.data?.error?.message || "შეკვეთა ვერ შეიქმნა"
          );
        },
      }
    );
  };

  return (
    <View className="flex-1 bg-gray-50">
      <ScrollView className="flex-1" contentContainerStyle={{ padding: 16 }}>
        <View className="bg-white rounded-2xl p-4 mb-4">
          <View className="flex-row items-center mb-4">
            <View className="w-10 h-10 rounded-full bg-primary-50 items-center justify-center mr-3">
              <MapPin size={20} color="#10b981" strokeWidth={2} />
            </View>
            <Text className="text-lg font-semibold text-gray-900">
              მიტანის მისამართი
            </Text>
          </View>
          <TextInput
            value={address}
            onChangeText={setAddress}
            placeholder="მაგ: რუსთაველის 12, ბ.3"
            multiline
            numberOfLines={2}
            className="bg-gray-50 rounded-xl p-4 text-base text-gray-900"
            placeholderTextColor="#9CA3AF"
          />
        </View>

        <View className="bg-white rounded-2xl p-4 mb-4">
          <View className="flex-row items-center mb-4">
            <View className="w-10 h-10 rounded-full bg-blue-50 items-center justify-center mr-3">
              <FileText size={20} color="#3B82F6" strokeWidth={2} />
            </View>
            <Text className="text-lg font-semibold text-gray-900">
              დამატებითი ინფორმაცია
            </Text>
          </View>
          <TextInput
            value={notes}
            onChangeText={setNotes}
            placeholder="მაგ: დარეკეთ მისვლისას"
            multiline
            numberOfLines={2}
            className="bg-gray-50 rounded-xl p-4 text-base text-gray-900"
            placeholderTextColor="#9CA3AF"
          />
        </View>

        <View className="bg-white rounded-2xl p-4 mb-4">
          <View className="flex-row items-center mb-4">
            <View className="w-10 h-10 rounded-full bg-primary-50 items-center justify-center mr-3">
              <UtensilsCrossed size={20} color="#10b981" strokeWidth={2} />
            </View>
            <View>
              <Text className="text-lg font-semibold text-gray-900">შეკვეთა</Text>
              <Text className="text-sm text-gray-500">{restaurantName}</Text>
            </View>
          </View>
          {items.map((item) => (
            <View
              key={item.menuItemId}
              className="flex-row justify-between py-2"
            >
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
              <Text className="text-gray-900">{(subtotal ?? 0).toFixed(2)}₾</Text>
            </View>
            <View className="flex-row justify-between mb-1">
              <Text className="text-gray-600">მიტანა</Text>
              <Text className="text-gray-900">{(deliveryFee ?? 0).toFixed(2)}₾</Text>
            </View>
            <View className="flex-row justify-between pt-2 border-t border-gray-100">
              <Text className="text-lg font-semibold text-gray-900">სულ</Text>
              <Text className="text-lg font-semibold text-primary-500">
                {(total ?? 0).toFixed(2)}₾
              </Text>
            </View>
          </View>
        </View>

        <View className="bg-amber-50 rounded-2xl p-4 border border-amber-200 flex-row items-center">
          <CreditCard size={20} color="#F59E0B" strokeWidth={2} />
          <Text className="text-amber-700 text-sm ml-3 flex-1">
            გადახდა ხდება ნაღდი ანგარიშსწორებით მიტანისას
          </Text>
        </View>
      </ScrollView>

      <View className="p-4 bg-white border-t border-gray-100">
        <TouchableOpacity
          onPress={handleOrder}
          disabled={createOrder.isPending}
          className={`py-4 rounded-xl items-center ${
            createOrder.isPending ? "bg-gray-200" : "bg-primary-500"
          }`}
        >
          {createOrder.isPending ? (
            <ActivityIndicator color="white" />
          ) : (
            <Text className="text-white text-lg font-semibold">
              შეკვეთის გაფორმება
            </Text>
          )}
        </TouchableOpacity>
      </View>
    </View>
  );
}
