import { useState } from 'react'
import { useAuth, useUser } from '@clerk/clerk-expo'
import { createApiClient } from '@/lib/api'
import { useCachedApi } from './useCachedApi'

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
  const { user } = useUser()
  const [isSaving, setIsSaving] = useState(false)

  const { data: context, isLoading, mutate } = useCachedApi<UserContext>(
    user?.id ? `ctx-${user.id}` : null,
    async () => {
      const api = createApiClient(getToken)
      return await api.get('/api/context')
    },
    1000 * 60 * 5 // 5 min TTL
  )

  const updateContext = async (patch: Partial<UserContext>) => {
    if (!context) return
    setIsSaving(true)
    try {
      // Optimistic update
      const nextContext = { ...context, ...patch }
      mutate(nextContext)

      // Network update
      const api = createApiClient(getToken)
      const updated = await api.patch('/api/context', patch)
      mutate(updated)
    } finally {
      setIsSaving(false)
    }
  }

  return { context, isLoading, isSaving, updateContext }
}
