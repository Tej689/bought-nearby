import { describe, expect, it } from 'vitest'
import { buildSeedDB } from '../data/seed'
import {
  MIN_ITEMS_TO_RANK,
  categoryList,
  itemScore,
  itemsForStore,
  overallRank,
  rankedLocalStores,
  storeStats,
} from './selectors'
import { CATEGORIES, ME, SENTIMENTS, rankingKey } from '../types'

const db = buildSeedDB()

describe('seed integrity', () => {
  it('points every item at a store that exists', () => {
    const ids = new Set(db.stores.map((s) => s.id))
    for (const item of Object.values(db.items)) {
      expect(ids, `${item.name} -> ${item.storeId}`).toContain(item.storeId)
    }
  })

  it('points every item at a user that exists', () => {
    const ids = new Set(db.users.map((u) => u.id))
    for (const item of Object.values(db.items)) {
      expect(ids).toContain(item.ownerId)
    }
  })

  it('lists each item in exactly one ranking bucket', () => {
    const seen = new Map<string, number>()
    for (const ids of Object.values(db.rankings)) {
      for (const id of ids) seen.set(id, (seen.get(id) ?? 0) + 1)
    }
    for (const id of Object.keys(db.items)) {
      expect(seen.get(id), `item ${id}`).toBe(1)
    }
    expect(seen.size).toBe(Object.keys(db.items).length)
  })

  it('files every item under the bucket matching its own fields', () => {
    for (const [key, ids] of Object.entries(db.rankings)) {
      for (const id of ids) {
        const item = db.items[id]
        expect(rankingKey(item.ownerId, item.category, item.sentiment)).toBe(key)
      }
    }
  })

  it('gives every user distinct timestamps so the feed can sort', () => {
    const stamps = Object.values(db.items).map((i) => i.createdAt)
    expect(new Set(stamps).size).toBe(stamps.length)
  })
})

describe('scoring over seed data', () => {
  it('scores every item inside 0..10', () => {
    for (const id of Object.keys(db.items)) {
      const score = itemScore(db, id)
      expect(score).toBeGreaterThanOrEqual(0)
      expect(score).toBeLessThanOrEqual(10)
    }
  })

  it('never scores an item below one ranked under it in the same category', () => {
    for (const category of CATEGORIES) {
      const ordered = categoryList(db, ME, category)
      const scores = ordered.map((id) => itemScore(db, id))
      for (let i = 1; i < scores.length; i++) {
        expect(scores[i], `${category} #${i + 1}`).toBeLessThanOrEqual(scores[i - 1])
      }
    }
  })

  it('numbers ranks contiguously from 1 within a category', () => {
    for (const category of CATEGORIES) {
      const ordered = categoryList(db, ME, category)
      ordered.forEach((id, i) => expect(overallRank(db, id)).toBe(i + 1))
    }
  })
})

describe('store rollup', () => {
  const ranked = rankedLocalStores(db)

  it('excludes chains entirely', () => {
    for (const s of ranked) expect(s.store.isLocal).toBe(true)
    // And the chains really are present in the data, so this isn't vacuous.
    expect(db.stores.some((s) => !s.isLocal)).toBe(true)
  })

  it('excludes local stores below the logging threshold', () => {
    for (const s of ranked) expect(s.count).toBeGreaterThanOrEqual(MIN_ITEMS_TO_RANK)

    const thin = db.stores.filter(
      (s) => s.isLocal && itemsForStore(db, s.id).length < MIN_ITEMS_TO_RANK,
    )
    // The seed deliberately includes some, so the threshold visibly does work.
    expect(thin.length).toBeGreaterThan(0)
    for (const s of thin) expect(ranked.map((r) => r.store.id)).not.toContain(s.id)
  })

  it('sorts descending by score', () => {
    for (let i = 1; i < ranked.length; i++) {
      expect(ranked[i].score).toBeLessThanOrEqual(ranked[i - 1].score)
    }
  })

  it('averages the scores of the items actually logged there', () => {
    for (const { store, score } of ranked) {
      const items = itemsForStore(db, store.id)
      const mean =
        items.reduce((sum, i) => sum + itemScore(db, i.id), 0) / items.length
      expect(score).toBeCloseTo(Math.round(mean * 10) / 10, 5)
    }
  })

  it('has enough ranked stores to make the map worth looking at', () => {
    expect(ranked.length).toBeGreaterThanOrEqual(10)
  })

  it('reports the highest-scoring item as the top item', () => {
    for (const { store, topItem } of ranked) {
      const best = Math.max(
        ...itemsForStore(db, store.id).map((i) => itemScore(db, i.id)),
      )
      expect(itemScore(db, topItem!.id)).toBe(best)
    }
  })
})

describe('coverage', () => {
  it('gives you something in every category', () => {
    for (const category of CATEGORIES) {
      expect(categoryList(db, ME, category).length).toBeGreaterThan(0)
    }
  })

  it('gives you a bucket deep enough to show real binary insertion', () => {
    const deepest = Math.max(
      ...CATEGORIES.flatMap((c) =>
        SENTIMENTS.map((s) => (db.rankings[rankingKey(ME, c, s)] ?? []).length),
      ),
    )
    // 7 items => 3 comparisons. Fewer than this and the mechanic looks trivial.
    expect(deepest).toBeGreaterThanOrEqual(7)
  })

  it('has a store worth showing detail for', () => {
    const paragon = storeStats(db, 'paragon')
    expect(paragon?.count).toBeGreaterThanOrEqual(4)
  })
})
