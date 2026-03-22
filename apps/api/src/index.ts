import 'dotenv/config'
import Fastify from 'fastify'
import cors from '@fastify/cors'
import { suggestionsRoute } from './routes/suggestions.js'
import { searchRoute } from './routes/search.js'
import { collectionsRoute } from './routes/collections.js'
import { contextRoute } from './routes/context.js'
import { webhooksRoute } from './routes/webhooks.js'
import { authMiddleware } from './middleware/auth.js'

async function main() {
  const app = Fastify({ logger: true })

  await app.register(cors, {
    origin: true,
    credentials: true,
  })

  app.addHook('onRequest', authMiddleware)

  await app.register(suggestionsRoute, { prefix: '/api/suggestions' })
  await app.register(searchRoute, { prefix: '/api/search' })
  await app.register(collectionsRoute, { prefix: '/api/collections' })
  await app.register(contextRoute, { prefix: '/api/context' })
  await app.register(webhooksRoute, { prefix: '/webhooks' })

  app.get('/health', async () => ({ status: 'ok', ts: new Date().toISOString() }))

  const PORT = Number(process.env.PORT ?? 3001)
  await app.listen({ port: PORT, host: '0.0.0.0' })
  console.log(`🚀 Unstressed API running on :${PORT}`)
}

main().catch((err) => {
  console.error(err)
  process.exit(1)
})
