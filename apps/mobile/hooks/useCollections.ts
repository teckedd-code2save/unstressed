import { useState, useEffect } from 'react'
import { useAuth } from '@clerk/clerk-expo'
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
  const [trips, setTrips] = useState<Trip[]>([])
  const [folders, setFolders] = useState<Folder[]>([])
  const [recentlySaved, setRecentlySaved] = useState<RecentSave[]>([])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const api = createApiClient(getToken)
    api
      .get('/api/collections')
      .then((data) => {
        setTrips(data.trips ?? [])
        setFolders(data.folders ?? [])
        setRecentlySaved(data.recentlySaved ?? [])
      })
      .finally(() => setIsLoading(false))
  }, [])

  return { trips, folders, recentlySaved, isLoading }
}
