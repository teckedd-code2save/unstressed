import type { FastifyInstance } from 'fastify'
import { searchGroundedPlaces, type GroundedPlace } from '../lib/places.js'

function fallbackSearch(query: string, moodFilters: string[]) {
  return [
    {
      id: 'fallback-1',
      title: 'The Quiet Library',
      description:
        'A hushed reading room with tall oak shelves and natural light. Perfect for deep focus without distraction.',
      imageUrl: null,
      contextTags: ['Free Entry', 'Quiet Zone'],
      moodTags: ['Deep Focus', 'Solitude'],
      distanceMins: 12,
      whyItFits:
        'Based on your energy state and search intent, a calm, structured environment helps you sustain concentration without overstimulation.',
    },
    {
      id: 'fallback-2',
      title: 'Tidal Rooftop Garden',
      description:
        'An elevated green space with city views and scattered seating. Ideal for clear-headed reflection.',
      imageUrl: null,
      contextTags: ['Outdoor', 'Open Until 9 PM'],
      moodTags: ['Nature Escape', 'Creative Flow'],
      distanceMins: 20,
      whyItFits:
        'A change of elevation and fresh air can reset mental fatigue. This fits your preference for nature-adjacent sanctuaries.',
    },
    {
      id: 'fallback-3',
      title: 'Ember Café',
      description:
        'Warm lighting, slow jazz, and single-origin pour-overs. A social-yet-focused sanctuary for creatives.',
      imageUrl: null,
      contextTags: ['WiFi', 'Affordable'],
      moodTags: ['Creative Flow', 'Vibrant Energy'],
      distanceMins: 8,
      whyItFits:
        "Ambient noise at the right level enhances creative thinking. Ember's curated atmosphere matches your current context well.",
    },
    {
      id: 'fallback-4',
      title: 'Stillwater Spa Lounge',
      description:
        'A members-open wellness lounge with hydrotherapy and guided breathwork sessions on the hour.',
      imageUrl: null,
      contextTags: ['Restorative', 'Booking Advised'],
      moodTags: ['Restorative Sleep', 'Solitude'],
      distanceMins: 25,
      whyItFits:
        'Your energy pattern suggests a parasympathetic reset would help. Breathwork and warmth are clinically effective for cortisol reduction.',
    },
  ]
}

function normalizeNumber(value: unknown): number | null {
  if (typeof value === 'number' && Number.isFinite(value)) return value
  if (typeof value === 'string') {
    const parsed = Number(value)
    return Number.isFinite(parsed) ? parsed : null
  }
  return null
}

function moodTagsForPlace(place: GroundedPlace) {
  if (place.types.includes('library')) return ['Deep Focus', 'Solitude']
  if (place.types.includes('park') || place.types.includes('botanical_garden')) return ['Nature Escape', 'Solitude']
  if (place.types.includes('spa')) return ['Restorative Sleep', 'Solitude']
  if (place.types.includes('art_gallery') || place.types.includes('museum')) return ['Creative Flow', 'Solitude']
  if (place.types.includes('bar') || place.types.includes('restaurant')) return ['Vibrant Energy', 'Creative Flow']
  return ['Deep Focus', 'Creative Flow']
}

function contextTagsForPlace(place: GroundedPlace, energyLevel: string) {
  const tags: string[] = []
  if (place.isOpenNow) tags.push('Open Now')
  if (typeof place.rating === 'number' && place.rating >= 4.5) tags.push('Top Rated')
  if (typeof place.distanceMins === 'number' && place.distanceMins <= 15) tags.push('Nearby')
  if (energyLevel === 'low') tags.push('Low Stimulus')
  if (!tags.length) tags.push('Fits Your Rhythm')
  return tags.slice(0, 3)
}

function describePlace(place: GroundedPlace) {
  if (place.types.includes('library')) return 'A quiet reading room with enough structure to help your attention settle.'
  if (place.types.includes('park') || place.types.includes('botanical_garden')) return 'Open air, softer stimulation, and room to let your nervous system slow down.'
  if (place.types.includes('spa')) return 'A restorative wellness stop designed for slower breathing and recovery.'
  if (place.types.includes('art_gallery') || place.types.includes('museum')) return 'A visually rich but calm environment that supports reflection without chaos.'
  if (place.types.includes('coffee_shop') || place.types.includes('cafe')) return 'A calm cafe atmosphere with enough ambient energy to keep you moving without overload.'
  return 'A nearby place that matches your current pace better than a loud or crowded alternative.'
}

