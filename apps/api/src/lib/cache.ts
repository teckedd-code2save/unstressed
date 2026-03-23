import Keyv from 'keyv'
import KeyvRedis from '@keyv/redis'

let store: Keyv | null = null
let redisAvailable = false

function getStore(): Keyv {
  if (store) return store

  if (process.env.REDIS_URL) {
    try {
      const keyvRedis = new KeyvRedis(process.env.REDIS_URL, {
        connectTimeout: 500,
        maxRetriesPerRequest: 1,
        enableOfflineQueue: false
      })
      
      keyvRedis.on('error', (err) => {
        if (redisAvailable) console.warn('📦 Redis connection lost, falling back to memory')
        redisAvailable = false
      })
      
      keyvRedis.on('ready', () => {
        redisAvailable = true
      })

      store = new Keyv({ store: keyvRedis, namespace: 'unstressed' })
      return store
    } catch {
      console.warn('📦 Redis setup failed, falling back to memory')
    }
  }

  // Fallback: in-memory cache (no Redis needed)
  store = new Keyv({ namespace: 'unstressed' })
  console.log('📦 Cache: initialized in-memory (no Redis)')
  return store
}

export const TTL = {
  PLACES_SEARCH:  1000 * 60 * 30,       // 30 min
  RIGHT_NOW:      1000 * 60 * 5,        // 5 min
  USER_CONTEXT:   1000 * 60 * 10,       // 10 min
  COLLECTIONS:    1000 * 60 * 15,       // 15 min
  DATA_AVAIL:     1000 * 60 * 60 * 6,   // 6 hours
}

// Timeout wrapper for cache ops so a dead Redis doesn't hang the request
async function withTimeout<T>(promise: Promise<T>, timeoutMs = 800): Promise<T> {
  return Promise.race([
    promise,
    new Promise<T>((_, reject) => setTimeout(() => reject(new Error('Cache timeout')), timeoutMs))
  ])
}

export async function cacheGet<T>(key: string): Promise<T | null> {
  try {
    const val = await withTimeout(getStore().get(key))
    return val ?? null
  } catch {
    return null
  }
}

export async function cacheSet(key: string, value: unknown, ttlMs: number): Promise<void> {
  try {
    // Fire and forget cache sets so they never block the response
    withTimeout(getStore().set(key, value, ttlMs)).catch(() => {})
  } catch {}
}

export async function cacheDel(key: string): Promise<void> {
  try {
    withTimeout(getStore().delete(key)).catch(() => {})
  } catch {}
}

export const CacheKey = {
  placesSearch: (lat: number, lng: number, types: string[], radius: number) =>
    `places:${lat.toFixed(3)}:${lng.toFixed(3)}:${types.sort().join(',')}:${radius}`,

  rightNow: (userId: string, lat: number, lng: number) =>
    `rightnow:${userId}:${lat.toFixed(3)}:${lng.toFixed(3)}`,

  userContext: (userId: string) =>
    `ctx:${userId}`,

  collections: (userId: string) =>
    `collections:${userId}`,
}
