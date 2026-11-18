import { useEffect, useRef, useState } from 'react'
import { useLocation } from 'react-router-dom'

// Module-level flag prevents the intro from replaying
// when App switches between login, setup and dashboard.
let initialIntroShown = false

export default function SaplingTransition() {
  const { pathname } = useLocation()
  const previousPath = useRef(pathname)

  const [run, setRun] = useState(
    () => initialIntroShown ? 0 : 1,
  )

  useEffect(() => {
    if (run > 0) initialIntroShown = true
  }, [run])

  useEffect(() => {
    if (previousPath.current === pathname) return

    previousPath.current = pathname

    const timer = window.setTimeout(() => {
      setRun((value) => value + 1)
    }, 0)

    return () => window.clearTimeout(timer)
  }, [pathname])

  if (!run) return null

  return (
    <div className="cv-sapling" key={run} aria-hidden="true">
      <div className="cv-sapling-mark">
        <svg viewBox="0 0 120 150" width="145" height="181">
          <ellipse className="cv-s-soil" cx="60" cy="136" rx="34" ry="8" />
          <path className="cv-s-stem" d="M60 134 C58 108 62 88 60 64" />
          <path className="cv-s-leaf cv-s-l1" d="M60 100 C40 98 28 84 30 68 C48 68 60 80 60 100Z" />
          <path className="cv-s-leaf cv-s-l2" d="M60 84 C64 62 80 50 98 54 C96 74 82 86 60 84Z" />
          <path className="cv-s-leaf cv-s-l3" d="M60 66 C46 56 46 38 60 26 C74 38 74 56 60 66Z" />
        </svg>

        <span className="cv-sapling-sparkle sparkle-one">✦</span>
        <span className="cv-sapling-sparkle sparkle-two">✧</span>
        <span className="cv-sapling-sparkle sparkle-three">✦</span>
      </div>

      <div className="cv-sapling-copy">
        <strong className="cv-sapling-brand">choivia</strong>
        <p>Grow at your own pace.</p>
      </div>
    </div>
  )
}
