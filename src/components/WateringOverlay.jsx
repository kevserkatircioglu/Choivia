import { useEffect } from 'react'

export default function WateringOverlay({ days, onDone }) {
  useEffect(() => { const t = setTimeout(onDone, 3600); return () => clearTimeout(t) }, [onDone])
  return (
    <div className="cv-water" onClick={onDone} role="status" aria-live="polite">
      <div className="cv-water-stage">
        <svg className="cv-can" viewBox="0 0 120 90" width="150" height="112" aria-hidden="true">
          <path d="M20 30h50v44a8 8 0 0 1-8 8H28a8 8 0 0 1-8-8z" fill="#7fb4d6" /><path d="M70 40l34-18 4 8-38 24z" fill="#6aa3c7" />
          <path d="M28 30a17 12 0 0 1 34 0" fill="none" stroke="#5b92b6" strokeWidth="5" />
        </svg>
        {[0, 1, 2, 3, 4].map((i) => <i key={i} className="cv-drop" style={{ '--d': `${i * 0.18}s`, '--x': `${i * 9}px` }} />)}
        <div className="cv-water-plant">🌱</div>
      </div>
      <h2>Your plant is watered! 💧</h2>
      <p><b>🔥 {days} day streak</b> — see you tomorrow!</p>
    </div>
  )
}
