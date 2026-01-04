import { Tabs } from "expo-router";
import { View } from "react-native";
import { Home, ClipboardList, User } from "lucide-react-native";

function TabIcon({ name, focused }: { name: string; focused: boolean }) {
  const color = focused ? "#10b981" : "#9CA3AF";
  const size = 24;

  const icons: Record<string, React.ReactNode> = {
    index: <Home size={size} color={color} strokeWidth={focused ? 2.5 : 2} />,
    orders: <ClipboardList size={size} color={color} strokeWidth={focused ? 2.5 : 2} />,
    profile: <User size={size} color={color} strokeWidth={focused ? 2.5 : 2} />,
  };

  return (
    <View className="items-center">
      {icons[name]}
    </View>
  );
}

export default function TabsLayout() {
  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: "#10b981",
        tabBarInactiveTintColor: "#9CA3AF",
        tabBarStyle: {
          borderTopWidth: 1,
          borderTopColor: "#E5E7EB",
          paddingTop: 8,
          paddingBottom: 8,
          height: 60,
        },
        tabBarLabelStyle: {
          fontSize: 12,
          fontWeight: "500",
        },
        headerShown: false,
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: "მთავარი",
          tabBarIcon: ({ focused }) => (
            <TabIcon name="index" focused={focused} />
          ),
        }}
      />
      <Tabs.Screen
        name="orders"
        options={{
          title: "შეკვეთები",
          tabBarIcon: ({ focused }) => (
            <TabIcon name="orders" focused={focused} />
          ),
        }}
      />
      <Tabs.Screen
        name="profile"
        options={{
          title: "პროფილი",
          tabBarIcon: ({ focused }) => (
            <TabIcon name="profile" focused={focused} />
          ),
        }}
      />
    </Tabs>
  );
}
