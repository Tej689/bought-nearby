import { useMemo } from 'react'
import { Link } from 'react-router-dom'
import { ItemTile } from '../components/ItemTile'
import { ScoreBadge } from '../components/ScoreBadge'
import {
  categorySize,
  feedItems,
  itemScore,
  overallRank,
  rankedLocalStores,
  storeById,
  userById,
} from '../lib/selectors'
import { useDB } from '../lib/storage'
import { CATEGORY_LABEL, ME } from '../types'

function relativeTime(ts: number, now: number): string {
  const days = Math.floor((now - ts) / 86_400_000)
  if (days <= 0) return 'today'
  if (days === 1) return 'yesterday'
  if (days < 7) return `${days}d ago`
  return `${Math.floor(days / 7)}w ago`
}

export function Feed() {
  const db = useDB()
  const items = useMemo(() => feedItems(db, ME), [db])
  const topStore = useMemo(() => rankedLocalStores(db)[0], [db])
  const now = Date.now()

  return (
    <div>
      <header className="border-line bg-surface sticky top-0 z-10 border-b px-5 pt-5 pb-3">
        <h1 className="text-2xl font-bold">Bought Nearby</h1>
        <p className="text-muted mt-0.5 text-sm">
          What your friends bought — and whether it held up.
        </p>
      </header>

      {topStore && (
        <Link
          to={`/store/${topStore.store.id}`}
          className="border-line mx-5 mt-4 flex items-center gap-3 rounded-2xl border p-4"
        >
          <span className="text-2xl">🏆</span>
          <div className="min-w-0 flex-1">
            <p className="text-muted text-[11px] font-bold tracking-widest uppercase">
              Top local store
            </p>
            <p className="truncate font-semibold">{topStore.store.name}</p>
            <p className="text-muted truncate text-xs">
              {topStore.store.neighborhood} · {topStore.count} logged
            </p>
          </div>
          <ScoreBadge score={topStore.score} />
        </Link>
      )}

      <ul className="space-y-3 p-5">
        {items.map((item) => {
          const owner = userById(db, item.ownerId)
          const store = storeById(db, item.storeId)
          const rank = overallRank(db, item.id)
          const total = categorySize(db, item.ownerId, item.category)

          return (
            <li key={item.id} className="border-line rounded-2xl border p-4">
              <p className="text-sm">
                <span className="mr-1">{owner?.avatar}</span>
                <strong>{owner?.name ?? 'Someone'}</strong> ranked this{' '}
                <strong>
                  #{rank} of {total}
                </strong>{' '}
                in {CATEGORY_LABEL[item.category]}
              </p>

              <div className="mt-3 flex items-center gap-3">
                <ItemTile
                  category={item.category}
                  photo={item.photo}
                  name={item.name}
                  size={52}
                />
                <div className="min-w-0 flex-1">
                  <p className="truncate font-semibold">{item.name}</p>
                  {store && (
                    <Link
                      to={`/store/${store.id}`}
                      className="text-muted block truncate text-xs"
                    >
                      {store.name} · {store.neighborhood}
                      {store.isLocal ? '' : ' · chain'}
                    </Link>
                  )}
                  <p className="text-muted mt-0.5 text-xs tabular-nums">
                    ${item.price} · {relativeTime(item.createdAt, now)}
                  </p>
                </div>
                <ScoreBadge score={itemScore(db, item.id)} />
              </div>
            </li>
          )
        })}
      </ul>
    </div>
  )
}
