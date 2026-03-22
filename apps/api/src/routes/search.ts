import type { FastifyInstance } from 'fastify'
import Anthropic from '@anthropic-ai/sdk'
import { getContextByUserId, logSearchQuery } from '@unstressed/db'

const anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY! })

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

export async function searchRoute(app: FastifyInstance) {
  app.post('/', async (request, reply) => {
    const userId = (request as any).userId as string
    const { query, moodFilters } = request.body as {
      query?: string
      moodFilters?: string[]
    }

    const context = await getContextByUserId(userId)

    const prompt = `You are Unstressed's intelligent search engine. You understand mood, energy, and context — not just keywords.

User context: energy level ${context?.energyLevel ?? 'medium'}, preferred sanctuaries: ${context?.preferredSanctuaries?.join(', ') || 'not set'}.
Search query: "${query ?? ''}"
Mood filters: ${moodFilters?.join(', ') || 'none'}

Return 4 sanctuary/place suggestions as JSON array:
[
  {
    "id": "unique-id-1",
    "title": "Place or experience name",
    "description": "2-3 sentence evocative description",
    "imageUrl": null,
    "contextTags": ["Fits Your Budget", "Matches Your Energy Level"],
    "moodTags": ["Deep Focus", "Solitude"],
    "distanceMins": 15,
    "whyItFits": "Personalized explanation of why this fits the user's current context (2-3 sentences)"
  }
]
Respond with ONLY valid JSON array.`

    try {
      const message = await anthropic.messages.create({
        model: 'claude-sonnet-4-6',
        max_tokens: 2048,
        messages: [{ role: 'user', content: prompt }],
      })

      const content = message.content[0]
      if (content.type !== 'text') return reply.code(500).send({ error: 'AI error' })

      // Strip markdown code fences if present
      const text = content.text.replace(/^```json\n?/, '').replace(/\n?```$/, '').trim()
      const results = JSON.parse(text)

      // Log the search
      await logSearchQuery(userId, query, moodFilters ?? [], results.length)

      return reply.send({ results })
    } catch (err: any) {
      app.log.warn({ err: err?.message }, 'AI unavailable — serving fallback search')
      const results = fallbackSearch(query ?? '', moodFilters ?? [])
      try {
        await logSearchQuery(userId, query, moodFilters ?? [], results.length)
      } catch (_) {}
      return reply.send({ results })
    }
  })
}
