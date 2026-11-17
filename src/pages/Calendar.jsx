import { useState } from 'react'
import { ChevronLeft, ChevronRight, Infinity as InfinityIcon, Moon, Plus, Star, X } from 'lucide-react'
import { useStored } from '../lib/useStored.js'
import { eventsKey } from '../lib/keys.js'
import { dayKey } from '../utils/streak.js'
import { mainKind, specialsFor } from '../data/specialDays.js'
import Flag from '../components/Flag.jsx'

const MONTHS = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December']
const DOW = ['M', 'T', 'W', 'T', 'F', 'S', 'S']
const EMOJIS = ['⭐', '🎂', '📚', '🎯', '🎉', '💼', '🩺', '✈️']
const pad = (n) => String(n).padStart(2, '0')
const keyOf = (y, m, d) => `${y}-${pad(m + 1)}-${pad(d)}`
const cellsOf = (y, m) => [...Array((new Date(y, m, 1).getDay() + 6) % 7).fill(null), ...Array.from({ length: new Date(y, m + 1, 0).getDate() }, (_, i) => i + 1)]

export function KindIcon({ kind, size = 16 }) {
  if (kind === 'national') return <Flag size={size} />
  if (kind === 'memorial') return <InfinityIcon size={size + 4} strokeWidth={2.4} className="px-k-inf" />
  if (kind === 'religious') return <Moon size={size} className="px-k-moon" />
  if (kind === 'special') return <Star size={size - 2} className="px-k-star" />
  return null
}

