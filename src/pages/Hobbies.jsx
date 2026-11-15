import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { ArrowRight, Check, Plus, Sprout } from 'lucide-react'
import { useStored } from '../lib/useStored.js'
import { TEMPLATES } from '../data/hobbyTemplates.js'
import {
  createHobby,
  hobbyProgress,
  isCheckedToday,
  nextTask,
  toggleCheckin,
} from '../utils/hobbies.js'

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
            return (
              <li key={hobby.id} className="hb-today-item">
                <Link to={`/hobbies/${hobby.id}`} className="hb-today-info">
                  <span className="hb-emoji" aria-hidden="true">{hobby.emoji}</span>
                  <span>
                    <strong>{hobby.name}</strong>
                    <small>{next ? `Next: ${next.task.text}` : 'All steps complete 🎉'}</small>
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
  const [error, setError] = useState('')

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
      emoji: template?.emoji ?? '🌱',
      stages: template?.stages ?? [{ title: 'First steps', tasks: [] }],
    })
    setHobbies([...hobbies, hobby])
    navigate(`/hobbies/${hobby.id}`)
  }

  const toggle = (id) =>
    setHobbies(hobbies.map((hobby) => (hobby.id === id ? toggleCheckin(hobby) : hobby)))

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
            {error && <p id="hb-name-error" className="hb-error" role="alert">{error}</p>}
            <button type="submit" className="hb-primary">
              Create hobby <ArrowRight size={16} />
            </button>
          </form>
        )}
      </section>
    </div>
  )
}
