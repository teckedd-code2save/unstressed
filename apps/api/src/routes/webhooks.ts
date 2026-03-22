import type { FastifyInstance } from 'fastify'
import { upsertUserByClerkId } from '@unstressed/db'

// Clerk webhook — sync user creation/updates to our DB
export async function webhooksRoute(app: FastifyInstance) {
  app.post('/clerk', async (request, reply) => {
    const event = request.body as {
      type: string
      data: {
        id: string
        email_addresses: { email_address: string }[]
        first_name?: string
        last_name?: string
        image_url?: string
      }
    }

    if (event.type === 'user.created' || event.type === 'user.updated') {
      await upsertUserByClerkId({
        clerkId: event.data.id,
        email: event.data.email_addresses[0]?.email_address ?? '',
        name: [event.data.first_name, event.data.last_name].filter(Boolean).join(' ') || undefined,
        avatarUrl: event.data.image_url,
      })
    }

    return reply.send({ received: true })
  })
}
