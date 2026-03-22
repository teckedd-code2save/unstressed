import type { FastifyRequest, FastifyReply } from 'fastify'
import { createClerkClient, verifyToken } from '@clerk/backend'
import { upsertUserByClerkId, getUserByClerkId } from '@unstressed/db'

const clerk = createClerkClient({ secretKey: process.env.CLERK_SECRET_KEY! })

const PUBLIC_PATHS = ['/health', '/webhooks']
const IS_DEV = process.env.NODE_ENV === 'development'
const DEV_BYPASS_HEADER = 'x-dev-bypass'
const DEV_SEED_CLERK_ID = 'demo_user_001'

export async function authMiddleware(request: FastifyRequest, reply: FastifyReply) {
  if (PUBLIC_PATHS.some((p) => request.url.startsWith(p))) return

  // ── Dev bypass ──────────────────────────────────────────────────────────────
  // In development, pass `x-dev-bypass: true` to authenticate as the seed user.
  // This header is never accepted in production.
  if (IS_DEV && request.headers[DEV_BYPASS_HEADER] === 'true') {
    const user = await getUserByClerkId(DEV_SEED_CLERK_ID)
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

  try {
    const token = authHeader.slice(7)
    const payload = await verifyToken(token, {
      secretKey: process.env.CLERK_SECRET_KEY!,
    })

    const clerkId = payload.sub
    const clerkUser = await clerk.users.getUser(clerkId)
    const user = await upsertUserByClerkId({
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
