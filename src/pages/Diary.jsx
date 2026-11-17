import { useEffect, useLayoutEffect, useMemo, useRef, useState } from 'react'
import {
  BookHeart,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  Lock,
  LockKeyhole,
} from 'lucide-react'
import PinPad from '../components/PinPad.jsx'
import { hashPassword, readAccounts } from '../lib/auth.js'
import { dayKey } from '../utils/streak.js'
import './diary.css'
import './diary-archive.css'

const diaryKey = (uid) => `choivia:diary:${uid}`
const pinKey = (uid) => `choivia:diarypin:${uid}`

// Change this to 'tr-TR' (and translate the UI strings) for a Turkish interface.
const LOCALE = 'en-GB'

// Notebook locks itself after this much inactivity.
const IDLE_LOCK_MS = 5 * 60 * 1000

// false: past pages are read-only (the diary keeps "that day's voice").
// true: real (non-demo) past pages can be corrected.
const ALLOW_PAST_EDIT = false

function readJSON(key, fallback) {
  try {
    const value = localStorage.getItem(key)
    return value ? JSON.parse(value) : fallback
  } catch {
    return fallback
  }
}

function makePinSalt() {
  if (!window.crypto?.getRandomValues) {
    throw new Error('Secure random values are unavailable.')
  }

  const bytes = window.crypto.getRandomValues(new Uint8Array(16))
  return Array.from(bytes, (byte) => byte.toString(16).padStart(2, '0')).join('')
}

/* ---------- date helpers ---------- */

const parseKey = (key) => new Date(`${key}T12:00:00`)

function formatLongDate(key) {
  return parseKey(key).toLocaleDateString(LOCALE, {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  })
}

function formatShortDate(key) {
  return parseKey(key).toLocaleDateString(LOCALE, { day: 'numeric', month: 'short' })
}

function formatHeading(key) {
  return parseKey(key).toLocaleDateString(LOCALE, {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
  })
}

function formatWeekday(key) {
  return parseKey(key).toLocaleDateString(LOCALE, { weekday: 'short' })
}

function formatMonth(key) {
  return parseKey(key).toLocaleDateString(LOCALE, { month: 'long', year: 'numeric' })
}

function relativeLabel(today, key) {
  const diff = Math.round((parseKey(today) - parseKey(key)) / 86400000)

  if (diff <= 0) return 'Today'
  if (diff === 1) return 'Yesterday'
  if (diff < 7) return `${diff} days ago`
  if (diff < 14) return 'Last week'
  if (diff < 30) return `${Math.floor(diff / 7)} weeks ago`
  if (diff < 60) return 'Last month'
  return `${Math.floor(diff / 30)} months ago`
}

function countWords(text) {
  const trimmed = text.trim()
  return trimmed ? trimmed.split(/\s+/).length : 0
}

function dateKeyDaysAgo(today, daysAgo) {
  const date = parseKey(today)
  date.setDate(date.getDate() - daysAgo)

  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const day = String(date.getDate()).padStart(2, '0')

  return `${year}-${month}-${day}`
}

// Presentation-only entries. These are never written to localStorage.
// Remove before shipping.
const DEMO_PAGES = [
  {
    daysAgo: 1,
    text: "I took a little time to slow down today. A quiet walk and a warm drink reminded me that not every day has to be extraordinary to be meaningful. I want to make more room for these peaceful moments.",
  },
  {
    daysAgo: 3,
    text: "I made progress on something I had been putting off. It was a small step, but finishing it gave me a calm sense of accomplishment. Sometimes getting started is the hardest part.",
  },
  {
    daysAgo: 5,
    text: "Today I made a little room for something I enjoy. Hobbies do not always need to be productive. Sometimes enjoying the process is more than enough.",
  },
  {
    daysAgo: 8,
    text: "A few things did not go as planned, and that is okay. I am learning to be more patient with myself and to take one thing at a time. Tomorrow is another opportunity to try again.",
  },
  {
    daysAgo: 12,
    text: "I noticed how much better I feel when I pause and appreciate simple moments. A good conversation, a favourite song, and a little time to myself made this day special.",
  },
]

