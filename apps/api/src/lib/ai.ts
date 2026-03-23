import Groq from 'groq-sdk'

let groqClient: Groq | null = null

function getGroq(): Groq | null {
  if (!process.env.GROQ_API_KEY) return null
  if (!groqClient) groqClient = new Groq({ apiKey: process.env.GROQ_API_KEY })
  return groqClient
}

export interface CurationInput {
  placeName: string
  placeTypes: string[]
  rating: number | null
  isOpenNow: boolean | null
  distanceMins: number | null
  energyLevel: string
  preferredSanctuaries: string[]
  moodFilters: string[]
  query?: string
}

export async function curatePlaces(inputs: CurationInput[]): Promise<{ description: string; whyItFits: string }[]> {
  const groq = getGroq()

  if (groq) {
    const prompt = `You are Unstressed's curation engine. For each place, write a brief evocative description and personalized "why it fits" for the user.

User context: energy=${inputs[0]?.energyLevel ?? 'medium'}, moods=${inputs[0]?.moodFilters.join(',') || 'none'}, preferences=${inputs[0]?.preferredSanctuaries.join(',') || 'none'}
${inputs[0]?.query ? `Search: "${inputs[0].query}"` : ''}

Places:
${inputs.map((p, i) => `${i}. "${p.placeName}" (${p.placeTypes.slice(0,2).join(', ')})`).join('\n')}

Respond ONLY with a JSON array of exactly ${inputs.length} objects:
[{"description":"2-sentence evocative description","whyItFits":"1-sentence personalized reason"},...]`

    try {
      const res = await groq.chat.completions.create({
        model: 'llama-3.3-70b-versatile',
        max_tokens: 800,
        messages: [{ role: 'user', content: prompt }],
      })
      const text = res.choices[0]?.message?.content?.trim() ?? ''
      const json = text.replace(/^```json\n?/, '').replace(/\n?```$/, '').trim()
      const parsed = JSON.parse(json)
      if (Array.isArray(parsed) && parsed.length === inputs.length) return parsed
    } catch {}
  }

  return inputs.map(templateCuration)
}

// Keep single for backwards compat
export async function curatePlace(input: CurationInput): Promise<{ description: string; whyItFits: string }> {
  return templateCuration(input)
}

function templateCuration(input: CurationInput): { description: string; whyItFits: string } {
  const typeMap: Record<string, string> = {
    cafe: 'A welcoming space with great coffee and a calm atmosphere.',
    library: 'A quiet haven for focused thinking and deep reading.',
    park: 'A natural outdoor space offering fresh air and room to breathe.',
    museum: 'A curated environment filled with art, history, and quiet contemplation.',
    spa: 'A restorative wellness space designed for deep relaxation.',
    art_gallery: 'A beautifully lit space showcasing contemporary and classic works.',
    restaurant: 'A thoughtfully designed dining environment with excellent food and ambiance.',
    bar: 'A social space with a curated atmosphere for unwinding.',
    book_store: 'A carefully curated bookshop with a warm, unhurried atmosphere.',
  }

  const mainType = input.placeTypes.find(t => typeMap[t]) ?? input.placeTypes[0] ?? 'place'
  const description = typeMap[mainType] ?? `A ${mainType.replace('_', ' ')} with a welcoming atmosphere.`

  const energyMap: Record<string, string> = {
    high: 'With your current high energy, this space offers a structured environment to channel your focus.',
    medium: 'A balanced setting that matches your current rhythm without overstimulating.',
    low: 'With your energy running low, this calm environment will help you restore and recharge.',
  }

  const whyItFits = energyMap[input.energyLevel] ?? 'A great match for your current state of mind.'

  return { description, whyItFits }
}

