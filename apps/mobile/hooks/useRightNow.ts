import { useAuth } from '@clerk/clerk-expo'
import { useQuery } from 'react-query'
import { createApiClient } from '@/lib/api'
import { getBestEffortLocation } from '@/lib/location'

export type MomentumItem = {
  time: string
  title: string
  description: string
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
}

export function useRightNow() {
  const { getToken } = useAuth()

  const query = useQuery<RightNowData, Error>(
    ['right-now'],
    async () => {
      const api = createApiClient(getToken)
      const location = await getBestEffortLocation()
      const searchParams = new URLSearchParams()
      if (location) {
        searchParams.set('lat', String(location.latitude))
        searchParams.set('lng', String(location.longitude))
      }
      const path = searchParams.toString()
        ? `/api/suggestions/right-now?${searchParams.toString()}`
        : '/api/suggestions/right-now'
      return api.get(path)
    },
    {
      staleTime: 60_000,
    },
  )

  return {
    data: query.data ?? null,
    isLoading: query.isLoading,
    error: query.error?.message ?? null,
    refetch: query.refetch,
  }
}
