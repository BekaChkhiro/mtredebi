import { useEffect, useState } from "react";
import { View, ActivityIndicator } from "react-native";
import { Stack } from "expo-router";
import { StatusBar } from "expo-status-bar";
import * as SplashScreen from "expo-splash-screen";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { GestureHandlerRootView } from "react-native-gesture-handler";

import { SocketProvider } from "@/components/SocketProvider";
import { NotificationProvider } from "@/components/NotificationProvider";
import "../src/global.css";

SplashScreen.preventAutoHideAsync();

function RootLayoutNav() {
  return (
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
          name="order/[id]"
          options={{
            headerShown: true,
            headerTitle: "შეკვეთის დეტალები",
            headerTintColor: "#0EA5E9",
          }}
        />
      </Stack>
      <StatusBar style="auto" />
    </GestureHandlerRootView>
  );
}

export default function RootLayout() {
  const [isReady, setIsReady] = useState(false);
  const [queryClient] = useState(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: {
            staleTime: 1000 * 60 * 5,
            retry: 2,
          },
        },
      })
  );

  useEffect(() => {
    SplashScreen.hideAsync();
    setIsReady(true);
  }, []);

  if (!isReady) {
    return (
      <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
        <ActivityIndicator size="large" color="#0EA5E9" />
      </View>
    );
  }

  return (
    <QueryClientProvider client={queryClient}>
      <SocketProvider>
        <NotificationProvider>
          <RootLayoutNav />
        </NotificationProvider>
      </SocketProvider>
    </QueryClientProvider>
  );
}
