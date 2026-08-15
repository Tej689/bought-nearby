/** Colour follows the sentiment band the score fell into. */
function toneFor(score: number): { bg: string; fg: string } {
  if (score >= 7) return { bg: '#e8f6ed', fg: '#16803c' }
  if (score >= 4) return { bg: '#fdf4e3', fg: '#a16207' }
  return { bg: '#fdeaea', fg: '#c02626' }
}

interface Props {
  score: number
  size?: 'sm' | 'md' | 'lg'
}

export function ScoreBadge({ score, size = 'md' }: Props) {
  const { bg, fg } = toneFor(score)
  const cls = {
    sm: 'text-xs px-1.5 py-0.5 min-w-[2.1rem]',
    md: 'text-sm px-2 py-1 min-w-[2.6rem]',
    lg: 'text-lg px-3 py-1.5 min-w-[3.4rem]',
  }[size]

  return (
    <span
      style={{ background: bg, color: fg }}
      className={`inline-block rounded-lg text-center font-bold tabular-nums ${cls}`}
    >
      {score.toFixed(1)}
    </span>
  )
}
