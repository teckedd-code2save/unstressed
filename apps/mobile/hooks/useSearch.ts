import { useState, useCallback } from 'react'
import { useAuth } from '@clerk/clerk-expo'
import { createApiClient } from '@/lib/api'
import { getBestEffortLocation } from '@/lib/location'

export type SearchResult = {
  id: string
  title: string
  description: string
  imageUrl: string | null
  contextTags: string[]
  moodTags: string[]
  distanceMins: number
  whyItFits: string | null
}

export function useSearch() {
  const { getToken } = useAuth()
  const [results, setResults] = useState<SearchResult[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const search = useCallback(
    async (query: string, moodFilters: string[]) => {
      if (!query && !moodFilters.length) {
        setResults([])
        return
      }
      setIsLoading(true)
      setError(null)
      try {
        const api = createApiClient(getToken)
        const location = await getBestEffortLocation()
        const data = await api.post('/api/search', {
          query,
          moodFilters,
          ...(location
            ? {
                lat: location.latitude,
                lng: location.longitude,
              }
            : {}),
        })
        setResults(data.results ?? [])
      } catch (err: any) {
        setError(err.message)
      } finally {
        setIsLoading(false)
      }
    },
    [getToken],
  )

  return { results, isLoading, error, search }
}
