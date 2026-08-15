import { useMemo, useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { ItemTile } from '../components/ItemTile'
import type { DraftItem } from '../lib/actions'
import { toStoredPhoto } from '../lib/photo'
import { useDB } from '../lib/storage'
import {
  CATEGORIES,
  CATEGORY_EMOJI,
  CATEGORY_LABEL,
  SENTIMENTS,
  SENTIMENT_LABEL,
  type Category,
  type Sentiment,
} from '../types'

const SENTIMENT_STYLE: Record<Sentiment, string> = {
  worth_it: 'border-worth text-worth bg-worth/5',
  fine: 'border-fine text-fine bg-fine/5',
  regret: 'border-regret text-regret bg-regret/5',
}

export function Log() {
  const db = useDB()
  const navigate = useNavigate()
  const fileRef = useRef<HTMLInputElement>(null)

  const [photo, setPhoto] = useState<string | null>(null)
  const [name, setName] = useState('')
  const [storeId, setStoreId] = useState('')
  const [price, setPrice] = useState('')
  const [category, setCategory] = useState<Category>('kitchen')
  const [sentiment, setSentiment] = useState<Sentiment | null>(null)
  const [busy, setBusy] = useState(false)

  /** Locals first — the whole point is nudging attention toward them. */
  const stores = useMemo(
    () =>
      [...db.stores].sort(
        (a, b) =>
          Number(b.isLocal) - Number(a.isLocal) || a.name.localeCompare(b.name),
      ),
    [db.stores],
  )

  const valid = name.trim() !== '' && storeId !== '' && sentiment !== null

  async function onPickPhoto(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return
    setBusy(true)
    setPhoto(await toStoredPhoto(file))
    setBusy(false)
  }

  function submit() {
    if (!valid || sentiment === null) return
    const draft: DraftItem = {
      name: name.trim(),
      photo,
      storeId,
      price: Number(price) || 0,
      category,
      sentiment,
    }
    navigate('/compare', { state: { draft } })
  }

  return (
    <div className="flex h-full flex-col">
      <header className="border-line flex items-center justify-between border-b px-5 py-4">
        <button onClick={() => navigate(-1)} className="text-muted text-sm font-medium">
          Cancel
        </button>
        <h1 className="font-semibold">Log a purchase</h1>
        <span className="w-12" />
      </header>

      <div className="min-h-0 flex-1 space-y-5 overflow-y-auto p-5">
        <button
          onClick={() => fileRef.current?.click()}
          className="border-line flex w-full items-center gap-4 rounded-2xl border border-dashed p-4 text-left"
        >
          <ItemTile category={category} photo={photo} name="preview" size={72} />
          <span className="text-muted text-sm">
            {busy ? 'Processing…' : photo ? 'Retake photo' : 'Add a photo'}
          </span>
        </button>
        <input
          ref={fileRef}
          type="file"
          accept="image/*"
          capture="environment"
          onChange={onPickPhoto}
          className="hidden"
        />

        <Field label="What did you buy?">
          <input
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Cast iron skillet"
            aria-label="What did you buy?"
            className="border-line w-full rounded-xl border px-3 py-2.5 outline-none focus:border-ink"
          />
        </Field>

        <Field label="Where from?">
          <select
            value={storeId}
            onChange={(e) => setStoreId(e.target.value)}
            aria-label="Where from?"
            className="border-line w-full rounded-xl border bg-transparent px-3 py-2.5 outline-none focus:border-ink"
          >
            <option value="">Pick a store…</option>
            <optgroup label="Local NYC stores">
              {stores
                .filter((s) => s.isLocal)
                .map((s) => (
                  <option key={s.id} value={s.id}>
                    {s.name} · {s.neighborhood}
                  </option>
                ))}
            </optgroup>
            <optgroup label="Chains">
              {stores
                .filter((s) => !s.isLocal)
                .map((s) => (
                  <option key={s.id} value={s.id}>
                    {s.name} · {s.neighborhood}
                  </option>
                ))}
            </optgroup>
          </select>
        </Field>

        <Field label="Price">
          <div className="border-line focus-within:border-ink flex items-center gap-1 rounded-xl border px-3">
            <span className="text-muted">$</span>
            <input
              value={price}
              onChange={(e) => setPrice(e.target.value.replace(/[^0-9.]/g, ''))}
              inputMode="decimal"
              placeholder="0"
              aria-label="Price"
              className="w-full bg-transparent py-2.5 tabular-nums outline-none"
            />
          </div>
        </Field>

        <Field label="Category">
          <div className="flex flex-wrap gap-2">
            {CATEGORIES.map((c) => (
              <button
                key={c}
                onClick={() => setCategory(c)}
                className={`rounded-full border px-3 py-1.5 text-sm font-medium ${
                  c === category ? 'border-ink bg-ink text-white' : 'border-line text-muted'
                }`}
              >
                {CATEGORY_EMOJI[c]} {CATEGORY_LABEL[c]}
              </button>
            ))}
          </div>
        </Field>

        <Field label="How do you feel about it?">
          <div className="grid grid-cols-3 gap-2">
            {SENTIMENTS.map((s) => (
              <button
                key={s}
                onClick={() => setSentiment(s)}
                className={`rounded-xl border py-3 text-sm font-semibold transition ${
                  s === sentiment ? SENTIMENT_STYLE[s] : 'border-line text-muted'
                }`}
              >
                {SENTIMENT_LABEL[s]}
              </button>
            ))}
          </div>
          <p className="text-muted mt-2 text-xs">
            You'll only compare this against other {' '}
            {sentiment ? SENTIMENT_LABEL[sentiment].toLowerCase() : '…'} buys.
          </p>
        </Field>
      </div>

      <div className="border-line border-t p-5">
        <button
          onClick={submit}
          disabled={!valid}
          className="bg-accent w-full rounded-xl py-3.5 font-semibold text-white disabled:opacity-30"
        >
          Rank it
        </button>
      </div>
    </div>
  )
}

/**
 * Deliberately a div, not a label. `<button>` is a labelable element, so a
 * wrapping <label> hands its own text to every button inside it — which made
 * all six category buttons announce the same accessible name. Inputs carry
 * their own aria-label instead.
 */
function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <span className="mb-1.5 block text-sm font-semibold">{label}</span>
      {children}
    </div>
  )
}
