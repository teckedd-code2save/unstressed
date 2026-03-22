import { prisma } from '../index'
import type { SearchQuery } from '../../generated/client'

export async function logSearchQuery(
  userId: string,
  queryText: string | undefined,
  moodFilters: string[],
  resultsCount: number,
): Promise<SearchQuery> {
  return prisma.searchQuery.create({
    data: { userId, queryText, moodFilters, resultsCount },
  })
}

export async function getRecentSearches(userId: string, limit = 10): Promise<SearchQuery[]> {
  return prisma.searchQuery.findMany({
    where: { userId },
    orderBy: { createdAt: 'desc' },
    take: limit,
  })
}
