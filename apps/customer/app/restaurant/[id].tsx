import { useState } from "react";
import {
  View,
  Text,
  ScrollView,
  Image,
  TouchableOpacity,
  ActivityIndicator,
  Modal,
} from "react-native";
import { useLocalSearchParams, router } from "expo-router";
import { useRestaurant } from "@/hooks/useRestaurants";
import { useCartStore, useCartItemCount, useCartTotal } from "@/store/cart.store";
import { Bike, Clock, MapPin, Plus, Minus, ShoppingBag, UtensilsCrossed, AlertCircle } from "lucide-react-native";

interface MenuItem {
  id: string;
  name: string;
  description: string | null;
  price: number;
  imageUrl: string | null;
  isAvailable: boolean;
}

interface Category {
  id: string;
  name: string;
  menuItems: MenuItem[];
}

interface Restaurant {
  id: string;
  name: string;
  description: string | null;
  address: string;
  imageUrl: string | null;
  coverImageUrl: string | null;
  deliveryFee: number;
  avgPrepTime: number;
  minOrderAmount: number;
  categories: Category[];
}

function MenuItemCard({
  item,
  onAdd,
}: {
  item: MenuItem;
  onAdd: () => void;
}) {
  return (
    <TouchableOpacity
      onPress={onAdd}
      disabled={!item.isAvailable}
      className={`flex-row bg-white rounded-2xl p-4 mb-3 border border-gray-100 ${
        !item.isAvailable ? "opacity-50" : ""
      }`}
    >
      <View className="flex-1 pr-3">
        <Text className="text-base font-semibold text-gray-900 mb-1">
          {item.name}
        </Text>
        {item.description && (
          <Text className="text-sm text-gray-500 mb-2" numberOfLines={2}>
            {item.description}
          </Text>
        )}
        <Text className="text-base font-semibold text-primary-500">
          {(item.price ?? 0).toFixed(2)}₾
        </Text>
      </View>
      {item.imageUrl ? (
        <Image
          source={{ uri: item.imageUrl }}
          className="w-20 h-20 rounded-xl"
          resizeMode="cover"
        />
      ) : (
        <View className="w-20 h-20 rounded-xl bg-primary-50 items-center justify-center">
          <UtensilsCrossed size={24} color="#10b981" strokeWidth={1.5} />
        </View>
      )}
      {!item.isAvailable && (
        <View className="absolute inset-0 items-center justify-center">
          <Text className="text-sm text-red-500 font-semibold bg-white px-2 py-1 rounded">
            არ არის ხელმისაწვდომი
          </Text>
        </View>
      )}
    </TouchableOpacity>
  );
}

function AddToCartModal({
  visible,
  item,
  restaurant,
  onClose,
}: {
  visible: boolean;
  item: MenuItem | null;
  restaurant: Restaurant;
  onClose: () => void;
}) {
  const [quantity, setQuantity] = useState(1);
  const addItem = useCartStore((state) => state.addItem);

  if (!item) return null;

  const handleAdd = () => {
    addItem(
      {
        menuItemId: item.id,
        name: item.name,
        price: item.price,
        quantity,
      },
      restaurant
    );
    setQuantity(1);
    onClose();
  };

  return (
    <Modal visible={visible} transparent animationType="slide">
      <TouchableOpacity
        activeOpacity={1}
        onPress={onClose}
        className="flex-1 bg-black/50 justify-end"
      >
        <TouchableOpacity activeOpacity={1} className="bg-white rounded-t-3xl p-6">
          <View className="flex-row items-start mb-4">
            {item.imageUrl ? (
              <Image
                source={{ uri: item.imageUrl }}
                className="w-24 h-24 rounded-2xl mr-4"
                resizeMode="cover"
              />
            ) : (
              <View className="w-24 h-24 rounded-2xl bg-primary-50 items-center justify-center mr-4">
                <UtensilsCrossed size={32} color="#10b981" strokeWidth={1.5} />
              </View>
            )}
            <View className="flex-1">
              <Text className="text-xl font-bold text-gray-900 mb-1">
                {item.name}
              </Text>
              {item.description && (
                <Text className="text-sm text-gray-500">{item.description}</Text>
              )}
            </View>
          </View>

          <View className="flex-row items-center justify-between py-4 border-t border-gray-100">
            <Text className="text-base text-gray-600">რაოდენობა</Text>
            <View className="flex-row items-center">
              <TouchableOpacity
                onPress={() => setQuantity(Math.max(1, quantity - 1))}
                className="w-11 h-11 rounded-full bg-gray-100 items-center justify-center"
              >
                <Minus size={20} color="#6B7280" strokeWidth={2} />
              </TouchableOpacity>
              <Text className="text-xl font-semibold mx-6">{quantity}</Text>
              <TouchableOpacity
                onPress={() => setQuantity(quantity + 1)}
                className="w-11 h-11 rounded-full bg-primary-500 items-center justify-center"
              >
                <Plus size={20} color="#ffffff" strokeWidth={2} />
              </TouchableOpacity>
            </View>
          </View>

          <TouchableOpacity
            onPress={handleAdd}
            className="bg-primary-500 py-4 rounded-xl items-center mt-4"
          >
            <Text className="text-white text-lg font-semibold">
              დამატება - {((item.price ?? 0) * quantity).toFixed(2)}₾
            </Text>
          </TouchableOpacity>
        </TouchableOpacity>
      </TouchableOpacity>
    </Modal>
  );
}

