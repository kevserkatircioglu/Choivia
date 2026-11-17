import { useEffect, useRef, useState } from 'react'
import { Droplet, Flame, Volume2, VolumeX } from 'lucide-react'
import { playChime, playPour, unlockAudio } from '../utils/sfx.js'

const FLOWERS = [
  { x: 150, y: 142, c: '#f7a8c4', d: 5.2, s: 1 },
  { x: 112, y: 184, c: '#c9a8f0', d: 5.7, s: 0.85 },
  { x: 190, y: 174, c: '#ffd36b', d: 6.2, s: 0.9 },
]
const PETALS = [0, 60, 120, 180, 240, 300]
const note = (n) => (n <= 1 ? 'Your journey starts today!' : n < 7 ? 'Keep it growing!' : 'You’re on fire!')

export default function WateringOverlay({ days, onDone }) {
  const [reduced] = useState(() => !!window.matchMedia?.('(prefers-reduced-motion: reduce)').matches)
  const [ready, setReady] = useState(reduced)
  const [sound, setSound] = useState(true)
  const soundRef = useRef(true)
  useEffect(() => { soundRef.current = sound }, [sound])

  useEffect(() => {
    if (reduced) return undefined
    unlockAudio()
    const play = (fn, ms) => setTimeout(() => soundRef.current && fn(), ms)
    const timers = [play(() => playPour(2.8), 1900), play(() => playChime(false), 6400), play(() => playChime(true), 7500), setTimeout(() => setReady(true), 9000)]
    return () => timers.forEach(clearTimeout)
  }, [reduced])

  return (
    <div className={`cv-water${reduced ? ' cv-rm' : ''}`} role="dialog" aria-label="Streak celebration" aria-live="polite">
      <button type="button" className="cv-water-sound" onClick={() => { unlockAudio(); setSound(!sound) }} aria-label={sound ? 'Mute sound' : 'Unmute sound'}>{sound ? <Volume2 size={20} /> : <VolumeX size={20} />}</button>
      <button type="button" className="cv-water-skip" onClick={onDone}>Skip</button>
      <h2 className="cv-water-title">Time to water your plant <Droplet size={20} aria-hidden="true" /></h2>

      <svg className="cv-svg" viewBox="0 0 300 350" aria-hidden="true">
        <defs>
          <linearGradient id="potG" x1="0" x2="1"><stop offset="0" stopColor="#e9a074" /><stop offset=".55" stopColor="#d98a5f" /><stop offset="1" stopColor="#b9693f" /></linearGradient>
          <linearGradient id="leafG" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stopColor="#a9dc86" /><stop offset="1" stopColor="#4f9a57" /></linearGradient>
        </defs>
        <ellipse cx="150" cy="334" rx="62" ry="8" fill="#2f5d4522" />
        <path d="M100 262H200L188 322Q186 331 177 331H123Q114 331 112 322Z" fill="url(#potG)" />
        <rect x="93" y="248" width="114" height="20" rx="8" fill="#e59a6c" />
        <ellipse className="cv-soil" cx="150" cy="251" rx="47" ry="6.5" />

        <g className="cv-plant">
          <path className="cv-stem" pathLength="100" d="M150 252C146 222 156 186 150 146" />
          <path className="cv-stem cv-br" pathLength="100" d="M150 216C140 206 124 198 113 187" />
          <path className="cv-stem cv-br" pathLength="100" d="M150 206C165 196 180 188 189 177" />
          <path className="cv-leaf cv-l1" d="M150 238C128 238 112 224 110 208C130 207 148 219 150 238Z" />
          <path className="cv-leaf cv-l2" d="M150 226C170 224 186 210 188 196C168 196 152 208 150 226Z" />
          <path className="cv-leaf cv-l3" d="M150 192C132 190 120 178 120 164C136 165 148 176 150 192Z" />
          <path className="cv-leaf cv-l4" d="M150 178C168 176 178 166 180 152C164 153 152 164 150 178Z" />
          {FLOWERS.map((f) => (
            <g key={f.d} transform={`translate(${f.x} ${f.y})`}>
              <g className="cv-bloom" style={{ '--d': `${f.d}s` }}>
                {PETALS.map((a) => <ellipse key={a} cx="0" cy="-10" rx="5.5" ry="10" fill={f.c} transform={`rotate(${a}) scale(${f.s})`} />)}
                <circle r="5" fill="#ffb84d" />
              </g>
            </g>
          ))}
        </g>

        <g className="cv-can">
          <g transform="translate(75 150)">
            <path d="M2 22C-18 22 -18 50 2 50" fill="none" stroke="#5b92b6" strokeWidth="6" strokeLinecap="round" />
            <rect x="0" y="10" width="62" height="46" rx="10" fill="#7fb4d6" />
            <rect x="6" y="14" width="10" height="38" rx="5" fill="#fff" opacity=".28" />
            <path d="M60 22L92 -4L98 4L60 40Z" fill="#6aa3c7" />
            <ellipse cx="96" cy="0" rx="4" ry="9" transform="rotate(35 96 0)" fill="#4f86ab" />
          </g>
        </g>
        <path className="cv-stream" pathLength="100" d="M172 158C174 195 168 225 170 250" />
        {[0, 1, 2, 3, 4, 5, 6, 7].map((i) => <circle key={i} className="cv-dropc" cx={166 + (i % 4) * 3} cy="160" r="2.3" style={{ '--i': i }} />)}
        {[0, 1, 2].map((i) => <ellipse key={i} className="cv-splash" cx={160 + i * 9} cy="250" rx="3" ry="1.6" style={{ '--i': i }} />)}
      </svg>

      {Array.from({ length: 12 }, (_, i) => <b key={i} className="cv-spark" style={{ left: `${(i * 29 + 6) % 92}%`, top: `${(i * 41 + 12) % 70}%`, '--i': i }}>✦</b>)}

      <div className="cv-zoom">
        <div className="cv-rays" /><div className="cv-glow" />
        <div className="cv-zoom-num"><Flame className="cv-flame" size={64} aria-hidden="true" /><b>{days}</b></div>
        <h3>day streak!</h3>
        <p>{note(days)}</p>
      </div>

      <button type="button" className={`cv-water-go${ready ? ' show' : ''}`} onClick={onDone} tabIndex={ready ? 0 : -1}>Continue</button>
    </div>
  )
}
