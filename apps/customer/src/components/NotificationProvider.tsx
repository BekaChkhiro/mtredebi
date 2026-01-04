import { useEffect } from "react";
import { useNotifications } from "@/hooks/useNotifications";
import { useAuthStore } from "@/store/auth.store";

export function NotificationProvider({ children }: { children: React.ReactNode }) {
  const { isAuthenticated } = useAuthStore();
  const { expoPushToken, permissionStatus } = useNotifications();

  useEffect(() => {
    if (isAuthenticated && expoPushToken) {
      console.log("[Notifications] Ready with token:", expoPushToken);
    }
  }, [isAuthenticated, expoPushToken]);

  return <>{children}</>;
}
