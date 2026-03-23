import type { FastifyInstance } from 'fastify'
import { getContextByUserId, logSearchQuery } from '@unstressed/db'
import { searchNearbyPlaces } from '../lib/places.js'
import { curatePlace } from '../lib/ai.js'

export async function searchRoute(app: FastifyInstance) {
  app.post('/', async (request, reply) => {
    const userId = (request as any).userId as string
    const { query, moodFilters, lat, lng } = request.body as {
      query?: string
      moodFilters?: string[]
      lat?: number
      lng?: number
    }

    const context = await getContextByUserId(userId)

    // If no location provided, return empty and ask for location
    if (!lat || !lng) {
      return reply.send({
        results: [],
        requiresLocation: true,
        message: 'Share your location to find real places near you.',
      })
    }

    try {
      // 1. Fetch real places from Google Places API
      const places = await searchNearbyPlaces(
        lat,
        lng,
        query ?? '',
        moodFilters ?? [],
        context?.preferredSanctuaries ?? [],
      )

      if (places.length === 0) {
        return reply.send({ results: [], message: 'No places found nearby. Try a different search.' })
      }

      // 2. Curate each place with AI (description + why it fits)
      const curated = await Promise.all(
        places.map(async (place) => {
          const { description, whyItFits } = await curatePlace({
            placeName: place.title,
            placeTypes: place.types,
            rating: place.rating,
            isOpenNow: place.isOpenNow,
            distanceMins: place.distanceMins,
            energyLevel: context?.energyLevel ?? 'medium',
            preferredSanctuaries: context?.preferredSanctuaries ?? [],
            moodFilters: moodFilters ?? [],
            query,
          })

          return {
            id: place.id,
            title: place.title,
            description,
            address: place.address,
            rating: place.rating,
            reviewCount: place.reviewCount,
            isOpenNow: place.isOpenNow,
            imageUrl: place.imageUrl,
            contextTags: buildContextTags(place),
            moodTags: moodFilters?.length ? moodFilters.slice(0, 2) : inferMoodTags(place.types),
            distanceMins: place.distanceMins,
            whyItFits,
            lat: place.lat,
            lng: place.lng,
          }
        })
      )

      await logSearchQuery(userId, query, moodFilters ?? [], curated.length)
      return reply.send({ results: curated })
    } catch (err: any) {
      app.log.error({ err: err?.message }, 'Places search failed')
      return reply.code(500).send({ error: 'Search temporarily unavailable. Please try again.' })
    }
  })
}

function buildContextTags(place: { rating: number | null; isOpenNow: boolean | null; distanceMins: number | null; reviewCount: number | null }): string[] {
  const tags: string[] = []
  if (place.isOpenNow === true) tags.push('Open Now')
  if (place.isOpenNow === false) tags.push('Currently Closed')
  if (place.distanceMins !== null && place.distanceMins <= 10) tags.push('Walking Distance')
  if (place.distanceMins !== null && place.distanceMins > 10 && place.distanceMins <= 25) tags.push('Short Drive')
  if (place.rating && place.rating >= 4.5) tags.push('Highly Rated')
  if (place.reviewCount && place.reviewCount > 500) tags.push('Popular Spot')
  return tags.slice(0, 3)
}

function inferMoodTags(types: string[]): string[] {
  const map: Record<string, string> = {
    cafe: 'Creative Flow',
    library: 'Deep Focus',
    park: 'Nature Escape',
    spa: 'Restorative Sleep',
    museum: 'Solitude',
    art_gallery: 'Solitude',
    restaurant: 'Vibrant Energy',
    bar: 'Vibrant Energy',
    natural_feature: 'Nature Escape',
  }
  const tags = new Set<string>()
  for (const t of types) {
    if (map[t]) tags.add(map[t])
    if (tags.size >= 2) break
  }
  return tags.size ? Array.from(tags) : ['Quiet Atmosphere']
}
