import { CATEGORY_EMOJI, type Category } from '../types'

/**
 * Deterministic gradients stand in for product photos on seeded items.
 * Deliberately not remote images: hackathon wifi fails, and a demo that
 * blanks out because a CDN timed out is a demo you lose.
 */
const GRADIENTS: Record<Category, string> = {
  kitchen: 'linear-gradient(135deg,#ffb066,#ff7a3d)',
  tech: 'linear-gradient(135deg,#8fa4ff,#5b6ee1)',
  clothing: 'linear-gradient(135deg,#ff9ec4,#e8628f)',
  fitness: 'linear-gradient(135deg,#6ee7a8,#2fae72)',
  home: 'linear-gradient(135deg,#c4a5ff,#8b5cf6)',
  beauty: 'linear-gradient(135deg,#7fe3e0,#2fa8a4)',
}

interface Props {
  category: Category
  photo: string | null
  name: string
  size?: number
  className?: string
}

export function ItemTile({ category, photo, name, size = 56, className = '' }: Props) {
  const style = { width: size, height: size }

  if (photo) {
    return (
      <img
        src={photo}
        alt={name}
        style={style}
        className={`shrink-0 rounded-xl object-cover ${className}`}
      />
    )
  }

  return (
    <div
      style={{ ...style, background: GRADIENTS[category] }}
      className={`grid shrink-0 place-items-center rounded-xl ${className}`}
      aria-hidden
    >
      <span style={{ fontSize: size * 0.42 }}>{CATEGORY_EMOJI[category]}</span>
    </div>
  )
}
