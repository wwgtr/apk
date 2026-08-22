import MaterialIcons from "@expo/vector-icons/MaterialIcons";
import { Tabs } from "expo-router";
import { Platform } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { HapticTab } from "@/components/haptic-tab";
import { sirajColors } from "@/components/siraj-ui";

export default function TabLayout() {
  const insets = useSafeAreaInsets();
  const bottomPadding = Platform.OS === "web" ? 10 : Math.max(insets.bottom, 8);
  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: sirajColors.jade,
        tabBarInactiveTintColor: "#87918B",
        tabBarButton: HapticTab,
        tabBarLabelStyle: { fontSize: 10, fontWeight: "700", writingDirection: "rtl" },
        tabBarStyle: {
          backgroundColor: "#FFFEFB",
          borderTopColor: "#E9E2D2",
          height: 58 + bottomPadding,
          paddingBottom: bottomPadding,
          paddingTop: 6,
        },
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: "الرئيسية",
          tabBarIcon: ({ color, focused }) => <MaterialIcons name={focused ? "home" : "home-filled"} size={24} color={color} />,
        }}
      />
      <Tabs.Screen name="library" options={{ title: "المكتبة", tabBarIcon: ({ color }) => <MaterialIcons name="menu-book" size={23} color={color} /> }} />
      <Tabs.Screen name="calendar" options={{ title: "التقويم", tabBarIcon: ({ color }) => <MaterialIcons name="calendar-month" size={23} color={color} /> }} />
      <Tabs.Screen name="search" options={{ title: "البحث", tabBarIcon: ({ color }) => <MaterialIcons name="search" size={23} color={color} /> }} />
      <Tabs.Screen name="saved" options={{ title: "المفضلة", tabBarIcon: ({ color }) => <MaterialIcons name="bookmark" size={23} color={color} /> }} />
      <Tabs.Screen name="downloads" options={{ href: null }} />
      <Tabs.Screen name="settings" options={{ href: null }} />
    </Tabs>
  );
}
