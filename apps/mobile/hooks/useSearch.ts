import { useState, useCallback } from 'react'
import { useAuth } from '@clerk/clerk-expo'
import * as Location from 'expo-location'
import { createApiClient } from '@/lib/api'

export type SearchResult = {
  id: string
  title: string
  description: string
  address: string
  imageUrl: string | null
  rating: number | null
  reviewCount: number | null
  isOpenNow: boolean | null
  contextTags: string[]
  moodTags: string[]
  distanceMins: number | null
  whyItFits: string | null
  lat?: number
  lng?: number
}

export function useSearch() {
  const { getToken } = useAuth()
  const [results, setResults] = useState<SearchResult[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [requiresLocation, setRequiresLocation] = useState(false)

  const search = useCallback(
    async (query: string, moodFilters: string[]) => {
      if (!query && !moodFilters.length) {
        setResults([])
        return
      }
      setIsLoading(true)
      setError(null)
      setRequiresLocation(false)

      try {
        // Get location
        const { status } = await Location.requestForegroundPermissionsAsync()
        let coords: { lat: number; lng: number } | null = null

        if (status === 'granted') {
          const loc = await Location.getCurrentPositionAsync({ accuracy: Location.Accuracy.Balanced })
          coords = { lat: loc.coords.latitude, lng: loc.coords.longitude }
        }

        const api = createApiClient(getToken)
        const data = await api.post('/api/search', {
          query,
          moodFilters,
          ...(coords ?? {}),
        })

        if (data.requiresLocation) {
          setRequiresLocation(true)
          setResults([])
        } else {
          setResults(data.results ?? [])
        }
      } catch (err: any) {
        setError(err.message)
      } finally {
        setIsLoading(false)
      }
    },
    [getToken],
  )

  return { results, isLoading, error, search, requiresLocation }
}
