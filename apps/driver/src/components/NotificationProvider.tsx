import { useEffect, useRef } from "react";
import * as Notifications from "expo-notifications";
import * as Device from "expo-device";
import { Platform } from "react-native";
import { useAuthStore } from "@/store/auth.store";
import { updatePushToken } from "@/api/auth";

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

async function registerForPushNotifications(): Promise<string | null> {
  if (!Device.isDevice) {
    console.log("[Notifications] Must use physical device");
    return null;
  }

  const { status: existingStatus } =
    await Notifications.getPermissionsAsync();
  let finalStatus = existingStatus;

  if (existingStatus !== "granted") {
    const { status } = await Notifications.requestPermissionsAsync();
    finalStatus = status;
  }

  if (finalStatus !== "granted") {
    console.log("[Notifications] Permission not granted");
    return null;
  }

  // Get Expo push token
  const token = await Notifications.getExpoPushTokenAsync({
    projectId: "mtredebi-driver", // Replace with your actual project ID
  });

  console.log("[Notifications] Push token:", token.data);

  // Configure Android channel
  if (Platform.OS === "android") {
    await Notifications.setNotificationChannelAsync("default", {
      name: "default",
      importance: Notifications.AndroidImportance.MAX,
      vibrationPattern: [0, 250, 250, 250],
      lightColor: "#0EA5E9",
    });
  }

  return token.data;
}

export function NotificationProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
  const notificationListener = useRef<Notifications.EventSubscription>();
  const responseListener = useRef<Notifications.EventSubscription>();

  useEffect(() => {
    if (!isAuthenticated) return;

    // Register for push notifications
    registerForPushNotifications().then(async (token) => {
      if (token) {
        try {
          await updatePushToken(token);
          console.log("[Notifications] Token registered with server");
        } catch (error) {
          console.error("[Notifications] Failed to register token:", error);
        }
      }
    });

    // Handle incoming notifications when app is foreground
    notificationListener.current =
      Notifications.addNotificationReceivedListener((notification) => {
        console.log("[Notifications] Received:", notification);
      });

    // Handle notification taps
    responseListener.current =
      Notifications.addNotificationResponseReceivedListener((response) => {
        console.log("[Notifications] Response:", response);
        // Handle navigation based on notification data
        const data = response.notification.request.content.data;
        if (data?.orderId) {
          // Navigate to order details
          // You can use router.push here
        }
      });

    return () => {
      if (notificationListener.current) {
        Notifications.removeNotificationSubscription(
          notificationListener.current
        );
      }
      if (responseListener.current) {
        Notifications.removeNotificationSubscription(responseListener.current);
      }
    };
  }, [isAuthenticated]);

  return <>{children}</>;
}
