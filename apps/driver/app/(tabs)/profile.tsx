import { useState } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  TextInput,
  Alert,
  ActivityIndicator,
  ScrollView,
} from "react-native";
import { router } from "expo-router";
import {
  User,
  Phone,
  Edit3,
  LogOut,
  ChevronRight,
  Shield,
  HelpCircle,
  Bell,
  MapPin,
} from "lucide-react-native";
import { useAuthStore } from "@/store/auth.store";
import { useUpdateProfile } from "@/hooks/useAuth";

function MenuItem({
  icon: Icon,
  label,
  value,
  onPress,
  showArrow = true,
  danger = false,
}: {
  icon: any;
  label: string;
  value?: string;
  onPress?: () => void;
  showArrow?: boolean;
  danger?: boolean;
}) {
  return (
    <TouchableOpacity
      className="flex-row items-center py-4 border-b border-gray-100"
      onPress={onPress}
      disabled={!onPress}
    >
      <View
        className={`w-10 h-10 rounded-full items-center justify-center mr-3 ${
          danger ? "bg-red-100" : "bg-gray-100"
        }`}
      >
        <Icon size={20} color={danger ? "#EF4444" : "#6B7280"} strokeWidth={2} />
      </View>
      <View className="flex-1">
        <Text className={`text-base ${danger ? "text-red-600" : "text-gray-900"}`}>
          {label}
        </Text>
        {value && <Text className="text-sm text-gray-500">{value}</Text>}
      </View>
      {showArrow && <ChevronRight size={20} color="#9CA3AF" strokeWidth={2} />}
    </TouchableOpacity>
  );
}

export default function ProfileScreen() {
  const user = useAuthStore((state) => state.user);
  const driverStatus = useAuthStore((state) => state.driverStatus);
  const logout = useAuthStore((state) => state.logout);
  const updateProfile = useUpdateProfile();

  const [isEditing, setIsEditing] = useState(false);
  const [name, setName] = useState(user?.name || "");

  const handleSave = () => {
    if (!name.trim()) {
      Alert.alert("შეცდომა", "სახელი აუცილებელია");
      return;
    }

    updateProfile.mutate(
      { name: name.trim() },
      {
        onSuccess: () => {
          setIsEditing(false);
          Alert.alert("წარმატება", "პროფილი განახლდა");
        },
        onError: () => {
          Alert.alert("შეცდომა", "პროფილის განახლება ვერ მოხერხდა");
        },
      }
    );
  };

  const handleLogout = () => {
    Alert.alert("გასვლა", "ნამდვილად გსურთ გასვლა?", [
      { text: "გაუქმება", style: "cancel" },
      {
        text: "გასვლა",
        style: "destructive",
        onPress: () => {
          logout();
          router.replace("/(auth)/phone");
        },
      },
    ]);
  };

  const formatPhone = (phone: string) => {
    const digits = phone.replace(/\D/g, "");
    if (digits.length >= 12) {
      return `+${digits.slice(0, 3)} ${digits.slice(3, 6)} ${digits.slice(6, 9)} ${digits.slice(9, 12)}`;
    }
    return phone;
  };

  return (
    <ScrollView className="flex-1 bg-gray-50">
      {/* Profile Header */}
      <View className="bg-white px-4 py-6 mb-4">
        <View className="items-center mb-4">
          <View className="w-24 h-24 bg-primary-100 rounded-full items-center justify-center mb-3">
            <User size={48} color="#0EA5E9" strokeWidth={2} />
          </View>

          {isEditing ? (
            <View className="w-full px-4">
              <TextInput
                value={name}
                onChangeText={setName}
                placeholder="თქვენი სახელი"
                className="border border-gray-200 rounded-xl px-4 py-3 text-center text-lg mb-3"
                autoFocus
              />
              <View className="flex-row justify-center gap-3">
                <TouchableOpacity
                  className="px-6 py-2 bg-gray-200 rounded-lg"
                  onPress={() => {
                    setIsEditing(false);
                    setName(user?.name || "");
                  }}
                >
                  <Text className="text-gray-700 font-semibold">გაუქმება</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  className="px-6 py-2 bg-primary-500 rounded-lg"
                  onPress={handleSave}
                  disabled={updateProfile.isPending}
                >
                  {updateProfile.isPending ? (
                    <ActivityIndicator size="small" color="white" />
                  ) : (
                    <Text className="text-white font-semibold">შენახვა</Text>
                  )}
                </TouchableOpacity>
              </View>
            </View>
          ) : (
            <>
              <Text className="text-2xl font-bold text-gray-900 mb-1">
                {user?.name || "მძღოლი"}
              </Text>
              <Text className="text-base text-gray-500 mb-2">
                {formatPhone(user?.phone || "")}
              </Text>
              <TouchableOpacity
                className="flex-row items-center"
                onPress={() => setIsEditing(true)}
              >
                <Edit3 size={16} color="#0EA5E9" strokeWidth={2} />
                <Text className="text-primary-500 font-semibold ml-1">
                  რედაქტირება
                </Text>
              </TouchableOpacity>
            </>
          )}
        </View>

        {/* Driver Status Badge */}
        <View className="flex-row justify-center">
          <View
            className={`px-4 py-2 rounded-full ${
              driverStatus === "ONLINE"
                ? "bg-green-100"
                : driverStatus === "BUSY"
                ? "bg-yellow-100"
                : "bg-gray-100"
            }`}
          >
            <Text
              className={`font-semibold ${
                driverStatus === "ONLINE"
                  ? "text-green-700"
                  : driverStatus === "BUSY"
                  ? "text-yellow-700"
                  : "text-gray-700"
              }`}
            >
              {driverStatus === "ONLINE"
                ? "ონლაინ"
                : driverStatus === "BUSY"
                ? "დაკავებული"
                : "ოფლაინ"}
            </Text>
          </View>
        </View>
      </View>

      {/* Menu Items */}
      <View className="bg-white px-4 mb-4">
        <MenuItem
          icon={Phone}
          label="ტელეფონი"
          value={formatPhone(user?.phone || "")}
          showArrow={false}
        />
        <MenuItem
          icon={Shield}
          label="როლი"
          value="მძღოლი"
          showArrow={false}
        />
        <MenuItem
          icon={MapPin}
          label="ლოკაციის ნებართვა"
          value="ჩართული"
          showArrow={false}
        />
      </View>

      {/* Settings */}
      <View className="bg-white px-4 mb-4">
        <MenuItem
          icon={Bell}
          label="შეტყობინებები"
          onPress={() => Alert.alert("შეტყობინებები", "შეტყობინებები ჩართულია")}
        />
        <MenuItem
          icon={HelpCircle}
          label="დახმარება"
          onPress={() => Alert.alert("დახმარება", "დაგვიკავშირდით: support@mtredebi.ge")}
        />
      </View>

      {/* Logout */}
      <View className="bg-white px-4 mb-8">
        <MenuItem
          icon={LogOut}
          label="გასვლა"
          onPress={handleLogout}
          danger
          showArrow={false}
        />
      </View>

      {/* App Version */}
      <View className="items-center pb-8">
        <Text className="text-sm text-gray-400">მტრედები მძღოლი v1.0.0</Text>
      </View>
    </ScrollView>
  );
}