function whyItFits(place: GroundedPlace, energyLevel: string, moodFilters: string[], query: string) {
  const moodLead = moodFilters[0] ? `${moodFilters[0]} matters right now` : 'Your current state calls for a more intentional environment'
  const distanceLead = typeof place.distanceMins === 'number' ? ` and this is about ${place.distanceMins} minutes away` : ''
  const queryLead = query ? ` for “${query}”` : ''
  const energyLead =
    energyLevel === 'low'
      ? 'It keeps stimulation manageable while still getting you out of your current loop.'
      : energyLevel === 'high'
        ? 'It gives your momentum somewhere useful to land without becoming noisy.'
        : 'It supports a steady pace without pulling your energy too far in either direction.'
  return `${moodLead}${queryLead}${distanceLead}. ${energyLead}`
}

function mapGroundedPlacesToResults(places: GroundedPlace[], energyLevel: string, moodFilters: string[], query: string) {
  return places.map((place) => ({
    id: place.id,
    title: place.title,
    description: describePlace(place),
    imageUrl: place.imageUrl,
    contextTags: contextTagsForPlace(place, energyLevel),
    moodTags: moodTagsForPlace(place),
    distanceMins: place.distanceMins ?? 15,
    whyItFits: whyItFits(place, energyLevel, moodFilters, query),
  }))
}

function mapSavedSuggestionsToResults(
  suggestions: Awaited<ReturnType<FastifyInstance['services']['getSuggestionsForUser']>>,
  query: string,
  moodFilters: string[],
) {
  const lowerQuery = query.trim().toLowerCase()
  const lowerMoods = moodFilters.map((mood) => mood.toLowerCase())
  const matched = suggestions.filter((suggestion) => {
    const haystack = [suggestion.title, suggestion.description, suggestion.location ?? '', suggestion.whyItFits ?? '']
      .join(' ')
      .toLowerCase()
    const moodMatch = !lowerMoods.length || suggestion.moodTags.some((tag) => lowerMoods.includes(tag.toLowerCase()))
    const queryMatch = !lowerQuery || haystack.includes(lowerQuery)
    return moodMatch && queryMatch
  })

  return matched.slice(0, 6).map((suggestion) => ({
    id: suggestion.id,
    title: suggestion.title,
    description: suggestion.description,
    imageUrl: suggestion.imageUrl,
    contextTags: suggestion.contextTags,
    moodTags: suggestion.moodTags,
    distanceMins: suggestion.distanceMins ?? 15,
    whyItFits: suggestion.whyItFits,
  }))
}

export async function searchRoute(app: FastifyInstance) {
  app.post('/', async (request, reply) => {
    const userId = (request as any).userId as string
    const { query, moodFilters, lat, lng } = request.body as {
      query?: string
      moodFilters?: string[]
      lat?: number | string
      lng?: number | string
    }

    const context = await app.services.getContextByUserId(userId)
    const normalizedLat = normalizeNumber(lat)
    const normalizedLng = normalizeNumber(lng)
    const normalizedQuery = query ?? ''
    const normalizedMoodFilters = moodFilters ?? []

    try {
      const groundedPlaces =
        normalizedLat !== null && normalizedLng !== null
          ? await searchGroundedPlaces({
              lat: normalizedLat,
              lng: normalizedLng,
              query: normalizedQuery,
              moodFilters: normalizedMoodFilters,
              preferredSanctuaries: context?.preferredSanctuaries ?? [],
            })
          : []

      const results =
        groundedPlaces.length > 0
          ? mapGroundedPlacesToResults(
              groundedPlaces,
              context?.energyLevel ?? 'medium',
              normalizedMoodFilters,
              normalizedQuery,
            )
          : mapSavedSuggestionsToResults(
              await app.services.getSuggestionsForUser(userId, 8),
              normalizedQuery,
              normalizedMoodFilters,
            )

      const finalResults = results.length > 0 ? results : fallbackSearch(normalizedQuery, normalizedMoodFilters)
      await app.services.logSearchQuery(userId, normalizedQuery, normalizedMoodFilters, finalResults.length)
      return reply.send({ results: finalResults })
    } catch (err: any) {
      app.log.warn({ err: err?.message }, 'Grounded search unavailable — serving fallback search')
      const results = fallbackSearch(normalizedQuery, normalizedMoodFilters)
      try {
        await app.services.logSearchQuery(userId, normalizedQuery, normalizedMoodFilters, results.length)
      } catch {}
      return reply.send({ results })
    }
  })
}
