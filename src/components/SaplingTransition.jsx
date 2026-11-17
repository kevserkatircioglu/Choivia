import { useEffect, useRef, useState } from 'react'
import { useLocation } from 'react-router-dom'

// Page-change feedback: a slim progress line and a soft paper veil (no mascot, no animation spam).
// File/component name is kept so App.jsx does not need to change.
export default function SaplingTransition() {
  const { pathname } = useLocation()
  const first = useRef(true)
  const [run, setRun] = useState(0)
  useEffect(() => {
    if (first.current) { first.current = false; return undefined }
    const t = setTimeout(() => setRun((n) => n + 1), 0)
    return () => clearTimeout(t)
  }, [pathname])
  if (!run) return null
  return (
    <div className="ct-wrap" key={run} aria-hidden="true">
      <div className="ct-veil" />
      <div className="ct-bar"><i /></div>
    </div>
  )
}
