import test from 'node:test'
import assert from 'node:assert/strict'
import type Anthropic from '@anthropic-ai/sdk'
import { buildApp } from './app.js'
import type { AppServices } from './services.js'

type TestUser = {
  id: string
  clerkId: string
  email: string
  name?: string | null
  avatarUrl?: string | null
}

type TestContext = {
  energyLevel: string
  preferredSanctuaries: string[]
  silenceStart: string
  silenceEnd: string
  circadianWakeTime: string
  calendarProvider: string | null
  healthProvider: string | null
  lastSynced: Date | null
}

function createTestServices() {
  const user: TestUser = {
    id: 'user_1',
    clerkId: 'demo_user_001',
    email: 'demo@unstressed.app',
    name: 'Demo User',
    avatarUrl: null,
  }

  let context: TestContext = {
    energyLevel: 'medium',
    preferredSanctuaries: ['quiet-cafes'],
    silenceStart: '22:00',
    silenceEnd: '08:00',
    circadianWakeTime: '07:15',
    calendarProvider: 'google',
    healthProvider: null,
    lastSynced: new Date('2026-03-28T10:00:00.000Z'),
  }

  const collections = [
    {
      id: 'trip_1',
      userId: user.id,
      name: 'Amalfi Coast Drift',
      description: 'Seven calm days by the water.',
      type: 'TRIP' as const,
      coverImage: null,
      isPrivate: false,
      icon: '✈️',
      dateStart: new Date('2026-06-12T00:00:00.000Z'),
      dateEnd: new Date('2026-06-19T00:00:00.000Z'),
      createdAt: new Date('2026-03-20T00:00:00.000Z'),
      updatedAt: new Date('2026-03-20T00:00:00.000Z'),
      items: [],
    },
    {
      id: 'folder_1',
      userId: user.id,
      name: 'Summer Retreats',
      description: 'Warm weather sanctuaries.',
      type: 'FOLDER' as const,
      coverImage: null,
      isPrivate: false,
      icon: '☀️',
      dateStart: null,
      dateEnd: null,
      createdAt: new Date('2026-03-20T00:00:00.000Z'),
      updatedAt: new Date('2026-03-20T00:00:00.000Z'),
      items: [],
    },
  ]

  const recentItems = [
    {
      id: 'item_1',
      collectionId: 'folder_1',
      placeName: 'Quiet Library',
      placeLocation: 'Accra',
      placeImageUrl: null,
      notes: null,
      savedAt: new Date('2026-03-28T09:00:00.000Z'),
      collection: {
        id: 'folder_1',
        userId: user.id,
        name: 'Summer Retreats',
        description: 'Warm weather sanctuaries.',
        type: 'FOLDER' as const,
        coverImage: null,
        isPrivate: false,
        icon: '☀️',
        dateStart: null,
        dateEnd: null,
        createdAt: new Date('2026-03-20T00:00:00.000Z'),
        updatedAt: new Date('2026-03-20T00:00:00.000Z'),
      },
    },
  ]

  const searchLogs: Array<{
    userId: string
    queryText: string | undefined
    moodFilters: string[]
    resultsCount: number
  }> = []

  const services: AppServices = {
    async getContextByUserId() {
      return context as any
    },
    async upsertContext(_userId, patch) {
      context = {
        ...context,
        ...patch,
        calendarProvider: patch.calendarProvider ?? context.calendarProvider,
        healthProvider: patch.healthProvider ?? context.healthProvider,
        lastSynced: new Date('2026-03-28T12:00:00.000Z'),
      }
      return context as any
    },
    async getCollectionsByUser() {
      return collections as any
    },
    async getRecentlySavedItems() {
      return recentItems as any
    },
    async createCollection(data) {
      const created = {
        id: `collection_${collections.length + 1}`,
        createdAt: new Date('2026-03-28T12:30:00.000Z'),
        updatedAt: new Date('2026-03-28T12:30:00.000Z'),
        dateStart: null,
        dateEnd: null,
        ...data,
        items: [],
      }
      collections.push(created as any)
      return created as any
    },
    async addItemToCollection(data) {
      const created = {
        id: `item_${recentItems.length + 2}`,
        savedAt: new Date('2026-03-28T12:31:00.000Z'),
        ...data,
      }
      return created as any
    },
    async upsertUserByClerkId(params) {
      return {
        id: user.id,
        clerkId: params.clerkId,
        email: params.email,
        name: params.name ?? null,
        avatarUrl: params.avatarUrl ?? null,
        createdAt: new Date('2026-03-20T00:00:00.000Z'),
        updatedAt: new Date('2026-03-28T00:00:00.000Z'),
      } as any
    },
    async getUserByClerkId(clerkId) {
      return clerkId === user.clerkId ? (user as any) : null
    },
    async logSearchQuery(userId, queryText, moodFilters, resultsCount) {
      searchLogs.push({ userId, queryText, moodFilters, resultsCount })
      return {
        id: `search_${searchLogs.length}`,
        userId,
        queryText: queryText ?? null,
        moodFilters,
        resultsCount,
        createdAt: new Date('2026-03-28T12:32:00.000Z'),
      } as any
    },
    createAnthropicClient() {
      return null as Anthropic | null
    },
  }

  return { services, searchLogs }
}

