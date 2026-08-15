import type { Sentiment } from '../types'

/**
 * Score bands per sentiment bucket. Beli-style: the bucket picks the band,
 * the position within the bucket picks the point inside it. Users never type
 * a number, which is exactly why the numbers end up meaning something.
 */
export const SCORE_BANDS: Record<Sentiment, [high: number, low: number]> = {
  worth_it: [10.0, 7.0],
  fine: [6.9, 4.0],
  regret: [3.9, 0.0],
}

/**
 * Score for the item at `index` (0 = best) in a bucket of `total` items.
 * A lone item sits at the top of its band — being your only "worth it" thing
 * shouldn't average you into mediocrity.
 */
export function scoreFor(
  sentiment: Sentiment,
  index: number,
  total: number,
): number {
  const [high, low] = SCORE_BANDS[sentiment]
  if (total <= 1) return high
  const t = index / (total - 1)
  return Math.round((high - t * (high - low)) * 10) / 10
}

/** Binary-insertion state machine. Ask, answer, repeat until `done`. */
export interface Comparison {
  lo: number
  hi: number
}

export function startComparison(listLength: number): Comparison {
  return { lo: 0, hi: listLength }
}

export function isDone(c: Comparison): boolean {
  return c.lo >= c.hi
}

/** Index into the existing list that the new item is being weighed against. */
export function pivot(c: Comparison): number {
  return (c.lo + c.hi) >> 1
}

/**
 * Advance the search. `newIsBetter` means the item being inserted beat the
 * item currently at the pivot.
 */
export function answer(c: Comparison, newIsBetter: boolean): Comparison {
  const mid = pivot(c)
  return newIsBetter ? { lo: c.lo, hi: mid } : { lo: mid + 1, hi: c.hi }
}

/** Final resting index once the search has converged. */
export function insertionIndex(c: Comparison): number {
  return c.lo
}

/**
 * Comparisons still required from this state, worst case. Drives the progress
 * dots — an unbounded "keep tapping" flow feels much longer than it is.
 */
export function remainingComparisons(c: Comparison): number {
  return c.hi <= c.lo ? 0 : Math.ceil(Math.log2(c.hi - c.lo + 1))
}

export function insertAt<T>(list: T[], item: T, index: number): T[] {
  return [...list.slice(0, index), item, ...list.slice(index)]
}
