export const CATEGORIES = [
  'kitchen',
  'tech',
  'clothing',
  'fitness',
  'home',
  'beauty',
] as const

export type Category = (typeof CATEGORIES)[number]

/**
 * Beli's real model is bucket-then-rank: you first say roughly how you feel,
 * then only compare against things in the same bucket. It makes the derived
 * score believable and cuts the number of comparisons roughly in three.
 */
export const SENTIMENTS = ['worth_it', 'fine', 'regret'] as const
export type Sentiment = (typeof SENTIMENTS)[number]

export interface Store {
  id: string
  name: string
  neighborhood: string
  lat: number
  lng: number
  /** false = chain. Chains are logged, but never ranked on the map. */
  isLocal: boolean
}

export interface Item {
  id: string
  name: string
  /** dataURL for user photos; null falls back to a generated category tile. */
  photo: string | null
  storeId: string
  price: number
  category: Category
  sentiment: Sentiment
  ownerId: string
  createdAt: number
}

export interface User {
  id: string
  name: string
  avatar: string
}

/**
 * Rank is never stored on an item — it's the position of an item's id inside
 * its ranking list. Storing a rank integer alongside the list guarantees the
 * two drift apart the first time something is inserted in the middle.
 */
export type RankingKey = string

export interface DB {
  users: User[]
  stores: Store[]
  items: Record<string, Item>
  /** `${ownerId}|${category}|${sentiment}` -> ordered item ids, best first. */
  rankings: Record<RankingKey, string[]>
}

export const ME = 'me'

export function rankingKey(
  ownerId: string,
  category: Category,
  sentiment: Sentiment,
): RankingKey {
  return `${ownerId}|${category}|${sentiment}`
}

export const CATEGORY_LABEL: Record<Category, string> = {
  kitchen: 'Kitchen',
  tech: 'Tech',
  clothing: 'Clothing',
  fitness: 'Fitness',
  home: 'Home',
  beauty: 'Beauty',
}

export const CATEGORY_EMOJI: Record<Category, string> = {
  kitchen: '🍳',
  tech: '🎧',
  clothing: '🧥',
  fitness: '🏋️',
  home: '🛋️',
  beauty: '🧴',
}

export const SENTIMENT_LABEL: Record<Sentiment, string> = {
  worth_it: 'Worth it',
  fine: 'Fine',
  regret: 'Regret',
}
