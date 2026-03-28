import Fastify from 'fastify'
import cors from '@fastify/cors'
import { suggestionsRoute } from './routes/suggestions.js'
import { searchRoute } from './routes/search.js'
import { collectionsRoute } from './routes/collections.js'
import { contextRoute } from './routes/context.js'
import { webhooksRoute } from './routes/webhooks.js'
import { authMiddleware } from './middleware/auth.js'
import type { AppServices } from './services.js'

type BuildAppOptions = {
  services?: Partial<AppServices> | AppServices
  useDefaultServices?: boolean
}

export async function buildApp(options: BuildAppOptions = {}) {
  const { services = {}, useDefaultServices = true } = options
  const app = Fastify({ logger: true })
  const baseServices = useDefaultServices ? (await import('./services.js')).defaultServices : {}

  app.decorate('services', {
    ...baseServices,
    ...services,
  } as AppServices)

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

  await app.ready()
  return app
}