async function withApp(run: (app: Awaited<ReturnType<typeof buildApp>>, helpers: ReturnType<typeof createTestServices>) => Promise<void>) {
  process.env.NODE_ENV = 'development'
  const helpers = createTestServices()
  const app = await buildApp({ services: helpers.services, useDefaultServices: false })

  try {
    await run(app, helpers)
  } finally {
    await app.close()
  }
}

test('GET /health stays public', async () => {
  await withApp(async (app) => {
    const response = await app.inject({ method: 'GET', url: '/health' })
    assert.equal(response.statusCode, 200)
    assert.equal(response.json().status, 'ok')
  })
})

test('protected routes reject missing auth', async () => {
  await withApp(async (app) => {
    const response = await app.inject({ method: 'GET', url: '/api/context' })
    assert.equal(response.statusCode, 401)
    assert.match(response.body, /Missing authorization header/)
  })
})

test('GET /api/suggestions/right-now returns fallback payload for dev bypass user', async () => {
  await withApp(async (app) => {
    const response = await app.inject({
      method: 'GET',
      url: '/api/suggestions/right-now',
      headers: { 'x-dev-bypass': 'true' },
    })

    assert.equal(response.statusCode, 200)
    const body = response.json()
    assert.equal(body.recommendation.cta, 'Start Session')
    assert.equal(body.energyInsight.level, 'medium')
  })
})

test('POST /api/search returns fallback results and logs the query', async () => {
  await withApp(async (app, { searchLogs }) => {
    const response = await app.inject({
      method: 'POST',
      url: '/api/search',
      headers: { 'x-dev-bypass': 'true' },
      payload: { query: 'quiet cafe', moodFilters: ['Deep Focus'] },
    })

    assert.equal(response.statusCode, 200)
    const body = response.json()
    assert.equal(body.results.length, 4)
    assert.equal(searchLogs.length, 1)
    assert.equal(searchLogs[0]?.queryText, 'quiet cafe')
  })
})

test('context endpoints read and update user context', async () => {
  await withApp(async (app) => {
    const getResponse = await app.inject({
      method: 'GET',
      url: '/api/context',
      headers: { 'x-dev-bypass': 'true' },
    })

    assert.equal(getResponse.statusCode, 200)
    assert.equal(getResponse.json().calendarProvider, 'google')

    const patchResponse = await app.inject({
      method: 'PATCH',
      url: '/api/context',
      headers: { 'x-dev-bypass': 'true' },
      payload: { preferredSanctuaries: ['forest-trails'], healthProvider: 'oura' },
    })

    assert.equal(patchResponse.statusCode, 200)
    const updated = patchResponse.json()
    assert.deepEqual(updated.preferredSanctuaries, ['forest-trails'])
    assert.equal(updated.healthProvider, 'oura')
  })
})

test('collections endpoints aggregate reads and allow writes', async () => {
  await withApp(async (app) => {
    const getResponse = await app.inject({
      method: 'GET',
      url: '/api/collections',
      headers: { 'x-dev-bypass': 'true' },
    })

    assert.equal(getResponse.statusCode, 200)
    const body = getResponse.json()
    assert.equal(body.trips.length, 1)
    assert.equal(body.folders.length, 1)
    assert.equal(body.recentlySaved.length, 1)

    const createResponse = await app.inject({
      method: 'POST',
      url: '/api/collections',
      headers: { 'x-dev-bypass': 'true' },
      payload: { name: 'Focus Week', type: 'FOLDER', icon: '🧠' },
    })

    assert.equal(createResponse.statusCode, 201)
    assert.equal(createResponse.json().name, 'Focus Week')

    const addItemResponse = await app.inject({
      method: 'POST',
      url: '/api/collections/folder_1/items',
      headers: { 'x-dev-bypass': 'true' },
      payload: { placeName: 'Stillwater Spa Lounge', notes: 'Book early' },
    })

    assert.equal(addItemResponse.statusCode, 201)
    assert.equal(addItemResponse.json().placeName, 'Stillwater Spa Lounge')
  })
})
