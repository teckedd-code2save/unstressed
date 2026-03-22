import type { FastifyInstance } from 'fastify'
import { getContextByUserId, upsertContext } from '@unstressed/db'

export async function contextRoute(app: FastifyInstance) {
  // GET /api/context
  app.get('/', async (request, reply) => {
    const userId = (request as any).userId as string
    const context = await getContextByUserId(userId)
    if (!context) return reply.code(404).send({ error: 'Context not found' })

    return reply.send({
      energyLevel: context.energyLevel,
      preferredSanctuaries: context.preferredSanctuaries,
      silenceStart: context.silenceStart,
      silenceEnd: context.silenceEnd,
      circadianWakeTime: context.circadianWakeTime,
      calendarProvider: context.calendarProvider,
      healthProvider: context.healthProvider,
      lastSynced: context.lastSynced?.toISOString() ?? null,
    })
  })

  // PATCH /api/context
  app.patch('/', async (request, reply) => {
    const userId = (request as any).userId as string
    const body = request.body as {
      energyLevel?: string
      preferredSanctuaries?: string[]
      silenceStart?: string
      silenceEnd?: string
      circadianWakeTime?: string
      calendarProvider?: string
      healthProvider?: string
    }

    const updated = await upsertContext(userId, body)

    return reply.send({
      energyLevel: updated.energyLevel,
      preferredSanctuaries: updated.preferredSanctuaries,
      silenceStart: updated.silenceStart,
      silenceEnd: updated.silenceEnd,
      circadianWakeTime: updated.circadianWakeTime,
      calendarProvider: updated.calendarProvider,
      healthProvider: updated.healthProvider,
      lastSynced: updated.lastSynced?.toISOString() ?? null,
    })
  })
}
