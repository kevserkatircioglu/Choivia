import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { ArrowRight, Check, Download, Plus, Sprout, Upload } from 'lucide-react'
import { useStored } from '../lib/useStored.js'
import { TEMPLATES } from '../data/hobbyTemplates.js'
import {
  createHobby,
  hobbyProgress,
  isCheckedToday,
  isWaiting,
  nextTask,
  parseBackup,
  plantStage,
  todayKey,
  toggleCheckin,
  totalDays,
  weekCount,
} from '../utils/hobbies.js'

const weeklyLabel = (hobby) => `${weekCount(hobby)} of ${hobby.goalPerWeek ?? 3} days this week`

// Tek dokunuşla "bugün yaptım". Tekrar basınca geri alınır.
export function CheckinButton({ hobby, onToggle }) {
  const done = isCheckedToday(hobby)
  return (
    <button
      type="button"
      className={`hb-checkin${done ? ' on' : ''}`}
      aria-pressed={done}
      onClick={onToggle}
      title={done ? 'Tap again to undo' : undefined}
    >
      {done ? <Check size={18} aria-hidden="true" /> : null}
      {done ? 'Practiced today' : 'I practiced today'}
    </button>
  )
}

// Dashboard'da görünen kısa liste.
export function TodayHobbies({ user }) {
  const [hobbies, setHobbies] = useStored(`choivia:hobbies:${user.id}`, [])

  const toggle = (id) =>
    setHobbies(hobbies.map((hobby) => (hobby.id === id ? toggleCheckin(hobby) : hobby)))

  return (
    <section className="hb-today" aria-labelledby="hb-today-title">
      <div className="hb-section-head">
        <div>
          <p className="eyebrow">YOUR HOBBIES</p>
          <h2 id="hb-today-title">Did you do it today?</h2>
        </div>
        <Link to="/hobbies" className="text-link">
          All hobbies <ArrowRight size={14} />
        </Link>
      </div>

      {hobbies.length === 0 ? (
        <div className="hb-empty">
          <Sprout size={26} aria-hidden="true" />
          <p>You have no hobbies yet. Pick one and get a ready-made roadmap.</p>
          <Link to="/hobbies" className="hb-primary">
            Start a hobby <ArrowRight size={16} />
          </Link>
        </div>
      ) : (
        <ul className="hb-today-list">
          {hobbies.map((hobby) => {
            const next = nextTask(hobby)
            const plant = plantStage(totalDays(hobby)).current
            return (
              <li key={hobby.id} className="hb-today-item">
                <Link to={`/hobbies/${hobby.id}`} className="hb-today-info">
                  <span className="hb-emoji" aria-hidden="true">{hobby.emoji}</span>
                  <span>
                    <strong>{hobby.name}</strong>
                    <small>{next ? `Next: ${next.task.text}` : 'All steps complete 🎉'}</small>
                    <small>{plant.emoji} {weeklyLabel(hobby)}</small>
                    {isWaiting(hobby) && (
                      <small className="hb-waiting">
                        It’s past {hobby.reminderTime}. Whenever you’re ready 🌿
                      </small>
                    )}
                  </span>
                </Link>
                <CheckinButton hobby={hobby} onToggle={() => toggle(hobby.id)} />
              </li>
            )
          })}
        </ul>
      )}
    </section>
  )
}

