import { useEffect, useState } from 'react'
import { Droplets, Flame } from 'lucide-react'
import PlantSvg from './PlantSvg.jsx'
import { stageForDays } from '../utils/plant.js'

export default function WateringOverlay({ days, onDone }) {
  const before = stageForDays(Math.max(days - 1, 0))
  const after = stageForDays(days)
  const [grown, setGrown] = useState(false)
  useEffect(() => {
    const a = setTimeout(() => setGrown(true), 2300)
    const b = setTimeout(onDone, 4600)
    return () => { clearTimeout(a); clearTimeout(b) }
  }, [onDone])
  return (
    <div className="px-water" onClick={onDone} role="status" aria-live="polite">
      <div className="px-water-card">
        <div className="px-water-stage">
          <svg className="px-can" viewBox="0 0 150 110" width="150" height="110" aria-hidden="true">
            <defs>
              <linearGradient id="wc1" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stopColor="#8cc2e6" /><stop offset="1" stopColor="#4f86ad" /></linearGradient>
            </defs>
            <path d="M26 46C6 46 4 82 26 84" stroke="#4f86ad" strokeWidth="7" strokeLinecap="round" fill="none" />
            <path d="M84 68L122 36l5 7-36 34z" fill="#4f86ad" />
            <rect x="116" y="26" width="22" height="9" rx="4.5" transform="rotate(40 127 30)" fill="#3d6f95" />
            <path d="M24 40h64l-4 56a8 8 0 0 1-8 7H36a8 8 0 0 1-8-7z" fill="url(#wc1)" />
            <ellipse cx="56" cy="40" rx="32" ry="6" fill="#6aa3c7" /><ellipse cx="56" cy="39" rx="26" ry="3.6" fill="#2f5d7e" />
            <path d="M34 52v36" stroke="#fff" strokeWidth="4" strokeLinecap="round" opacity=".28" />
          </svg>
          {[0, 1, 2, 3, 4, 5, 6].map((i) => <i key={i} className="px-drop" style={{ '--d': `${0.9 + i * 0.22}s`, '--x': `${(i % 3) * 7 - 7}px` }} />)}
          <div className="px-water-plant"><PlantSvg stage={grown ? after : before} size={130} /></div>
        </div>
        <h2><Droplets size={22} /> Your plant has been watered</h2>
        <p className="px-water-streak"><Flame size={16} /> {days} day streak</p>
        <small>Open Choivia every day to keep it growing</small>
      </div>
    </div>
  )
}
