import { useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import { ArrowLeft, ChevronDown, Heart, Trash2 } from 'lucide-react'
import Icon from '../components/Icon.jsx'
import PlantIllustration from '../components/PlantIllustration.jsx'
import { useStored } from '../lib/useStored.js'
import { CheckinButton } from './Hobbies.jsx'
import { achievementProgress, achievementsFor, applyAchievements } from '../utils/achievements.js'
import {
  MILESTONES,
  MOODS,
  addSession,
  formatDay,
  heatmap,
  hobbyProgress,
  isCheckedToday,
  latestMilestone,
  milestoneTitle,
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
const isTiny = (task) => task.text.startsWith('Just 2 minutes')

const ACHIEVEMENT_GROUPS = [
  {
    id: 'consistency',
    label: 'Consistency',
    matches: (id) => id === 'first-day' || id === 'comeback' || id.startsWith('days-'),
  },
  {
    id: 'roadmap',
    label: 'Roadmap & skills',
    matches: (id) =>
      ['first-step', 'tiny-win', 'stage-one', 'roadmap-done'].includes(id) ||
      /^(violin|guitar|drawing|running)-/.test(id),
  },
  {
    id: 'practice-log',
    label: 'Practice log',
    matches: (id) =>
      ['first-note', 'hard-day', 'long-session'].includes(id) ||
      id.startsWith('hours-'),
  },
  {
    id: 'weekly',
    label: 'Weekly goals',
    matches: (id) => id.startsWith('goal-'),
  },
]

export default function HobbyDetail({ user }) {
  const { hobbyId } = useParams()
  const navigate = useNavigate()
  const [hobbies, setHobbies] = useStored(`choivia:hobbies:${user.id}`, [])
  const [drafts, setDrafts] = useState({})
  const [stageDraft, setStageDraft] = useState('')
  const [status, setStatus] = useState('')
  const [celebration, setCelebration] = useState([])
  const [minutes, setMinutes] = useState('')
  const [mood, setMood] = useState('')
  const [note, setNote] = useState('')
  const [logError, setLogError] = useState('')
  const [showAll, setShowAll] = useState(false)
  const [achievementFilter, setAchievementFilter] = useState('all')
  const [openAchievementGroup, setOpenAchievementGroup] = useState('consistency')

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
  const trophies = achievementsFor(hobby)
  const unlockedCount = trophies.filter((item) => hobby.achievements?.[item.id]).length
  const achievementPercent = trophies.length
    ? Math.round((unlockedCount / trophies.length) * 100)
    : 0

  const achievementGroups = ACHIEVEMENT_GROUPS.map((group) => {
    const allItems = trophies.filter((item) => group.matches(item.id))
    const items = allItems.filter((item) => {
      const unlocked = Boolean(hobby.achievements?.[item.id])
      return achievementFilter === 'all' ||
        (achievementFilter === 'unlocked' && unlocked) ||
        (achievementFilter === 'locked' && !unlocked)
    })

    return {
      ...group,
      items,
      total: allItems.length,
      unlocked: allItems.filter((item) => hobby.achievements?.[item.id]).length,
    }
  }).filter((group) => group.items.length > 0)

  // Her değişiklik buradan geçer: yeni başarım varsa kaydedilir ve kutlanır.
  function save(updated) {
    const { hobby: settled, unlocked } = applyAchievements(updated)
    setHobbies(hobbies.map((item) => (item.id === hobby.id ? settled : item)))
    if (unlocked.length) setCelebration(unlocked)
  }

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

  // Büyük gelen bir adımın önüne 2 dakikalık bir versiyon ekler.
  function makeSmaller(stageId, task) {
    mapStage(stageId, (stage) => {
      const index = stage.tasks.findIndex((item) => item.id === task.id)
      const tiny = {
        id: uid(),
        key: '',
        text: `Just 2 minutes: ${task.text}`,
        minutes: 2,
        tip: 'No pressure. Two minutes counts.',
        done: false,
      }
      const tasks = [...stage.tasks]
      tasks.splice(index, 0, tiny)
      return { ...stage, tasks }
    })
    setStatus('Added a 2-minute version before this step.')
  }

  function addTask(event, stageId) {
    event.preventDefault()
    const text = (drafts[stageId] || '').trim()
    if (!text) return
    mapStage(stageId, (stage) => ({
      ...stage,
      tasks: [...stage.tasks, { id: uid(), key: '', text, minutes: 0, tip: '', done: false }],
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
        ? `Milestone! ${plural(count, 'practice day')} for ${hobby.name}.`
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
        <span className="hb-emoji hb-emoji-xl" aria-hidden="true"><Icon name={hobby.emoji} size={46} /></span>
        <div>
          <h1>{hobby.name}</h1>
          {hobby.why && (
            <p className="hb-why"><Heart size={15} aria-hidden="true" /> {hobby.why}</p>
          )}
        </div>
      </header>

      <p className="hb-status" role="status">{status}</p>

      <div aria-live="polite">
        {celebration.length > 0 && (
          <section className="hb-celebrate" aria-label="New achievement">
            <p className="eyebrow">ACHIEVEMENT UNLOCKED</p>
            <ul>
              {celebration.map((item) => (
                <li key={item.id}>
                  <span className="hb-trophy-emoji" aria-hidden="true"><Icon name={item.emoji} size={28} /></span>
                  <div>
                    <strong>{item.title}</strong>
                    <small>{item.description}</small>
                  </div>
                </li>
              ))}
            </ul>
            <button type="button" className="hb-secondary" onClick={() => setCelebration([])}>Nice!</button>
          </section>
        )}
      </div>

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
              <i aria-hidden="true">{day.done && <Icon name="check" size={14} />}</i>
              <small>{day.label}</small>
              <span className="sr-only">{day.key}: {day.done ? 'practiced' : 'not practiced'}</span>
            </span>
          ))}
        </div>

        <p className="hb-goal-line">
          {doneThisWeek >= goal
            ? <><Icon name="star" size={16} /> You met your goal this week.</>
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
                  <Icon name={item.emoji} size={18} /> {item.label}
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
        <PlantIllustration stage={plant.key} size={76} className="hb-plant-visual" />
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
            {nextPlant ? (
              <>
                {plural(nextPlant.min - days, 'day')} until{' '}
                <PlantIllustration stage={nextPlant.key} size={20} className="hb-inline-plant" />{' '}
                {nextPlant.label}
              </>
            ) : 'Fully grown. Beautiful.'}
          </small>
        </div>
      </section>

      <p className="hb-milestone">
        <Icon name="trophy" size={17} />
        {upcoming
          ? <>Next milestone: {milestoneTitle(upcoming)}, {plural(upcoming - days, 'day')} to go.</>
          : latest
            ? `Latest milestone: ${plural(latest, 'practice day')}.`
            : 'Your first milestone is one practice day away.'}
      </p>

      <section className="hb-next" aria-label="Next small step">
        <p className="eyebrow">YOUR NEXT SMALL STEP</p>
        {next ? (
          <>
            <h2>{next.task.text}</h2>
            <p>
              {next.stage.title}
              {next.task.minutes > 0 && ` · about ${next.task.minutes} min`}
              {` · ${progress.percent}% of the roadmap done`}
            </p>
            {next.task.tip && <p className="hb-tip-line"><Icon name="help" size={16} /> {next.task.tip}</p>}
            <div className="hb-next-actions">
              <button
                type="button"
                className="hb-primary"
                onClick={() => toggleTask(next.stage.id, next.task.id)}
              >
                Mark this step done
              </button>
              {!isTiny(next.task) && (
                <button type="button" className="hb-secondary" onClick={() => makeSmaller(next.stage.id, next.task)}>
                  Make it smaller
                </button>
              )}
            </div>
          </>
        ) : (
          <h2><Icon name="party-popper" size={22} /> You have completed every step. Add new steps below to keep growing.</h2>
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
                    <div className="hb-task-row">
                      <label>
                        <input
                          type="checkbox"
                          checked={task.done}
                          onChange={() => toggleTask(stage.id, task.id)}
                        />
                        <span>
                          {task.text}
                          {task.minutes > 0 && <small className="hb-min">~{task.minutes} min</small>}
                        </span>
                      </label>
                      <button
                        type="button"
                        className="hb-icon-btn"
                        aria-label={`Remove step: ${task.text}`}
                        onClick={() => removeTask(stage.id, task.id)}
                      >
                        ×
                      </button>
                    </div>
                    {!task.done && (task.tip || !isTiny(task)) && (
                      <details className="hb-tip">
                        <summary>Need help?</summary>
                        {task.tip && <p>{task.tip}</p>}
                        {!isTiny(task) && (
                          <button type="button" className="hb-secondary" onClick={() => makeSmaller(stage.id, task)}>
                            Make it smaller
                          </button>
                        )}
                      </details>
                    )}
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

      <section className="hb-achievement-section" aria-labelledby="hb-achievements-title">
        <div className="hb-achievement-top">
          <div>
            <h2 id="hb-achievements-title" className="hb-h2">Achievements</h2>
            <p>{unlockedCount} of {trophies.length} unlocked</p>
          </div>
          <strong>{achievementPercent}%</strong>
        </div>

        <div
          className="hb-achievement-progress"
          role="progressbar"
          aria-label="Achievement progress"
          aria-valuemin={0}
          aria-valuemax={trophies.length}
          aria-valuenow={unlockedCount}
        >
          <span style={{ width: `${achievementPercent}%` }} />
        </div>

        <div className="hb-achievement-filters" role="group" aria-label="Filter achievements">
          {[
            { id: 'all', label: 'All', count: trophies.length },
            { id: 'unlocked', label: 'Unlocked', count: unlockedCount },
            { id: 'locked', label: 'Locked', count: trophies.length - unlockedCount },
          ].map((filter) => (
            <button
              key={filter.id}
              type="button"
              className={achievementFilter === filter.id ? 'active' : ''}
              aria-pressed={achievementFilter === filter.id}
              onClick={() => setAchievementFilter(filter.id)}
            >
              {filter.label} <span>{filter.count}</span>
            </button>
          ))}
        </div>

        <div className="hb-achievement-groups">
          {achievementGroups.map((group) => {
            const isOpen = openAchievementGroup === group.id

            return (
              <section key={group.id} className="hb-achievement-group">
                <button
                  type="button"
                  className="hb-achievement-group-toggle"
                  aria-expanded={isOpen}
                  onClick={() => setOpenAchievementGroup(isOpen ? null : group.id)}
                >
                  <span>
                    <strong>{group.label}</strong>
                    <small>{group.unlocked} of {group.total} unlocked</small>
                  </span>
                  <ChevronDown
                    size={19}
                    className={isOpen ? 'expanded' : ''}
                    aria-hidden="true"
                  />
                </button>

                {isOpen && (
                  <ul className="hb-trophies">
                    {group.items.map((item) => {
                      const date = hobby.achievements?.[item.id]
                      const unlocked = Boolean(date)
                      const progress = unlocked
                        ? null
                        : achievementProgress(hobby, item)

                      return (
                        <li key={item.id} className={unlocked ? 'on' : 'locked'}>
                          <span className="hb-trophy-emoji" aria-hidden="true">
                            <Icon name={item.emoji} size={26} />
                          </span>
                          <div>
                            <strong>{item.title}</strong>
                            <small>{item.description}</small>
                            {unlocked ? (
                              <small className="hb-trophy-date">Unlocked {formatDay(date)}</small>
                            ) : progress?.current !== undefined ? (
                              <div className="hb-trophy-progress">
                                <div className="hb-trophy-progress-label">
                                  <small>
                                    {progress.current}/{progress.target} {progress.unit}
                                  </small>
                                  <small>
                                    {Math.round((progress.current / progress.target) * 100)}%
                                  </small>
                                </div>
                                <div
                                  className="hb-trophy-progress-bar"
                                  role="progressbar"
                                  aria-label={`${item.title} progress`}
                                  aria-valuemin={0}
                                  aria-valuemax={progress.target}
                                  aria-valuenow={progress.current}
                                >
                                  <span
                                    style={{
                                      width: `${(progress.current / progress.target) * 100}%`,
                                    }}
                                  />
                                </div>
                              </div>
                            ) : (
                              <small className="hb-trophy-locked">
                                {progress?.hint || 'Keep practicing.'}
                              </small>
                            )}
                          </div>
                        </li>
                      )
                    })}
                  </ul>
                )}
              </section>
            )
          })}

          {achievementGroups.length === 0 && (
            <p className="hb-hint">There are no achievements in this filter yet.</p>
          )}
        </div>
      </section>

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
                      {moodInfo && <> <Icon name={moodInfo.emoji} size={15} /> {moodInfo.label}</>}
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