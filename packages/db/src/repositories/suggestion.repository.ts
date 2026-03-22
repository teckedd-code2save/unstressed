import { prisma } from '../index'
import type { Suggestion, Prisma } from '../../generated/client'

export async function getSuggestionsForUser(userId: string, limit = 10): Promise<Suggestion[]> {
  return prisma.suggestion.findMany({
    where: { userId, isActive: true },
    orderBy: { createdAt: 'desc' },
    take: limit,
  })
}

export async function createSuggestion(
  data: Prisma.SuggestionCreateInput,
): Promise<Suggestion> {
  return prisma.suggestion.create({ data })
}

export async function upsertSuggestionsForUser(
  userId: string,
  suggestions: Prisma.SuggestionCreateManyInput[],
): Promise<void> {
  await prisma.$transaction([
    prisma.suggestion.updateMany({
      where: { userId, isActive: true },
      data: { isActive: false },
    }),
    prisma.suggestion.createMany({
      data: suggestions.map((s) => ({ ...s, userId })),
    }),
  ])
}
