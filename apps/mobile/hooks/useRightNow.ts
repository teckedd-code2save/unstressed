import { useState, useEffect } from 'react'
import { useAuth } from '@clerk/clerk-expo'
import * as Location from 'expo-location'
import { createApiClient } from '@/lib/api'

export type MomentumItem = {
  time: string
  title: string
  description: string
}

export type NearbyPlace = {
  title: string
  imageUrl: string | null
  distanceMins: number | null
  rating: number | null
}

export type RightNowData = {
  headline: string
  moodTags: string[]
  heroSuggestion: {
    title: string
    description: string
    imageUrl: string | null
  } | null
  energyInsight: {
    level: string
    title: string
    body: string
  } | null
  recommendation: {
    title: string
    subtitle: string
    cta: string
  } | null
  upcomingMomentum: MomentumItem[]
  contextualInsight: {
    headline: string
    body: string
  } | null
  nearbyPlaces?: NearbyPlace[]
}

export function useRightNow() {
  const { getToken } = useAuth()
  const [data, setData] = useState<RightNowData | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    let cancelled = false

    async function load() {
      try {
        // Request location permission and get coords
        const { status } = await Location.requestForegroundPermissionsAsync()
        let locationParams = ''

        if (status === 'granted') {
          const loc = await Location.getCurrentPositionAsync({ accuracy: Location.Accuracy.Balanced })
          locationParams = `?lat=${loc.coords.latitude}&lng=${loc.coords.longitude}`
        }

        const api = createApiClient(getToken)
        const result = await api.get(`/api/suggestions/right-now${locationParams}`)
        if (!cancelled) setData(result)
      } catch (err: any) {
        if (!cancelled) setError(err.message)
      } finally {
        if (!cancelled) setIsLoading(false)
      }
    }

    load()
    return () => { cancelled = true }
  }, [])

  return { data, isLoading, error }
}
