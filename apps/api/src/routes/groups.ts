import type { FastifyInstance } from 'fastify'

export async function groupsRoute(app: FastifyInstance) {
  app.get('/dashboard', async (request, reply) => {
    const userId = (request as any).userId as string
    const dashboard = await app.services.getGroupsDashboardByUser(userId)
    return reply.send(dashboard)
  })

  app.post('/options/:optionId/votes', async (request, reply) => {
    const userId = (request as any).userId as string
    const { optionId } = request.params as { optionId: string }

    await app.services.submitPlanVoteForUser(userId, optionId)
    const dashboard = await app.services.getGroupsDashboardByUser(userId)

    return reply.code(200).send(dashboard)
  })
}
