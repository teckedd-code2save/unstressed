import { Tabs } from 'expo-router'
import { useColorScheme, View, Text } from 'react-native'
import type { ColorSchemeName } from 'react-native'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import { MaterialCommunityIcons } from '@expo/vector-icons'

type TabIconProps = {
  focused: boolean
  colorScheme: ColorSchemeName
  icon: keyof typeof MaterialCommunityIcons.glyphMap
  label: string
}

function TabIcon({ focused, colorScheme, icon, label }: TabIconProps) {
  const isDark = colorScheme === 'dark'
  const activeColor = isDark ? '#93d2d1' : '#156a67'
  const inactiveColor = isDark ? '#bfc8c8' : '#5d605c'

  return (
    <View className="items-center justify-center pt-1">
      <View
        className="items-center justify-center rounded-full"
        style={{
          minWidth: 40,
          height: 30,
          paddingHorizontal: 10,
          backgroundColor: focused ? (isDark ? '#153a39' : '#dcefed') : 'transparent',
        }}
      >
        <MaterialCommunityIcons
          name={icon}
          size={20}
          color={focused ? activeColor : inactiveColor}
        />
      </View>
      <Text
        style={{
          fontFamily: 'Manrope_600SemiBold',
          fontSize: 9,
          color: focused ? activeColor : inactiveColor,
          marginTop: 4,
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
          backgroundColor: isDark ? '#161816' : '#fcfbf8',
          borderTopWidth: 0,
          elevation: 0,
          shadowOpacity: 0.08,
          shadowRadius: 18,
          shadowOffset: { width: 0, height: -6 },
          height: 68 + insets.bottom,
          paddingBottom: insets.bottom + 6,
          paddingTop: 6,
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
            <TabIcon focused={focused} colorScheme={colorScheme} icon="lightning-bolt-outline" label="Right Now" />
          ),
        }}
      />
      <Tabs.Screen
        name="search"
        options={{
          tabBarIcon: ({ focused }) => (
            <TabIcon focused={focused} colorScheme={colorScheme} icon="magnify" label="Search" />
          ),
        }}
      />
      <Tabs.Screen
        name="collections"
        options={{
          tabBarIcon: ({ focused }) => (
            <TabIcon focused={focused} colorScheme={colorScheme} icon="bookmark-multiple-outline" label="Collections" />
          ),
        }}
      />
      <Tabs.Screen
        name="context"
        options={{
          tabBarIcon: ({ focused }) => (
            <TabIcon focused={focused} colorScheme={colorScheme} icon="tune-variant" label="Context" />
          ),
        }}
      />
      <Tabs.Screen
        name="groups"
        options={{
          tabBarIcon: ({ focused }) => (
            <TabIcon focused={focused} colorScheme={colorScheme} icon="account-group-outline" label="Groups" />
          ),
        }}
      />
      <Tabs.Screen
        name="safety"
        options={{
          tabBarIcon: ({ focused }) => (
            <TabIcon focused={focused} colorScheme={colorScheme} icon="shield-check-outline" label="Safety" />
          ),
        }}
      />
    </Tabs>
  )
}
