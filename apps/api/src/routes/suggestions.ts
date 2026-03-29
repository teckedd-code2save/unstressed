import type { FastifyInstance } from 'fastify'
import { searchGroundedPlaces, type GroundedPlace } from '../lib/places.js'

function fallbackRightNow(energyLevel: string, timeOfDay: string) {
  return {
    headline: `A ${timeOfDay} to restore your ${energyLevel === 'low' ? 'energy' : 'focus'}.`,
    moodTags: ['Quiet Atmosphere', 'Nearby', '30 mins'],
    heroSuggestion: {
      title: 'The Glass House',
      description: 'A sanctuary for decompression and herbal matcha.',
      imageUrl: null,
    },
    energyInsight: {
      level: energyLevel,
      title: 'Momentum vs. Fatigue',
      body: "You've been in sustained focus. A short reset now prevents a late-afternoon slump.",
    },
    recommendation: {
      title: 'Recommended: Micro-Reset',
      subtitle: '10 min · Breathwork & Eye Strain Relief',
      cta: 'Start Session',
    },
    upcomingMomentum: [
      { time: '5:00 PM', title: 'Inbox Zero', description: 'Clear low-priority messages.' },
      { time: '6:30 PM', title: 'Evening Unwind', description: 'Low-intensity movement.' },
      { time: '10:15 PM', title: 'Deep Rest', description: 'Cooling the room for optimal sleep.' },
    ],
    contextualInsight: {
      headline: 'Your energy usually dips at 4:30.',
      body: "We've noticed a pattern. Proactively shifting to a calming environment now will help you avoid burnout and enter the weekend refreshed.",
    },
  }
}

function normalizeNumber(value: unknown): number | null {
  if (typeof value === 'number' && Number.isFinite(value)) return value
  if (typeof value === 'string') {
    const parsed = Number(value)
    return Number.isFinite(parsed) ? parsed : null
  }
  return null
}

function describeGroundedPlace(place: GroundedPlace) {
  if (place.types.includes('park') || place.types.includes('botanical_garden')) {
    return 'Fresh air, softer sound, and enough space to let your body downshift.'
  }
  if (place.types.includes('library')) {
    return 'Quiet structure, low distraction, and a better chance of deep focus.'
  }
  if (place.types.includes('coffee_shop') || place.types.includes('cafe')) {
    return 'A nearby pause with enough ambient energy to feel alive without getting loud.'
  }
  if (place.types.includes('spa')) {
    return 'A restorative reset point when your system needs warmth, calm, and slower pacing.'
  }
  return 'A nearby option that fits your current energy better than staying overstimulated.'
}

function buildGroundedRightNow(energyLevel: string, timeOfDay: string, places: GroundedPlace[]) {
  const hero = places[0] ?? null
  const supporting = places.slice(1, 4)
  const moodTags = hero
    ? [
        hero.distanceMins ? `${hero.distanceMins} mins` : 'Nearby',
        hero.isOpenNow ? 'Open Now' : 'Nearby',
        hero.types.includes('park') ? 'Nature Escape' : hero.types.includes('library') ? 'Deep Focus' : 'Quiet Atmosphere',
      ]
    : ['Quiet Atmosphere', 'Nearby', '30 mins']

  return {
    headline: hero
      ? `A ${timeOfDay} for ${hero.title}.`
      : `A ${timeOfDay} to restore your ${energyLevel === 'low' ? 'energy' : 'focus'}.`,
    moodTags,
    heroSuggestion: hero
      ? {
          title: hero.title,
          description: describeGroundedPlace(hero),
          imageUrl: hero.imageUrl,
        }
      : null,
    energyInsight: {
      level: energyLevel,
      title: hero?.isOpenNow ? 'A timely place to reset' : 'Momentum vs. Fatigue',
      body:
        energyLevel === 'low'
          ? 'Your energy is asking for lower stimulation. A shorter trip to a calmer place is the right tradeoff.'
          : 'Your energy can still be directed well. A better environment now protects the rest of your day.',
    },
    recommendation: {
      title: hero ? `Recommended: ${hero.title}` : 'Recommended: Micro-Reset',
      subtitle: hero?.distanceMins ? `${hero.distanceMins} min away · Nearby place` : '10 min · Breathwork & Eye Strain Relief',
      cta: hero ? 'Explore Nearby' : 'Start Session',
    },
    upcomingMomentum: supporting.length
      ? supporting.map((place, index) => ({
          time: `${6 + index}:30 PM`,
          title: place.title,
          description: describeGroundedPlace(place),
        }))
      : [
          { time: '5:00 PM', title: 'Inbox Zero', description: 'Clear low-priority messages.' },
          { time: '6:30 PM', title: 'Evening Unwind', description: 'Low-intensity movement.' },
          { time: '10:15 PM', title: 'Deep Rest', description: 'Cooling the room for optimal sleep.' },
        ],
    contextualInsight: {
      headline: hero ? `${hero.title} matches your pace.` : 'Your energy usually dips at 4:30.',
      body: hero
        ? `${describeGroundedPlace(hero)} This is a grounded nearby option instead of a speculative AI-only recommendation.`
        : "We've noticed a pattern. Proactively shifting to a calming environment now will help you avoid burnout and enter the weekend refreshed.",
    },
  }
}

