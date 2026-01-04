import { useState } from "react";
import {
  View,
  Text,
  TextInput,
  FlatList,
  TouchableOpacity,
  RefreshControl,
  ActivityIndicator,
  Image,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { router } from "expo-router";
import { useRestaurants } from "@/hooks/useRestaurants";
import { Search, X, Bike, Clock, UtensilsCrossed, AlertCircle } from "lucide-react-native";

interface Restaurant {
  id: string;
  name: string;
  description: string | null;
  imageUrl: string | null;
  deliveryFee: number;
  avgPrepTime: number;
  minOrderAmount: number;
}

function RestaurantCard({ restaurant }: { restaurant: Restaurant }) {
  return (
    <TouchableOpacity
      onPress={() => router.push(`/restaurant/${restaurant.id}`)}
      className="bg-white rounded-2xl mb-4 overflow-hidden shadow-sm border border-gray-100"
    >
      <View className="h-40 bg-gray-100">
        {restaurant.imageUrl ? (
          <Image
            source={{ uri: restaurant.imageUrl }}
            className="w-full h-full"
            resizeMode="cover"
          />
        ) : (
          <View className="w-full h-full items-center justify-center bg-primary-50">
            <UtensilsCrossed size={48} color="#10b981" strokeWidth={1.5} />
          </View>
        )}
      </View>
      <View className="p-4">
        <Text className="text-lg font-semibold text-gray-900 mb-1">
          {restaurant.name}
        </Text>
        {restaurant.description && (
          <Text className="text-sm text-gray-500 mb-3" numberOfLines={1}>
            {restaurant.description}
          </Text>
        )}
        <View className="flex-row items-center">
          <View className="flex-row items-center">
            <Bike size={16} color="#6B7280" strokeWidth={2} />
            <Text className="text-sm text-gray-600 ml-1">
              {(restaurant.deliveryFee ?? 0).toFixed(2)}₾
            </Text>
          </View>
          <View className="w-1 h-1 rounded-full bg-gray-300 mx-3" />
          <View className="flex-row items-center">
            <Clock size={16} color="#6B7280" strokeWidth={2} />
            <Text className="text-sm text-gray-600 ml-1">
              {restaurant.avgPrepTime ?? 0} წთ
            </Text>
          </View>
          {(restaurant.minOrderAmount ?? 0) > 0 && (
            <>
              <View className="w-1 h-1 rounded-full bg-gray-300 mx-3" />
              <Text className="text-sm text-gray-600">
                მინ. {(restaurant.minOrderAmount ?? 0).toFixed(0)}₾
              </Text>
            </>
          )}
        </View>
      </View>
    </TouchableOpacity>
  );
}

export default function HomeScreen() {
  const [search, setSearch] = useState("");
  const { data, isLoading, isError, refetch, isRefetching } = useRestaurants(search);

  const restaurants = data?.data?.restaurants || [];

  return (
    <SafeAreaView className="flex-1 bg-gray-50" edges={["top"]}>
      <View className="px-4 pt-4 pb-2">
        <Text className="text-2xl font-bold text-gray-900 mb-4">
          რესტორნები
        </Text>

        <View className="flex-row items-center bg-white rounded-2xl px-4 py-3 border border-gray-200">
          <Search size={20} color="#9CA3AF" strokeWidth={2} />
          <TextInput
            value={search}
            onChangeText={setSearch}
            placeholder="ძიება..."
            className="flex-1 text-base text-gray-900 ml-3"
            placeholderTextColor="#9CA3AF"
          />
          {search.length > 0 && (
            <TouchableOpacity onPress={() => setSearch("")}>
              <X size={20} color="#9CA3AF" strokeWidth={2} />
            </TouchableOpacity>
          )}
        </View>
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
            შეცდომა მოხდა რესტორნების ჩატვირთვისას
          </Text>
          <TouchableOpacity
            onPress={() => refetch()}
            className="bg-primary-500 px-6 py-3 rounded-xl"
          >
            <Text className="text-white font-semibold">თავიდან ცდა</Text>
          </TouchableOpacity>
        </View>
      ) : restaurants.length === 0 ? (
        <View className="flex-1 items-center justify-center px-6">
          <View className="w-16 h-16 rounded-full bg-primary-50 items-center justify-center mb-4">
            <UtensilsCrossed size={32} color="#10b981" strokeWidth={2} />
          </View>
          <Text className="text-gray-500 text-center">
            {search
              ? "რესტორანი ვერ მოიძებნა"
              : "რესტორნები ჯერ არ არის დამატებული"}
          </Text>
        </View>
      ) : (
        <FlatList
          data={restaurants}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => <RestaurantCard restaurant={item} />}
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
