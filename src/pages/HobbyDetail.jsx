import { useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import { ArrowLeft, Heart, Trash2 } from 'lucide-react'
import { useStored } from '../lib/useStored.js'
import { CheckinButton } from './Hobbies.jsx'
import {
  hobbyProgress,
  lastSevenDays,
  nextTask,
  toggleCheckin,
  uid,
} from '../utils/hobbies.js'

export default function HobbyDetail({ user }) {
  const { hobbyId } = useParams()
  const navigate = useNavigate()
  const [hobbies, setHobbies] = useStored(`choivia:hobbies:${user.id}`, [])
  const [drafts, setDrafts] = useState({})
  const [stageDraft, setStageDraft] = useState('')

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

      <section className="hb-panel" aria-label="Progress">
        <div className="hb-panel-row">
          <div>
            <strong className="hb-big">{progress.percent}%</strong>
            <small>{progress.done} of {progress.total} steps done</small>
          </div>
          <CheckinButton hobby={hobby} onToggle={() => save(toggleCheckin(hobby))} />
        </div>
        <span
          className="hb-bar"
          role="progressbar"
          aria-label="Overall progress"
          aria-valuemin={0}
          aria-valuemax={100}
          aria-valuenow={progress.percent}
        >
          <span style={{ width: `${progress.percent}%` }} />
        </span>
        <div className="hb-week" aria-label="Practice days in the last 7 days">
          {lastSevenDays(hobby).map((day) => (
            <span key={day.key} className={`${day.done ? 'on' : ''}${day.isToday ? ' today' : ''}`}>
              <i aria-hidden="true">{day.done ? '✓' : ''}</i>
              <small>{day.label}</small>
              <span className="sr-only">{day.key}: {day.done ? 'practiced' : 'not practiced'}</span>
            </span>
          ))}
        </div>
      </section>

      <section className="hb-next" aria-label="Next small step">
        <p className="eyebrow">YOUR NEXT SMALL STEP</p>
        {next ? (
          <>
            <h2>{next.task.text}</h2>
            <p>{next.stage.title}</p>
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

      <button type="button" className="hb-danger" onClick={removeHobby}>
        <Trash2 size={16} aria-hidden="true" /> Delete this hobby
      </button>
    </div>
  )
}