const DAILY_PROMPTS = [
  'What made you smile today?',
  'What is one thing you are grateful for?',
  'Which moment would you like to remember?',
  'What did you learn about yourself today?',
  'What would make tomorrow a little better?',
  'When did you feel most like yourself today?',
  'What is something you want to give yourself credit for?',
]

const MOODS = [
  { value: 'great', emoji: '😄', label: 'Great' },
  { value: 'good', emoji: '🙂', label: 'Good' },
  { value: 'okay', emoji: '😐', label: 'Okay' },
  { value: 'low', emoji: '😔', label: 'Low' },
  { value: 'tough', emoji: '😣', label: 'Tough' },
]

const STARTER_PHRASES = [
  { label: 'Gratitude', text: 'Today I’m grateful for…' },
  { label: 'Something I learned', text: 'Today I learned…' },
  { label: 'A moment to remember', text: 'A moment I want to remember is…' },
]

function promptForDay(key) {
  const date = parseKey(key)
  const dayNumber = Math.floor(
    Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()) / 86400000,
  )

  return DAILY_PROMPTS[
    ((dayNumber % DAILY_PROMPTS.length) + DAILY_PROMPTS.length)
      % DAILY_PROMPTS.length
  ]
}

/* ---------- lock flow (unchanged) ---------- */

function LockScreen({ children }) {
  return (
    <div className="diary-lock-screen">
      <section className="diary-lock-card">
        {children}
      </section>
    </div>
  )
}

export default function Diary({ user }) {
  const [pin, setPin] = useState(() => readJSON(pinKey(user.id), null))
  const [unlocked, setUnlocked] = useState(false)
  const [firstPin, setFirstPin] = useState(null)
  const [forgot, setForgot] = useState(false)
  const [password, setPassword] = useState('')
  const [passwordError, setPasswordError] = useState('')
  const [resetBusy, setResetBusy] = useState(false)

  async function savePin(value) {
    try {
      const salt = makePinSalt()
      const record = { salt, hash: await hashPassword(value, salt) }

      localStorage.setItem(pinKey(user.id), JSON.stringify(record))
      setPin(record)
      setFirstPin(null)
      setUnlocked(true)
      return ''
    } catch {
      return 'Could not save your PIN. Please try again.'
    }
  }

  async function handleReset(event) {
    event.preventDefault()
    setPasswordError('')
    setResetBusy(true)

    try {
      const account = readAccounts().find((item) => item.id === user.id)

      if (!account || await hashPassword(password, account.salt) !== account.passwordHash) {
        setPasswordError('That password is not correct.')
        return
      }

      localStorage.removeItem(pinKey(user.id))
      setPin(null)
      setFirstPin(null)
      setForgot(false)
      setPassword('')
    } catch {
      setPasswordError('Unable to verify your password. Please try again.')
    } finally {
      setResetBusy(false)
    }
  }

  if (forgot) {
    return (
      <LockScreen>
        <span className="diary-lock-icon"><LockKeyhole size={27} /></span>
        <form className="diary-reset-form" onSubmit={handleReset}>
          <h1>Reset your diary PIN</h1>
          <p>Your diary entries will remain on this device.</p>

          <label htmlFor="diary-account-password">Account password</label>
          <input
            id="diary-account-password"
            type="password"
            value={password}
            onChange={(event) => {
              setPassword(event.target.value)
              setPasswordError('')
            }}
            placeholder="Enter your password"
            autoComplete="current-password"
            required
          />

          {passwordError && <p className="diary-form-error" role="alert">{passwordError}</p>}

          <button className="diary-primary-button" type="submit" disabled={!password || resetBusy}>
            {resetBusy ? 'Checking…' : 'Continue'}
          </button>

          <button
            className="diary-text-button"
            type="button"
            onClick={() => {
              setForgot(false)
              setPassword('')
              setPasswordError('')
            }}
          >
            Cancel
          </button>
        </form>
      </LockScreen>
    )
  }

  if (!pin) {
    return (
      <LockScreen>
        <span className="diary-lock-icon"><BookHeart size={28} /></span>

        {firstPin === null ? (
          <PinPad
            key="create-pin"
            title="Create a diary PIN"
            hint="Choose a 4-digit PIN for your diary."
            onComplete={(value) => {
              setFirstPin(value)
              return ''
            }}
          />
        ) : (
          <PinPad
            key="confirm-pin"
            title="Confirm your PIN"
            hint="Enter the same 4 digits again."
            onComplete={(value) => {
              if (value !== firstPin) {
                window.setTimeout(() => setFirstPin(null), 500)
                return 'The PINs did not match. Try again.'
              }

              return savePin(value)
            }}
          />
        )}

        <p className="diary-security-note">
          Your PIN is an access lock, not encryption. Entries are stored in this browser.
        </p>
      </LockScreen>
    )
  }

  if (!unlocked) {
    return (
      <LockScreen>
        <span className="diary-lock-icon"><Lock size={26} /></span>

        <PinPad
          title="My diary"
          hint="Enter your 4-digit PIN."
          onComplete={async (value) => {
            try {
              const valid = await hashPassword(value, pin.salt) === pin.hash

              if (valid) {
                setUnlocked(true)
                return ''
              }

              return 'Wrong PIN. Please try again.'
            } catch {
              return 'Could not verify your PIN. Please try again.'
            }
          }}
          footer={
            <button
              type="button"
              className="diary-text-button"
              onClick={() => setForgot(true)}
            >
              Forgot PIN?
            </button>
          }
        />
      </LockScreen>
    )
  }

  return <Notebook user={user} onLock={() => setUnlocked(false)} />
}

