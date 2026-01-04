import { Tabs } from "expo-router";
import { Package, History, User } from "lucide-react-native";
import { useLocation } from "@/hooks/useLocation";
import { useDriverSocket } from "@/hooks/useSocket";

export default function TabsLayout() {
  // Initialize location tracking
  useLocation();
  // Initialize socket listeners
  useDriverSocket();

  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: "#0EA5E9",
        tabBarInactiveTintColor: "#9CA3AF",
        tabBarStyle: {
          backgroundColor: "#ffffff",
          borderTopColor: "#E5E7EB",
          height: 85,
          paddingBottom: 30,
          paddingTop: 10,
        },
        tabBarLabelStyle: {
          fontSize: 12,
          fontWeight: "600",
        },
        headerStyle: {
          backgroundColor: "#0EA5E9",
        },
        headerTintColor: "#ffffff",
        headerTitleStyle: {
          fontWeight: "bold",
        },
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: "შეკვეთები",
          headerTitle: "ხელმისაწვდომი შეკვეთები",
          tabBarIcon: ({ color, size }) => (
            <Package size={size} color={color} strokeWidth={2} />
          ),
        }}
      />
      <Tabs.Screen
        name="history"
        options={{
          title: "ისტორია",
          headerTitle: "შეკვეთების ისტორია",
          tabBarIcon: ({ color, size }) => (
            <History size={size} color={color} strokeWidth={2} />
          ),
        }}
      />
      <Tabs.Screen
        name="profile"
        options={{
          title: "პროფილი",
          headerTitle: "ჩემი პროფილი",
          tabBarIcon: ({ color, size }) => (
            <User size={size} color={color} strokeWidth={2} />
          ),
        }}
      />
    </Tabs>
  );
}
