import { useState } from 'react'
import { Check, Plus } from 'lucide-react'
import { useStored } from '../lib/useStored.js'
import { dayKey } from '../utils/streak.js'

const HOURS = Array.from({ length: 13 }, (_, i) => i + 8)
const iconFor = (h) => (h < 11 ? '🌅' : h < 17 ? '☀️' : h < 20 ? '🌇' : '🌙')
const fmt = (h) => `${String(h).padStart(2, '0')}:00`

export default function Planner({ user }) {
  const today = dayKey()
  const [plan, setPlan] = useStored(`choivia:plan:${user.id}:${today}`, {})
  const [draft, setDraft] = useState({})
  const done = HOURS.filter((h) => plan[h]?.done).length
  const stage = done === 0 ? '🌱' : done < 5 ? '🌿' : done < 10 ? '🪴' : '🌸'

  const add = (h) => {
    const text = (draft[h] || '').trim(); if (!text) return
    setPlan({ ...plan, [h]: { text, done: false } }); setDraft({ ...draft, [h]: '' })
  }
  const toggle = (h) => setPlan({ ...plan, [h]: { ...plan[h], done: !plan[h].done } })
  const clear = (h) => { const n = { ...plan }; delete n[h]; setPlan(n) }

  return (
    <div className="cv-plan">
      <header className="cv-plan-head">
        <div><p className="eyebrow">TODAY · 08:00 – 20:00</p><h1>Your daily plan</h1><p>Fill the day, tick it off, watch your plant grow.</p></div>
        <div className="cv-plan-plant" aria-label={`${done} of ${HOURS.length} done`}><span>{stage}</span><b>{done}/{HOURS.length}</b></div>
      </header>
      <ol className="cv-timeline">
        {HOURS.map((h) => {
          const item = plan[h]
          return (
            <li key={h} className={item?.done ? 'done' : ''}>
              <span className="cv-time"><i>{iconFor(h)}</i>{fmt(h)}</span>
              {item ? (
                <div className="cv-slot">
                  <button type="button" className="cv-tick" onClick={() => toggle(h)} aria-label={item.done ? 'Mark not done' : 'Mark done'}>{item.done && <Check size={16} />}</button>
                  <span>{item.text}</span>{item.done && <em aria-hidden="true">✨</em>}
                  <button type="button" className="cv-del" onClick={() => clear(h)} aria-label="Remove">×</button>
                </div>
              ) : (
                <form className="cv-slot cv-empty" onSubmit={(e) => { e.preventDefault(); add(h) }}>
                  <input value={draft[h] || ''} onChange={(e) => setDraft({ ...draft, [h]: e.target.value })} placeholder="What’s the plan?" aria-label={`Plan for ${fmt(h)}`} />
                  <button type="submit" aria-label="Add"><Plus size={18} /></button>
                </form>
              )}
            </li>
          )
        })}
      </ol>
    </div>
  )
}
