import { useEffect, useState } from 'react'
import { ChevronDown, ChevronLeft, ChevronRight, ChevronUp, Clock3, Plus, X, Info, Check, Pencil } from 'lucide-react'
import Icon from '../components/Icon.jsx'
import { useStored } from '../lib/useStored.js'
import { dayKey } from '../utils/streak.js'
import { mainKind, specialsFor } from '../data/specialDays.js'

const SPECIAL_ICON = {
  national: 'star',
  religious: 'sparkles',
  memorial: 'heart',
  special: 'calendar',
  week: 'calendar',
}

const SPECIAL_LABEL = {
  national: 'Public holiday',
  religious: 'Religious holiday',
  memorial: 'Commemorative day',
  special: 'Special day',
  week: 'Special week',
}

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
const CAT_CLASS = { '⭐': 'general', '🎂': 'birthday', '📚': 'study', '🎯': 'goal', '🎉': 'celebration', '💼': 'work', '🩺': 'health', '✈️': 'travel' }
const catOf = (ev) => CAT_CLASS[ev.emoji] || 'general'
const pad = (n) => String(n).padStart(2, '0')
const getRoundedTime = () => {
  const now = new Date()
  now.setHours(now.getHours() + (now.getMinutes() >= 30 ? 1 : 0), 0, 0, 0)
  return `${pad(now.getHours())}:00`
}
const keyOf = (y, m, d) => `${y}-${pad(m + 1)}-${pad(d)}`
const cellsOf = (y, m) => [...Array((new Date(y, m, 1).getDay() + 6) % 7).fill(null), ...Array.from({ length: new Date(y, m + 1, 0).getDate() }, (_, i) => i + 1)]

