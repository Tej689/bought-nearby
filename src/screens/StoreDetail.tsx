import { useMemo } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import { ItemTile } from '../components/ItemTile'
import { ScoreBadge } from '../components/ScoreBadge'
import {
  MIN_ITEMS_TO_RANK,
  itemScore,
  itemsForStore,
  storeStats,
  userById,
} from '../lib/selectors'
import { useDB } from '../lib/storage'
import { CATEGORY_LABEL, ME } from '../types'

export function StoreDetail() {
  const db = useDB()
  const navigate = useNavigate()
  const { storeId = '' } = useParams()

  const stats = storeStats(db, storeId)

  const items = useMemo(
    () =>
      itemsForStore(db, storeId)
        .map((item) => ({ item, score: itemScore(db, item.id) }))
        .sort((a, b) => b.score - a.score),
    [db, storeId],
  )

  if (!stats) {
    return <p className="text-muted p-8 text-center text-sm">Store not found.</p>
  }

  const { store } = stats
  const ranked = store.isLocal && stats.count >= MIN_ITEMS_TO_RANK

  return (
    <div>
      <header className="border-line bg-surface sticky top-0 z-10 border-b px-5 pt-5 pb-4">
        <button onClick={() => navigate(-1)} className="text-muted mb-2 text-sm font-medium">
          ← Back
        </button>

        <div className="flex items-start gap-3">
          <div className="min-w-0 flex-1">
            <h1 className="text-2xl leading-tight font-bold">{store.name}</h1>
            <p className="text-muted mt-0.5 text-sm">
              {store.neighborhood}
              {store.isLocal ? ' · Local' : ' · Chain'}
            </p>
          </div>
          {ranked && <ScoreBadge score={stats.score} size="lg" />}
        </div>

        <p className="text-muted mt-3 text-xs">
          {ranked ? (
            <>
              {stats.count} purchases logged here, averaging{' '}
              <strong className="text-ink">{stats.score.toFixed(1)}</strong> after
              people ranked them.
            </>
          ) : store.isLocal ? (
            <>
              Needs {MIN_ITEMS_TO_RANK - stats.count} more logged purchase
              {MIN_ITEMS_TO_RANK - stats.count === 1 ? '' : 's'} before it can be
              ranked.
            </>
          ) : (
            <>Chains are logged, but never ranked — this app is for independents.</>
          )}
        </p>
      </header>

      {items.length === 0 ? (
        <p className="text-muted px-5 py-16 text-center text-sm">
          Nothing logged here yet.
        </p>
      ) : (
        <ul className="space-y-2 p-5">
          {items.map(({ item, score }) => {
            const owner = userById(db, item.ownerId)
            return (
              <li
                key={item.id}
                className="border-line flex items-center gap-3 rounded-2xl border p-3"
              >
                <ItemTile
                  category={item.category}
                  photo={item.photo}
                  name={item.name}
                  size={48}
                />
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-semibold">{item.name}</p>
                  <p className="text-muted truncate text-xs">
                    {item.ownerId === ME ? 'You' : (owner?.name ?? 'Someone')} ·{' '}
                    {CATEGORY_LABEL[item.category]} · ${item.price}
                  </p>
                </div>
                <ScoreBadge score={score} />
              </li>
            )
          })}
        </ul>
      )}

      <div className="px-5 pb-8">
        <Link
          to="/log"
          className="border-line text-muted block rounded-xl border border-dashed py-3 text-center text-sm font-medium"
        >
          Log something from {store.name}
        </Link>
      </div>
    </div>
  )
}
