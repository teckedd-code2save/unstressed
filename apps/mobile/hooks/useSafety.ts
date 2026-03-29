import { useAuth } from '@clerk/clerk-expo'
import { useMutation, useQuery, useQueryClient } from 'react-query'
import { createApiClient } from '@/lib/api'

export type SafetyCircle = {
  id: string
  name: string
  memberCount: number
  liveShareEnabled: boolean
  quietCheckInIntervalMins: number
}

export type SafetyShareViewer = {
  userId: string
  displayName: string
}

export type SafetyDashboard = {
  circles: SafetyCircle[]
  activeShare: {
    id: string
    ownerUserId: string
    status: 'ACTIVE' | 'PAUSED' | 'ENDED'
    startedAt: string
    expiresAt: string
    destinationLabel: string
    viewers: SafetyShareViewer[]
  } | null
  recentCheckIns: Array<{
    id: string
    status: 'SAFE' | 'DELAYED' | 'HELP'
    note: string | null
    createdAt: string
  }>
}

export function useSafety() {
  const { getToken } = useAuth()
  const queryClient = useQueryClient()

  const query = useQuery<SafetyDashboard, Error>(
    ['safety-dashboard'],
    async () => {
      const api = createApiClient(getToken)
      return api.get('/api/safety/circles')
    },
    {
      staleTime: 30_000,
    },
  )

  const mutation = useMutation<
    { accepted: boolean; status: 'SAFE' | 'DELAYED' | 'HELP'; note: string | null; recordedAt: string },
    Error,
    { status: 'SAFE' | 'DELAYED' | 'HELP'; note?: string }
  >(
    async (payload) => {
      const api = createApiClient(getToken)
      return api.post('/api/safety/check-ins', payload)
    },
    {
      onSuccess: (result) => {
        queryClient.setQueryData<SafetyDashboard | undefined>(['safety-dashboard'], (current) => {
          if (!current) return current
          return {
            ...current,
            recentCheckIns: [
              {
                id: `checkin_${result.recordedAt}`,
                status: result.status,
                note: result.note,
                createdAt: result.recordedAt,
              },
              ...current.recentCheckIns,
            ],
          }
        })
      },
    },
  )

  return {
    dashboard: query.data ?? null,
    isLoading: query.isLoading,
    error: query.error?.message ?? mutation.error?.message ?? null,
    isSubmitting: mutation.isLoading,
    sendCheckIn: mutation.mutateAsync,
    refetch: query.refetch,
  }
}
