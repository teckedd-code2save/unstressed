import { prisma } from '../index'
import type { UserContext } from '../../generated/client'

export async function getContextByUserId(userId: string): Promise<UserContext | null> {
  return prisma.userContext.findUnique({ where: { userId } })
}

export async function upsertContext(
  userId: string,
  data: Partial<Omit<UserContext, 'id' | 'userId' | 'createdAt' | 'updatedAt'>>,
): Promise<UserContext> {
  return prisma.userContext.upsert({
    where: { userId },
    update: { ...data, updatedAt: new Date() },
    create: {
      userId,
      energyLevel: data.energyLevel ?? 'medium',
      preferredSanctuaries: data.preferredSanctuaries ?? [],
      silenceStart: data.silenceStart ?? '22:00',
      silenceEnd: data.silenceEnd ?? '08:00',
      circadianWakeTime: data.circadianWakeTime ?? '07:15',
      calendarProvider: data.calendarProvider,
      healthProvider: data.healthProvider,
    },
  })
}
