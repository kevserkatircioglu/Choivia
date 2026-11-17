import { Frown, Laugh, Meh, Smile } from 'lucide-react'
import { MOODS } from './moodConfig.js'

function ToughFace({ size = 22, ...props }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      {...props}
    >
      <circle cx="12" cy="12" r="10" />
      <path d="M8 9.5l2.5 1" />
      <path d="M16 9.5l-2.5 1" />
      <path d="M8.5 16.5c1-1.2 2.1-1.8 3.5-1.8s2.5.6 3.5 1.8" />
    </svg>
  )
}

const MOOD_ICONS = {
  great: Laugh,
  good: Smile,
  okay: Meh,
  low: Frown,
  tough: ToughFace,
}

export function MoodIcon({ mood, size = 22, className = '' }) {
  const item = MOODS.find((entry) => entry.value === mood)
  const Icon = MOOD_ICONS[mood]

  if (!item || !Icon) return null

  return (
    <Icon
      size={size}
      className={`mood-icon mood-${mood} ${className}`.trim()}
      aria-hidden="true"
    />
  )
}
