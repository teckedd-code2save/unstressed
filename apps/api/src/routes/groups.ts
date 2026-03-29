import type { FastifyInstance } from 'fastify'

export async function groupsRoute(app: FastifyInstance) {
  app.get('/dashboard', async (request, reply) => {
    const userId = (request as any).userId as string
    const dashboard = await app.services.getGroupsDashboardByUser(userId)
    return reply.send(dashboard)
  })
}
