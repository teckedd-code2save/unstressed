import type { FastifyInstance } from 'fastify'
import {
  getCollectionsByUser,
  getRecentlySavedItems,
  createCollection,
  addItemToCollection,
} from '@unstressed/db'

export async function collectionsRoute(app: FastifyInstance) {
  // GET /api/collections — fetch all trips, folders, and recently saved
  app.get('/', async (request, reply) => {
    const userId = (request as any).userId as string

    const [allCollections, recentItems] = await Promise.all([
      getCollectionsByUser(userId),
      getRecentlySavedItems(userId, 5),
    ])

    const trips = allCollections
      .filter((c) => c.type === 'TRIP')
      .map((c) => ({
        id: c.id,
        name: c.name,
        subtitle: c.description ?? '',
        coverImage: c.coverImage ?? '',
        dateRange: c.dateStart
          ? `${c.dateStart.toLocaleDateString()} – ${c.dateEnd?.toLocaleDateString() ?? 'TBD'}`
          : undefined,
        daysUntil: c.dateStart
          ? Math.max(0, Math.ceil((c.dateStart.getTime() - Date.now()) / 86400000))
          : undefined,
        memberAvatars: [],
      }))

    const folders = allCollections
      .filter((c) => c.type !== 'TRIP')
      .map((c) => ({
        id: c.id,
        name: c.name,
        description: c.description ?? '',
        icon: c.icon ?? '🗂',
        itemCount: c.items.length,
        tags: [],
      }))

    const recentlySaved = recentItems.map((item) => ({
      id: item.id,
      name: item.placeName,
      location: item.placeLocation ?? '',
      imageUrl: item.placeImageUrl ?? '',
      collectionName: item.collection.name,
    }))

    return reply.send({ trips, folders, recentlySaved })
  })

  // POST /api/collections — create a new collection
  app.post('/', async (request, reply) => {
    const userId = (request as any).userId as string
    const body = request.body as {
      name: string
      description?: string
      type?: 'TRIP' | 'FOLDER' | 'SAVED'
      icon?: string
      isPrivate?: boolean
    }

    const collection = await createCollection({
      userId,
      name: body.name,
      description: body.description ?? null,
      type: body.type ?? 'FOLDER',
      coverImage: null,
      isPrivate: body.isPrivate ?? false,
      icon: body.icon ?? '🗂',
    })

    return reply.code(201).send(collection)
  })

  // POST /api/collections/:id/items — save a place to a collection
  app.post('/:id/items', async (request, reply) => {
    const { id: collectionId } = request.params as { id: string }
    const body = request.body as {
      placeName: string
      placeLocation?: string
      placeImageUrl?: string
      notes?: string
    }

    const item = await addItemToCollection({
      collectionId,
      placeName: body.placeName,
      placeLocation: body.placeLocation ?? null,
      placeImageUrl: body.placeImageUrl ?? null,
      notes: body.notes ?? null,
    })

    return reply.code(201).send(item)
  })
}
