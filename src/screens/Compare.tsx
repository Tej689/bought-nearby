import { useEffect, useRef, useState } from 'react'
import { Navigate, useLocation, useNavigate } from 'react-router-dom'
import { ItemTile } from '../components/ItemTile'
import { commitItem, type DraftItem } from '../lib/actions'
import {
  answer,
  insertionIndex,
  isDone,
  pivot,
  remainingComparisons,
  startComparison,
} from '../lib/ranking'
import { bucketList } from '../lib/selectors'
import { getDB, useDB } from '../lib/storage'
import { CATEGORY_LABEL, ME, SENTIMENT_LABEL, type Category } from '../types'

export function Compare() {
  const db = useDB()
  const navigate = useNavigate()
  const { state } = useLocation() as { state: { draft?: DraftItem } | null }
  const draft = state?.draft

  /**
   * Snapshot the bucket once on mount. The binary search holds indices into
   * this exact list — if it recomputed from a changing DB mid-flow, those
   * indices would silently point at the wrong items.
   */
  const [bucket] = useState<string[]>(() =>
    draft ? bucketList(getDB(), ME, draft.category, draft.sentiment) : [],
  )
  const [search, setSearch] = useState(() => startComparison(bucket.length))
  const [asked, setAsked] = useState(0)
  const committed = useRef(false)

  const done = !draft || isDone(search)

  useEffect(() => {
    if (!draft || !done || committed.current) return
    // Ref guard: StrictMode runs effects twice in dev, and without it the
    // item gets logged twice.
    committed.current = true
    const id = commitItem(draft, insertionIndex(search))
    navigate('/shelves', { replace: true, state: { justAdded: id } })
  }, [done, draft, search, navigate])

  if (!draft) return <Navigate to="/log" replace />
  if (done) return null

  const opponent = db.items[bucket[pivot(search)]]
  if (!opponent) return null

  const total = asked + remainingComparisons(search)

  const choose = (newIsBetter: boolean) => {
    setSearch((c) => answer(c, newIsBetter))
    setAsked((n) => n + 1)
  }

  return (
    <div className="flex h-full flex-col p-5">
      <header className="pt-2 text-center">
        <p className="text-muted text-xs font-medium tracking-wide uppercase">
          {CATEGORY_LABEL[draft.category]} · {SENTIMENT_LABEL[draft.sentiment]}
        </p>
        <h1 className="mt-1 text-xl font-bold">Which one is better?</h1>
        <div className="mt-3 flex justify-center gap-1.5">
          {Array.from({ length: total }, (_, i) => (
            <span
              key={i}
              className={`h-1.5 w-6 rounded-full ${i < asked ? 'bg-accent' : 'bg-line'}`}
            />
          ))}
        </div>
      </header>

      <div className="flex min-h-0 flex-1 flex-col justify-center gap-3 py-4">
        <ChoiceCard
          label="Just bought"
          name={draft.name}
          photo={draft.photo}
          category={draft.category}
          price={draft.price}
          onClick={() => choose(true)}
          highlight
        />

        <div className="text-muted text-center text-xs font-semibold tracking-widest">
          VS
        </div>

        <ChoiceCard
          label={`Your #${pivot(search) + 1} in this bucket`}
          name={opponent.name}
          photo={opponent.photo}
          category={opponent.category}
          price={opponent.price}
          onClick={() => choose(false)}
        />
      </div>

      <button onClick={() => navigate('/log')} className="text-muted py-3 text-sm font-medium">
        Cancel
      </button>
    </div>
  )
}

interface CardProps {
  label: string
  name: string
  photo: string | null
  category: Category
  price: number
  onClick: () => void
  highlight?: boolean
}

function ChoiceCard({
  label,
  name,
  photo,
  category,
  price,
  onClick,
  highlight,
}: CardProps) {
  return (
    <button
      onClick={onClick}
      className={`flex w-full items-center gap-4 rounded-2xl border p-4 text-left transition active:scale-[0.98] ${
        highlight ? 'border-accent bg-accent/5' : 'border-line'
      }`}
    >
      <ItemTile category={category} photo={photo} name={name} size={72} />
      <div className="min-w-0 flex-1">
        <p className="text-muted text-[11px] font-medium tracking-wide uppercase">
          {label}
        </p>
        <p className="mt-0.5 leading-snug font-semibold">{name}</p>
        <p className="text-muted mt-0.5 text-sm tabular-nums">${price}</p>
      </div>
    </button>
  )
}
