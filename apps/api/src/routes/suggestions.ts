import type { FastifyInstance } from 'fastify'
import { getContextByUserId } from '@unstressed/db'
import { searchNearbyPlaces } from '../lib/places.js'
import { generateRightNow } from '../lib/ai.js'

export async function suggestionsRoute(app: FastifyInstance) {
  app.get('/right-now', async (request, reply) => {
    const userId = (request as any).userId as string
    const { lat, lng } = request.query as { lat?: string; lng?: string }

    const context = await getContextByUserId(userId)
    const hour = new Date().getHours()
    const timeOfDay =
      hour < 6 ? 'early morning' : hour < 12 ? 'morning' : hour < 17 ? 'afternoon' : 'evening'
    const energyLevel = context?.energyLevel ?? 'medium'

    // Fetch nearby real places if location provided
    let nearbyPlaces: { title: string; types: string[]; rating: number | null; distanceMins: number | null; imageUrl: string | null }[] = []

    if (lat && lng) {
      try {
        const places = await searchNearbyPlaces(
          parseFloat(lat),
          parseFloat(lng),
          '',
          [],
          context?.preferredSanctuaries ?? [],
          3000,
        )
        nearbyPlaces = places.map(p => ({
          title: p.title,
          types: p.types,
          rating: p.rating,
          distanceMins: p.distanceMins,
          imageUrl: p.imageUrl,
        }))
      } catch (err: any) {
        app.log.warn({ err: err?.message }, 'Places fetch failed for right-now')
      }
    }

    try {
      const data = await generateRightNow(
        energyLevel,
        timeOfDay,
        context?.preferredSanctuaries ?? [],
        nearbyPlaces,
      )

      // Inject real place image into hero if available
      if (nearbyPlaces.length > 0 && nearbyPlaces[0].imageUrl) {
        if (data.heroSuggestion) {
          data.heroSuggestion.imageUrl = nearbyPlaces[0].imageUrl as any
        } else {
          data.heroSuggestion = {
            title: nearbyPlaces[0].title,
            description: 'A real nearby sanctuary curated for your current state.',
            imageUrl: nearbyPlaces[0].imageUrl as any,
          }
        }
      }

      // Attach nearby places to response for display
      return reply.send({
        ...data,
        nearbyPlaces: nearbyPlaces.slice(0, 3),
      })
    } catch (err: any) {
      app.log.error({ err: err?.message }, 'Right-now generation failed')
      return reply.code(500).send({ error: 'Suggestions temporarily unavailable.' })
    }
  })
}
