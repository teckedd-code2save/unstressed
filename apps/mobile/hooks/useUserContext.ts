import { useState, useEffect } from 'react'
import { useAuth } from '@clerk/clerk-expo'
import { createApiClient } from '@/lib/api'

export type UserContext = {
  energyLevel: string
  preferredSanctuaries: string[]
  silenceStart: string
  silenceEnd: string
  circadianWakeTime: string
  calendarProvider: string | null
  healthProvider: string | null
  lastSynced: string | null
}

export function useUserContext() {
  const { getToken } = useAuth()
  const [context, setContext] = useState<UserContext | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [isSaving, setIsSaving] = useState(false)

  useEffect(() => {
    const api = createApiClient(getToken)
    api
      .get('/api/context')
      .then(setContext)
      .finally(() => setIsLoading(false))
  }, [])

  const updateContext = async (patch: Partial<UserContext>) => {
    setIsSaving(true)
    try {
      const api = createApiClient(getToken)
      const updated = await api.patch('/api/context', patch)
      setContext(updated)
    } finally {
      setIsSaving(false)
    }
  }

  return { context, isLoading, isSaving, updateContext }
}
