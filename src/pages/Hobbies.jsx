import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { ArrowRight, Check, Play, Plus } from 'lucide-react'
import Icon from '../components/Icon.jsx'
import PlantIllustration from '../components/PlantIllustration.jsx'
import { getHobbyTheme } from '../utils/hobbyTheme.js'
import { getMotionPreference } from '../utils/motionPreference.js'
import { useStored } from '../lib/useStored.js'
import { TEMPLATES } from '../data/hobbyTemplates.js'
import {
  createHobby,
  hobbyProgress,
  isCheckedToday,
  isWaiting,
  nextTask,
  plantStage,
  sessionMinutesForDate,
  todayKey,
  totalDays,
  weekCount,
} from '../utils/hobbies.js'

const weeklyLabel = (hobby) => `${weekCount(hobby)} of ${hobby.goalPerWeek ?? 3} days this week`

const dashboardTaskLabel = (text = '') => {
  const prefix = 'Just 2 minutes:'
  return text.startsWith(prefix)
    ? `${text.slice(prefix.length).trim()} (2-min version)`
    : text
}

// Kart eylemi artık oturum sistemini kullanır; check-in silme butonu gösterilmez.
function HobbySessionAction({ hobby, activeSession }) {
  const practiced = isCheckedToday(hobby)
  const minutes = sessionMinutesForDate(hobby, todayKey())
  const detailPath = `/hobbies/${hobby.id}`

  if (activeSession?.hobbyId === hobby.id) {
    return (
      <Link to={detailPath} className="hb-session-card-action">
        <Play size={15} fill="currentColor" aria-hidden="true" /> Resume session
      </Link>
    )
  }

  if (practiced) {
    return (
      <div className="hb-session-card-practiced">
        <span>
          <Check size={16} aria-hidden="true" />
          Practiced today{minutes > 0 ? ` · ${minutes} min` : ''}
        </span>
        {activeSession ? (
          <small>Another session is in progress.</small>
        ) : (
          <Link
            to={detailPath}
            state={{ startSession: true }}
            className="hb-session-card-secondary"
          >
            Start another
          </Link>
        )}
      </div>
    )
  }

  if (activeSession) {
    return <small className="hb-session-card-wait">Another session is in progress.</small>
  }

  return (
    <Link
      to={detailPath}
      state={{ startSession: true }}
      className="hb-session-card-action"
    >
      <Play size={15} fill="currentColor" aria-hidden="true" /> Start session
    </Link>
  )
}

