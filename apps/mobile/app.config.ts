import type { ExpoConfig, ConfigContext } from 'expo/config'

export default ({ config }: ConfigContext): ExpoConfig => ({
  ...config,
  name: 'Unstressed',
  slug: 'unstressed',
  version: '1.0.0',
  orientation: 'portrait',
  scheme: 'unstressed',
  userInterfaceStyle: 'automatic',
  newArchEnabled: true,
  ios: {
    supportsTablet: false,
    bundleIdentifier: 'com.serendepify.unstressed',
    infoPlist: {
      NSLocationWhenInUseUsageDescription:
        'Unstressed uses your location to suggest nearby sanctuaries and enable Safe & Seen.',
      NSLocationAlwaysUsageDescription:
        'Unstressed uses your location in the background for Safe & Seen safety features.',
      NSCalendarsUsageDescription:
        'Unstressed reads your calendar to find pockets of silence and suggest optimal timing.',
      NSHealthShareUsageDescription:
        'Unstressed reads your health data to map your energy levels and improve suggestions.',
    },
  },
  android: {
    package: 'com.serendepify.unstressed',
    permissions: [
      'ACCESS_FINE_LOCATION',
      'ACCESS_COARSE_LOCATION',
      'READ_CALENDAR',
    ],
  },
  web: {
    bundler: 'metro',
    output: 'static',
  },
  plugins: [
    'expo-router',
    'expo-font',
    'expo-secure-store',
    [
      'expo-location',
      {
        locationAlwaysAndWhenInUsePermission:
          'Allow Unstressed to use your location for Safe & Seen.',
      },
    ],
    'expo-splash-screen',
  ],
  experiments: {
    typedRoutes: true,
  },
  extra: {
    clerkPublishableKey: process.env.EXPO_PUBLIC_CLERK_PUBLISHABLE_KEY,
    apiUrl: process.env.EXPO_PUBLIC_API_URL,
    eas: {
      projectId: '18d5ca0d-6610-44be-98bf-dfcca7581922',
    },
  },
})
