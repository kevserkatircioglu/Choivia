import { useId } from 'react'

// Potted plant that grows with `stage` (0 = seedling … 4 = in bloom). Pure SVG, no emoji.
const LEAF = 'M0 0C-13-5-19-22 0-36C19-22 13-5 0 0Z'
const TOP = [92, 80, 68, 54, 46]
const LEAVES = [
  { y: 90, r: -58, s: 0.62, min: 1 }, { y: 90, r: 58, s: 0.62, min: 1 },
  { y: 78, r: -44, s: 0.82, min: 2 }, { y: 74, r: 46, s: 0.82, min: 2 },
  { y: 64, r: -38, s: 1, min: 3 }, { y: 60, r: 40, s: 1, min: 3 },
]

export default function PlantSvg({ stage = 0, size = 140, className = '' }) {
  const id = useId().replace(/:/g, '')
  const top = TOP[stage]
  return (
    <svg className={`px-plant ${className}`} viewBox="0 0 120 140" width={size} height={size * 1.167} role="img" aria-label={`Plant, growth stage ${stage + 1} of 5`}>
      <defs>
        <linearGradient id={`${id}p`} x1="0" x2="1"><stop offset="0" stopColor="#d98a5f" /><stop offset=".55" stopColor="#c56f46" /><stop offset="1" stopColor="#a95a37" /></linearGradient>
        <linearGradient id={`${id}l`} x1="0" y1="0" x2="1" y2="1"><stop offset="0" stopColor="#8fcf7a" /><stop offset="1" stopColor="#3f9a5c" /></linearGradient>
        <radialGradient id={`${id}f`}><stop offset="0" stopColor="#fff4c2" /><stop offset="1" stopColor="#ffd45e" /></radialGradient>
      </defs>
      <ellipse cx="60" cy="134" rx="34" ry="4" fill="#26362f" opacity=".1" />
      <path d="M32 100h56l-6 30a6 6 0 0 1-6 5H44a6 6 0 0 1-6-5z" fill={`url(#${id}p)`} />
      <rect x="28" y="92" width="64" height="12" rx="5" fill="#d98a5f" /><rect x="28" y="92" width="64" height="4" rx="2" fill="#fff" opacity=".18" />
      <ellipse cx="60" cy="93" rx="29" ry="3.2" fill="#4a3426" />
      {stage > 0 && <path d={`M60 93C60 ${(93 + top) / 2} 59 ${top + 6} 60 ${top}`} stroke="#3f8a55" strokeWidth="3" strokeLinecap="round" fill="none" key={`s${stage}`} className="px-stem" />}
      {stage === 0 && <path d="M60 93c0-4 1-6 3-7" stroke="#6bb26f" strokeWidth="2.4" strokeLinecap="round" fill="none" />}
      {LEAVES.filter((l) => stage >= l.min).map((l, i) => (
        <g key={i} transform={`translate(60 ${l.y}) rotate(${l.r}) scale(${l.s})`}>
          <path d={LEAF} fill={`url(#${id}l)`} className="px-leaf" style={{ animationDelay: `${i * 0.08}s` }} />
          <path d="M0 -2V-26" stroke="#2f7a48" strokeWidth="1" opacity=".35" />
        </g>
      ))}
      {stage >= 1 && stage < 4 && <g transform={`translate(60 ${top}) scale(${0.55 + stage * 0.12})`}><path d={LEAF} fill={`url(#${id}l)`} className="px-leaf" /></g>}
      {stage >= 4 && (
        <g transform={`translate(60 ${top})`} className="px-bloom">
          {[0, 60, 120, 180, 240, 300].map((r) => <ellipse key={r} cx="0" cy="-8" rx="5" ry="8" fill="#ff9db8" transform={`rotate(${r})`} />)}
          <circle r="5.5" fill={`url(#${id}f)`} />
        </g>
      )}
    </svg>
  )
}
