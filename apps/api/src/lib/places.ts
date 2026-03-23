import axios from 'axios'

const PLACES_API_KEY = process.env.GOOGLE_PLACES_API_KEY!

// Sanctuary type → Google Places type mapping
const MOOD_TO_PLACE_TYPE: Record<string, string[]> = {
  'Solitude':        ['library', 'park', 'museum'],
  'Deep Focus':      ['library', 'cafe', 'book_store'],
  'Creative Flow':   ['cafe', 'art_gallery', 'museum'],
  'Restorative Sleep': ['spa', 'park', 'natural_feature'],
  'Vibrant Energy':  ['restaurant', 'night_club', 'shopping_mall'],
  'Nature Escape':   ['park', 'campground', 'natural_feature'],
}

const SANCTUARY_TO_TYPE: Record<string, string[]> = {
  'quiet-waterfronts': ['natural_feature', 'park'],
  'forest-trails':     ['park', 'campground'],
  'quiet-cafes':       ['cafe'],
  'art-galleries':     ['art_gallery', 'museum'],
  'libraries':         ['library'],
  'rooftop-spaces':    ['bar', 'restaurant'],
}

export interface PlaceResult {
  place_id: string
  name: string
  vicinity: string
  rating?: number
  user_ratings_total?: number
  opening_hours?: { open_now: boolean }
  photos?: { photo_reference: string }[]
  types: string[]
  geometry: { location: { lat: number; lng: number } }
}

export interface EnrichedPlace {
  id: string
  title: string
  description: string
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

export function getPhotoUrl(photoReference: string, maxWidth = 600): string {
  return `https://maps.googleapis.com/maps/api/place/photo?maxwidth=${maxWidth}&photo_reference=${photoReference}&key=${PLACES_API_KEY}`
}

// Places API (New) photo URL
export function getPhotoUrlNew(photoName: string, maxWidth = 600): string {
  return `https://places.googleapis.com/v1/${photoName}/media?maxWidthPx=${maxWidth}&key=${PLACES_API_KEY}`
}

export async function searchNearbyPlaces(
  lat: number,
  lng: number,
  keyword: string,
  moodFilters: string[],
  preferredSanctuaries: string[],
  radius = 5000,
): Promise<EnrichedPlace[]> {
  // Determine place types from mood + sanctuary preferences
  const types = new Set<string>()
  for (const mood of moodFilters) {
    for (const t of MOOD_TO_PLACE_TYPE[mood] ?? []) types.add(t)
  }
  for (const s of preferredSanctuaries) {
    for (const t of SANCTUARY_TO_TYPE[s] ?? []) types.add(t)
  }
  if (types.size === 0) {
    types.add('cafe')
    types.add('park')
    types.add('library')
  }

  // Use Places API (New) — searchNearby endpoint
  const body: Record<string, any> = {
    locationRestriction: {
      circle: {
        center: { latitude: lat, longitude: lng },
        radius,
      },
    },
    maxResultCount: 8,
    languageCode: 'en',
    includedTypes: Array.from(types).slice(0, 5),
  }

  if (keyword) body.textQuery = keyword

  const resp = await axios.post(
    'https://places.googleapis.com/v1/places:searchNearby',
    body,
    {
      headers: {
        'Content-Type': 'application/json',
        'X-Goog-Api-Key': PLACES_API_KEY,
        'X-Goog-FieldMask': 'places.id,places.displayName,places.formattedAddress,places.rating,places.userRatingCount,places.currentOpeningHours,places.photos,places.types,places.location,places.priceLevel',
      },
    }
  )

  const results = resp.data.places ?? []

  return results.slice(0, 6).map((place: any) => {
    const photoName = place.photos?.[0]?.name
    return {
      id: place.id,
      title: place.displayName?.text ?? 'Unknown Place',
      description: '',
      address: place.formattedAddress ?? '',
      rating: place.rating ?? null,
      reviewCount: place.userRatingCount ?? null,
      isOpenNow: place.currentOpeningHours?.openNow ?? null,
      imageUrl: photoName ? getPhotoUrlNew(photoName) : null,
      types: place.types ?? [],
      lat: place.location?.latitude ?? lat,
      lng: place.location?.longitude ?? lng,
      distanceMins: estimateTravelMins(lat, lng, place.location?.latitude ?? lat, place.location?.longitude ?? lng),
    }
  })
}

function estimateTravelMins(lat1: number, lng1: number, lat2: number, lng2: number): number {
  // Haversine distance in km
  const R = 6371
  const dLat = (lat2 - lat1) * Math.PI / 180
  const dLng = (lng2 - lng1) * Math.PI / 180
  const a = Math.sin(dLat/2)**2 + Math.cos(lat1*Math.PI/180) * Math.cos(lat2*Math.PI/180) * Math.sin(dLng/2)**2
  const km = R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a))
  // ~20km/h average city travel
  return Math.round(km / 20 * 60)
}
