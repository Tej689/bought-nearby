import { useSyncExternalStore } from 'react'
import { buildSeedDB } from '../data/seed'
import type { DB } from '../types'

const KEY = 'bought-nearby:db:v1'

/**
 * Explicitly the DOM's storage, not the bare global. Node 26 ships its own
 * experimental `localStorage` global that is undefined unless you pass
 * --localstorage-file, and it shadows jsdom's working one under test.
 */
const store = () => window.localStorage

/**
 * Loaded on first read rather than at import time. Import-time side effects
 * make the module impossible to set up cleanly under test, and there's no
 * reason to touch storage before something actually asks for the data.
 */
let db: DB | null = null
const listeners = new Set<() => void>()

function ensure(): DB {
  return (db ??= load())
}

function load(): DB {
  try {
    const raw = store().getItem(KEY)
    if (raw) return JSON.parse(raw) as DB
  } catch {
    // Corrupt or unparseable payload — fall through to a clean seed rather
    // than leaving the app wedged on a bad localStorage entry.
  }
  const seeded = buildSeedDB()
  persist(seeded)
  return seeded
}

function persist(next: DB): boolean {
  try {
    store().setItem(KEY, JSON.stringify(next))
    return true
  } catch {
    return false
  }
}

/**
 * Writes, and if the quota is blown, retries once with every user-supplied
 * photo stripped. Photos are the only thing here big enough to hit the ~5MB
 * cap, and losing them is far better than losing the whole ranking mid-demo.
 */
function save(next: DB): void {
  if (persist(next)) return

  const stripped: DB = {
    ...next,
    items: Object.fromEntries(
      Object.entries(next.items).map(([id, item]) => [
        id,
        { ...item, photo: null },
      ]),
    ),
  }
  if (persist(stripped)) {
    db = stripped
    console.warn('localStorage quota exceeded — dropped stored photos.')
  } else {
    console.error('localStorage write failed; changes are in memory only.')
  }
}

export function getDB(): DB {
  return ensure()
}

export function setDB(updater: (current: DB) => DB): void {
  const next = updater(ensure())
  db = next
  save(next)
  listeners.forEach((fn) => fn())
}

export function resetDB(): void {
  const next = buildSeedDB()
  db = next
  save(next)
  listeners.forEach((fn) => fn())
}

function subscribe(fn: () => void): () => void {
  listeners.add(fn)
  return () => listeners.delete(fn)
}

export function useDB(): DB {
  return useSyncExternalStore(subscribe, getDB, getDB)
}
