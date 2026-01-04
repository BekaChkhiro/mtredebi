import { useEffect } from "react";
import { Stack } from "expo-router";
import { StatusBar } from "expo-status-bar";
import * as SplashScreen from "expo-splash-screen";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { SocketProvider } from "@/components/SocketProvider";
import { NotificationProvider } from "@/components/NotificationProvider";

import "../src/global.css";

SplashScreen.preventAutoHideAsync();

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60 * 5,
      retry: 2,
    },
  },
});

export default function RootLayout() {
  useEffect(() => {
    SplashScreen.hideAsync();
  }, []);

  return (
    <QueryClientProvider client={queryClient}>
      <SocketProvider>
        <NotificationProvider>
          <GestureHandlerRootView style={{ flex: 1 }}>
            <Stack
              screenOptions={{
                headerShown: false,
              }}
            >
              <Stack.Screen name="index" />
              <Stack.Screen name="(auth)" />
              <Stack.Screen name="(tabs)" />
              <Stack.Screen
                name="restaurant/[id]"
                options={{
                  headerShown: true,
                  headerTitle: "",
                  headerTransparent: true,
                }}
              />
              <Stack.Screen
                name="cart"
                options={{
                  presentation: "modal",
                  headerShown: true,
                  headerTitle: "კალათა",
                }}
              />
              <Stack.Screen
                name="checkout"
                options={{
                  headerShown: true,
                  headerTitle: "შეკვეთის გაფორმება",
                }}
              />
              <Stack.Screen
                name="order/[id]"
                options={{
                  headerShown: true,
                  headerTitle: "შეკვეთის თვალყურისდევნება",
                }}
              />
            </Stack>
            <StatusBar style="auto" />
          </GestureHandlerRootView>
        </NotificationProvider>
      </SocketProvider>
    </QueryClientProvider>
  );
}
