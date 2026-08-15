import { useMemo, useState } from 'react'
import { MapContainer, Marker, TileLayer, Tooltip, useMap } from 'react-leaflet'
import { divIcon } from 'leaflet'
import { Link, useNavigate } from 'react-router-dom'
import { ScoreBadge } from '../components/ScoreBadge'
import { MIN_ITEMS_TO_RANK, rankedLocalStores, type StoreStats } from '../lib/selectors'
import { useDB } from '../lib/storage'

const NYC: [number, number] = [40.727, -73.975]

function pinColor(score: number): string {
  if (score >= 8.5) return '#15803d'
  if (score >= 7) return '#4d9e46'
  if (score >= 5) return '#ca8a04'
  return '#b45309'
}

function pinFor(stats: StoreStats, rank: number) {
  const color = pinColor(stats.score)
  return divIcon({
    className: '',
    html: `
      <div style="
        display:grid;place-items:center;
        width:34px;height:34px;border-radius:50%;
        background:${color};color:#fff;
        font:700 12px/1 ui-sans-serif,system-ui,sans-serif;
        border:2.5px solid #fff;box-shadow:0 2px 6px rgba(0,0,0,.35);
      ">${rank}</div>`,
    iconSize: [34, 34],
    iconAnchor: [17, 17],
  })
}

/** Fits the viewport to the pins so the map never opens on empty ocean. */
function FitToPins({ points }: { points: [number, number][] }) {
  const map = useMap()
  useMemo(() => {
    if (points.length > 0) {
      map.fitBounds(points, { padding: [40, 40], maxZoom: 14 })
    }
  }, [map, points])
  return null
}

export function NearbyMap() {
  const db = useDB()
  const navigate = useNavigate()
  const [view, setView] = useState<'map' | 'list'>('map')

  const ranked = useMemo(() => rankedLocalStores(db), [db])
  const points = useMemo(
    () => ranked.map((s) => [s.store.lat, s.store.lng] as [number, number]),
    [ranked],
  )

  return (
    <div className="flex h-full flex-col">
      <header className="border-line bg-surface border-b px-5 pt-5 pb-3">
        <h1 className="text-2xl font-bold">Nearby</h1>
        <p className="text-muted mt-0.5 text-sm">
          Local stores ranked by how much people kept loving what they bought.
        </p>

        <div className="border-line mt-3 inline-flex rounded-full border p-0.5">
          {(['map', 'list'] as const).map((v) => (
            <button
              key={v}
              onClick={() => setView(v)}
              className={`rounded-full px-4 py-1 text-sm font-medium capitalize ${
                view === v ? 'bg-ink text-white' : 'text-muted'
              }`}
            >
              {v}
            </button>
          ))}
        </div>
      </header>

      {ranked.length === 0 ? (
        <p className="text-muted px-5 py-16 text-center text-sm">
          No local store has {MIN_ITEMS_TO_RANK} logged purchases yet.
        </p>
      ) : view === 'map' ? (
        <div className="min-h-0 flex-1">
          <MapContainer
            center={NYC}
            zoom={12}
            scrollWheelZoom
            className="h-full w-full"
          >
            <TileLayer
              attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
              url="https://tile.openstreetmap.org/{z}/{x}/{y}.png"
            />
            <FitToPins points={points} />
            {ranked.map((stats, i) => (
              <Marker
                key={stats.store.id}
                position={[stats.store.lat, stats.store.lng]}
                icon={pinFor(stats, i + 1)}
                eventHandlers={{ click: () => navigate(`/store/${stats.store.id}`) }}
              >
                <Tooltip direction="top" offset={[0, -18]}>
                  <span className="font-semibold">{stats.store.name}</span> ·{' '}
                  {stats.score.toFixed(1)}
                </Tooltip>
              </Marker>
            ))}
          </MapContainer>
        </div>
      ) : (
        <ol className="min-h-0 flex-1 space-y-2 overflow-y-auto p-5">
          {ranked.map((stats, i) => (
            <li key={stats.store.id}>
              <Link
                to={`/store/${stats.store.id}`}
                className="border-line flex items-center gap-3 rounded-2xl border p-3"
              >
                <span className="text-muted w-5 shrink-0 text-center text-sm font-bold tabular-nums">
                  {i + 1}
                </span>
                <div className="min-w-0 flex-1">
                  <p className="truncate font-semibold">{stats.store.name}</p>
                  <p className="text-muted truncate text-xs">
                    {stats.store.neighborhood} · {stats.count} logged
                    {stats.topItem ? ` · top: ${stats.topItem.name}` : ''}
                  </p>
                </div>
                <ScoreBadge score={stats.score} />
              </Link>
            </li>
          ))}
        </ol>
      )}
    </div>
  )
}
