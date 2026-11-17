import { AVATARS, getAvatar } from '../data/avatars.js'

export function Avatar({ id, size = 48, pose, className = '' }) {
  const a = getAvatar(id)
  const file = (pose && a.poses?.[pose]) || `${a.id}.webp`
  return (
    <img className={`cv-avatar ${className}`} src={`${import.meta.env.BASE_URL}avatars/${file}`}
      width={size} height={size} alt={a.name} draggable="false" />
  )
}

// Avatars sit side by side in a wrapping row (compact = smaller, for the sign-up screen).
export function AvatarPicker({ value, onChange, compact }) {
  return (
    <div className={`px-avatars${compact ? ' compact' : ''}`} role="radiogroup" aria-label="Choose avatar">
      {AVATARS.map((a) => (
        <button key={a.id} type="button" role="radio" aria-checked={value === a.id}
          className={`px-avatar-pick${value === a.id ? ' on' : ''}`} onClick={() => onChange(a.id)} aria-label={a.name}>
          <Avatar id={a.id} size={compact ? 46 : 54} />
        </button>
      ))}
    </div>
  )
}
