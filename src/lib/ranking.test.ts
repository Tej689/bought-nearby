import { describe, expect, it } from 'vitest'
import {
  answer,
  insertAt,
  insertionIndex,
  isDone,
  pivot,
  remainingComparisons,
  scoreFor,
  startComparison,
  SCORE_BANDS,
} from './ranking'
import { SENTIMENTS } from '../types'

/**
 * Drives the state machine against a list of numbers sorted best-first,
 * answering honestly. Returns where the value landed and how many questions
 * it took to get there.
 */
function insertHonestly(sorted: number[], value: number) {
  let c = startComparison(sorted.length)
  let comparisons = 0
  while (!isDone(c)) {
    comparisons++
    c = answer(c, value > sorted[pivot(c)])
    if (comparisons > 100) throw new Error('did not converge')
  }
  return { index: insertionIndex(c), comparisons }
}

describe('binary insertion', () => {
  it('asks nothing for the first item in a bucket', () => {
    const { index, comparisons } = insertHonestly([], 5)
    expect(comparisons).toBe(0)
    expect(index).toBe(0)
  })

  it('preserves descending order for every insertion point', () => {
    const sorted = [100, 90, 80, 70, 60, 50, 40, 30, 20, 10]
    for (const value of [105, 95, 55, 15, 5]) {
      const { index } = insertHonestly(sorted, value)
      const result = insertAt(sorted, value, index)
      expect(result).toEqual([...result].sort((a, b) => b - a))
      expect(result).toHaveLength(sorted.length + 1)
    }
  })

  it('stays within ceil(log2(n+1)) comparisons', () => {
    for (let n = 0; n <= 64; n++) {
      const sorted = Array.from({ length: n }, (_, i) => (n - i) * 10)
      const { comparisons } = insertHonestly(sorted, 55)
      expect(comparisons).toBeLessThanOrEqual(Math.ceil(Math.log2(n + 1)))
    }
  })

  it('reports a remaining count that never undershoots', () => {
    const sorted = Array.from({ length: 20 }, (_, i) => (20 - i) * 10)
    let c = startComparison(sorted.length)
    let actual = 0
    let predicted = remainingComparisons(c)
    while (!isDone(c)) {
      expect(remainingComparisons(c)).toBeLessThanOrEqual(predicted)
      predicted = remainingComparisons(c)
      c = answer(c, 55 > sorted[pivot(c)])
      actual++
    }
    expect(actual).toBeLessThanOrEqual(Math.ceil(Math.log2(21)))
    expect(remainingComparisons(c)).toBe(0)
  })

  it('puts a new best at the top and a new worst at the bottom', () => {
    const sorted = [50, 40, 30]
    expect(insertHonestly(sorted, 99).index).toBe(0)
    expect(insertHonestly(sorted, 1).index).toBe(3)
  })
})

describe('scoring', () => {
  it('gives a lone item the top of its band', () => {
    for (const s of SENTIMENTS) {
      expect(scoreFor(s, 0, 1)).toBe(SCORE_BANDS[s][0])
    }
  })

  it('keeps every score inside its sentiment band', () => {
    for (const s of SENTIMENTS) {
      const [high, low] = SCORE_BANDS[s]
      for (let total = 1; total <= 30; total++) {
        for (let i = 0; i < total; i++) {
          const score = scoreFor(s, i, total)
          expect(score).toBeLessThanOrEqual(high)
          expect(score).toBeGreaterThanOrEqual(low)
        }
      }
    }
  })

  it('decreases monotonically down a bucket', () => {
    const scores = Array.from({ length: 8 }, (_, i) => scoreFor('worth_it', i, 8))
    for (let i = 1; i < scores.length; i++) {
      expect(scores[i]).toBeLessThan(scores[i - 1])
    }
  })

  it('never lets a regret outscore a fine, or a fine outscore a worth_it', () => {
    const worstWorthIt = scoreFor('worth_it', 29, 30)
    const bestFine = scoreFor('fine', 0, 30)
    const worstFine = scoreFor('fine', 29, 30)
    const bestRegret = scoreFor('regret', 0, 30)
    expect(worstWorthIt).toBeGreaterThan(bestFine)
    expect(worstFine).toBeGreaterThan(bestRegret)
  })
})