function buildSavedSuggestionRightNow(
  energyLevel: string,
  timeOfDay: string,
  suggestions: Awaited<ReturnType<FastifyInstance['services']['getSuggestionsForUser']>>,
) {
  const top = suggestions[0]
  if (!top) return fallbackRightNow(energyLevel, timeOfDay)

  return {
    headline: `A ${timeOfDay} for ${top.title}.`,
    moodTags: top.moodTags.slice(0, 3),
    heroSuggestion: {
      title: top.title,
      description: top.description,
      imageUrl: top.imageUrl,
    },
    energyInsight: {
      level: energyLevel,
      title: 'Grounded from your saved curation',
      body: top.whyItFits ?? "We've shifted to a saved suggestion because live nearby place data is unavailable right now.",
    },
    recommendation: {
      title: `Recommended: ${top.title}`,
      subtitle: `${top.distanceMins ?? 15} min away · Saved suggestion`,
      cta: 'Explore Nearby',
    },
    upcomingMomentum: suggestions.slice(1, 4).map((suggestion, index) => ({
      time: `${6 + index}:15 PM`,
      title: suggestion.title,
      description: suggestion.description,
    })),
    contextualInsight: {
      headline: 'Grounded suggestions are active.',
      body: 'Live places are unavailable, so this view is using your saved curation history rather than speculative AI output.',
    },
  }
}

export async function suggestionsRoute(app: FastifyInstance) {
  app.get('/right-now', async (request, reply) => {
    const userId = (request as any).userId as string
    const { lat, lng } = (request.query as { lat?: string; lng?: string }) ?? {}
    const context = await app.services.getContextByUserId(userId)

    const hour = new Date().getHours()
    const timeOfDay =
      hour < 6 ? 'early morning' : hour < 12 ? 'morning' : hour < 17 ? 'afternoon' : 'evening'
    const energyLevel = context?.energyLevel ?? 'medium'

    try {
      const normalizedLat = normalizeNumber(lat)
      const normalizedLng = normalizeNumber(lng)
      const nearbyPlaces =
        normalizedLat !== null && normalizedLng !== null
          ? await searchGroundedPlaces({
              lat: normalizedLat,
              lng: normalizedLng,
              moodFilters: [],
              preferredSanctuaries: context?.preferredSanctuaries ?? [],
            })
          : []

      if (nearbyPlaces.length > 0) {
        return reply.send(buildGroundedRightNow(energyLevel, timeOfDay, nearbyPlaces))
      }

      const savedSuggestions = await app.services.getSuggestionsForUser(userId, 6)
      return reply.send(buildSavedSuggestionRightNow(energyLevel, timeOfDay, savedSuggestions))
    } catch (err: any) {
      app.log.warn({ err: err?.message }, 'Grounded right-now unavailable — serving fallback')
      return reply.send(fallbackRightNow(energyLevel, timeOfDay))
    }
  })
}