export async function generateRightNow(
  energyLevel: string,
  timeOfDay: string,
  preferredSanctuaries: string[],
  nearbyPlaces: { title: string; types: string[]; rating: number | null; distanceMins: number | null }[],
): Promise<{
  headline: string
  moodTags: string[]
  heroSuggestion: { title: string; description: string; imageUrl: null } | null
  energyInsight: { level: string; title: string; body: string }
  recommendation: { title: string; subtitle: string; cta: string }
  upcomingMomentum: { time: string; title: string; description: string }[]
  contextualInsight: { headline: string; body: string }
}> {
  const groq = getGroq()
  const placesContext = nearbyPlaces.length
    ? `\nNearby real places: ${nearbyPlaces.slice(0,3).map(p => `${p.title} (${p.types[0]}, ${p.distanceMins ?? '?'} mins away)`).join('; ')}`
    : ''

  if (groq) {
    const prompt = `You are Unstressed, a proactive leisure intelligence assistant.
User: energy=${energyLevel}, time=${timeOfDay}, preferred sanctuaries: ${preferredSanctuaries.join(', ') || 'not set'}.${placesContext}

Respond with ONLY valid JSON:
{
  "headline": "Short warm headline (max 10 words)",
  "moodTags": ["tag1", "tag2", "tag3"],
  "heroSuggestion": { "title": "Nearby place name or activity", "description": "One evocative line", "imageUrl": null },
  "energyInsight": { "level": "${energyLevel}", "title": "Insight title", "body": "2-sentence insight" },
  "recommendation": { "title": "Recommended: action", "subtitle": "Duration · Type", "cta": "Start" },
  "upcomingMomentum": [
    { "time": "HH:MM PM", "title": "Activity", "description": "Brief" },
    { "time": "HH:MM PM", "title": "Activity", "description": "Brief" },
    { "time": "HH:MM PM", "title": "Activity", "description": "Brief" }
  ],
  "contextualInsight": { "headline": "Pattern (max 8 words)", "body": "2-sentence observation." }
}`

    try {
      const res = await groq.chat.completions.create({
        model: 'llama-3.3-70b-versatile',
        max_tokens: 800,
        messages: [{ role: 'user', content: prompt }],
      })
      const text = res.choices[0]?.message?.content?.trim() ?? ''
      const json = text.replace(/^```json\n?/, '').replace(/\n?```$/, '').trim()
      return JSON.parse(json)
    } catch {
      return fallbackRightNow(energyLevel, timeOfDay)
    }
  }

  return fallbackRightNow(energyLevel, timeOfDay)
}

function fallbackRightNow(energyLevel: string, timeOfDay: string) {
  const headlines: Record<string, string> = {
    high: `A ${timeOfDay} to channel your momentum.`,
    medium: `A ${timeOfDay} to find your balance.`,
    low: `A ${timeOfDay} to restore your energy.`,
  }
  return {
    headline: headlines[energyLevel] ?? `A ${timeOfDay} worth savoring.`,
    moodTags: ['Quiet Atmosphere', 'Nearby', '30 mins'],
    heroSuggestion: null,
    energyInsight: {
      level: energyLevel,
      title: 'Your Energy Right Now',
      body: energyLevel === 'low'
        ? 'Your energy is running low. A short break now prevents a deeper crash later.'
        : 'You have momentum to work with. Use it on what matters most.',
    },
    recommendation: {
      title: 'Recommended: Micro-Reset',
      subtitle: '10 min · Breathwork & Rest',
      cta: 'Start Session',
    },
    upcomingMomentum: [
      { time: '5:00 PM', title: 'Inbox Zero', description: 'Clear low-priority messages.' },
      { time: '6:30 PM', title: 'Evening Unwind', description: 'Low-intensity movement.' },
      { time: '10:00 PM', title: 'Deep Rest', description: 'Wind down for optimal sleep.' },
    ],
    contextualInsight: {
      headline: 'Small resets compound over time.',
      body: 'Proactively shifting environments prevents burnout. Even 20 minutes changes your trajectory for the rest of the day.',
    },
  }
}