export default function Calendar({ user }) {
  const now = new Date()
  const [events, setEvents] = useStored(eventsKey(user.id), [])
  const [year, setYear] = useState(now.getFullYear())
  const [month, setMonth] = useState(now.getMonth()) // null = whole-year view
  const [sel, setSel] = useState(null)
  const [title, setTitle] = useState('')
  const [time, setTime] = useState('')
  const [emoji, setEmoji] = useState('⭐')
  const today = dayKey()
  const byDate = events.reduce((acc, e) => ({ ...acc, [e.date]: [...(acc[e.date] || []), e] }), {})

  const grid = (m, big) => (
    <div className={`px-mgrid${big ? ' big' : ''}`}>
      {DOW.map((d, i) => <i key={i} className="px-dow">{d}</i>)}
      {cellsOf(year, m).map((d, i) => {
        if (!d) return <span key={i} />
        const k = keyOf(year, m, d), list = byDate[k], sp = specialsFor(year, m, d), kind = mainKind(sp)
        return (
          <button key={i} type="button" onClick={() => setSel(k)}
            className={`px-cell${k === today ? ' today' : ''}${k === sel ? ' sel' : ''}${kind ? ` k-${kind}` : ''}${sp.some((s) => s.type === 'week') ? ' wk' : ''}`}
            aria-label={`${d} ${MONTHS[m]}${sp.length ? `, ${sp[0].name}` : ''}${list ? `, ${list.length} reminders` : ''}`}>
            <b>{d}</b>
            {big ? <span className="px-cell-mark">{kind && <KindIcon kind={kind} size={13} />}</span> : (kind || list) && <u className={kind ? `k-${kind}` : ''} />}
            {big && list && <i className="px-dot" />}
          </button>
        )
      })}
    </div>
  )

  const add = (e) => {
    e.preventDefault(); const t = title.trim(); if (!t || !sel) return
    setEvents([...events, { id: Date.now(), date: sel, title: t, emoji, time }]); setTitle(''); setTime('')
  }
  const move = (n) => { const m = month + n; if (m < 0) { setYear(year - 1); setMonth(11) } else if (m > 11) { setYear(year + 1); setMonth(0) } else setMonth(m) }
  const [sy, sm, sd] = sel ? sel.split('-').map(Number) : []
  const selSpecials = sel ? specialsFor(sy, sm - 1, sd) : []
  const monthList = month === null ? [] : Array.from({ length: new Date(year, month + 1, 0).getDate() }, (_, i) => i + 1)
    .flatMap((d) => specialsFor(year, month, d).filter((s) => s.type !== 'week').map((s) => ({ d, ...s })))

  return (
    <div className="px-page px-cal">
      <header className="px-head">
        <div><p className="px-eyebrow">CALENDAR</p><h1>{month === null ? year : `${MONTHS[month]} ${year}`}</h1></div>
        <div className="px-cal-nav">
          {month === null ? (
            <><button type="button" onClick={() => setYear(year - 1)} aria-label="Previous year"><ChevronLeft size={20} /></button><button type="button" className="t" onClick={() => setMonth(now.getMonth())}>Month</button><button type="button" onClick={() => setYear(year + 1)} aria-label="Next year"><ChevronRight size={20} /></button></>
          ) : (
            <><button type="button" onClick={() => move(-1)} aria-label="Previous month"><ChevronLeft size={20} /></button><button type="button" className="t" onClick={() => setMonth(null)}>Year</button><button type="button" onClick={() => move(1)} aria-label="Next month"><ChevronRight size={20} /></button></>
          )}
        </div>
      </header>

      {month === null ? (
        <div className="px-year">
          {MONTHS.map((name, m) => (
            <section key={name} className={`px-mini${year === now.getFullYear() && m === now.getMonth() ? ' now' : ''}`}>
              <button type="button" className="px-mini-title" onClick={() => setMonth(m)}>{name} <ChevronRight size={14} /></button>
              {grid(m, false)}
            </section>
          ))}
        </div>
      ) : (
        <>
          <section className="px-card">{grid(month, true)}
            <ul className="px-legend"><li><Flag size={11} /> National holiday</li><li><InfinityIcon size={15} /> Atatürk memorial</li><li><Moon size={12} /> Religious</li><li><span className="wkbar" /> Special week</li></ul>
          </section>
          {!!monthList.length && (
            <section className="px-card"><h2 className="px-h2">This month</h2>
              <ul className="px-month-list">{monthList.map((s) => <li key={`${s.d}${s.name}`}><span className="d">{s.d}</span><KindIcon kind={s.type} size={15} /><span>{s.name}</span></li>)}</ul>
            </section>
          )}
        </>
      )}

      {sel && (
        <div className="cv-sheet-back" onClick={() => setSel(null)}>
          <div className="cv-sheet px-daysheet" role="dialog" aria-label="Day details" onClick={(e) => e.stopPropagation()}>
            <button type="button" className="cv-sheet-x" onClick={() => setSel(null)} aria-label="Close"><X size={20} /></button>
            <h2>{new Date(`${sel}T00:00`).toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })}</h2>
            {selSpecials.map((s) => <div key={s.name} className={`px-special k-${s.type}`}><KindIcon kind={s.type === 'week' ? null : s.type} size={18} /><span>{s.name}</span>{s.type === 'week' && <em>Week</em>}</div>)}
            <ul className="px-ev-list">
              {(byDate[sel] || []).map((ev) => (
                <li key={ev.id}><span>{ev.emoji}</span><b>{ev.title}<small>{ev.time || 'All day'}</small></b><button type="button" onClick={() => setEvents(events.filter((x) => x.id !== ev.id))} aria-label="Remove reminder">×</button></li>
              ))}
              {!byDate[sel] && !selSpecials.length && <li className="px-ev-empty">Nothing planned for this day.</li>}
            </ul>
            <form onSubmit={add} className="px-ev-form">
              <div className="px-emoji-row" role="radiogroup" aria-label="Pick an icon">{EMOJIS.map((x) => <button key={x} type="button" role="radio" aria-checked={emoji === x} className={emoji === x ? 'on' : ''} onClick={() => setEmoji(x)}>{x}</button>)}</div>
              <div className="px-ev-row"><input value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Add a reminder…" maxLength={60} aria-label="Reminder title" /><input type="time" value={time} onChange={(e) => setTime(e.target.value)} aria-label="Reminder time" /><button type="submit" aria-label="Add reminder"><Plus size={20} /></button></div>
              <p className="px-ev-note">With a time set, you’ll get a notification then. Without one, at 09:00.</p>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
