import { useEffect, useRef, useState } from 'react'
import { Link, useLocation } from 'react-router-dom'
import { ItemTile } from '../components/ItemTile'
import { ScoreBadge } from '../components/ScoreBadge'
import { bucketList, itemScore, overallRank, storeById } from '../lib/selectors'
import { useDB } from '../lib/storage'
import {
  CATEGORIES,
  CATEGORY_EMOJI,
  CATEGORY_LABEL,
  ME,
  SENTIMENTS,
  SENTIMENT_LABEL,
  type Category,
} from '../types'

const SENTIMENT_TONE: Record<(typeof SENTIMENTS)[number], string> = {
  worth_it: 'text-worth',
  fine: 'text-fine',
  regret: 'text-regret',
}

export function Shelves() {
  const db = useDB()
  const { state } = useLocation() as { state: { justAdded?: string } | null }
  const justAdded = state?.justAdded
  const addedItem = justAdded ? db.items[justAdded] : undefined

  const [category, setCategory] = useState<Category>(
    () => addedItem?.category ?? 'kitchen',
  )
  const addedRef = useRef<HTMLLIElement>(null)

  useEffect(() => {
    // Optional call: purely a nicety, and jsdom doesn't implement it.
    addedRef.current?.scrollIntoView?.({ block: 'center', behavior: 'smooth' })
  }, [justAdded, category])

  const total = SENTIMENTS.reduce(
    (n, s) => n + bucketList(db, ME, category, s).length,
    0,
  )

  return (
    <div>
      <header className="border-line bg-surface sticky top-0 z-10 border-b px-5 pt-5 pb-3">
        <h1 className="text-2xl font-bold">Your shelves</h1>
        <p className="text-muted mt-0.5 text-sm">
          Ranked by you, one head-to-head at a time.
        </p>
      </header>

      <div className="border-line scrollbar-none flex gap-2 overflow-x-auto border-b px-5 py-3">
        {CATEGORIES.map((c) => (
          <button
            key={c}
            onClick={() => setCategory(c)}
            className={`shrink-0 rounded-full border px-3 py-1.5 text-sm font-medium transition ${
              c === category
                ? 'border-ink bg-ink text-white'
                : 'border-line text-muted'
            }`}
          >
            {CATEGORY_EMOJI[c]} {CATEGORY_LABEL[c]}
          </button>
        ))}
      </div>

      {total === 0 ? (
        <p className="text-muted px-5 py-16 text-center text-sm">
          Nothing in {CATEGORY_LABEL[category]} yet. Tap + to log something.
        </p>
      ) : (
        <div className="px-5 pb-8">
          {SENTIMENTS.map((sentiment) => {
            const ids = bucketList(db, ME, category, sentiment)
            if (ids.length === 0) return null

            return (
              <section key={sentiment} className="mt-5">
                <h2
                  className={`text-[11px] font-bold tracking-widest uppercase ${SENTIMENT_TONE[sentiment]}`}
                >
                  {SENTIMENT_LABEL[sentiment]} · {ids.length}
                </h2>
                <ul className="mt-2 space-y-2">
                  {ids.map((id) => {
                    const item = db.items[id]
                    const store = storeById(db, item.storeId)
                    const isNew = id === justAdded

                    return (
                      <li
                        key={id}
                        ref={isNew ? addedRef : undefined}
                        className={`flex items-center gap-3 rounded-2xl border p-3 ${
                          isNew ? 'border-accent bg-accent/5' : 'border-line'
                        }`}
                      >
                        <span className="text-muted w-5 shrink-0 text-center text-sm font-bold tabular-nums">
                          {overallRank(db, id)}
                        </span>
                        <ItemTile
                          category={item.category}
                          photo={item.photo}
                          name={item.name}
                          size={48}
                        />
                        <div className="min-w-0 flex-1">
                          <p className="truncate text-sm font-semibold">{item.name}</p>
                          {store && (
                            <Link
                              to={`/store/${store.id}`}
                              className="text-muted block truncate text-xs"
                            >
                              {store.name}
                              {store.isLocal ? '' : ' · chain'} · ${item.price}
                            </Link>
                          )}
                        </div>
                        <ScoreBadge score={itemScore(db, id)} />
                      </li>
                    )
                  })}
                </ul>
              </section>
            )
          })}
        </div>
      )}
    </div>
  )
}