// Dashboard'da görünen kısa liste.
// Dashboard'da görünen kısa liste.
export function TodayHobbies({ user }) {
  const motionPreference = getMotionPreference(user.id)
  const [hobbies] = useStored(`choivia:hobbies:${user.id}`, [])
  const [activeSession] = useStored(`choivia:active-session:${user.id}`, null)

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
          <Icon name="sprout" size={26} />
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
              <li key={hobby.id} className="hb-today-item" data-hobby-theme={getHobbyTheme(hobby)}>
                <Link to={`/hobbies/${hobby.id}`} className="hb-today-info">
                  <span className="hb-emoji" aria-hidden="true"><Icon name={hobby.emoji} size={22} /></span>
                  <span>
                    <strong>{hobby.name}</strong>
                    <small>{next ? `Next: ${dashboardTaskLabel(next.task.text)}` : 'All steps complete'}</small>
                    <small><PlantIllustration stage={plant.key} size={20} className="hb-inline-plant" motionPreference={motionPreference} /> {weeklyLabel(hobby)}</small>
                    {activeSession?.hobbyId === hobby.id && <small className="hb-active-session">Session in progress</small>}
                    {isWaiting(hobby) && (
                      <small className="hb-waiting">
                        It’s past {hobby.reminderTime}. Whenever you’re ready.
                      </small>
                    )}
                  </span>
                </Link>
                <HobbySessionAction hobby={hobby} activeSession={activeSession} />
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
  const motionPreference = getMotionPreference(user.id)
  const [hobbies, setHobbies] = useStored(`choivia:hobbies:${user.id}`, [])
  const [activeSession] = useStored(`choivia:active-session:${user.id}`, null)
  const [selected, setSelected] = useState(null) // template id | 'blank' | null
  const [name, setName] = useState('')
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
      goalPerWeek: 3,
      emoji: template?.emoji ?? '🌱',
      templateId: template?.id ?? '',
      stages: template?.stages ?? [{ title: 'First steps', tasks: [] }],
    })
    setHobbies([...hobbies, hobby])
    navigate(`/hobbies/${hobby.id}`)
  }


  const usedTemplateIds = new Set(
    hobbies.map((hobby) => hobby.templateId).filter(Boolean),
  )
  const availableTemplates = TEMPLATES.filter(
    (template) => !usedTemplateIds.has(template.id),
  )

  return (
    <div className="hb-page">
      <header className="hb-head">
        <p className="eyebrow">HOBBIES</p>
        <h1>Grow something you love.</h1>
        <p>Pick a roadmap, take one small step at a time, and start a session whenever you practice.</p>
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
                <li key={hobby.id} className="hb-card" data-hobby-theme={getHobbyTheme(hobby)}>
                  <Link to={`/hobbies/${hobby.id}`} className="hb-card-link">
                    <span className="hb-card-garden-art">
                      <PlantIllustration
                        stage={plant.key}
                        size={88}
                        className="hb-card-plant"
                        motionPreference={motionPreference}
                      />
                      <small>{plant.label}</small>
                    </span>
                    <span className="hb-card-main">
                      <span className="hb-card-title">
                        <span className="hb-emoji" aria-hidden="true"><Icon name={hobby.emoji} size={20} /></span>
                        <strong>{hobby.name}</strong>
                      </span>
                      <small>{next ? `Next: ${dashboardTaskLabel(next.task.text)}` : 'All steps complete'}</small>
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
                      <small>{weeklyLabel(hobby)}</small>
                      {activeSession?.hobbyId === hobby.id && <small className="hb-active-session">Session in progress</small>}
                    </span>
                  </Link>
                  <HobbySessionAction hobby={hobby} activeSession={activeSession} />
                </li>
              )
            })}
          </ul>
        </section>
      )}

      <section aria-labelledby="hb-new">
        <h2 id="hb-new" className="hb-h2">
          {hobbies.length
            ? availableTemplates.length ? 'Add another hobby' : 'Create your own hobby'
            : 'Choose a hobby to start'}
        </h2>

        {availableTemplates.length === 0 && hobbies.length > 0 && (
          <p className="hb-hint">
            You’ve explored all the ready-made templates. You can still create something of your own.
          </p>
        )}

        <div className="hb-templates" role="group" aria-label="Available hobby templates">
          {availableTemplates.map((template) => {
            const stepCount = template.stages.reduce(
              (total, stage) => total + stage.tasks.length,
              0,
            )
            const firstTask = template.stages.find((stage) => stage.tasks.length)?.tasks[0]

            return (
              <button
                key={template.id}
                type="button"
                className={`hb-template${selected === template.id ? ' selected' : ''}`}
                data-hobby-theme={template.id}
                aria-pressed={selected === template.id}
                onClick={() => choose(template.id)}
              >
                <span className="hb-emoji hb-emoji-lg" aria-hidden="true"><Icon name={template.emoji} size={34} /></span>
                <strong>{template.name}</strong>
                <small>{template.blurb}</small>
                <small className="hb-template-meta">
                  <span>{template.stages.length} stages · {stepCount} steps</span>
                  {firstTask?.minutes
                    ? <span>First step ~{firstTask.minutes} min</span>
                    : null}
                </small>
              </button>
            )
          })}
          <button
            type="button"
            className={`hb-template hb-template-blank${selected === 'blank' ? ' selected' : ''}`}
            data-hobby-theme="garden"
            aria-pressed={selected === 'blank'}
            onClick={() => choose('blank')}
          >
            <span className="hb-emoji hb-emoji-lg" aria-hidden="true"><Plus size={26} /></span>
            <strong>Something else</strong>
            <small>Start empty and add your own steps.</small>
          </button>
        </div>

        {selected && (
          <form className="hb-form hb-quick-create" onSubmit={create} noValidate>
            <label>
              <span>What would you like to call it?</span>
              <input
                autoFocus
                value={name}
                onChange={(event) => { setName(event.target.value); setError('') }}
                maxLength={40}
                placeholder="e.g. Learn pottery"
                aria-invalid={Boolean(error)}
                aria-describedby={error ? 'hb-name-error' : undefined}
              />
            </label>

            {error && <p id="hb-name-error" className="hb-error" role="alert">{error}</p>}

            <p className="hb-hint">
              That’s enough to begin. You can add your reason, weekly goal and a gentle reminder after your first practice.
            </p>

            <button type="submit" className="hb-primary">
              Start <ArrowRight size={16} />
            </button>
          </form>
        )}
      </section>

    </div>
  )
} 