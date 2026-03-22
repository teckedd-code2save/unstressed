import { useState, useEffect } from 'react'
import { useAuth } from '@clerk/clerk-expo'
import { createApiClient } from '@/lib/api'

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
    imageUrl: string
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
  const [data, setData] = useState<RightNowData | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const api = createApiClient(getToken)
    api
      .get('/api/suggestions/right-now')
      .then(setData)
      .catch((err) => setError(err.message))
      .finally(() => setIsLoading(false))
  }, [])

  return { data, isLoading, error }
}
