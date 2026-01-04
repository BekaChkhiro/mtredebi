import { useEffect, useRef, useState, useCallback } from "react";
import { Platform } from "react-native";
import * as Notifications from "expo-notifications";
import * as Device from "expo-device";
import Constants from "expo-constants";
import { useRouter } from "expo-router";
import { useAuthStore } from "@/store/auth.store";
import { apiClient } from "@/api/client";

// Configure notification behavior
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: true,
    shouldShowBanner: true,
    shouldShowList: true,
  }),
});

interface NotificationData {
  type?: string;
  orderId?: string;
  [key: string]: unknown;
}

export function useNotifications() {
  const [expoPushToken, setExpoPushToken] = useState<string | null>(null);
  const [permissionStatus, setPermissionStatus] = useState<string | null>(null);
  const notificationListener = useRef<Notifications.EventSubscription | null>(null);
  const responseListener = useRef<Notifications.EventSubscription | null>(null);
  const { isAuthenticated, token } = useAuthStore();
  const router = useRouter();

  // Register for push notifications
  const registerForPushNotifications = useCallback(async () => {
    if (!Device.isDevice) {
      console.log("[Notifications] Must use physical device for push notifications");
      return null;
    }

    // Check existing permissions
    const { status: existingStatus } = await Notifications.getPermissionsAsync();
    let finalStatus = existingStatus;

    // Request permissions if not granted
    if (existingStatus !== "granted") {
      const { status } = await Notifications.requestPermissionsAsync();
      finalStatus = status;
    }

    setPermissionStatus(finalStatus);

    if (finalStatus !== "granted") {
      console.log("[Notifications] Permission not granted");
      return null;
    }

    // Get Expo push token
    try {
      const projectId = Constants.expoConfig?.extra?.eas?.projectId;
      const pushToken = await Notifications.getExpoPushTokenAsync({
        projectId,
      });

      console.log("[Notifications] Push token:", pushToken.data);
      setExpoPushToken(pushToken.data);
      return pushToken.data;
    } catch (error) {
      console.log("[Notifications] Error getting push token:", error);
      return null;
    }
  }, []);

  // Save push token to backend
  const savePushToken = useCallback(async (pushToken: string) => {
    if (!isAuthenticated || !token) return;

    try {
      await apiClient.put("/auth/push-token", { pushToken });
      console.log("[Notifications] Push token saved to backend");
    } catch (error) {
      console.log("[Notifications] Error saving push token:", error);
    }
  }, [isAuthenticated, token]);

  // Handle notification tap
  const handleNotificationResponse = useCallback((response: Notifications.NotificationResponse) => {
    const data = response.notification.request.content.data as NotificationData;
    console.log("[Notifications] Notification tapped:", data);

    // Navigate based on notification type
    if (data?.orderId) {
      router.push(`/order/${data.orderId}`);
    }
  }, [router]);

  // Setup notification listeners
  useEffect(() => {
    if (!isAuthenticated) return;

    // Register and save token
    registerForPushNotifications().then((pushToken) => {
      if (pushToken) {
        savePushToken(pushToken);
      }
    });

    // Listen for notifications when app is in foreground
    notificationListener.current = Notifications.addNotificationReceivedListener((notification) => {
      console.log("[Notifications] Received:", notification.request.content);
    });

    // Listen for notification responses (taps)
    responseListener.current = Notifications.addNotificationResponseReceivedListener(handleNotificationResponse);

    // Android notification channel
    if (Platform.OS === "android") {
      Notifications.setNotificationChannelAsync("orders", {
        name: "Orders",
        importance: Notifications.AndroidImportance.HIGH,
        vibrationPattern: [0, 250, 250, 250],
        lightColor: "#FF6B35",
      });
    }

    return () => {
      if (notificationListener.current) {
        Notifications.removeNotificationSubscription(notificationListener.current);
      }
      if (responseListener.current) {
        Notifications.removeNotificationSubscription(responseListener.current);
      }
    };
  }, [isAuthenticated, registerForPushNotifications, savePushToken, handleNotificationResponse]);

  return {
    expoPushToken,
    permissionStatus,
    registerForPushNotifications,
  };
}

// Schedule a local notification (for testing)
export async function scheduleLocalNotification(title: string, body: string, data?: NotificationData) {
  await Notifications.scheduleNotificationAsync({
    content: {
      title,
      body,
      data,
      sound: true,
    },
    trigger: null, // Immediate
  });
}
