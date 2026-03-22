import { prisma } from '../index'
import type { User } from '../../generated/client'

export async function upsertUserByClerkId(params: {
  clerkId: string
  email: string
  name?: string
  avatarUrl?: string
}): Promise<User> {
  return prisma.user.upsert({
    where: { clerkId: params.clerkId },
    update: {
      email: params.email,
      name: params.name,
      avatarUrl: params.avatarUrl,
    },
    create: {
      clerkId: params.clerkId,
      email: params.email,
      name: params.name,
      avatarUrl: params.avatarUrl,
      context: {
        create: {
          energyLevel: 'medium',
          preferredSanctuaries: [],
          silenceStart: '22:00',
          silenceEnd: '08:00',
          circadianWakeTime: '07:15',
        },
      },
    },
  })
}

export async function getUserByClerkId(clerkId: string): Promise<User | null> {
  return prisma.user.findUnique({ where: { clerkId } })
}
