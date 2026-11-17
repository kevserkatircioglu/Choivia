import { useEffect, useState } from 'react'
import { Check, ChevronLeft, ChevronRight, Moon, Plus, Sun, Sunrise, Sunset, X } from 'lucide-react'
import { useStored } from '../lib/useStored.js'
import { dayKey } from '../utils/streak.js'
import PlantSvg from '../components/PlantSvg.jsx'
import { stageForPercent } from '../utils/plant.js'

const HOURS = Array.from({ length: 16 }, (_, i) => i + 7) // 07:00 – 22:00
const fmt = (h) => `${String(h).padStart(2, '0')}:00`
const periodIcon = (h) => (h < 11 ? Sunrise : h < 17 ? Sun : h < 20 ? Sunset : Moon)
const part = (h) => (h < 11 ? 'morning' : h < 17 ? 'day' : h < 20 ? 'evening' : 'night')
const WEEKDAYS = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun']
const startOfDay = (d) => new Date(d.getFullYear(), d.getMonth(), d.getDate())
const addDays = (d, n) => { const x = new Date(d); x.setDate(x.getDate() + n); return x }
const mondayOf = (d) => addDays(startOfDay(d), -((d.getDay() + 6) % 7))
function readPlan(uid, key) {
  try { return JSON.parse(localStorage.getItem(`choivia:plan:${uid}:${key}`)) || {} } catch { return {} }
}

function Ring({ pct }) {
  const C = 2 * Math.PI * 34
  return (
    <svg className="px-ring" viewBox="0 0 80 80" aria-hidden="true">
      <defs><linearGradient id="pxg" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stopColor="#8fcf7a" /><stop offset="1" stopColor="#2f7a55" /></linearGradient></defs>
      <circle cx="40" cy="40" r="34" className="bg" />
      <circle cx="40" cy="40" r="34" className="fg" stroke="url(#pxg)" strokeDasharray={`${(pct / 100) * C} ${C}`} transform="rotate(-90 40 40)" />
      <text x="40" y="45" textAnchor="middle">{pct}%</text>
    </svg>
  )
}

