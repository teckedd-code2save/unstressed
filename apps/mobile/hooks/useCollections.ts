import { useAuth } from '@clerk/clerk-expo'
import { useQuery } from 'react-query'
import { createApiClient } from '@/lib/api'

export type Trip = {
  id: string
  name: string
  subtitle: string
  coverImage: string | null
  dateRange?: string
  daysUntil?: number
  memberAvatars?: string[]
}

export type Folder = {
  id: string
  name: string
  description: string
  icon: string
  itemCount: number
  tags?: string[]
}

export type RecentSave = {
  id: string
  name: string
  location: string
  imageUrl: string | null
  collectionName: string
}

export function useCollections() {
  const { getToken } = useAuth()
  const query = useQuery<
    { trips?: Trip[]; folders?: Folder[]; recentlySaved?: RecentSave[] },
    Error
  >(
    ['collections'],
    async () => {
      const api = createApiClient(getToken)
      return api.get('/api/collections')
    },
    {
      staleTime: 5 * 60_000,
    },
  )

  return {
    trips: query.data?.trips ?? [],
    folders: query.data?.folders ?? [],
    recentlySaved: query.data?.recentlySaved ?? [],
    isLoading: query.isLoading,
    error: query.error?.message ?? null,
    refetch: query.refetch,
  }
}
