import { useEffect, useRef, useState } from 'react'
import { useLocation } from 'react-router-dom'

// A slim progress line sweeps across the top on every page change (the page itself fades in via CSS).
export default function RouteTransition() {
  const { pathname } = useLocation()
  const first = useRef(true)
  const [run, setRun] = useState(0)
  useEffect(() => {
    if (first.current) { first.current = false; return undefined }
    const t = setTimeout(() => setRun((n) => n + 1), 0)
    return () => clearTimeout(t)
  }, [pathname])
  return run ? <div className="px-route-bar" key={run} aria-hidden="true" /> : null
}
