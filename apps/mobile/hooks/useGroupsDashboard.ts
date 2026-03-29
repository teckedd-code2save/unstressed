import { useAuth } from '@clerk/clerk-expo'
import { useQuery } from 'react-query'
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

  return {
    dashboard: query.data ?? null,
    isLoading: query.isLoading,
    error: query.error?.message ?? null,
    refetch: query.refetch,
  }
}
