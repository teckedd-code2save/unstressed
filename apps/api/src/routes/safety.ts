import type { FastifyInstance } from 'fastify'

export async function safetyRoute(app: FastifyInstance) {
  app.get('/circles', async (request, reply) => {
    const userId = (request as any).userId as string
    const dashboard = await app.services.getSafetyDashboardByUser(userId)
    return reply.send(dashboard)
  })

  app.post('/check-ins', async (request, reply) => {
    const userId = (request as any).userId as string
    const body = request.body as {
      status?: 'SAFE' | 'DELAYED' | 'HELP'
      note?: string
      circleId?: string
    }

    const checkIn = await app.services.createSafetyCheckIn({
      userId,
      status: body.status ?? 'SAFE',
      note: body.note ?? null,
      circleId: body.circleId ?? null,
    })

    return reply.code(202).send(checkIn)
  })
}
