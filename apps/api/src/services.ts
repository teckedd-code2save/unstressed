import Anthropic from '@anthropic-ai/sdk'
import {
  getContextByUserId,
  upsertContext,
  getCollectionsByUser,
  getRecentlySavedItems,
  getGroupsDashboardByUser,
  getSafetyDashboardByUser,
  createSafetyCheckIn,
  createCollection,
  addItemToCollection,
  upsertUserByClerkId,
  getUserByClerkId,
  logSearchQuery,
} from '@unstressed/db'

export type AppServices = {
  getContextByUserId: typeof getContextByUserId
  upsertContext: typeof upsertContext
  getCollectionsByUser: typeof getCollectionsByUser
  getRecentlySavedItems: typeof getRecentlySavedItems
  getGroupsDashboardByUser: typeof getGroupsDashboardByUser
  getSafetyDashboardByUser: typeof getSafetyDashboardByUser
  createSafetyCheckIn: typeof createSafetyCheckIn
  createCollection: typeof createCollection
  addItemToCollection: typeof addItemToCollection
  upsertUserByClerkId: typeof upsertUserByClerkId
  getUserByClerkId: typeof getUserByClerkId
  logSearchQuery: typeof logSearchQuery
  createAnthropicClient: () => Anthropic | null
}

export const defaultServices: AppServices = {
  getContextByUserId,
  upsertContext,
  getCollectionsByUser,
  getRecentlySavedItems,
  getGroupsDashboardByUser,
  getSafetyDashboardByUser,
  createSafetyCheckIn,
  createCollection,
  addItemToCollection,
  upsertUserByClerkId,
  getUserByClerkId,
  logSearchQuery,
  createAnthropicClient: () => {
    const apiKey = process.env.ANTHROPIC_API_KEY
    return apiKey ? new Anthropic({ apiKey }) : null
  },
}
