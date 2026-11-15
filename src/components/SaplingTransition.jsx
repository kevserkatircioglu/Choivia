import { useEffect, useRef, useState } from 'react'
import { useLocation } from 'react-router-dom'

// Sayfa değişince ortada bir fidan büyür; içerik overlay'in altında değişir.
export default function SaplingTransition() {
  const { pathname } = useLocation()
  const first = useRef(true)
  const [run, setRun] = useState(0)
  useEffect(() => {
    if (first.current) { first.current = false; return }
    const t = setTimeout(() => setRun((n) => n + 1), 0)
    return () => clearTimeout(t)
  }, [pathname])
  if (!run) return null
  return (
    <div className="cv-sapling" key={run} aria-hidden="true">
      <svg viewBox="0 0 120 150" width="150" height="188">
        <ellipse className="cv-s-soil" cx="60" cy="136" rx="34" ry="8" />
        <path className="cv-s-stem" d="M60 134 C58 108 62 88 60 64" />
        <path className="cv-s-leaf cv-s-l1" d="M60 100 C40 98 28 84 30 68 C48 68 60 80 60 100Z" />
        <path className="cv-s-leaf cv-s-l2" d="M60 84 C64 62 80 50 98 54 C96 74 82 86 60 84Z" />
        <path className="cv-s-leaf cv-s-l3" d="M60 66 C46 56 46 38 60 26 C74 38 74 56 60 66Z" />
      </svg>
      <p>Growing…</p>
    </div>
  )
}
