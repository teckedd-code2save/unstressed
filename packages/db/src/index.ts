import { PrismaClient } from '../generated/client'
import { PrismaPg } from '@prisma/adapter-pg'
import 'dotenv/config'

const globalForPrisma = globalThis as unknown as { prisma: PrismaClient }

function createPrismaClient() {
  const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL! })
  return new PrismaClient({
    adapter,
    log: process.env.NODE_ENV === 'development' ? ['query', 'error', 'warn'] : ['error'],
  })
}

export const prisma = globalForPrisma.prisma ?? createPrismaClient()

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma

// Re-export generated types
export * from '../generated/client'

// Re-export repositories
export * from './repositories/user.repository'
export * from './repositories/suggestion.repository'
export * from './repositories/collection.repository'
export * from './repositories/context.repository'
export * from './repositories/search.repository'
