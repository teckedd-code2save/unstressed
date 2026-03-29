import { prisma } from '../index'
import type { Collection, CollectionItem, CollectionType } from '../../generated/client'

export async function getCollectionsByUser(
  userId: string,
  type?: CollectionType,
): Promise<(Collection & { items: CollectionItem[] })[]> {
  return prisma.collection.findMany({
    where: { userId, ...(type ? { type } : {}) },
    include: { items: { orderBy: { savedAt: 'desc' }, take: 5 } },
    orderBy: { updatedAt: 'desc' },
  })
}

export async function createCollection(
  data: Pick<Collection, 'userId' | 'name' | 'description' | 'type' | 'coverImage' | 'isPrivate' | 'icon'>,
): Promise<Collection> {
  return prisma.collection.create({ data })
}

export async function addItemToCollection(
  data: Pick<CollectionItem, 'collectionId' | 'placeName' | 'placeLocation' | 'placeImageUrl' | 'notes'>,
): Promise<CollectionItem> {
  return prisma.collectionItem.create({ data })
}

export async function getRecentlySavedItems(
  userId: string,
  limit = 5,
): Promise<Array<CollectionItem & { collectionName: string }>> {
  return prisma.$queryRaw<Array<CollectionItem & { collectionName: string }>>`
    SELECT
      ci."id",
      ci."collectionId",
      ci."placeName",
      ci."placeLocation",
      ci."placeImageUrl",
      ci."notes",
      ci."savedAt",
      c."name" AS "collectionName"
    FROM "collection_items" ci
    INNER JOIN "collections" c ON c."id" = ci."collectionId"
    WHERE c."userId" = ${userId}
    ORDER BY ci."savedAt" DESC
    LIMIT ${limit}
  `
}
