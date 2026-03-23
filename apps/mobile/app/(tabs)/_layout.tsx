import { Tabs } from "expo-router"
import { useColorScheme } from "react-native"
import { useSafeAreaInsets } from "react-native-safe-area-context"
import { Ionicons } from "@expo/vector-icons"

export default function TabsLayout() {
  const colorScheme = useColorScheme()
  const isDark = colorScheme === "dark"
  const insets = useSafeAreaInsets()
  const activeColor = isDark ? "#93d2d1" : "#156a67"
  const inactiveColor = "#6b7280"

  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: activeColor,
        tabBarInactiveTintColor: inactiveColor,
        tabBarStyle: {
          backgroundColor: isDark ? "#1e201e" : "#faf9f6",
          borderTopWidth: 0,
          elevation: 0,
          shadowOpacity: 0,
          height: 56 + insets.bottom,
          paddingBottom: insets.bottom + 4,
          paddingTop: 6,
        },
        tabBarLabelStyle: {
          fontFamily: "Manrope_600SemiBold",
          fontSize: 10,
          letterSpacing: 0.3,
        },
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: "Right Now",
          tabBarIcon: ({ color, size }) => <Ionicons name="flash" size={size ?? 22} color={color} />,
        }}
      />
      <Tabs.Screen
        name="search"
        options={{
          title: "Search",
          tabBarIcon: ({ color, size }) => <Ionicons name="search" size={size ?? 22} color={color} />,
        }}
      />
      <Tabs.Screen
        name="collections"
        options={{
          title: "Collections",
          tabBarIcon: ({ color, size }) => <Ionicons name="folder" size={size ?? 22} color={color} />,
        }}
      />
      <Tabs.Screen
        name="context"
        options={{
          title: "Context",
          tabBarIcon: ({ color, size }) => <Ionicons name="person" size={size ?? 22} color={color} />,
        }}
      />
    </Tabs>
  )
}
