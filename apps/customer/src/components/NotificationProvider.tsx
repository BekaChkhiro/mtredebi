import { useEffect, useState } from "react";
import { Platform } from "react-native";
import * as Device from "expo-device";
import { useAuthStore } from "@/store/auth.store";
import { apiClient } from "@/api/client";

export function NotificationProvider({ children }: { children: React.ReactNode }) {
  const { isAuthenticated, token } = useAuthStore();
  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    setIsReady(true);
  }, []);

  useEffect(() => {
    if (!isReady || !isAuthenticated || !token) return;

    // Only setup notifications on physical devices
    if (!Device.isDevice) {
      console.log("[Notifications] Skipping - not a physical device");
      return;
    }

    const setupNotifications = async () => {
      try {
        const Notifications = await import("expo-notifications");

        // Configure notification behavior
        Notifications.setNotificationHandler({
          handleNotification: async () => ({
            shouldShowAlert: true,
            shouldPlaySound: true,
            shouldSetBadge: true,
          }),
        });

        // Check permissions
        const { status: existingStatus } = await Notifications.getPermissionsAsync();
        let finalStatus = existingStatus;

        if (existingStatus !== "granted") {
          const { status } = await Notifications.requestPermissionsAsync();
          finalStatus = status;
        }

        if (finalStatus !== "granted") {
          console.log("[Notifications] Permission not granted");
          return;
        }

        // Get push token
        const pushToken = await Notifications.getExpoPushTokenAsync();
        console.log("[Notifications] Push token:", pushToken.data);

        // Save to backend
        await apiClient.put("/auth/push-token", { pushToken: pushToken.data });
        console.log("[Notifications] Token saved to backend");

        // Android channel
        if (Platform.OS === "android") {
          Notifications.setNotificationChannelAsync("orders", {
            name: "Orders",
            importance: Notifications.AndroidImportance.HIGH,
          });
        }
      } catch (error) {
        console.log("[Notifications] Setup error:", error);
      }
    };

    setupNotifications();
  }, [isReady, isAuthenticated, token]);

  return <>{children}</>;
}
