import { View, Text, TouchableOpacity, Alert } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { router } from "expo-router";
import { useAuthStore } from "@/store/auth.store";
import { User, MapPin, Bell, HelpCircle, LogOut, ChevronRight } from "lucide-react-native";

export default function ProfileScreen() {
  const { user, logout } = useAuthStore();

  const handleLogout = () => {
    Alert.alert(
      "გასვლა",
      "ნამდვილად გსურთ გასვლა?",
      [
        { text: "არა", style: "cancel" },
        {
          text: "დიახ",
          style: "destructive",
          onPress: () => {
            logout();
            router.replace("/(auth)/phone");
          },
        },
      ]
    );
  };

  const formatPhone = (phone: string) => {
    const digits = phone.replace(/\D/g, "");
    if (digits.length >= 12) {
      return `+${digits.slice(0, 3)} ${digits.slice(3, 6)} ${digits.slice(6, 9)} ${digits.slice(9, 12)}`;
    }
    return phone;
  };

  return (
    <SafeAreaView className="flex-1 bg-gray-50" edges={["top"]}>
      <View className="px-4 pt-4 pb-2">
        <Text className="text-2xl font-bold text-gray-900">პროფილი</Text>
      </View>

      <View className="flex-1 px-4 pt-4">
        <View className="bg-white rounded-2xl p-5 mb-4">
          <View className="items-center mb-4">
            <View className="w-20 h-20 bg-primary-100 rounded-full items-center justify-center mb-3">
              <User size={36} color="#10b981" strokeWidth={1.5} />
            </View>
            <Text className="text-xl font-semibold text-gray-900">
              {user?.name || "მომხმარებელი"}
            </Text>
            <Text className="text-sm text-gray-500">
              {user?.phone ? formatPhone(user.phone) : ""}
            </Text>
          </View>
        </View>

        <View className="bg-white rounded-2xl overflow-hidden mb-4">
          <TouchableOpacity className="flex-row items-center p-4 border-b border-gray-100">
            <View className="w-10 h-10 rounded-full bg-primary-50 items-center justify-center">
              <MapPin size={20} color="#10b981" strokeWidth={2} />
            </View>
            <Text className="flex-1 text-base text-gray-900 ml-3">მისამართები</Text>
            <ChevronRight size={20} color="#9CA3AF" strokeWidth={2} />
          </TouchableOpacity>

          <TouchableOpacity className="flex-row items-center p-4 border-b border-gray-100">
            <View className="w-10 h-10 rounded-full bg-blue-50 items-center justify-center">
              <Bell size={20} color="#3B82F6" strokeWidth={2} />
            </View>
            <Text className="flex-1 text-base text-gray-900 ml-3">შეტყობინებები</Text>
            <ChevronRight size={20} color="#9CA3AF" strokeWidth={2} />
          </TouchableOpacity>

          <TouchableOpacity className="flex-row items-center p-4">
            <View className="w-10 h-10 rounded-full bg-purple-50 items-center justify-center">
              <HelpCircle size={20} color="#8B5CF6" strokeWidth={2} />
            </View>
            <Text className="flex-1 text-base text-gray-900 ml-3">დახმარება</Text>
            <ChevronRight size={20} color="#9CA3AF" strokeWidth={2} />
          </TouchableOpacity>
        </View>

        <TouchableOpacity
          onPress={handleLogout}
          className="bg-white rounded-2xl p-4 flex-row items-center"
        >
          <View className="w-10 h-10 rounded-full bg-red-50 items-center justify-center">
            <LogOut size={20} color="#EF4444" strokeWidth={2} />
          </View>
          <Text className="flex-1 text-base text-red-500 ml-3">გასვლა</Text>
        </TouchableOpacity>
      </View>

      <View className="px-4 pb-6">
        <Text className="text-center text-sm text-gray-400">
          ვერსია 1.0.0
        </Text>
      </View>
    </SafeAreaView>
  );
}
