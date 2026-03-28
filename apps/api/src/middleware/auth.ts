import type { FastifyRequest, FastifyReply } from 'fastify'
import { createClerkClient, verifyToken } from '@clerk/backend'

const PUBLIC_PATHS = ['/health', '/webhooks']
const DEV_BYPASS_HEADER = 'x-dev-bypass'
const DEV_SEED_CLERK_ID = 'demo_user_001'

export async function authMiddleware(request: FastifyRequest, reply: FastifyReply) {
  const isDev = process.env.NODE_ENV === 'development'

  if (request.method === 'OPTIONS' || PUBLIC_PATHS.some((p) => request.url.startsWith(p))) return

  // ── Dev bypass ──────────────────────────────────────────────────────────────
  // In development, pass `x-dev-bypass: true` to authenticate as the seed user.
  // This header is never accepted in production.
  if (isDev && request.headers[DEV_BYPASS_HEADER] === 'true') {
    const user = await request.server.services.getUserByClerkId(DEV_SEED_CLERK_ID)
    if (user) {
      ;(request as any).userId = user.id
      ;(request as any).clerkId = DEV_SEED_CLERK_ID
      return
    }
  }

  // ── Clerk JWT auth ──────────────────────────────────────────────────────────
  const authHeader = request.headers.authorization
  if (!authHeader?.startsWith('Bearer ')) {
    return reply.code(401).send({ error: 'Missing authorization header' })
  }

  const clerkSecretKey = process.env.CLERK_SECRET_KEY
  const clerk = clerkSecretKey ? createClerkClient({ secretKey: clerkSecretKey }) : null

  if (!clerkSecretKey || !clerk) {
    return reply.code(503).send({ error: 'CLERK_SECRET_KEY is not configured' })
  }

  try {
    const token = authHeader.slice(7)
    const payload = await verifyToken(token, {
      secretKey: clerkSecretKey,
    })

    const clerkId = payload.sub
    const clerkUser = await clerk.users.getUser(clerkId)
    const user = await request.server.services.upsertUserByClerkId({
      clerkId,
      email: clerkUser.emailAddresses[0]?.emailAddress ?? '',
      name: [clerkUser.firstName, clerkUser.lastName].filter(Boolean).join(' ') || undefined,
      avatarUrl: clerkUser.imageUrl || undefined,
    })

    ;(request as any).userId = user.id
    ;(request as any).clerkId = clerkId
  } catch (err) {
    request.log.warn({ err }, 'Auth failed')
    return reply.code(401).send({ error: 'Invalid or expired token' })
  }
}
