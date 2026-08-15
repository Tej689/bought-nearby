import {
  SENTIMENTS,
  rankingKey,
  type Category,
  type DB,
  type Item,
  type Store,
  type User,
} from '../types'
import { scoreFor } from './ranking'

/** Stores need at least this many logged items before they can be ranked. */
export const MIN_ITEMS_TO_RANK = 2

export function bucketList(
  db: DB,
  ownerId: string,
  category: Category,
  sentiment: (typeof SENTIMENTS)[number],
): string[] {
  return db.rankings[rankingKey(ownerId, category, sentiment)] ?? []
}

/** Every item in a category for one person, best bucket first. */
export function categoryList(
  db: DB,
  ownerId: string,
  category: Category,
): string[] {
  return SENTIMENTS.flatMap((s) => bucketList(db, ownerId, category, s))
}

export function itemScore(db: DB, itemId: string): number {
  const item = db.items[itemId]
  if (!item) return 0
  const list = bucketList(db, item.ownerId, item.category, item.sentiment)
  const index = list.indexOf(itemId)
  return scoreFor(item.sentiment, index < 0 ? 0 : index, list.length)
}

/** 1-based position within the owner's whole category shelf. */
export function overallRank(db: DB, itemId: string): number {
  const item = db.items[itemId]
  if (!item) return 0
  return categoryList(db, item.ownerId, item.category).indexOf(itemId) + 1
}

export function categorySize(db: DB, ownerId: string, category: Category) {
  return categoryList(db, ownerId, category).length
}

export function itemsForStore(db: DB, storeId: string): Item[] {
  return Object.values(db.items).filter((i) => i.storeId === storeId)
}

export interface StoreStats {
  store: Store
  count: number
  score: number
  topItem: Item | null
}

export function storeStats(db: DB, storeId: string): StoreStats | null {
  const store = db.stores.find((s) => s.id === storeId)
  if (!store) return null

  const items = itemsForStore(db, storeId)
  if (items.length === 0) {
    return { store, count: 0, score: 0, topItem: null }
  }

  const scored = items
    .map((item) => ({ item, score: itemScore(db, item.id) }))
    .sort((a, b) => b.score - a.score)

  const mean = scored.reduce((sum, s) => sum + s.score, 0) / scored.length

  return {
    store,
    count: items.length,
    score: Math.round(mean * 10) / 10,
    topItem: scored[0].item,
  }
}

/**
 * The thesis, in one function: local stores ordered by how much people
 * actually ended up loving what they bought there.
 *
 * Chains are excluded on purpose. Most purchases happen at chains, so letting
 * them rank means Target and Amazon bury every independent within a week and
 * the entire premise of the app quietly stops being true.
 */
export function rankedLocalStores(db: DB): StoreStats[] {
  return db.stores
    .filter((s) => s.isLocal)
    .map((s) => storeStats(db, s.id))
    .filter((s): s is StoreStats => s !== null && s.count >= MIN_ITEMS_TO_RANK)
    .sort((a, b) => b.score - a.score)
}

export function storeById(db: DB, id: string): Store | undefined {
  return db.stores.find((s) => s.id === id)
}

export function userById(db: DB, id: string): User | undefined {
  return db.users.find((u) => u.id === id)
}

/** Friends' purchases, newest first. */
export function feedItems(db: DB, viewerId: string, limit = 40): Item[] {
  return Object.values(db.items)
    .filter((i) => i.ownerId !== viewerId)
    .sort((a, b) => b.createdAt - a.createdAt)
    .slice(0, limit)
}