export default function Calendar({ user }) {
  const now = new Date()
  const [events, setEvents] = useStored(`choivia:events:${user.id}`, [])
  const [year, setYear] = useState(now.getFullYear())
  const [month, setMonth] = useState(null) // null = year view
  const [sel, setSel] = useState(null)
  const [showLegend, setShowLegend] = useState(false)
  const [legendClosing, setLegendClosing] = useState(false)
  const toggleLegend = () => {
    if (legendClosing) return
    if (showLegend) {
      setLegendClosing(true)
      setTimeout(() => {
        setShowLegend(false)
        setLegendClosing(false)
      }, 200)
    } else {
      setShowLegend(true)
    }
  }
  const [sheetPosition, setSheetPosition] = useState(null)
  const [title, setTitle] = useState('')
  const [draftHour, setDraftHour] = useState('')
  const [draftMinute, setDraftMinute] = useState('')
  const [showTime, setShowTime] = useState(false)
  const [timePart, setTimePart] = useState('hour')
  const [emoji, setEmoji] = useState('⭐')
  const [editingId, setEditingId] = useState(null)
  const [draftDate, setDraftDate] = useState('')
  const today = dayKey()
  const byDate = events.reduce((acc, e) => ({ ...acc, [e.date]: [...(acc[e.date] || []), e] }), {})

  const openDayDetails = (key, event) => {
    const rect = event.currentTarget.getBoundingClientRect()
    const margin = 16
    const gap = 12
    const width = Math.min(380, window.innerWidth - margin * 2)
    const maxHeight = Math.min(640, window.innerHeight - margin * 2)

    let left = rect.right + gap
    if (left + width > window.innerWidth - margin) {
      left = rect.left - width - gap
    }
    if (left < margin) {
      left = Math.max(margin, Math.min(rect.left, window.innerWidth - width - margin))
    }

    const top = Math.max(
      margin,
      Math.min(rect.top - 20, window.innerHeight - maxHeight - margin)
    )

    setSheetPosition({ top, left })
    setSel(key)
  }

  useEffect(() => {
    if (!sel) return undefined

    const handleKeyDown = (event) => {
      if (event.key === 'Escape') setSel(null)
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [sel])

  const grid = (m, big) => (
    <div className={`cv-mgrid${big ? ' big' : ''}`}>
      {DOW.map((d, i) => <i key={i} className="cv-dow">{d}</i>)}
      {cellsOf(year, m).map((d, i) => {
        if (!d) return <span key={i} />
        const k = keyOf(year, m, d)
        const list = byDate[k] || []
        const specialDays = specialsFor(year, m, d)
        const specialKind = mainKind(specialDays)

        return (
          <button
            key={i}
            type="button"
            className={`cv-cell${k === today ? ' today' : ''}${list.length ? ` has cat-${catOf(list[0])}` : ''}${specialKind ? ` has-special special-${specialKind}` : ''}${k === sel ? ' sel' : ''}`}
            onClick={(event) => openDayDetails(k, event)}
            aria-label={`${d} ${MONTHS[m]} ${year}${k === today ? ', today' : ''}${list.length ? `, ${list.length} events` : ''}${specialDays.length ? `, ${specialDays.map((item) => item.name).join(', ')}` : ''}`}
          >
            <span className="cv-day-number">{d}</span>

            {specialDays.some((item) => item.name.includes('Atatürk Memorial Day')) ? (
              <span className="cv-day-symbol memorial-symbol" aria-hidden="true">🖤</span>
            ) : specialKind === 'national' ? (
                <span className="cv-day-symbol national-symbol" aria-hidden="true">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    viewBox="0 0 900 600"
                    className="national-flag-icon"
                  >
                    <path
                      d="M0 0h900v600H0z"
                      fill="#E30A17"
                    />
                    <path
                      d="m417.504 300 135.68-44.078-83.86 115.41V228.668l83.86 115.41Zm9.25 80.21c-35.7 56.415-104.387 82.446-168.508 63.86C194.125 425.488 150 366.762 150 300s44.125-125.488 108.246-144.07c64.121-18.586 132.809 7.445 168.508 63.86-33.223-36.97-85.797-49.63-132.203-31.84C248.14 205.737 217.5 250.296 217.5 300s30.64 94.262 77.05 112.05c46.407 17.79 98.981 5.13 132.204-31.84"
                      fill="#FFFFFF"
                    />
                  </svg>
                </span>
            ) : null}

            {(list.length > 0 || specialKind) && (
              <small className="cv-event-markers" aria-hidden="true">
                {[...new Set(list.map(catOf))].slice(0, 3).map((c) => (
                  <i key={c} className={`cv-personal-marker cat-${c}`} />
                ))}
                {specialKind && (
                  <i className={`cv-special-marker special-${specialKind}`} />
                )}
              </small>
            )}
          </button>
        )
      })}
    </div>
  )

  const startEditing = (ev) => {
    setEditingId(ev.id)
    setTitle(ev.title)
    setEmoji(ev.emoji || '⭐')
    setDraftDate(ev.date || sel)

    const [hour = '', minute = ''] = (ev.time || '').split(':')
    setDraftHour(hour)
    setDraftMinute(minute)
    setShowTime(Boolean(ev.time))
    setTimePart('hour')
  }

  const cancelEditing = () => {
    setEditingId(null)
    setTitle('')
    setDraftDate('')
    setDraftHour('')
    setDraftMinute('')
    setShowTime(false)
    setTimePart('hour')
    setEmoji('⭐')
  }

  const adjustTimePart = (part, amount) => {
    const isHour = part === 'hour'
    const rawValue = isHour ? draftHour : draftMinute
    const max = isHour ? 23 : 59
    const current = Math.min(max, Math.max(0, Number(rawValue) || 0))
    const next = (current + amount + max + 1) % (max + 1)
    const formatted = pad(next)

    if (isHour) setDraftHour(formatted)
    else setDraftMinute(formatted)
  }

  const stepTime = (dir) => adjustTimePart(timePart, dir * (timePart === 'minute' ? 5 : 1))

  const handleTimeKey = (e, part) => {
    if (e.key !== 'ArrowUp' && e.key !== 'ArrowDown') return
    e.preventDefault()
    adjustTimePart(part, (e.key === 'ArrowUp' ? 1 : -1) * (part === 'minute' ? 5 : 1))
  }

  const add = (e) => {
    e.preventDefault()
    const t = title.trim()
    const isEditing = editingId !== null
    const eventDate = isEditing ? (draftDate || sel) : sel

    if (!t || !eventDate) return

    const eventTime = showTime && draftHour !== '' && draftMinute !== ''
      ? `${pad(Math.min(23, Math.max(0, Number(draftHour))))}:${pad(Math.min(59, Math.max(0, Number(draftMinute))))}`
      : ''

    if (isEditing) {
      setEvents(events.map((ev) => {
        if (ev.id !== editingId) return ev

        const updated = {
          ...ev,
          date: eventDate,
          title: t,
          emoji,
        }

        if (eventTime) updated.time = eventTime
        else delete updated.time

        return updated
      }))
    } else {
      setEvents([
        ...events,
        { id: Date.now(), date: eventDate, title: t, emoji, ...(eventTime ? { time: eventTime } : {}) },
      ])
    }

    setEditingId(null)
    setTitle('')
    setDraftDate('')
    setDraftHour('')
    setDraftMinute('')
    setShowTime(false)
    setTimePart('hour')

    if (isEditing && eventDate !== sel) {
      setSel(null)
    }
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
          <button
            type="button"
            className={`cv-legend-toggle${showLegend && !legendClosing ? ' on' : ''}`}
            aria-expanded={showLegend && !legendClosing}
            aria-label="Show color legend"
            title="Color legend"
            onClick={toggleLegend}
          >
            <Info size={18} />
          </button>
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

      {showLegend && <ul className={`cv-legend${legendClosing ? ' closing' : ''}`} aria-label="Calendar legend">
        {EMOJIS.map((x) => (
          <li key={x}><i className={`cv-legend-dot cat-${CAT_CLASS[x]}`} />{EVENT_ICON_LABELS[x]}</li>
        ))}
        <li><i className="cv-legend-ring" />Holiday / special day</li>
      </ul>}

      {sel && (
        <div className="cv-sheet-back" onClick={() => setSel(null)}>
          <div className="cv-sheet" style={sheetPosition ? { top: `${sheetPosition.top}px`, left: `${sheetPosition.left}px` } : undefined} role="dialog" aria-modal="true" aria-labelledby="cv-sheet-title" onClick={(e) => e.stopPropagation()}>
            <header className="cv-sheet-header">
              <h2 id="cv-sheet-title">{new Date(`${sel}T00:00`).toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })}</h2>
              <button type="button" className="cv-sheet-x" onClick={() => setSel(null)} aria-label="Close"><X size={20} /></button>
            </header>
            <div className="cv-sheet-content">
            {(() => {
              const selectedDate = new Date(`${sel}T00:00`)
              const selectedSpecials = specialsFor(
                selectedDate.getFullYear(),
                selectedDate.getMonth(),
                selectedDate.getDate(),
              )

              return selectedSpecials.length > 0 ? (
                <section className="cv-special-list" aria-label="Special days">
                  {selectedSpecials.map((item, index) => (
                    <div className={`cv-special-item special-${item.type}`} key={`${item.name}-${index}`}>
                      <span className="cv-special-icon">
                        <Icon name={SPECIAL_ICON[item.type] || 'calendar'} size={18} />
                      </span>
                      <div className="cv-special-copy">
                        <b>{item.name}</b>
                        <span>{SPECIAL_LABEL[item.type] || 'Special day'}</span>
                        {item.isHalfDay && (
                          <small>Half-day · from {item.time || '13:00'}</small>
                        )}
                      </div>
                    </div>
                  ))}
                </section>
              ) : null
            })()}
            <ul className="cv-ev-list">
              {(byDate[sel] || []).map((ev) => (
                <li key={ev.id}>
                  <span className="cv-event-icon"><Icon name={ev.emoji || '⭐'} size={18} /></span>
                  <span className="cv-event-info">
                    <b>{ev.title}</b>
                    {ev.time && <small>{ev.time}</small>}
                  </span>
                  <div className="cv-event-actions">
                    <button
                      type="button"
                      onClick={() => startEditing(ev)}
                      aria-label={`Edit ${ev.title}`}
                      title="Edit event"
                    >
                      <Pencil size={16} />
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setEvents(events.filter((x) => x.id !== ev.id))
                        if (editingId === ev.id) cancelEditing()
                      }}
                      aria-label={`Remove ${ev.title}`}
                      title="Remove event"
                    >
                      ×
                    </button>
                  </div>
                </li>
              ))}
              {!(byDate[sel] || []).length && !specialsFor(
                ...sel.split('-').map((part, index) => index === 1 ? Number(part) - 1 : Number(part))
              ).length && <li className="cv-ev-empty">Nothing planned for this day.</li>}
            </ul>
            <form onSubmit={add} className="cv-ev-form">
              <div className="cv-ev-row">
                <input
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder={editingId !== null ? "Edit event…" : "Add an event…"}
                  maxLength={60}
                  aria-label="Event title"
                />
                <button
                  type="submit"
                  aria-label={editingId !== null ? "Save changes" : "Add event"}
                  disabled={!title.trim()}

                  onClick={(e) => {
                    e.currentTarget.animate(
                      [
                        { transform: 'scale(1)' },
                        { transform: 'scale(.90)', offset: 0.35 },
                        { transform: 'scale(1.08)', offset: 0.72 },
                        { transform: 'scale(1)' },
                      ],
                      { duration: 360, easing: 'cubic-bezier(.2,.8,.2,1)' }
                    )
                  }}>
                  {editingId !== null ? <Check size={20} /> : <Plus size={20} />}
                </button>
              </div>

              {editingId !== null && (
                <div className="cv-ev-edit-meta">
                  <label>
                    <span>Event date</span>
                    <input
                      type="date"
                      value={draftDate}
                      onChange={(e) => setDraftDate(e.target.value)}
                      required
                    />
                  </label>
                  <button type="button" onClick={cancelEditing}>Cancel</button>
                </div>
              )}

              <div className="cv-ev-category">
                <div className="cv-ev-category-heading">
                  <span>Category</span>
                  <strong>{EVENT_ICON_LABELS[emoji]}</strong>
                </div>
                <div className="cv-emoji-row" role="radiogroup" aria-label="Pick a category">
                  {EMOJIS.map((x) => (
                    <button
                      key={x}
                      type="button"
                      role="radio"
                      aria-label={EVENT_ICON_LABELS[x]}
                      title={EVENT_ICON_LABELS[x]}
                      aria-checked={emoji === x}
                      className={emoji === x ? 'on' : ''}
                      onClick={() => setEmoji(x)}
                    >
                      <Icon name={x} size={18} />
                    </button>
                  ))}
                </div>
              </div>

              <div className="cv-ev-time-section">
                <div className="cv-ev-time-default">
                  <span>{showTime ? 'Specific time' : 'All day'}</span>
                  <button
                    type="button"
                    className="cv-add-time"
                    aria-expanded={showTime}
                    onClick={() => {
                      if (showTime) {
                        setDraftHour('')
                        setDraftMinute('')
                      } else {
                        const [hour, minute] = getRoundedTime().split(':')
                        setDraftHour(hour)
                        setDraftMinute(minute)
                      }
                      setShowTime(!showTime)
                    }}
                  >
                    {showTime ? <X size={15} /> : <Plus size={15} />}
                    {showTime ? 'Remove time' : 'Add time'}
                  </button>
                </div>

                {showTime && (
                  <div className="cv-ev-time">
                    <div className="cv-ev-time-label">
                      <Clock3 size={17} />
                      <span>Time</span>
                    </div>
                    <div className="cv-time-inputs">
                      <div className="cv-time-box">
                        <input
                          type="text"
                          inputMode="numeric"
                          maxLength={2}
                          placeholder="--"
                          value={draftHour}
                          onChange={(e) => setDraftHour(e.target.value.replace(/\D/g, '').slice(0, 2))}
                          onFocus={(e) => { setTimePart('hour'); e.target.select() }}
                          onKeyDown={(e) => handleTimeKey(e, 'hour')}
                          onBlur={() => {
                            if (draftHour !== '') {
                              setDraftHour(pad(Math.min(23, Math.max(0, Number(draftHour) || 0))))
                            }
                          }}
                          aria-label="Event hour"
                        />
                        <span className="cv-time-separator">:</span>
                        <input
                          type="text"
                          inputMode="numeric"
                          maxLength={2}
                          placeholder="--"
                          value={draftMinute}
                          onChange={(e) => setDraftMinute(e.target.value.replace(/\D/g, '').slice(0, 2))}
                          onFocus={(e) => { setTimePart('minute'); e.target.select() }}
                          onKeyDown={(e) => handleTimeKey(e, 'minute')}
                          onBlur={() => {
                            if (draftMinute !== '') {
                              setDraftMinute(pad(Math.min(59, Math.max(0, Number(draftMinute) || 0))))
                            }
                          }}
                          aria-label="Event minute"
                        />
                        <span className="cv-time-stepper">
                          <button type="button" aria-label="Increase time" onMouseDown={(e) => e.preventDefault()} onClick={() => stepTime(1)}><ChevronUp size={14} /></button>
                          <button type="button" aria-label="Decrease time" onMouseDown={(e) => e.preventDefault()} onClick={() => stepTime(-1)}><ChevronDown size={14} /></button>
                        </span>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </form>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