export default function Hobbies({ user }) {
  const navigate = useNavigate()
  const [hobbies, setHobbies] = useStored(`choivia:hobbies:${user.id}`, [])
  const [selected, setSelected] = useState(null) // template id | 'blank' | null
  const [name, setName] = useState('')
  const [why, setWhy] = useState('')
  const [goal, setGoal] = useState(3)
  const [reminder, setReminder] = useState('')
  const [error, setError] = useState('')
  const [backupMessage, setBackupMessage] = useState('')

  function choose(id) {
    setSelected(id)
    setError('')
    const template = TEMPLATES.find((item) => item.id === id)
    setName(template ? template.name : '')
  }

  function create(event) {
    event.preventDefault()
    if (!name.trim()) {
      setError('Give your hobby a name to continue.')
      return
    }
    const template = TEMPLATES.find((item) => item.id === selected)
    const hobby = createHobby({
      name,
      why,
      goalPerWeek: Number(goal),
      reminderTime: reminder,
      emoji: template?.emoji ?? '🌱',
      stages: template?.stages ?? [{ title: 'First steps', tasks: [] }],
    })
    setHobbies([...hobbies, hobby])
    navigate(`/hobbies/${hobby.id}`)
  }

  const toggle = (id) =>
    setHobbies(hobbies.map((hobby) => (hobby.id === id ? toggleCheckin(hobby) : hobby)))

  function exportBackup() {
    const backup = { app: 'choivia', version: 1, exportedAt: new Date().toISOString(), hobbies }
    const blob = new Blob([JSON.stringify(backup, null, 2)], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.download = `choivia-hobbies-${todayKey()}.json`
    document.body.appendChild(link)
    link.click()
    link.remove()
    window.setTimeout(() => URL.revokeObjectURL(url), 1000)
    setBackupMessage('Backup downloaded. Keep the file somewhere safe.')
  }

  async function importBackup(event) {
    const input = event.currentTarget
    const file = input.files?.[0]
    input.value = ''
    if (!file) return

    try {
      const imported = parseBackup(await file.text())
      if (!window.confirm(`Import ${imported.length} hobby backup entries? Hobbies with the same id will be replaced.`)) {
        setBackupMessage('Import canceled. Nothing was changed.')
        return
      }
      const byId = new Map(hobbies.map((hobby) => [hobby.id, hobby]))
      imported.forEach((hobby) => byId.set(hobby.id, hobby))
      setHobbies([...byId.values()])
      setBackupMessage('Backup imported.')
    } catch {
      setBackupMessage('That file is not a valid Choivia hobby backup. Nothing was changed.')
    }
  }

  return (
    <div className="hb-page">
      <header className="hb-head">
        <p className="eyebrow">HOBBIES</p>
        <h1>Grow something you love.</h1>
        <p>Pick a roadmap, take one small step at a time, and check in whenever you practice.</p>
      </header>

      {hobbies.length > 0 && (
        <section aria-labelledby="hb-mine">
          <h2 id="hb-mine" className="hb-h2">My hobbies</h2>
          <ul className="hb-cards">
            {hobbies.map((hobby) => {
              const progress = hobbyProgress(hobby)
              const next = nextTask(hobby)
              const plant = plantStage(totalDays(hobby)).current
              return (
                <li key={hobby.id} className="hb-card">
                  <Link to={`/hobbies/${hobby.id}`} className="hb-card-link">
                    <span className="hb-emoji hb-emoji-lg" aria-hidden="true">{hobby.emoji}</span>
                    <span className="hb-card-main">
                      <strong>{hobby.name}</strong>
                      <small>{next ? `Next: ${next.task.text}` : 'All steps complete 🎉'}</small>
                      <span
                        className="hb-bar"
                        role="progressbar"
                        aria-label={`${hobby.name} progress`}
                        aria-valuemin={0}
                        aria-valuemax={100}
                        aria-valuenow={progress.percent}
                      >
                        <span style={{ width: `${progress.percent}%` }} />
                      </span>
                      <small>{progress.done} of {progress.total} steps · {progress.percent}%</small>
                      <small>{plant.emoji} {plant.label} · {weeklyLabel(hobby)}</small>
                    </span>
                  </Link>
                  <CheckinButton hobby={hobby} onToggle={() => toggle(hobby.id)} />
                </li>
              )
            })}
          </ul>
        </section>
      )}

      <section aria-labelledby="hb-new">
        <h2 id="hb-new" className="hb-h2">{hobbies.length ? 'Add another hobby' : 'Choose a hobby to start'}</h2>

        <div className="hb-templates" role="group" aria-label="Hobby templates">
          {TEMPLATES.map((template) => (
            <button
              key={template.id}
              type="button"
              className={`hb-template${selected === template.id ? ' selected' : ''}`}
              aria-pressed={selected === template.id}
              onClick={() => choose(template.id)}
            >
              <span className="hb-emoji hb-emoji-lg" aria-hidden="true">{template.emoji}</span>
              <strong>{template.name}</strong>
              <small>{template.blurb}</small>
            </button>
          ))}
          <button
            type="button"
            className={`hb-template${selected === 'blank' ? ' selected' : ''}`}
            aria-pressed={selected === 'blank'}
            onClick={() => choose('blank')}
          >
            <span className="hb-emoji hb-emoji-lg" aria-hidden="true"><Plus size={26} /></span>
            <strong>Something else</strong>
            <small>Start empty and add your own steps.</small>
          </button>
        </div>

        {selected && (
          <form className="hb-form" onSubmit={create} noValidate>
            <label>
              <span>Name</span>
              <input
                value={name}
                onChange={(event) => { setName(event.target.value); setError('') }}
                maxLength={40}
                aria-invalid={Boolean(error)}
                aria-describedby={error ? 'hb-name-error' : undefined}
              />
            </label>
            <label>
              <span>Why do you want to do this? <em>(optional)</em></span>
              <input
                value={why}
                onChange={(event) => setWhy(event.target.value)}
                maxLength={120}
                placeholder="e.g. I want to play for my family"
              />
            </label>
            <div className="hb-form-row">
              <label>
                <span>A comfortable weekly goal</span>
                <select value={goal} onChange={(event) => setGoal(event.target.value)}>
                  {[1, 2, 3, 4, 5, 6, 7].map((n) => (
                    <option key={n} value={n}>{n} {n === 1 ? 'day' : 'days'} a week</option>
                  ))}
                </select>
              </label>
              <label>
                <span>Reminder time <em>(optional)</em></span>
                <input type="time" value={reminder} onChange={(event) => setReminder(event.target.value)} />
              </label>
            </div>
            <p className="hb-hint">
              Start small. A goal you can keep beats a big one you can’t. Reminders appear on your dashboard,
              gently, once the time has passed.
            </p>
            {error && <p id="hb-name-error" className="hb-error" role="alert">{error}</p>}
            <button type="submit" className="hb-primary">
              Create hobby <ArrowRight size={16} />
            </button>
          </form>
        )}
      </section>

      <section className="hb-backup" aria-labelledby="hb-backup-title">
        <h2 id="hb-backup-title" className="hb-h2">Back up your hobbies</h2>
        <p className="hb-hint">
          Your data lives in this browser. If you clear your browser data, it is gone. Download a backup now and then.
        </p>
        <div className="hb-backup-actions">
          <button type="button" className="hb-secondary" onClick={exportBackup} disabled={hobbies.length === 0}>
            <Download size={16} aria-hidden="true" /> Download backup
          </button>
          <label className="hb-secondary hb-file">
            <Upload size={16} aria-hidden="true" /> Import backup
            <input type="file" accept=".json,application/json" onChange={importBackup} className="sr-only" />
          </label>
        </div>
        {backupMessage && <p className="hb-status" role="status">{backupMessage}</p>}
      </section>
    </div>
  )
}