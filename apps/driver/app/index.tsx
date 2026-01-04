import { useEffect } from "react";
import { View, ActivityIndicator } from "react-native";
import { Redirect } from "expo-router";
import { useAuthStore } from "@/store/auth.store";

export default function Index() {
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
  const isLoading = useAuthStore((state) => state.isLoading);
  const user = useAuthStore((state) => state.user);

  if (isLoading) {
    return (
      <View className="flex-1 items-center justify-center bg-white">
        <ActivityIndicator size="large" color="#0EA5E9" />
      </View>
    );
  }

  // Check if user is a driver
  if (isAuthenticated && user?.role === "DRIVER") {
    return <Redirect href="/(tabs)" />;
  }

  return <Redirect href="/(auth)/phone" />;
}
