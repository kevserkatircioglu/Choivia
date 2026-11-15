import { AVATARS, getAvatar } from '../data/avatars.js'

export function Avatar({ id, size = 48, pose, className = '' }) {
  const a = getAvatar(id)
  const file = (pose && a.poses?.[pose]) || `${a.id}.webp`
  return (
    <img className={`cv-avatar ${className}`} src={`${import.meta.env.BASE_URL}avatars/${file}`}
      width={size} height={size} alt={a.name} draggable="false" />
  )
}

export function AvatarPicker({ value, onChange }) {
  return (
    <div className="cv-avatar-grid" role="radiogroup" aria-label="Choose avatar">
      {AVATARS.map((a) => (
        <button key={a.id} type="button" role="radio" aria-checked={value === a.id}
          className={`cv-avatar-pick${value === a.id ? ' selected' : ''}`} onClick={() => onChange(a.id)} aria-label={a.name}>
          <Avatar id={a.id} size={64} />
        </button>
      ))}
    </div>
  )
}
