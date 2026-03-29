import { Tabs } from 'expo-router'
import { useColorScheme, View, Text } from 'react-native'
import type { ColorSchemeName } from 'react-native'
import { useSafeAreaInsets } from 'react-native-safe-area-context'

type TabIconProps = {
  focused: boolean
  colorScheme: ColorSchemeName
  icon: string
  label: string
}

function TabIcon({ focused, colorScheme, icon, label }: TabIconProps) {
  const isDark = colorScheme === 'dark'
  const activeColor = isDark ? '#93d2d1' : '#156a67'
  const inactiveColor = isDark ? '#bfc8c8' : '#5d605c'

  return (
    <View className="items-center justify-center pt-2">
      <Text style={{ fontSize: 20, color: focused ? activeColor : inactiveColor }}>{icon}</Text>
      <Text
        style={{
          fontFamily: 'Manrope_600SemiBold',
          fontSize: 10,
          color: focused ? activeColor : inactiveColor,
          marginTop: 2,
          letterSpacing: 0.5,
          textTransform: 'uppercase',
        }}
      >
        {label}
      </Text>
    </View>
  )
}

export default function TabsLayout() {
  const colorScheme = useColorScheme()
  const isDark = colorScheme === 'dark'
  const insets = useSafeAreaInsets()

  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarStyle: {
          backgroundColor: isDark ? '#1e201e' : '#faf9f6',
          borderTopWidth: 0,
          elevation: 0,
          shadowOpacity: 0,
          height: 60 + insets.bottom,
          paddingBottom: insets.bottom,
        },
        tabBarActiveTintColor: isDark ? '#93d2d1' : '#156a67',
        tabBarInactiveTintColor: isDark ? '#bfc8c8' : '#5d605c',
        tabBarShowLabel: false,
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          tabBarIcon: ({ focused }) => (
            <TabIcon focused={focused} colorScheme={colorScheme} icon="⚡" label="Right Now" />
          ),
        }}
      />
      <Tabs.Screen
        name="search"
        options={{
          tabBarIcon: ({ focused }) => (
            <TabIcon focused={focused} colorScheme={colorScheme} icon="🔍" label="Search" />
          ),
        }}
      />
      <Tabs.Screen
        name="collections"
        options={{
          tabBarIcon: ({ focused }) => (
            <TabIcon focused={focused} colorScheme={colorScheme} icon="🗂" label="Collections" />
          ),
        }}
      />
      <Tabs.Screen
        name="context"
        options={{
          tabBarIcon: ({ focused }) => (
            <TabIcon focused={focused} colorScheme={colorScheme} icon="◎" label="Context" />
          ),
        }}
      />
      <Tabs.Screen
        name="groups"
        options={{
          tabBarIcon: ({ focused }) => (
            <TabIcon focused={focused} colorScheme={colorScheme} icon="◌" label="Groups" />
          ),
        }}
      />
      <Tabs.Screen
        name="safety"
        options={{
          tabBarIcon: ({ focused }) => (
            <TabIcon focused={focused} colorScheme={colorScheme} icon="▲" label="Safety" />
          ),
        }}
      />
    </Tabs>
  )
}
