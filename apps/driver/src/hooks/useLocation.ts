import { useEffect, useRef, useCallback } from "react";
import * as Location from "expo-location";
import * as TaskManager from "expo-task-manager";
import { useAuthStore } from "@/store/auth.store";
import { updateDriverLocation } from "@/api/driver";
import { getSocket } from "@/components/SocketProvider";

const LOCATION_TASK_NAME = "driver-location-task";
const LOCATION_INTERVAL = 10000; // 10 seconds

// Define the background task
TaskManager.defineTask(LOCATION_TASK_NAME, async ({ data, error }) => {
  if (error) {
    console.error("[Location Task] Error:", error);
    return;
  }

  if (data) {
    const { locations } = data as { locations: Location.LocationObject[] };
    const location = locations[0];

    if (location) {
      try {
        // Update location via API
        await updateDriverLocation(
          location.coords.latitude,
          location.coords.longitude
        );

        // Also emit via socket if connected
        const socket = getSocket();
        if (socket?.connected) {
          socket.emit("driver:location", {
            lat: location.coords.latitude,
            lng: location.coords.longitude,
          });
        }

        console.log("[Location Task] Updated:", location.coords);
      } catch (err) {
        console.error("[Location Task] Failed to update:", err);
      }
    }
  }
});

export function useLocation() {
  const driverStatus = useAuthStore((state) => state.driverStatus);
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
  const locationSubscription = useRef<Location.LocationSubscription | null>(null);

  const requestPermissions = useCallback(async () => {
    const { status: foregroundStatus } =
      await Location.requestForegroundPermissionsAsync();

    if (foregroundStatus !== "granted") {
      console.log("[Location] Foreground permission denied");
      return false;
    }

    const { status: backgroundStatus } =
      await Location.requestBackgroundPermissionsAsync();

    if (backgroundStatus !== "granted") {
      console.log("[Location] Background permission denied");
      return false;
    }

    return true;
  }, []);

  const startBackgroundTracking = useCallback(async () => {
    const hasPermission = await requestPermissions();
    if (!hasPermission) return;

    const isTaskRegistered = await TaskManager.isTaskRegisteredAsync(
      LOCATION_TASK_NAME
    );

    if (!isTaskRegistered) {
      await Location.startLocationUpdatesAsync(LOCATION_TASK_NAME, {
        accuracy: Location.Accuracy.High,
        timeInterval: LOCATION_INTERVAL,
        distanceInterval: 50, // meters
        foregroundService: {
          notificationTitle: "მტრედები - მძღოლი",
          notificationBody: "თქვენი ლოკაცია განახლდება",
          notificationColor: "#0EA5E9",
        },
        pausesUpdatesAutomatically: false,
        showsBackgroundLocationIndicator: true,
      });
      console.log("[Location] Background tracking started");
    }
  }, [requestPermissions]);

  const stopBackgroundTracking = useCallback(async () => {
    const isTaskRegistered = await TaskManager.isTaskRegisteredAsync(
      LOCATION_TASK_NAME
    );

    if (isTaskRegistered) {
      await Location.stopLocationUpdatesAsync(LOCATION_TASK_NAME);
      console.log("[Location] Background tracking stopped");
    }
  }, []);

  const startForegroundTracking = useCallback(async () => {
    const hasPermission = await requestPermissions();
    if (!hasPermission) return;

    if (locationSubscription.current) {
      locationSubscription.current.remove();
    }

    locationSubscription.current = await Location.watchPositionAsync(
      {
        accuracy: Location.Accuracy.High,
        timeInterval: LOCATION_INTERVAL,
        distanceInterval: 50,
      },
      async (location) => {
        try {
          await updateDriverLocation(
            location.coords.latitude,
            location.coords.longitude
          );

          const socket = getSocket();
          if (socket?.connected) {
            socket.emit("driver:location", {
              lat: location.coords.latitude,
              lng: location.coords.longitude,
            });
          }

          console.log("[Location] Foreground update:", location.coords);
        } catch (err) {
          console.error("[Location] Failed to update:", err);
        }
      }
    );

    console.log("[Location] Foreground tracking started");
  }, [requestPermissions]);

  const stopForegroundTracking = useCallback(() => {
    if (locationSubscription.current) {
      locationSubscription.current.remove();
      locationSubscription.current = null;
      console.log("[Location] Foreground tracking stopped");
    }
  }, []);

  const getCurrentLocation = useCallback(async () => {
    const hasPermission = await requestPermissions();
    if (!hasPermission) return null;

    const location = await Location.getCurrentPositionAsync({
      accuracy: Location.Accuracy.High,
    });

    return location;
  }, [requestPermissions]);

  // Auto-manage tracking based on driver status
  useEffect(() => {
    if (!isAuthenticated) {
      stopBackgroundTracking();
      stopForegroundTracking();
      return;
    }

    if (driverStatus === "ONLINE" || driverStatus === "BUSY") {
      startBackgroundTracking();
    } else {
      stopBackgroundTracking();
      stopForegroundTracking();
    }

    return () => {
      stopForegroundTracking();
    };
  }, [
    driverStatus,
    isAuthenticated,
    startBackgroundTracking,
    stopBackgroundTracking,
    stopForegroundTracking,
  ]);

  return {
    requestPermissions,
    startBackgroundTracking,
    stopBackgroundTracking,
    startForegroundTracking,
    stopForegroundTracking,
    getCurrentLocation,
  };
}
