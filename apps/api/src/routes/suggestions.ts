import type { FastifyInstance } from 'fastify'

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

export async function suggestionsRoute(app: FastifyInstance) {
  app.get('/right-now', async (request, reply) => {
    const userId = (request as any).userId as string
    const context = await app.services.getContextByUserId(userId)

    const hour = new Date().getHours()
    const timeOfDay =
      hour < 6 ? 'early morning' : hour < 12 ? 'morning' : hour < 17 ? 'afternoon' : 'evening'
    const energyLevel = context?.energyLevel ?? 'medium'

    const prompt = `You are Unstressed, a proactive leisure intelligence assistant.
User context: energy level ${energyLevel}, time: ${timeOfDay}, preferred sanctuaries: ${context?.preferredSanctuaries?.join(', ') || 'not set'}.

Respond with ONLY valid JSON matching this exact shape:
{
  "headline": "Short warm headline suggesting how to spend this moment (max 12 words)",
  "moodTags": ["tag1", "tag2", "tag3"],
  "heroSuggestion": { "title": "Place or activity", "description": "One-line evocative description", "imageUrl": null },
  "energyInsight": { "level": "${energyLevel}", "title": "Insight title", "body": "2-sentence insight about current energy state" },
  "recommendation": { "title": "Recommended: Micro-action name", "subtitle": "Duration and type", "cta": "Start Session" },
  "upcomingMomentum": [
    { "time": "HH:MM PM", "title": "Activity", "description": "Brief description" },
    { "time": "HH:MM PM", "title": "Activity", "description": "Brief description" },
    { "time": "HH:MM PM", "title": "Activity", "description": "Brief description" }
  ],
  "contextualInsight": { "headline": "Pattern observation (max 8 words)", "body": "2-sentence AI observation and optimization tip." }
}`

    try {
      const anthropic = app.services.createAnthropicClient()
      if (!anthropic) throw new Error('ANTHROPIC_API_KEY is not configured')

      const message = await anthropic.messages.create({
        model: 'claude-sonnet-4-6',
        max_tokens: 1024,
        messages: [{ role: 'user', content: prompt }],
      })

      const content = message.content[0]
      if (content.type !== 'text') throw new Error('Unexpected content type')

      // Strip markdown code fences if present
      const text = content.text.replace(/^```json\n?/, '').replace(/\n?```$/, '').trim()
      return reply.send(JSON.parse(text))
    } catch (err: any) {
      app.log.warn({ err: err?.message }, 'AI unavailable — serving fallback')
      return reply.send(fallbackRightNow(energyLevel, timeOfDay))
    }
  })
}
