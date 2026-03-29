import { useAuth } from '@clerk/clerk-expo'
import { useMutation, useQuery, useQueryClient } from 'react-query'
import { createApiClient } from '@/lib/api'

export type GroupSummary = {
  id: string
  name: string
  role: 'HOST' | 'MEMBER'
  memberCount: number
  pendingVotes: number
  nextDecisionAt: string
}

export type GroupPlanParticipant = {
  userId: string
  displayName: string
  voteStatus: 'SUBMITTED' | 'PENDING'
}

export type GroupPlanOption = {
  id: string
  title: string
  category: string
  score: number
  votes: number
  whyItFits: string
  isSelectedByUser: boolean
}

export type GroupPlanItineraryItem = {
  id: string
  startsAt: string
  title: string
  type: string
}

export type GroupsDashboard = {
  groups: GroupSummary[]
  activePlan: {
    id: string
    groupId: string
    title: string
    status: 'DRAFT' | 'VOTING' | 'FINALIZED'
    window: {
      start: string
      end: string
    }
    participants: GroupPlanParticipant[]
    options: GroupPlanOption[]
    itineraryDraft: GroupPlanItineraryItem[]
  } | null
}

export function useGroupsDashboard() {
  const { getToken } = useAuth()
  const queryClient = useQueryClient()

  const query = useQuery<GroupsDashboard, Error>(
    ['groups-dashboard'],
    async () => {
      const api = createApiClient(getToken)
      return api.get('/api/groups/dashboard')
    },
    {
      staleTime: 60_000,
    },
  )

  const voteMutation = useMutation<GroupsDashboard, Error, { optionId: string }>(
    async ({ optionId }) => {
      const api = createApiClient(getToken)
      return api.post(`/api/groups/options/${optionId}/votes`, {})
    },
    {
      onSuccess: (nextDashboard) => {
        queryClient.setQueryData(['groups-dashboard'], nextDashboard)
      },
    },
  )

  return {
    dashboard: query.data ?? null,
    isLoading: query.isLoading,
    error: query.error?.message ?? voteMutation.error?.message ?? null,
    isSubmittingVote: voteMutation.isLoading,
    submitVote: async (optionId: string) => voteMutation.mutateAsync({ optionId }),
    refetch: query.refetch,
  }
}
