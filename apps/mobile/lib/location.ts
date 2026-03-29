import * as Location from 'expo-location'

type DeviceLocation = {
  latitude: number
  longitude: number
}

let cachedLocation: DeviceLocation | null = null
let permissionSettled = false
let permissionGranted = false

async function withTimeout<T>(promise: Promise<T>, timeoutMs: number): Promise<T | null> {
  return Promise.race([
    promise,
    new Promise<null>((resolve) => setTimeout(() => resolve(null), timeoutMs)),
  ])
}

export async function getBestEffortLocation(): Promise<DeviceLocation | null> {
  if (cachedLocation) return cachedLocation

  if (!permissionSettled) {
    const current = await Location.getForegroundPermissionsAsync()
    if (current.granted) {
      permissionGranted = true
    } else {
      const requested = await withTimeout(Location.requestForegroundPermissionsAsync(), 2000)
      permissionGranted = requested?.granted ?? false
    }
    permissionSettled = true
  }

  if (!permissionGranted) return null

  const lastKnown = await withTimeout(
    Location.getLastKnownPositionAsync({
      maxAge: 1000 * 60 * 10,
      requiredAccuracy: 1000,
    }),
    800,
  )

  if (lastKnown?.coords) {
    cachedLocation = {
      latitude: lastKnown.coords.latitude,
      longitude: lastKnown.coords.longitude,
    }
    return cachedLocation
  }

  const current = await withTimeout(
    Location.getCurrentPositionAsync({ accuracy: Location.Accuracy.Balanced }),
    2200,
  )

  if (!current?.coords) return null

  cachedLocation = {
    latitude: current.coords.latitude,
    longitude: current.coords.longitude,
  }
  return cachedLocation
}
