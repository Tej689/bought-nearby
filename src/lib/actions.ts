import { ME, rankingKey, type Category, type Item, type Sentiment } from '../types'
import { insertAt } from './ranking'
import { setDB } from './storage'

export interface DraftItem {
  name: string
  photo: string | null
  storeId: string
  price: number
  category: Category
  sentiment: Sentiment
}

/** Commits a draft at the position binary insertion converged on. */
export function commitItem(draft: DraftItem, index: number): string {
  const id = `${ME}-${Date.now().toString(36)}`

  setDB((db) => {
    const item: Item = { ...draft, id, ownerId: ME, createdAt: Date.now() }
    const key = rankingKey(ME, draft.category, draft.sentiment)
    const list = db.rankings[key] ?? []

    return {
      ...db,
      items: { ...db.items, [id]: item },
      rankings: {
        ...db.rankings,
        [key]: insertAt(list, id, Math.min(Math.max(index, 0), list.length)),
      },
    }
  })

  return id
}

export function deleteItem(itemId: string): void {
  setDB((db) => {
    const item = db.items[itemId]
    if (!item) return db

    const { [itemId]: _removed, ...items } = db.items
    const key = rankingKey(item.ownerId, item.category, item.sentiment)

    return {
      ...db,
      items,
      rankings: {
        ...db.rankings,
        [key]: (db.rankings[key] ?? []).filter((id) => id !== itemId),
      },
    }
  })
}