function DayPlan({ user, date, onChange }) {
  const key = dayKey(date)
  const isToday = key === dayKey()
  const [plan, setPlan] = useStored(`choivia:plan:${user.id}:${key}`, {})
  const [now, setNow] = useState(() => new Date())
  const [adding, setAdding] = useState(null)
  const [text, setText] = useState('')

  useEffect(() => {
    if (!isToday) return undefined
    const t = setInterval(() => setNow(new Date()), 60000)
    return () => clearInterval(t)
  }, [isToday])
  useEffect(() => { onChange?.() }, [plan]) // eslint-disable-line react-hooks/exhaustive-deps

  const planned = HOURS.filter((h) => plan[h])
  const done = planned.filter((h) => plan[h].done).length
  const pct = planned.length ? Math.round((done / planned.length) * 100) : 0
  const nowH = now.getHours()
  const next = isToday ? planned.find((h) => !plan[h].done && h >= nowH) : undefined

  const commit = (h) => {
    const t = text.trim()
    if (t) setPlan({ ...plan, [h]: { text: t, done: false } })
    setAdding(null); setText('')
  }
  const toggle = (h) => setPlan({ ...plan, [h]: { ...plan[h], done: !plan[h].done } })
  const remove = (h) => { const n = { ...plan }; delete n[h]; setPlan(n) }

  const summary = !planned.length ? 'Nothing planned yet. Tap a time slot to add something.'
    : done === planned.length ? 'Everything is done. Nicely finished.'
      : next !== undefined ? `Up next at ${fmt(next)} · ${plan[next].text}` : `${planned.length - done} left on the list.`

  return (
    <>
      <section className="px-pl-hero">
        <div className="px-pl-hero-text">
          <p className="px-eyebrow">{isToday ? 'TODAY' : 'PLAN'}</p>
          <h1>{date.toLocaleDateString('en-GB', { weekday: 'long' })}</h1>
          <p className="px-pl-date">{date.toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' })}</p>
          <p className="px-pl-summary">{summary}</p>
        </div>
        <div className="px-pl-hero-side"><PlantSvg stage={stageForPercent(pct)} size={84} /><Ring pct={pct} /></div>
      </section>

      <ol className="px-pl-list">
        {HOURS.map((h) => {
          const item = plan[h]
          const Icon = periodIcon(h)
          const isNow = isToday && h === nowH
          const past = isToday && h < nowH
          return (
            <li key={h} data-part={part(h)} className={`px-pl-row${item?.done ? ' is-done' : ''}${isNow ? ' is-now' : ''}${past && !item ? ' is-past' : ''}${next === h ? ' is-next' : ''}`}>
              <div className="px-pl-time"><b>{fmt(h)}</b><span><Icon size={13} aria-hidden="true" />{isNow ? 'Now' : ''}</span></div>
              <div className="px-pl-rail" aria-hidden="true"><i /></div>
              {item ? (
                <div className="px-pl-card">
                  <button type="button" className="px-pl-check" onClick={() => toggle(h)} aria-label={item.done ? 'Mark as not done' : 'Mark as done'} aria-pressed={!!item.done}>{item.done && <Check size={15} strokeWidth={3} />}</button>
                  <span className="px-pl-text">{item.text}{next === h && <small>Up next</small>}</span>
                  <button type="button" className="px-pl-del" onClick={() => remove(h)} aria-label={`Remove plan at ${fmt(h)}`}><X size={17} /></button>
                </div>
              ) : adding === h ? (
                <form className="px-pl-card px-pl-form" onSubmit={(e) => { e.preventDefault(); commit(h) }}>
                  <input autoFocus value={text} onChange={(e) => setText(e.target.value)} maxLength={80} placeholder="What’s the plan?" aria-label={`Plan for ${fmt(h)}`}
                    onKeyDown={(e) => { if (e.key === 'Escape') { setAdding(null); setText('') } }} onBlur={() => { if (!text.trim()) setAdding(null) }} />
                  <button type="submit" aria-label="Save plan"><Check size={18} /></button>
                </form>
              ) : (
                <button type="button" className="px-pl-add" onClick={() => { setAdding(h); setText('') }}><Plus size={15} /> Add plan</button>
              )}
            </li>
          )
        })}
      </ol>
    </>
  )
}

export default function Planner({ user }) {
  const [selected, setSelected] = useState(() => startOfDay(new Date()))
  const [, setTick] = useState(0)
  const monday = mondayOf(selected)
  const todayKey = dayKey()

  return (
    <div className="px-page px-pl-page">
      <nav className="px-pl-week" aria-label="Choose a day">
        <button type="button" className="px-pl-arrow" onClick={() => setSelected(addDays(selected, -7))} aria-label="Previous week"><ChevronLeft size={20} /></button>
        <div className="px-pl-days">
          {WEEKDAYS.map((label, i) => {
            const d = addDays(monday, i)
            const k = dayKey(d)
            const items = Object.values(readPlan(user.id, k))
            const state = !items.length ? 'none' : items.every((x) => x.done) ? 'all' : 'some'
            return (
              <button key={k} type="button" className={`px-pl-day${k === dayKey(selected) ? ' on' : ''}${k === todayKey ? ' today' : ''}`} onClick={() => setSelected(d)} aria-pressed={k === dayKey(selected)} aria-label={d.toDateString()}>
                <small>{label}</small><b>{d.getDate()}</b><i data-state={state} />
              </button>
            )
          })}
        </div>
        <button type="button" className="px-pl-arrow" onClick={() => setSelected(addDays(selected, 7))} aria-label="Next week"><ChevronRight size={20} /></button>
      </nav>
      <DayPlan key={dayKey(selected)} user={user} date={selected} onChange={() => setTick((n) => n + 1)} />
    </div>
  )
}
