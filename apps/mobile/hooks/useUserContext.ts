import { useAuth } from '@clerk/clerk-expo'
import { useMutation, useQuery, useQueryClient } from 'react-query'
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
  const queryClient = useQueryClient()

  const query = useQuery<UserContext, Error>(
    ['user-context'],
    async () => {
      const api = createApiClient(getToken)
      return api.get('/api/context')
    },
    {
      staleTime: 5 * 60_000,
    },
  )

  const mutation = useMutation<UserContext, Error, Partial<UserContext>>(
    async (patch) => {
      const api = createApiClient(getToken)
      return api.patch('/api/context', patch)
    },
    {
      onSuccess: (updated) => {
        queryClient.setQueryData(['user-context'], updated)
      },
    },
  )

  const updateContext = async (patch: Partial<UserContext>) => {
    await mutation.mutateAsync(patch)
  }

  return {
    context: query.data ?? null,
    isLoading: query.isLoading,
    isSaving: mutation.isLoading,
    error: query.error?.message ?? mutation.error?.message ?? null,
    updateContext,
    refetch: query.refetch,
  }
}
