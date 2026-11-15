import { useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import { ArrowLeft, Heart, Trash2 } from 'lucide-react'
import { useStored } from '../lib/useStored.js'
import { CheckinButton } from './Hobbies.jsx'
import {
  MILESTONES,
  MOODS,
  addSession,
  formatDay,
  heatmap,
  hobbyProgress,
  isCheckedToday,
  latestMilestone,
  nextMilestone,
  nextTask,
  plantStage,
  removeSession,
  sessionsNewestFirst,
  thisWeek,
  toggleCheckin,
  totalDays,
  totalMinutes,
  uid,
  weekCount,
  weeksStreak,
} from '../utils/hobbies.js'

const MINUTE_CHIPS = [10, 20, 30, 45, 60]
const plural = (n, word) => `${n} ${word}${n === 1 ? '' : 's'}`

export default function HobbyDetail({ user }) {
  const { hobbyId } = useParams()
  const navigate = useNavigate()
  const [hobbies, setHobbies] = useStored(`choivia:hobbies:${user.id}`, [])
  const [drafts, setDrafts] = useState({})
  const [stageDraft, setStageDraft] = useState('')
  const [status, setStatus] = useState('')
  const [minutes, setMinutes] = useState('')
  const [mood, setMood] = useState('')
  const [note, setNote] = useState('')
  const [logError, setLogError] = useState('')
  const [showAll, setShowAll] = useState(false)

  const hobby = hobbies.find((item) => item.id === hobbyId)

  if (!hobby) {
    return (
      <div className="hb-page">
        <p>We couldn’t find that hobby.</p>
        <Link to="/hobbies" className="text-link">Back to hobbies</Link>
      </div>
    )
  }

  const progress = hobbyProgress(hobby)
  const next = nextTask(hobby)
  const days = totalDays(hobby)
  const goal = hobby.goalPerWeek ?? 3
  const doneThisWeek = weekCount(hobby)
  const streak = weeksStreak(hobby)
  const { current: plant, next: nextPlant } = plantStage(days)
  const plantPercent = nextPlant
    ? Math.round(((days - plant.min) / (nextPlant.min - plant.min)) * 100)
    : 100
  const latest = latestMilestone(days)
  const upcoming = nextMilestone(days)
  const checkedToday = isCheckedToday(hobby)
  const sessions = sessionsNewestFirst(hobby)
  const shownSessions = showAll ? sessions : sessions.slice(0, 5)
  const hours = Math.round((totalMinutes(hobby) / 60) * 10) / 10

  const save = (updated) =>
    setHobbies(hobbies.map((item) => (item.id === hobby.id ? updated : item)))

  const mapStage = (stageId, change) =>
    save({
      ...hobby,
      stages: hobby.stages.map((stage) => (stage.id === stageId ? change(stage) : stage)),
    })

  const toggleTask = (stageId, taskId) =>
    mapStage(stageId, (stage) => ({
      ...stage,
      tasks: stage.tasks.map((task) => (task.id === taskId ? { ...task, done: !task.done } : task)),
    }))

  const removeTask = (stageId, taskId) =>
    mapStage(stageId, (stage) => ({
      ...stage,
      tasks: stage.tasks.filter((task) => task.id !== taskId),
    }))

  function addTask(event, stageId) {
    event.preventDefault()
    const text = (drafts[stageId] || '').trim()
    if (!text) return
    mapStage(stageId, (stage) => ({
      ...stage,
      tasks: [...stage.tasks, { id: uid(), text, done: false }],
    }))
    setDrafts({ ...drafts, [stageId]: '' })
  }

  function addStage(event) {
    event.preventDefault()
    const title = stageDraft.trim()
    if (!title) return
    save({ ...hobby, stages: [...hobby.stages, { id: uid(), title, tasks: [] }] })
    setStageDraft('')
  }

  function handleCheckin() {
    const updated = toggleCheckin(hobby)
    save(updated)
    if (!isCheckedToday(updated)) {
      setStatus('Check-in undone.')
      return
    }
    const count = totalDays(updated)
    setStatus(
      MILESTONES.includes(count)
        ? `🎉 Milestone! ${plural(count, 'practice day')} for ${hobby.name}.`
        : `Nice work. That’s ${plural(count, 'practice day')} so far.`,
    )
  }

  function saveEntry(event) {
    event.preventDefault()
    if (!minutes && !mood && !note.trim()) {
      setLogError('Add a few minutes, a mood or a note first.')
      return
    }
    save(addSession(hobby, { minutes, mood, note }))
    setMinutes('')
    setMood('')
    setNote('')
    setLogError('')
    setStatus('Saved to your practice log.')
  }

  function removeHobby() {
    if (!window.confirm(`Delete “${hobby.name}” and all its progress? This cannot be undone.`)) return
    setHobbies(hobbies.filter((item) => item.id !== hobby.id))
    navigate('/hobbies')
  }

  return (
    <div className="hb-page">
      <Link to="/hobbies" className="back-link">
        <ArrowLeft size={16} aria-hidden="true" /> All hobbies
      </Link>

      <header className="hb-detail-head">
        <span className="hb-emoji hb-emoji-xl" aria-hidden="true">{hobby.emoji}</span>
        <div>
          <h1>{hobby.name}</h1>
          {hobby.why && (
            <p className="hb-why"><Heart size={15} aria-hidden="true" /> {hobby.why}</p>
          )}
        </div>
      </header>

      <p className="hb-status" role="status">{status}</p>

      <section className="hb-panel" aria-label="This week">
        <div className="hb-panel-row">
          <div>
            <strong className="hb-big">{doneThisWeek}<span> / {goal}</span></strong>
            <small>days this week</small>
          </div>
          <CheckinButton hobby={hobby} onToggle={handleCheckin} />
        </div>

        <div className="hb-week" aria-label="This week, Monday to Sunday">
          {thisWeek(hobby).map((day) => (
            <span key={day.key} className={`${day.done ? 'on' : ''}${day.isToday ? ' today' : ''}${day.future ? ' future' : ''}`}>
              <i aria-hidden="true">{day.done ? '✓' : ''}</i>
              <small>{day.label}</small>
              <span className="sr-only">{day.key}: {day.done ? 'practiced' : 'not practiced'}</span>
            </span>
          ))}
        </div>

        <p className="hb-goal-line">
          {doneThisWeek >= goal
            ? '🌟 You met your goal this week.'
            : `${plural(goal - doneThisWeek, 'more day')} to reach your weekly goal.`}
          {streak > 0 && ` · ${plural(streak, 'week')} in a row`}
        </p>
        <p className="hb-hint">Missing a day is fine. Your streak counts weeks, not days.</p>
      </section>

      {checkedToday && (
        <form className="hb-log" onSubmit={saveEntry} noValidate>
          <h2>How did it go today?</h2>
          <p className="hb-hint">Optional. A short note now is a gift to your future self.</p>

          <div className="hb-field">
            <span id="hb-min-label">Time spent (minutes)</span>
            <div className="hb-chips" role="group" aria-labelledby="hb-min-label">
              {MINUTE_CHIPS.map((value) => (
                <button
                  key={value}
                  type="button"
                  className={`hb-chip${Number(minutes) === value ? ' on' : ''}`}
                  aria-pressed={Number(minutes) === value}
                  onClick={() => setMinutes(String(value))}
                >
                  {value}
                </button>
              ))}
              <input
                type="number"
                min="0"
                max="600"
                inputMode="numeric"
                value={minutes}
                onChange={(event) => setMinutes(event.target.value)}
                aria-label="Minutes, custom"
                placeholder="Other"
              />
            </div>
          </div>

          <div className="hb-field">
            <span id="hb-mood-label">Mood</span>
            <div className="hb-chips" role="group" aria-labelledby="hb-mood-label">
              {MOODS.map((item) => (
                <button
                  key={item.id}
                  type="button"
                  className={`hb-chip${mood === item.id ? ' on' : ''}`}
                  aria-pressed={mood === item.id}
                  onClick={() => setMood(mood === item.id ? '' : item.id)}
                >
                  <span aria-hidden="true">{item.emoji}</span> {item.label}
                </button>
              ))}
            </div>
          </div>

          <label className="hb-field">
            <span>Note</span>
            <textarea
              rows={3}
              value={note}
              maxLength={300}
              onChange={(event) => setNote(event.target.value)}
              placeholder="What did you practice? What felt good or hard?"
            />
          </label>

          {logError && <p className="hb-error" role="alert">{logError}</p>}
          <button type="submit" className="hb-primary">Save entry</button>
        </form>
      )}

      <section className="hb-plant" aria-label="Your plant">
        <span className="hb-plant-emoji" aria-hidden="true">{plant.emoji}</span>
        <div>
          <strong>{plant.label}</strong>
          <small>
            {plural(days, 'practice day')}
            {hours > 0 && ` · ${hours} h logged`}
          </small>
          <span
            className="hb-bar"
            role="progressbar"
            aria-label="Progress to the next plant stage"
            aria-valuemin={0}
            aria-valuemax={100}
            aria-valuenow={plantPercent}
          >
            <span style={{ width: `${plantPercent}%` }} />
          </span>
          <small>
            {nextPlant
              ? `${plural(nextPlant.min - days, 'day')} until ${nextPlant.emoji} ${nextPlant.label}`
              : 'Fully grown. Beautiful.'}
          </small>
        </div>
      </section>

      <p className="hb-milestone">
        {latest ? `🏅 Latest milestone: ${plural(latest, 'practice day')}.` : '🏅 Your first milestone is one practice day away.'}
        {upcoming && ` Next: ${upcoming} (${plural(upcoming - days, 'day')} to go).`}
      </p>

      <section className="hb-next" aria-label="Next small step">
        <p className="eyebrow">YOUR NEXT SMALL STEP</p>
        {next ? (
          <>
            <h2>{next.task.text}</h2>
            <p>{next.stage.title} · {progress.percent}% of the roadmap done</p>
            <button
              type="button"
              className="hb-primary"
              onClick={() => toggleTask(next.stage.id, next.task.id)}
            >
              Mark this step done
            </button>
          </>
        ) : (
          <h2>You have completed every step. 🎉 Add new steps below to keep growing.</h2>
        )}
      </section>

      <h2 className="hb-h2">Roadmap</h2>
      <div className="hb-stages">
        {hobby.stages.map((stage, index) => {
          const done = stage.tasks.filter((task) => task.done).length
          return (
            <details key={stage.id} className="hb-stage" open={next?.stage.id === stage.id}>
              <summary>
                <span className="hb-stage-num">{index + 1}</span>
                <span className="hb-stage-title">{stage.title}</span>
                <small>{done}/{stage.tasks.length}</small>
              </summary>

              <ul className="hb-tasks">
                {stage.tasks.map((task) => (
                  <li key={task.id} className={task.done ? 'done' : ''}>
                    <label>
                      <input
                        type="checkbox"
                        checked={task.done}
                        onChange={() => toggleTask(stage.id, task.id)}
                      />
                      <span>{task.text}</span>
                    </label>
                    <button
                      type="button"
                      className="hb-icon-btn"
                      aria-label={`Remove step: ${task.text}`}
                      onClick={() => removeTask(stage.id, task.id)}
                    >
                      ×
                    </button>
                  </li>
                ))}
              </ul>

              <form className="hb-add" onSubmit={(event) => addTask(event, stage.id)}>
                <input
                  value={drafts[stage.id] || ''}
                  onChange={(event) => setDrafts({ ...drafts, [stage.id]: event.target.value })}
                  placeholder="Add a step…"
                  aria-label={`Add a step to ${stage.title}`}
                  maxLength={100}
                />
                <button type="submit" className="hb-secondary">Add</button>
              </form>
            </details>
          )
        })}
      </div>

      <form className="hb-add hb-add-stage" onSubmit={addStage}>
        <input
          value={stageDraft}
          onChange={(event) => setStageDraft(event.target.value)}
          placeholder="Add a new stage…"
          aria-label="Add a new stage"
          maxLength={60}
        />
        <button type="submit" className="hb-secondary">Add stage</button>
      </form>

      <h2 className="hb-h2">Your last 12 weeks</h2>
      <div
        className="hb-heatmap"
        role="img"
        aria-label={`Practice calendar for the last 12 weeks. ${plural(days, 'practice day')} in total.`}
      >
        {heatmap(hobby).map((week, index) => (
          <div key={index} className="hb-heat-col">
            {week.map((day) => (
              <span
                key={day.key}
                className={`hb-heat${day.done ? ' on' : ''}${day.future ? ' future' : ''}`}
                title={`${formatDay(day.key)}${day.done ? ': practiced' : ''}`}
              />
            ))}
          </div>
        ))}
      </div>

      <h2 className="hb-h2">Practice log</h2>
      {sessions.length === 0 ? (
        <p className="hb-hint">Entries you save after a check-in will appear here.</p>
      ) : (
        <>
          <ul className="hb-log-list">
            {shownSessions.map((entry) => {
              const moodInfo = MOODS.find((item) => item.id === entry.mood)
              return (
                <li key={entry.id}>
                  <div className="hb-log-top">
                    <strong>{formatDay(entry.date)}</strong>
                    <span>
                      {entry.minutes > 0 && `${entry.minutes} min`}
                      {moodInfo && ` ${moodInfo.emoji} ${moodInfo.label}`}
                    </span>
                    <button
                      type="button"
                      className="hb-icon-btn"
                      aria-label={`Delete log entry from ${formatDay(entry.date)}`}
                      onClick={() => save(removeSession(hobby, entry.id))}
                    >
                      ×
                    </button>
                  </div>
                  {entry.note && <p>{entry.note}</p>}
                </li>
              )
            })}
          </ul>
          {sessions.length > 5 && (
            <button type="button" className="hb-secondary" onClick={() => setShowAll(!showAll)}>
              {showAll ? 'Show fewer' : `Show all ${sessions.length} entries`}
            </button>
          )}
        </>
      )}

      <details className="hb-stage hb-settings">
        <summary><span className="hb-stage-title">Goal and reminder</span></summary>
        <div className="hb-form-row">
          <label className="hb-field">
            <span>Weekly goal</span>
            <select
              value={goal}
              onChange={(event) => save({ ...hobby, goalPerWeek: Number(event.target.value) })}
            >
              {[1, 2, 3, 4, 5, 6, 7].map((n) => (
                <option key={n} value={n}>{plural(n, 'day')} a week</option>
              ))}
            </select>
          </label>
          <label className="hb-field">
            <span>Reminder time</span>
            <input
              type="time"
              value={hobby.reminderTime ?? ''}
              onChange={(event) => save({ ...hobby, reminderTime: event.target.value })}
            />
          </label>
        </div>
      </details>

      <button type="button" className="hb-danger" onClick={removeHobby}>
        <Trash2 size={16} aria-hidden="true" /> Delete this hobby
      </button>
    </div>
  )
}