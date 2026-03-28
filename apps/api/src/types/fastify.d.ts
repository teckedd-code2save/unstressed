import type { AppServices } from '../services.js'

declare module 'fastify' {
  interface FastifyInstance {
    services: AppServices
  }
}