/* ---------- mini calendar ---------- */

const WEEKDAY_LETTERS = ['M', 'T', 'W', 'T', 'F', 'S', 'S']

function MiniCalendar({ today, selected, written, onPick }) {
  const monthOf = (key) => {
    const [y, m] = key.split('-').map(Number)
    return { y, m: m - 1 }
  }

  const [view, setView] = useState(() => monthOf(selected))
  const current = monthOf(today)


  const first = new Date(view.y, view.m, 1)
  const offset = (first.getDay() + 6) % 7 // Monday first
  const count = new Date(view.y, view.m + 1, 0).getDate()
  const mm = String(view.m + 1).padStart(2, '0')

  const cells = []
  for (let i = 0; i < offset; i += 1) cells.push(null)
  for (let d = 1; d <= count; d += 1) {
    cells.push(`${view.y}-${mm}-${String(d).padStart(2, '0')}`)
  }

  const canNext = view.y * 12 + view.m < current.y * 12 + current.m

  function shift(delta) {
    setView(({ y, m }) => {
      const next = new Date(y, m + delta, 1)
      return { y: next.getFullYear(), m: next.getMonth() }
    })
  }

  return (
    <section className="diary-mini" aria-label="Diary calendar">
      <header>
        <button type="button" onClick={() => shift(-1)} aria-label="Previous month">
          <ChevronLeft size={17} />
        </button>
        <h2>{first.toLocaleDateString(LOCALE, { month: 'long', year: 'numeric' })}</h2>
        <button type="button" onClick={() => shift(1)} disabled={!canNext} aria-label="Next month">
          <ChevronRight size={17} />
        </button>
      </header>

      <div className="diary-mini-grid">
        {WEEKDAY_LETTERS.map((letter, index) => (
          <span key={index} className="diary-mini-weekday" aria-hidden="true">{letter}</span>
        ))}

        {cells.map((key, index) => {
          if (!key) return <span key={`blank-${index}`} />

          const pickable = written.has(key) || key === today
          const classes = [
            'diary-mini-day',
            written.has(key) ? 'has-entry' : '',
            key === today ? 'is-today' : '',
            key === selected ? 'is-selected' : '',
          ].filter(Boolean).join(' ')

          return (
            <button
              key={key}
              type="button"
              className={classes}
              disabled={!pickable}
              aria-label={formatLongDate(key)}
              aria-current={key === selected ? 'date' : undefined}
              onClick={() => onPick(key)}
            >
              {Number(key.slice(8))}
            </button>
          )
        })}
      </div>
    </section>
  )
}

