type SearchGroundedPlacesParams = {
  lat: number
  lng: number
  query?: string
  moodFilters?: string[]
  preferredSanctuaries?: string[]
  radius?: number
  limit?: number
}

export type GroundedPlace = {
  id: string
  title: string
  address: string
  rating: number | null
  reviewCount: number | null
  isOpenNow: boolean | null
  imageUrl: string | null
  types: string[]
  lat: number
  lng: number
  distanceMins: number | null
}

const DEFAULT_TYPES = ['cafe', 'library', 'park', 'book_store']
const MOOD_TO_PLACE_TYPES: Record<string, string[]> = {
  Solitude: ['library', 'park', 'museum'],
  'Deep Focus': ['library', 'book_store', 'coffee_shop'],
  'Creative Flow': ['art_gallery', 'museum', 'coffee_shop'],
  'Restorative Sleep': ['spa', 'park'],
  'Vibrant Energy': ['restaurant', 'bar'],
  'Nature Escape': ['park', 'botanical_garden'],
}
const SANCTUARY_TO_PLACE_TYPES: Record<string, string[]> = {
  'quiet-waterfronts': ['park'],
  'forest-trails': ['park', 'botanical_garden'],
  'quiet-cafes': ['coffee_shop', 'cafe'],
  'art-galleries': ['art_gallery', 'museum'],
  libraries: ['library', 'book_store'],
  'rooftop-spaces': ['restaurant', 'bar'],
}
const cache = new Map<string, { expiresAt: number; value: GroundedPlace[] }>()
const CACHE_TTL_MS = 1000 * 60 * 10

function buildTypes(moodFilters: string[], preferredSanctuaries: string[]) {
  const types = new Set<string>()
  for (const mood of moodFilters) {
    for (const type of MOOD_TO_PLACE_TYPES[mood] ?? []) types.add(type)
  }
  for (const sanctuary of preferredSanctuaries) {
    for (const type of SANCTUARY_TO_PLACE_TYPES[sanctuary] ?? []) types.add(type)
  }
  if (!types.size) {
    for (const type of DEFAULT_TYPES) types.add(type)
  }
  return Array.from(types).slice(0, 5)
}

function buildTextQuery(query: string, moodFilters: string[], preferredSanctuaries: string[]) {
  const parts = [query.trim()]
  if (moodFilters[0]) parts.push(moodFilters[0])
  if (preferredSanctuaries[0]) parts.push(preferredSanctuaries[0].replace(/-/g, ' '))
  return parts.filter(Boolean).join(' near me')
}

function buildCacheKey(params: SearchGroundedPlacesParams, types: string[]) {
  return [
    params.lat.toFixed(3),
    params.lng.toFixed(3),
    params.query?.trim().toLowerCase() ?? '',
    types.sort().join(','),
    params.radius ?? 5000,
    params.limit ?? 6,
  ].join(':')
}

async function fetchJson(url: string, init: RequestInit, timeoutMs = 2500) {
  const controller = new AbortController()
  const timeout = setTimeout(() => controller.abort(), timeoutMs)

  try {
    const response = await fetch(url, { ...init, signal: controller.signal })
    if (!response.ok) {
      throw new Error(`Places API request failed with ${response.status}`)
    }
    return response.json()
  } finally {
    clearTimeout(timeout)
  }
}

function estimateTravelMins(lat1: number, lng1: number, lat2: number, lng2: number) {
  const radiusKm = 6371
  const dLat = ((lat2 - lat1) * Math.PI) / 180
  const dLng = ((lng2 - lng1) * Math.PI) / 180
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLng / 2) ** 2
  const kilometers = radiusKm * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))
  return Math.max(3, Math.round((kilometers / 20) * 60))
}

function toPhotoUrl(photoName: string, apiKey: string) {
  return `https://places.googleapis.com/v1/${photoName}/media?maxWidthPx=900&key=${apiKey}`
}

function normalizePlace(place: any, lat: number, lng: number, apiKey: string): GroundedPlace {
  const photoName = place.photos?.[0]?.name
  const placeLat = place.location?.latitude ?? lat
  const placeLng = place.location?.longitude ?? lng

  return {
    id: place.id,
    title: place.displayName?.text ?? 'Untitled place',
    address: place.formattedAddress ?? '',
    rating: place.rating ?? null,
    reviewCount: place.userRatingCount ?? null,
    isOpenNow: place.currentOpeningHours?.openNow ?? null,
    imageUrl: photoName ? toPhotoUrl(photoName, apiKey) : null,
    types: place.types ?? [],
    lat: placeLat,
    lng: placeLng,
    distanceMins: estimateTravelMins(lat, lng, placeLat, placeLng),
  }
}

export async function searchGroundedPlaces(params: SearchGroundedPlacesParams): Promise<GroundedPlace[]> {
  const apiKey = process.env.GOOGLE_PLACES_API_KEY
  if (!apiKey) return []

  const moodFilters = params.moodFilters ?? []
  const preferredSanctuaries = params.preferredSanctuaries ?? []
  const types = buildTypes(moodFilters, preferredSanctuaries)
  const cacheKey = buildCacheKey(params, types)
  const cached = cache.get(cacheKey)

  if (cached && cached.expiresAt > Date.now()) {
    return cached.value
  }

  const fieldMask =
    'places.id,places.displayName,places.formattedAddress,places.rating,places.userRatingCount,places.currentOpeningHours,places.photos,places.types,places.location'
  const headers = {
    'Content-Type': 'application/json',
    'X-Goog-Api-Key': apiKey,
    'X-Goog-FieldMask': fieldMask,
  }
  const radius = params.radius ?? 5000
  const limit = params.limit ?? 6

  const payload = params.query?.trim()
    ? {
        textQuery: buildTextQuery(params.query, moodFilters, preferredSanctuaries),
        pageSize: limit,
        rankPreference: 'DISTANCE',
        languageCode: 'en',
        locationBias: {
          circle: {
            center: { latitude: params.lat, longitude: params.lng },
            radius,
          },
        },
      }
    : {
        locationRestriction: {
          circle: {
            center: { latitude: params.lat, longitude: params.lng },
            radius,
          },
        },
        maxResultCount: limit,
        rankPreference: 'POPULARITY',
        languageCode: 'en',
        includedTypes: types,
      }

  const endpoint = params.query?.trim()
    ? 'https://places.googleapis.com/v1/places:searchText'
    : 'https://places.googleapis.com/v1/places:searchNearby'

  try {
    const json = await fetchJson(endpoint, {
      method: 'POST',
      headers,
      body: JSON.stringify(payload),
    })
    const places = Array.isArray(json.places) ? json.places : []
    const normalized = places
      .slice(0, limit)
      .map((place: any) => normalizePlace(place, params.lat, params.lng, apiKey))
    cache.set(cacheKey, { value: normalized, expiresAt: Date.now() + CACHE_TTL_MS })
    return normalized
  } catch {
    return []
  }
}
