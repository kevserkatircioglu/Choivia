import { useId } from 'react'

export default function Logo({ size = 36, className = '' }) {
  const id = useId().replace(/:/g, '')
  return (
    <svg className={className} width={size} height={size} viewBox="0 0 64 64" role="img" aria-label="Choivia">
      <defs>
        <linearGradient id={`a${id}`} x1="0" y1="0" x2="1" y2="1"><stop offset="0" stopColor="#c5e59a" /><stop offset="1" stopColor="#2f8250" /></linearGradient>
        <linearGradient id={`b${id}`} x1="0" y1="0" x2="1" y2="1"><stop offset="0" stopColor="#e2f4b8" /><stop offset="1" stopColor="#6bb85f" /></linearGradient>
      </defs>
      <path d="M49 19.5A21.5 21.5 0 1 0 49 44.5" fill="none" stroke={`url(#a${id})`} strokeWidth="9.5" strokeLinecap="round" />
      <path d="M31 41C31 28 41 20.5 57 20C57 35 48 44 31 41Z" fill={`url(#b${id})`} />
      <path d="M34 39C41 34 48 28.5 54 23.5" fill="none" stroke="#fff" strokeOpacity=".65" strokeWidth="1.8" strokeLinecap="round" />
    </svg>
  )
}
