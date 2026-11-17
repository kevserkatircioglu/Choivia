import { useState } from 'react'
import { ChevronLeft, ChevronRight, Plus, X } from 'lucide-react'
import Icon from '../components/Icon.jsx'
import { useStored } from '../lib/useStored.js'
import { dayKey } from '../utils/streak.js'

const MONTHS = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December']
const DOW = ['M', 'T', 'W', 'T', 'F', 'S', 'S']
const EMOJIS = ['⭐', '🎂', '📚', '🎯', '🎉', '💼', '🩺', '✈️']
const EVENT_ICON_LABELS = {
  '⭐': 'General',
  '🎂': 'Birthday',
  '📚': 'Study',
  '🎯': 'Goal',
  '🎉': 'Celebration',
  '💼': 'Work',
  '🩺': 'Health',
  '✈️': 'Travel',
}
const pad = (n) => String(n).padStart(2, '0')
const keyOf = (y, m, d) => `${y}-${pad(m + 1)}-${pad(d)}`
const cellsOf = (y, m) => [...Array((new Date(y, m, 1).getDay() + 6) % 7).fill(null), ...Array.from({ length: new Date(y, m + 1, 0).getDate() }, (_, i) => i + 1)]

export default function Calendar({ user }) {
  const now = new Date()
  const [events, setEvents] = useStored(`choivia:events:${user.id}`, [])
  const [year, setYear] = useState(now.getFullYear())
  const [month, setMonth] = useState(null) // null = year view
  const [sel, setSel] = useState(null)
  const [title, setTitle] = useState('')
  const [emoji, setEmoji] = useState('⭐')
  const today = dayKey()
  const byDate = events.reduce((acc, e) => ({ ...acc, [e.date]: [...(acc[e.date] || []), e] }), {})

  const grid = (m, big) => (
    <div className={`cv-mgrid${big ? ' big' : ''}`}>
      {DOW.map((d, i) => <i key={i} className="cv-dow">{d}</i>)}
      {cellsOf(year, m).map((d, i) => {
        if (!d) return <span key={i} />
        const k = keyOf(year, m, d); const list = byDate[k]
        return (
          <button
            key={i}
            type="button"
            className={`cv-cell${k === today ? ' today' : ''}${list ? ' has' : ''}${k === sel ? ' sel' : ''}`}
            onClick={() => setSel(k)}
            aria-label={`${d} ${MONTHS[m]} ${year}${k === today ? ', today' : ''}${list ? `, ${list.length} events` : ''}`}
          >
            {d}
            {list && (
              <small className="cv-event-markers" aria-hidden="true">
                {Array.from({ length: Math.min(list.length, 3) }, (_, marker) => (
                  <i key={marker} />
                ))}
              </small>
            )}
          </button>
        )
      })}
    </div>
  )

  const add = (e) => {
    e.preventDefault(); const t = title.trim(); if (!t || !sel) return
    setEvents([...events, { id: Date.now(), date: sel, title: t, emoji }]); setTitle('')
  }
  const move = (n) => { const m = month + n; if (m < 0) { setYear(year - 1); setMonth(11) } else if (m > 11) { setYear(year + 1); setMonth(0) } else setMonth(m) }

  return (
    <div className="cv-cal">
      <header className="cv-cal-head">
        <div><p className="eyebrow">YOUR YEAR</p><h1>Calendar</h1><p>Your events and plans.</p></div>
        <div className="cv-cal-tools">
          <div className="cv-view-toggle" role="group" aria-label="Calendar view">
            <button
              type="button"
              aria-pressed={month === null}
              onClick={() => setMonth(null)}
            >
              Year
            </button>
            <button
              type="button"
              aria-pressed={month !== null}
              onClick={() => setMonth(month ?? now.getMonth())}
            >
              Month
            </button>
          </div>
          <div className="cv-cal-nav">
            {month === null ? (
              <>
                <button type="button" onClick={() => setYear(year - 1)} aria-label="Previous year"><ChevronLeft size={20} /></button>
                <b>{year}</b>
                <button type="button" onClick={() => setYear(year + 1)} aria-label="Next year"><ChevronRight size={20} /></button>
              </>
            ) : (
              <>
                <button type="button" onClick={() => move(-1)} aria-label="Previous month"><ChevronLeft size={20} /></button>
                <b>{MONTHS[month].slice(0, 3)} {year}</b>
                <button type="button" onClick={() => move(1)} aria-label="Next month"><ChevronRight size={20} /></button>
              </>
            )}
          </div>
        </div>
      </header>

      {month === null ? (
        <div className="cv-year">
          {MONTHS.map((name, m) => (
            <section key={name} className={`cv-mini${year === now.getFullYear() && m === now.getMonth() ? ' now' : ''}`}>
              <button type="button" className="cv-mini-title" onClick={() => setMonth(m)}>{name} <ChevronRight size={14} /></button>
              {grid(m, false)}
            </section>
          ))}
        </div>
      ) : (
        <section className="cv-month">
          <h2>{MONTHS[month]}</h2>
          {grid(month, true)}
        </section>
      )}

      {sel && (
        <div className="cv-sheet-back" onClick={() => setSel(null)}>
          <div className="cv-sheet" role="dialog" aria-label="Day details" onClick={(e) => e.stopPropagation()}>
            <button type="button" className="cv-sheet-x" onClick={() => setSel(null)} aria-label="Close"><X size={20} /></button>
            <h2>{new Date(`${sel}T00:00`).toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })}</h2>
            <ul className="cv-ev-list">
              {(byDate[sel] || []).map((ev) => (
                <li key={ev.id}><span className="cv-event-icon"><Icon name={ev.emoji || '⭐'} size={18} /></span><b>{ev.title}</b><button type="button" onClick={() => setEvents(events.filter((x) => x.id !== ev.id))} aria-label="Remove event">×</button></li>
              ))}
              {!byDate[sel] && <li className="cv-ev-empty">Nothing planned for this day.</li>}
            </ul>
            <form onSubmit={add} className="cv-ev-form">
              <div className="cv-emoji-row" role="radiogroup" aria-label="Pick an icon">{EMOJIS.map((x) => <button key={x} type="button" role="radio" aria-label={EVENT_ICON_LABELS[x]} aria-checked={emoji === x} className={emoji === x ? 'on' : ''} onClick={() => setEmoji(x)}><Icon name={x} size={18} /></button>)}</div>
              <div className="cv-ev-row"><input value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Add an event…" maxLength={60} aria-label="Event title" /><button type="submit" aria-label="Add event"><Plus size={20} /></button></div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
