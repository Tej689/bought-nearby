import '@testing-library/jest-dom/vitest'
import { afterEach, beforeEach } from 'vitest'
import { cleanup } from '@testing-library/react'
import { resetDB } from '../lib/storage'

/**
 * Under Vitest's jsdom environment `window` and `globalThis` are the same
 * object, and Node 26 defines its own experimental `localStorage` there that
 * reads as undefined unless the process was started with --localstorage-file.
 * It shadows jsdom's implementation, so tests get no storage at all.
 *
 * An in-memory Storage is installed instead — deterministic, and isolated
 * between tests without depending on jsdom internals.
 */
class MemoryStorage implements Storage {
  private map = new Map<string, string>()

  get length() {
    return this.map.size
  }
  clear() {
    this.map.clear()
  }
  getItem(key: string) {
    return this.map.get(key) ?? null
  }
  key(index: number) {
    return [...this.map.keys()][index] ?? null
  }
  removeItem(key: string) {
    this.map.delete(key)
  }
  setItem(key: string, value: string) {
    this.map.set(key, String(value))
  }
  [name: string]: unknown
}

if (!window.localStorage) {
  Object.defineProperty(window, 'localStorage', {
    value: new MemoryStorage(),
    configurable: true,
    writable: true,
  })
}

beforeEach(() => {
  window.localStorage.clear()
  // The storage module memoises the DB, so clearing the backing store is not
  // enough on its own — the in-memory copy has to be reseeded too.
  resetDB()
})

afterEach(cleanup)