/* ---------- notebook ---------- */

function Notebook({ user, onLock }) {
  const today = dayKey()
  const storageKey = diaryKey(user.id)
  const [entries, setEntries] = useState(() => {
    const stored = readJSON(storageKey, {})
    return stored && typeof stored === 'object' && !Array.isArray(stored) ? stored : {}
  })
  const [day, setDay] = useState(today)
  const [saveStatus, setSaveStatus] = useState('saved')
  const [toggledMonths, setToggledMonths] = useState({})

  const topRef = useRef(null)
  const areaRef = useRef(null)

  const displayEntries = useMemo(() => {
    const samples = {}

    DEMO_PAGES.forEach(({ daysAgo, text }) => {
      let offset = daysAgo
      let key = dateKeyDaysAgo(today, offset)

      // Keep real entries untouched if a sample date is already occupied.
      while (
        Object.prototype.hasOwnProperty.call(entries, key) ||
        Object.prototype.hasOwnProperty.call(samples, key)
      ) {
        offset += 1
        key = dateKeyDaysAgo(today, offset)
      }

      samples[key] = { text, demo: true }
    })

    return { ...samples, ...entries }
  }, [entries, today])

  // Written past days, newest first.
  const days = useMemo(
    () => Object.keys(displayEntries)
      .filter((key) => (
        key !== today && (
          (
            typeof displayEntries[key]?.text === 'string' &&
            displayEntries[key].text.trim()
          ) ||
          displayEntries[key]?.mood
        )
      ))
      .sort()
      .reverse(),
    [displayEntries, today],
  )

  const isToday = day === today
  const text = displayEntries[day]?.text || ''
  const editable = isToday || (ALLOW_PAST_EDIT && !displayEntries[day]?.demo)
  const selectedMood = displayEntries[day]?.mood || ''
  const dailyPrompt = promptForDay(day)
  const wordCount = countWords(text)

  // Pages you can flip through: every written day, then today. Oldest → newest.
  const pageKeys = useMemo(() => [...days].reverse().concat(today), [days, today])
  const pageIndex = pageKeys.indexOf(day)
  const prevKey = pageIndex > 0 ? pageKeys[pageIndex - 1] : null
  const nextKey = pageIndex >= 0 && pageIndex < pageKeys.length - 1 ? pageKeys[pageIndex + 1] : null

  const written = useMemo(() => {
    const set = new Set(days)
    if (displayEntries[today]?.text?.trim() || displayEntries[today]?.mood) {
      set.add(today)
    }
    return set
  }, [days, displayEntries, today])

  const months = useMemo(() => {
    const map = new Map()

    days.forEach((key) => {
      const monthKey = key.slice(0, 7)
      if (!map.has(monthKey)) map.set(monthKey, [])
      map.get(monthKey).push(key)
    })

    return Array.from(map, ([key, items]) => ({ key, items }))
  }, [days])

  // Lock automatically after a period of inactivity.
  useEffect(() => {
    const events = ['pointerdown', 'keydown', 'scroll']
    let timer

    const reset = () => {
      window.clearTimeout(timer)
      timer = window.setTimeout(onLock, IDLE_LOCK_MS)
    }

    reset()
    events.forEach((name) => window.addEventListener(name, reset, { passive: true }))

    return () => {
      window.clearTimeout(timer)
      events.forEach((name) => window.removeEventListener(name, reset))
    }
  }, [onLock])

  // ← / → flip pages (not while typing in an editable field).
  useEffect(() => {
    function onKey(event) {
      if (event.altKey || event.ctrlKey || event.metaKey || event.shiftKey) return

      const target = event.target
      const typing = target instanceof HTMLElement && (
        target.isContentEditable ||
        (/^(TEXTAREA|INPUT)$/.test(target.tagName) && !target.readOnly)
      )
      if (typing) return

      if (event.key === 'ArrowLeft' && prevKey) setDay(prevKey)
      if (event.key === 'ArrowRight' && nextKey) setDay(nextKey)
    }

    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [prevKey, nextKey])

  // Auto-grow: the page is as tall as its text (with a minimum from `rows`).
  useLayoutEffect(() => {
    const el = areaRef.current
    if (!el) return undefined

    const fit = () => {
      el.style.height = 'auto'
      el.style.height = `${el.scrollHeight}px`
    }

    fit()
    window.addEventListener('resize', fit)
    return () => window.removeEventListener('resize', fit)
  }, [text, day])

  function persistEntries(next) {
    setEntries(next)

    try {
      localStorage.setItem(storageKey, JSON.stringify(next))
      setSaveStatus('saved')
    } catch {
      setSaveStatus('error')
    }
  }

  function write(value) {
    if (!editable) return

    const next = {
      ...entries,
      [day]: {
        ...(entries[day] || {}),
        text: value,
      },
    }

    persistEntries(next)
  }

  function updateMood(value) {
    if (!editable) return

    const current = entries[day] || {}
    const nextEntry = {
      ...current,
      text: current.text || '',
    }

    // Tapping the selected mood again removes it.
    if (current.mood === value) {
      delete nextEntry.mood
    } else {
      nextEntry.mood = value
    }

    const next = { ...entries }

    // Do not keep an entirely empty entry.
    if (!nextEntry.text.trim() && !nextEntry.mood) {
      delete next[day]
    } else {
      next[day] = nextEntry
    }

    persistEntries(next)
  }

  function insertStarter(phrase) {
    if (!editable) return

    const separator = text
      ? (text.endsWith('\n') ? '' : '\n\n')
      : ''

    write(`${text}${separator}${phrase}`)
    areaRef.current?.focus()
  }

  // Used by the list and the calendar, which sit below the page.
  function selectDay(key) {
    setDay(key)
    topRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' })
  }

  let statusText
  if (!editable) statusText = 'Past pages are read-only'
  else if (saveStatus !== 'saved') statusText = 'Could not save. Check your browser storage.'
  else if (!isToday) statusText = 'Editing a past page · Saved on this device'
  else statusText = 'Saved on this device'

  return (
    <div className="diary-page">
      <header className="diary-header" ref={topRef}>
        <div>
          <p className="diary-eyebrow">MY DIARY</p>
          <h1>{isToday ? 'Today’s page' : formatHeading(day)}</h1>
          {!isToday && <p className="diary-relative">{relativeLabel(today, day)}</p>}
        </div>

        <button type="button" className="diary-lock-button" onClick={onLock}>
          <Lock size={16} />
          <span>Lock</span>
        </button>
      </header>

      {pageKeys.length > 1 && (
        <nav className="diary-pager" aria-label="Diary pages">
          <button
            type="button"
            className="diary-pager-button"
            onClick={() => prevKey && setDay(prevKey)}
            disabled={!prevKey}
            aria-label={prevKey ? `Previous page, ${formatLongDate(prevKey)}` : 'No earlier page'}
          >
            <ChevronLeft size={17} />
            <span>{prevKey ? formatShortDate(prevKey) : 'Older'}</span>
          </button>

          <button
            type="button"
            className="diary-pager-button"
            onClick={() => nextKey && setDay(nextKey)}
            disabled={!nextKey}
            aria-label={nextKey ? `Next page, ${formatLongDate(nextKey)}` : 'No newer page'}
          >
            <span>{nextKey ? (nextKey === today ? 'Today' : formatShortDate(nextKey)) : 'Newer'}</span>
            <ChevronRight size={17} />
          </button>

          {!isToday && (
            <button type="button" className="diary-back-button" onClick={() => setDay(today)}>
              <ChevronLeft size={17} />
              Back to today
            </button>
          )}
        </nav>
      )}

      {(editable || selectedMood) && (
        <section className="diary-writing-tools" aria-label="Writing helpers">
          {editable ? (
            <div className="diary-mood-row">
              <span className="diary-tool-label">How are you feeling?</span>

              <div className="diary-mood-options">
                {MOODS.map((mood) => (
                  <button
                    key={mood.value}
                    type="button"
                    className={`diary-mood-button${selectedMood === mood.value ? ' is-selected' : ''}`}
                    aria-label={mood.label}
                    aria-pressed={selectedMood === mood.value}
                    title={mood.label}
                    onClick={() => updateMood(mood.value)}
                  >
                    <span aria-hidden="true">{mood.emoji}</span>
                    <small>{mood.label}</small>
                  </button>
                ))}
              </div>
            </div>
          ) : (
            <div className="diary-past-mood">
              <span aria-hidden="true">
                {MOODS.find((mood) => mood.value === selectedMood)?.emoji}
              </span>
              <span>
                You felt {MOODS.find((mood) => mood.value === selectedMood)?.label.toLowerCase()}
              </span>
            </div>
          )}

          {editable && (
            <div className="diary-prompt-card">
              <div className="diary-prompt-copy">
                <small>A LITTLE PROMPT</small>
                <p>{dailyPrompt}</p>
              </div>

              <div className="diary-starters" aria-label="Writing starters">
                {STARTER_PHRASES.map((starter) => (
                  <button
                    key={starter.label}
                    type="button"
                    onClick={() => insertStarter(starter.text)}
                  >
                    {starter.label}
                  </button>
                ))}
              </div>
            </div>
          )}
        </section>
      )}

      <article
        key={day}
        className={`diary-paper is-entering${isToday ? '' : ' is-past'}${editable ? '' : ' is-readonly'}`}
      >
        <span className="diary-ribbon" aria-hidden="true" />
        <p className="diary-paper-date">{formatLongDate(day)}</p>

        <div className="diary-editor-toolbar">
          <span className="diary-word-count">
            {wordCount} {wordCount === 1 ? 'word' : 'words'}
          </span>
        </div>

        <textarea
          ref={areaRef}
          rows={isToday ? 10 : 4}
          value={text}
          readOnly={!editable}
          onChange={(event) => write(event.target.value)}
          spellCheck={false}
          placeholder={isToday ? 'Start wherever you are…' : ''}
          aria-label={`Diary page for ${formatLongDate(day)}`}
        />

        <small className="diary-paper-status">{statusText}</small>
      </article>

      {!!days.length && (
        <div className="diary-archive">
          <MiniCalendar
            key={day.slice(0, 7)}
            today={today}
            selected={day}
            written={written}
            onPick={selectDay}
          />

          <section className="diary-archive-list">
            <h2>Earlier pages</h2>

            {months.map(({ key, items }, index) => {
              const open = toggledMonths[key] ?? (index === 0 || key === day.slice(0, 7))

              return (
                <div className="diary-month" key={key}>
                  <button
                    type="button"
                    className="diary-month-toggle"
                    aria-expanded={open}
                    onClick={() => setToggledMonths((prev) => ({ ...prev, [key]: !open }))}
                  >
                    <span>{formatMonth(items[0])}</span>
                    <em>{items.length} {items.length === 1 ? 'page' : 'pages'}</em>
                    <ChevronDown size={16} aria-hidden="true" />
                  </button>

                  {open && (
                    <ul>
                      {items.map((itemKey) => {
                        const entryText = displayEntries[itemKey].text.trim()
                        const words = countWords(entryText)

                        return (
                          <li key={itemKey}>
                            <button
                              type="button"
                              className={`diary-archive-row${itemKey === day ? ' is-active' : ''}`}
                              aria-current={itemKey === day ? 'page' : undefined}
                              onClick={() => selectDay(itemKey)}
                            >
                              <span className="diary-archive-date">
                                <small>{formatWeekday(itemKey)}</small>
                                <b>{parseKey(itemKey).getDate()}</b>
                              </span>
                              <span className="diary-archive-preview">
                                {entryText.replace(/\s+/g, ' ').slice(0, 140) || (displayEntries[itemKey].mood ? 'Mood check-in' : '')}
                              </span>
                              <span className="diary-archive-meta">
                                {words ? `${words} ${words === 1 ? 'word' : 'words'}` : displayEntries[itemKey].mood ? 'Mood saved' : '0 words'}
                              </span>
                            </button>
                          </li>
                        )
                      })}
                    </ul>
                  )}
                </div>
              )
            })}
          </section>
        </div>
      )}
    </div>
  )
}