import { useState, useEffect } from 'react'
import AsyncStorage from '@react-native-async-storage/async-storage'

// Cache hook: returns cached data instantly, then fetches fresh data in background
export function useCachedApi<T>(
  key: string | null,
  fetcher: () => Promise<T>,
  ttlMs = 1000 * 60 * 30 // default 30 min freshness
) {
  const [data, setData] = useState<T | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [isRefreshing, setIsRefreshing] = useState(false)

  useEffect(() => {
    if (!key) {
      setData(null)
      setIsLoading(false)
      return
    }

    let cancelled = false

    const load = async () => {
      // Check cache first (async now)
      try {
        const cachedStr = await AsyncStorage.getItem(`unstressed-cache:${key}`)
        let isStale = true
        
        if (cachedStr) {
          const parsed = JSON.parse(cachedStr)
          if (!cancelled) setData(parsed.data as T)
          
          if (parsed.timestamp && Date.now() - parsed.timestamp < ttlMs) {
            isStale = false // Data is fresh
          }
        }

        if (!isStale && cachedStr) {
          if (!cancelled) setIsLoading(false)
          return
        }
      } catch {}

      if (!cancelled) setIsRefreshing(!!data)
      
      try {
        const result = await fetcher()
        if (!cancelled) {
          setData(result)
          await AsyncStorage.setItem(`unstressed-cache:${key}`, JSON.stringify({ timestamp: Date.now(), data: result }))
          setError(null)
        }
      } catch (err: any) {
        if (!cancelled) setError(err.message)
      } finally {
        if (!cancelled) {
          setIsLoading(false)
          setIsRefreshing(false)
        }
      }
    }

    load()
    return () => { cancelled = true }
  }, [key])

  // Allow manual updates to the cache
  const mutate = async (newData: T) => {
    if (!key) return
    setData(newData)
    try {
      await AsyncStorage.setItem(`unstressed-cache:${key}`, JSON.stringify({ timestamp: Date.now(), data: newData }))
    } catch {}
  }

  return { data, isLoading, isRefreshing, error, mutate }
}