function CartButton() {
  const restaurantName = useCartStore((state) => state.restaurantName);
  const itemCount = useCartItemCount();
  const total = useCartTotal();

  if (itemCount === 0) return null;

  return (
    <TouchableOpacity
      onPress={() => router.push("/cart")}
      className="absolute bottom-6 left-4 right-4 bg-primary-500 rounded-2xl py-4 px-6 flex-row items-center justify-between shadow-lg"
    >
      <View className="flex-row items-center">
        <View className="w-10 h-10 rounded-full bg-white/20 items-center justify-center mr-3">
          <ShoppingBag size={20} color="#ffffff" strokeWidth={2} />
        </View>
        <View>
          <Text className="text-white text-base font-semibold">
            {itemCount} ნივთი
          </Text>
          <Text className="text-white/70 text-sm">{restaurantName}</Text>
        </View>
      </View>
      <Text className="text-white text-lg font-bold">{(total ?? 0).toFixed(2)}₾</Text>
    </TouchableOpacity>
  );
}

export default function RestaurantScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { data, isLoading, isError, refetch } = useRestaurant(id);
  const [selectedItem, setSelectedItem] = useState<MenuItem | null>(null);
  const [modalVisible, setModalVisible] = useState(false);

  if (isLoading) {
    return (
      <View className="flex-1 items-center justify-center bg-white">
        <ActivityIndicator size="large" color="#10b981" />
      </View>
    );
  }

  if (isError || !data?.data?.restaurant) {
    return (
      <View className="flex-1 items-center justify-center bg-white px-6">
        <View className="w-16 h-16 rounded-full bg-red-50 items-center justify-center mb-4">
          <AlertCircle size={32} color="#EF4444" strokeWidth={2} />
        </View>
        <Text className="text-gray-500 text-center mb-4">
          რესტორანი ვერ მოიძებნა
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

  const restaurant: Restaurant = data.data.restaurant;

  const handleAddItem = (item: MenuItem) => {
    setSelectedItem(item);
    setModalVisible(true);
  };

  return (
    <View className="flex-1 bg-gray-50">
      <ScrollView className="flex-1">
        <View className="h-52 bg-gray-200">
          {restaurant.coverImageUrl || restaurant.imageUrl ? (
            <Image
              source={{ uri: restaurant.coverImageUrl || restaurant.imageUrl || "" }}
              className="w-full h-full"
              resizeMode="cover"
            />
          ) : (
            <View className="w-full h-full items-center justify-center bg-primary-50">
              <UtensilsCrossed size={64} color="#10b981" strokeWidth={1.5} />
            </View>
          )}
        </View>

        <View className="bg-white px-4 py-5 -mt-6 rounded-t-3xl">
          <Text className="text-2xl font-bold text-gray-900 mb-1">
            {restaurant.name}
          </Text>
          {restaurant.description && (
            <Text className="text-sm text-gray-500 mb-4">
              {restaurant.description}
            </Text>
          )}
          <View className="flex-row items-center flex-wrap">
            <View className="flex-row items-center mr-4">
              <Bike size={16} color="#6B7280" strokeWidth={2} />
              <Text className="text-sm text-gray-600 ml-1">
                {(restaurant.deliveryFee ?? 0).toFixed(2)}₾
              </Text>
            </View>
            <View className="flex-row items-center mr-4">
              <Clock size={16} color="#6B7280" strokeWidth={2} />
              <Text className="text-sm text-gray-600 ml-1">
                {restaurant.avgPrepTime ?? 0} წთ
              </Text>
            </View>
            <View className="flex-row items-center">
              <MapPin size={16} color="#6B7280" strokeWidth={2} />
              <Text className="text-sm text-gray-600 ml-1" numberOfLines={1}>
                {restaurant.address}
              </Text>
            </View>
          </View>
        </View>

        <View className="px-4 py-4 pb-32">
          {(restaurant.categories || []).map((category) => (
            <View key={category.id} className="mb-6">
              <Text className="text-lg font-bold text-gray-900 mb-3">
                {category.name}
              </Text>
              {(category.menuItems || []).map((item) => (
                <MenuItemCard
                  key={item.id}
                  item={item}
                  onAdd={() => handleAddItem(item)}
                />
              ))}
            </View>
          ))}
        </View>
      </ScrollView>

      <CartButton />

      <AddToCartModal
        visible={modalVisible}
        item={selectedItem}
        restaurant={restaurant}
        onClose={() => {
          setModalVisible(false);
          setSelectedItem(null);
        }}
      />
    </View>
  );
}
