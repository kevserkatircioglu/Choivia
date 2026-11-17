import { useState } from 'react'
import { Check, Plus } from 'lucide-react'
import Icon from '../components/Icon.jsx'
import PlantIllustration from '../components/PlantIllustration.jsx'
import '../components/PlantIllustration.css'
import { useStored } from '../lib/useStored.js'
import { dayKey } from '../utils/streak.js'

const HOURS = Array.from({ length: 13 }, (_, i) => i + 8)
const iconFor = (h) => (h < 11 ? 'sunrise' : h < 17 ? 'sun' : h < 20 ? 'sunset' : 'moon')
const fmt = (h) => `${String(h).padStart(2, '0')}:00`

export default function Planner({ user }) {
  const today = dayKey()
  const now = new Date()
  const currentHour = now.getHours()
  const [plan, setPlan] = useStored(`choivia:plan:${user.id}:${today}`, {})
  const [draft, setDraft] = useState({})
  const [openHour, setOpenHour] = useState(null)
  const [showAllHours, setShowAllHours] = useState(false)

  const targetHour = Math.max(HOURS[0], Math.min(HOURS[HOURS.length - 1], currentHour))
  const nearbyEmptyHours = HOURS
    .filter((hour) => !plan[hour])
    .sort((a, b) => Math.abs(a - targetHour) - Math.abs(b - targetHour))
    .slice(0, 3)

  const defaultVisibleHours = HOURS.filter(
    (hour) => Boolean(plan[hour]) || nearbyEmptyHours.includes(hour),
  )
  const hiddenHourCount = HOURS.length - defaultVisibleHours.length
  const visibleHours = showAllHours ? HOURS : defaultVisibleHours

  const done = HOURS.filter((h) => plan[h]?.done).length
  const stage = done === 0 ? 0 : done < 3 ? 1 : done < 6 ? 2 : done < 10 ? 3 : 4

  const add = (h) => {
    const text = (draft[h] || '').trim()
    if (!text) return

    setPlan({ ...plan, [h]: { text, done: false } })
    setDraft({ ...draft, [h]: '' })
    setOpenHour(null)
  }
  const toggle = (h) => setPlan({ ...plan, [h]: { ...plan[h], done: !plan[h].done } })
  const clear = (h) => { const n = { ...plan }; delete n[h]; setPlan(n) }

  return (
    <div className="cv-plan">
      <header className="cv-plan-head">
        <div><p className="eyebrow">TODAY · 08:00 – 20:00</p><h1>Your daily plan</h1><p>Plan your day, one task at a time.</p></div>
        <div className="cv-plan-plant" aria-label={`${done} of ${HOURS.length} done`}><PlantIllustration stage={stage} size={58} /><b>{done}/{HOURS.length}</b></div>
      </header>
      {hiddenHourCount > 0 && (
        <div className="cv-timeline-controls">
          <span>
            {showAllHours
              ? `All ${HOURS.length} hours shown`
              : `Showing ${visibleHours.length} of ${HOURS.length} hours`}
          </span>
          <button
            type="button"
            aria-expanded={showAllHours}
            aria-controls="cv-timeline-list"
            onClick={() => setShowAllHours((value) => !value)}
          >
            {showAllHours ? 'Show fewer hours' : `Show all ${HOURS.length} hours`}
          </button>
        </div>
      )}

      <ol className="cv-timeline" id="cv-timeline-list">
        {visibleHours.map((h) => {
          const item = plan[h]
          const rowState = [
            item?.done ? 'done' : '',
            h < currentHour ? 'past' : '',
            h === currentHour ? 'current' : '',
          ].filter(Boolean).join(' ')

          return (
            <li
              key={h}
              className={rowState}
              aria-current={h === currentHour ? 'time' : undefined}
            >
              <span className="cv-time">
                <i><Icon name={iconFor(h)} size={19} /></i>
                <span className="cv-time-label">{fmt(h)}</span>
                {h === currentHour && <small className="cv-now-label">Now</small>}
              </span>

              {item ? (
                <div className="cv-slot">
                  <button
                    type="button"
                    className="cv-tick"
                    onClick={() => toggle(h)}
                    aria-label={item.done ? 'Mark not done' : 'Mark done'}
                  >
                    {item.done && <Check size={16} />}
                  </button>
                  <span>{item.text}</span>
                  {item.done && <em aria-hidden="true"><Icon name="sparkles" size={16} /></em>}
                  <button type="button" className="cv-del" onClick={() => clear(h)} aria-label="Remove">×</button>
                </div>
              ) : openHour === h ? (
                <form
                  className="cv-slot cv-empty"
                  onSubmit={(e) => { e.preventDefault(); add(h) }}
                >
                  <input
                    autoFocus
                    value={draft[h] || ''}
                    onChange={(e) => setDraft({ ...draft, [h]: e.target.value })}
                    placeholder="Add a task…"
                    aria-label={`Plan for ${fmt(h)}`}
                  />
                  <button type="submit" aria-label="Add"><Plus size={18} /></button>
                  <button
                    type="button"
                    className="cv-cancel"
                    onClick={() => setOpenHour(null)}
                    aria-label="Cancel"
                  >
                    Cancel
                  </button>
                </form>
              ) : (
                <button
                  type="button"
                  className="cv-slot cv-empty cv-empty-trigger"
                  onClick={() => setOpenHour(h)}
                  aria-label={`Add a task at ${fmt(h)}`}
                >
                  <Plus size={16} />
                  <span>Add a task</span>
                </button>
              )}
            </li>
          )
        })}
      </ol>
    </div>
  )
}
