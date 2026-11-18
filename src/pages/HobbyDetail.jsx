import { useEffect, useRef, useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import { ArrowLeft, ChevronDown, Heart, MoreHorizontal, Play, Trash2 } from 'lucide-react'
import Icon from '../components/Icon.jsx'
import PlantIllustration from '../components/PlantIllustration.jsx'
import { getHobbyTheme } from '../utils/hobbyTheme.js'
import { getMotionPreference } from '../utils/motionPreference.js'
import { useStored } from '../lib/useStored.js'
import { achievementProgress, achievementsFor, applyAchievements } from '../utils/achievements.js'
import {
  MILESTONES,
  MOODS,
  formatDay,
  heatmap,
  hobbyProgress,
  latestMilestone,
  milestoneTitle,
  nextMilestone,
  nextTask,
  plantStage,
  removeSession,
  sessionsNewestFirst,
  thisWeek,
  toggleCheckinForDate,
  todayKey,
  totalDays,
  totalMinutes,
  uid,
  weekCount,
  weeksStreak,
} from '../utils/hobbies.js'
import {
  applyHobbyIntent,
  completePracticeSession,
  createActiveSession,
  elapsedSessionMinutes,
  needsDurationReview,
} from '../utils/sessions.js'

const plural = (n, word) => `${n} ${word}${n === 1 ? '' : 's'}`
const isTiny = (task) => task.text.startsWith('Just 2 minutes')
const formatElapsed = (seconds) => `${String(Math.floor(seconds / 60)).padStart(2, '0')}:${String(seconds % 60).padStart(2, '0')}`

function SessionFocus({ startedAt, next, plant, motionPreference, onFinish }) {
  const [now, setNow] = useState(0)

  useEffect(() => {
    const interval = window.setInterval(() => setNow(Date.now()), 1000)
    return () => window.clearInterval(interval)
  }, [startedAt])

  const elapsed = Math.max(0, Math.floor((now - startedAt) / 1000))

  return (
    <section className="hb-session-focus" aria-label="Practice session in progress">
      <PlantIllustration
        stage={plant.key}
        size={112}
        motionPreference={motionPreference}
      />
      <p className="eyebrow">A LITTLE TIME FOR YOU</p>
      <h2>{next ? next.task.text : 'Explore your hobby at your own pace.'}</h2>
      <p className="hb-session-focus-stage">
        {next
          ? `${next.stage.title}${next.task.minutes > 0 ? ` · about ${next.task.minutes} min` : ''}`
          : 'There is no assigned step. Enjoy exploring.'}
      </p>
      {next?.task.tip && <p className="hb-session-focus-tip">{next.task.tip}</p>}
      <p className="hb-session-clock" aria-hidden="true">{formatElapsed(elapsed)}</p>
      <button type="button" className="hb-primary" onClick={onFinish}>
        Finish session
      </button>
    </section>
  )
}

const TABS = [
  { id: 'today', label: 'Today' },
  { id: 'roadmap', label: 'Roadmap' },
  { id: 'progress', label: 'Progress' },
]

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
  const [activeSession, setActiveSession] = useStored(`choivia:active-session:${user.id}`, null)
  const motionPreference = getMotionPreference(user.id)
  const [drafts, setDrafts] = useState({})
  const [stageDraft, setStageDraft] = useState('')
  const [status, setStatus] = useState('')
  const [celebration, setCelebration] = useState([])
  const [minutes, setMinutes] = useState('')
  const [mood, setMood] = useState('')
  const [note, setNote] = useState('')
  const [logError, setLogError] = useState('')
  const sessionStartedAt = activeSession?.hobbyId === hobbyId
    ? activeSession.startedAt
    : null
  const [sessionDate, setSessionDate] = useState(null)
  const [sessionSheetOpen, setSessionSheetOpen] = useState(false)
  const [sessionMode, setSessionMode] = useState('timed')
  const [longSession, setLongSession] = useState(false)
  const [completeNextStep, setCompleteNextStep] = useState(false)
  const [whyDraft, setWhyDraft] = useState('')
  const [reminderDraft, setReminderDraft] = useState('')
  const [makeStickDismissed, setMakeStickDismissed] = useState(false)
  const [sessionReward, setSessionReward] = useState(null)
  const [showDiaryShortcut, setShowDiaryShortcut] = useState(false)
  const [showAll, setShowAll] = useState(false)
  const [achievementFilter, setAchievementFilter] = useState('all')
  const [openAchievementGroup, setOpenAchievementGroup] = useState('consistency')
  const [undoTask, setUndoTask] = useState(null)
  const [undoSession, setUndoSession] = useState(null)
  const [activeTab, setActiveTab] = useState('today')
  const sessionSheetRef = useRef(null)

  useEffect(() => {
    if (!undoTask) return undefined
    const timeout = window.setTimeout(() => setUndoTask(null), 7000)
    return () => window.clearTimeout(timeout)
  }, [undoTask])

  useEffect(() => {
    if (!status) return undefined
    const timeout = window.setTimeout(() => setStatus(''), 4000)
    return () => window.clearTimeout(timeout)
  }, [status])

  useEffect(() => {
    if (!sessionReward) return undefined
    const timeout = window.setTimeout(() => setSessionReward(null), 2200)
    return () => window.clearTimeout(timeout)
  }, [sessionReward])

  useEffect(() => {
    if (!undoSession) return undefined
    const timeout = window.setTimeout(() => setUndoSession(null), 7000)
    return () => window.clearTimeout(timeout)
  }, [undoSession])

  // Keep keyboard focus inside the completion dialog and restore it on close.
  useEffect(() => {
    if (!sessionSheetOpen) return undefined

    const dialog = sessionSheetRef.current
    if (!dialog) return undefined

    const previousFocus = document.activeElement
    const selector = [
      'a[href]',
      'button:not([disabled])',
      'input:not([disabled])',
      'textarea:not([disabled])',
      'select:not([disabled])',
      '[tabindex]:not([tabindex="-1"])',
    ].join(', ')

    const getFocusable = () => Array.from(dialog.querySelectorAll(selector))
      .filter((element) => !element.hasAttribute('hidden')
        && element.getAttribute('aria-hidden') !== 'true')

    const minutesInput = dialog.querySelector('input[type="number"]')
    const firstFocusable = minutesInput || getFocusable()[0]
    firstFocusable?.focus()

    function handleDialogKeyDown(event) {
      if (event.key === 'Escape') {
        event.preventDefault()
        setSessionSheetOpen(false)
        return
      }

      if (event.key !== 'Tab') return

      const items = getFocusable()
      if (!items.length) {
        event.preventDefault()
        dialog.focus()
        return
      }

      const first = items[0]
      const last = items[items.length - 1]

      if (event.shiftKey && document.activeElement === first) {
        event.preventDefault()
        last.focus()
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault()
        first.focus()
      } else if (!dialog.contains(document.activeElement)) {
        event.preventDefault()
        first.focus()
      }
    }

    dialog.addEventListener('keydown', handleDialogKeyDown)

    return () => {
      dialog.removeEventListener('keydown', handleDialogKeyDown)
      if (previousFocus instanceof HTMLElement && previousFocus.isConnected) {
        previousFocus.focus()
      }
    }
  }, [sessionSheetOpen])

  const hobby = hobbies.find((item) => item.id === hobbyId)

  if (!hobby) {
    return (
      <div className="hb-page">
        <p>We couldn’t find that hobby.</p>
        <Link to="/hobbies" className="text-link">Back to hobbies</Link>
      </div>
    )
  }

  const isSessionRunning = Boolean(sessionStartedAt && !sessionSheetOpen)
  const otherActiveHobby = activeSession && activeSession.hobbyId !== hobby.id
    ? hobbies.find((item) => item.id === activeSession.hobbyId)
    : null

  const progress = hobbyProgress(hobby)
  const next = nextTask(hobby)
  const taskCount = (hobby.stages ?? []).reduce(
    (sum, stage) => sum + (stage.tasks?.length ?? 0),
    0,
  )
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
  const sessions = sessionsNewestFirst(hobby)
  const shownSessions = showAll ? sessions : sessions.slice(0, 5)
  const practiceWeeks = heatmap(hobby)
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

  function removeTask(stageId, taskId) {
    const targetStage = hobby.stages.find((stage) => stage.id === stageId)
    if (!targetStage) return

    const index = targetStage.tasks.findIndex((task) => task.id === taskId)
    if (index < 0) return

    const task = targetStage.tasks[index]
    setUndoTask({ stageId, task, index })

    mapStage(stageId, (stage) => ({
      ...stage,
      tasks: stage.tasks.filter((item) => item.id !== taskId),
    }))
  }

  function undoRemoveTask() {
    if (!undoTask) return

    const removed = undoTask
    mapStage(removed.stageId, (stage) => {
      if (stage.tasks.some((task) => task.id === removed.task.id)) return stage

      const tasks = [...stage.tasks]
      tasks.splice(Math.min(removed.index, tasks.length), 0, removed.task)
      return { ...stage, tasks }
    })

    setUndoTask(null)
    setStatus('Step restored to your roadmap.')
  }

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

  function startSession() {
    if (activeSession && activeSession.hobbyId !== hobby.id) {
      const otherName = hobbies.find((item) => item.id === activeSession.hobbyId)?.name
        ?? 'another hobby'
      setStatus(`A session is already running for ${otherName}. Finish that one first.`)
      return
    }

    setSessionMode('timed')
    setSessionDate(null)
    setMinutes('')
    setMood('')
    setNote('')
    setLogError('')
    setLongSession(false)
    setCompleteNextStep(false)
    setSessionReward(null)
    setShowDiaryShortcut(false)
    setActiveSession(createActiveSession(hobby.id))
    setStatus('')
  }

  function openManualLog() {
    setSessionMode('manual')
    setSessionDate(todayKey())
    setMinutes('')
    setMood('')
    setNote('')
    setLogError('')
    setLongSession(false)
    setCompleteNextStep(false)
    setSessionSheetOpen(true)
  }

  function finishSession() {
    if (!sessionStartedAt) return

    const elapsedMinutes = elapsedSessionMinutes(sessionStartedAt)
    setSessionDate(activeSession?.date || todayKey())
    setSessionMode('timed')
    setLongSession(needsDurationReview(elapsedMinutes))
    setMinutes(needsDurationReview(elapsedMinutes) ? '' : String(elapsedMinutes))
    setLogError('')
    setSessionSheetOpen(true)
  }

  function resumeSession() {
    setSessionSheetOpen(false)
  }

  function cancelManualLog() {
    setSessionSheetOpen(false)
    setSessionDate(null)
    setLogError('')
  }

  function completeSession(event) {
    event.preventDefault()

    const duration = Number(minutes)
    if (!Number.isFinite(duration) || duration < 1 || duration > 600) {
      setLogError('Enter a duration between 1 and 600 minutes.')
      return
    }

    const date = sessionDate || activeSession?.date || todayKey()
    const previousDays = totalDays(hobby)
    const updated = completePracticeSession(hobby, {
      date,
      minutes: duration,
      mood,
      note,
      completeNextStep,
    })

    save(updated)

    const nextDays = totalDays(updated)
    const beforePlant = plantStage(previousDays)
    const afterPlant = plantStage(nextDays)

    setSessionReward({
      minutes: duration,
      previousDays,
      nextDays,
      previousPlant: beforePlant.current,
      currentPlant: afterPlant.current,
      nextPlant: afterPlant.next,
      previousRemaining: beforePlant.next
        ? beforePlant.next.min - previousDays
        : 0,
      remaining: afterPlant.next ? afterPlant.next.min - nextDays : 0,
      percent: afterPlant.next
        ? Math.round(
            ((nextDays - afterPlant.current.min)
              / (afterPlant.next.min - afterPlant.current.min)) * 100,
          )
        : 100,
    })

    setStatus(
      MILESTONES.includes(nextDays) && nextDays > previousDays
        ? `A lovely milestone: ${plural(nextDays, 'practice day')} for ${hobby.name}.`
        : `Session saved. ${plural(nextDays, 'practice day')} so far. Every little step counts.`,
    )

    if (activeSession?.hobbyId === hobby.id) {
      setActiveSession(null)
    }

    setMinutes('')
    setMood('')
    setNote('')
    setLogError('')
    setLongSession(false)
    setCompleteNextStep(false)
    setSessionDate(null)
    setSessionSheetOpen(false)
    setSessionMode('timed')
    setActiveTab('today')
    setShowDiaryShortcut(true)
    setMakeStickDismissed(false)
  }

  function saveMakeItStick(event) {
    event.preventDefault()

    if (!whyDraft.trim() && !reminderDraft) return

    save(applyHobbyIntent(hobby, {
      why: whyDraft,
      reminderTime: reminderDraft,
    }))

    setWhyDraft('')
    setReminderDraft('')
    setStatus('Your reason and reminder are saved.')
  }

  function removeLogEntry(sessionId) {
    const index = (hobby.sessions ?? []).findIndex((entry) => entry.id === sessionId)
    if (index < 0) return

    const entry = hobby.sessions[index]
    setUndoSession({ entry, index })
    save(removeSession(hobby, sessionId))
  }

  function undoRemoveSession() {
    if (!undoSession) return

    const { entry, index } = undoSession
    const sessions = [...(hobby.sessions ?? [])]

    if (!sessions.some((item) => item.id === entry.id)) {
      sessions.splice(Math.min(index, sessions.length), 0, entry)
      save({ ...hobby, sessions })
    }

    setUndoSession(null)
    setStatus('Practice entry restored.')
  }

  function togglePastDay(key) {
    if (key >= todayKey()) return

    const updated = toggleCheckinForDate(hobby, key)
    const added = updated.checkins.includes(key)
    save(updated)
    setStatus(
      added
        ? `Added ${formatDay(key)}. No guilt, just progress.`
        : `Removed the check-in for ${formatDay(key)}.`,
    )
  }

  function handleTabKeyDown(event) {
    const currentIndex = TABS.findIndex((tab) => tab.id === activeTab)
    const targetIndex = {
      ArrowRight: (currentIndex + 1) % TABS.length,
      ArrowLeft: (currentIndex - 1 + TABS.length) % TABS.length,
      Home: 0,
      End: TABS.length - 1,
    }[event.key]

    if (targetIndex === undefined) return

    event.preventDefault()
    const targetTab = TABS[targetIndex]
    setActiveTab(targetTab.id)
    document.getElementById(`hb-tab-${targetTab.id}`)?.focus()
  }

  function removeHobby() {
    if (!window.confirm(`Delete “${hobby.name}” and all its progress? This cannot be undone.`)) return
    setHobbies(hobbies.filter((item) => item.id !== hobby.id))
    navigate('/hobbies')
  }

  return (
    <div className="hb-page hb-detail-page" data-hobby-theme={getHobbyTheme(hobby)}>
      <Link to="/hobbies" className="back-link">
        <ArrowLeft size={16} aria-hidden="true" /> All hobbies
      </Link>

      <header className="hb-detail-head">
        <span className="hb-emoji hb-emoji-xl" aria-hidden="true"><Icon name={hobby.emoji} size={46} /></span>
        <div className="hb-detail-title">
          <div className="hb-detail-title-row">
            <h1>{hobby.name}</h1>
            {!isSessionRunning && (
              <div className="hb-checkin-dock hb-detail-inline-actions">
                <button
                  type="button"
                  className="hb-checkin"
                  aria-label="Start session"
                  disabled={Boolean(otherActiveHobby)}
                  onClick={startSession}
                >
                  <Play size={15} fill="currentColor" aria-hidden="true" />
                  <span className="hb-action-label-wide">Start session</span>
                  <span className="hb-action-label-short">Start</span>
                </button>
                <button
                  type="button"
                  className="hb-log-it"
                  aria-label="Already practised? Log it"
                  onClick={openManualLog}
                >
                  <span className="hb-action-label-wide">Already practised? Log it</span>
                  <span className="hb-action-label-short">Log it</span>
                </button>
              </div>
            )}
            <details className="hb-detail-menu">
              <summary aria-label={`More options for ${hobby.name}`}>
                <MoreHorizontal size={22} aria-hidden="true" />
              </summary>
              <div className="hb-detail-menu-panel">
                <p className="eyebrow">GOAL AND REMINDER</p>
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
                <button type="button" className="hb-danger" onClick={removeHobby}>
                  <Trash2 size={16} aria-hidden="true" /> Delete this hobby
                </button>
              </div>
            </details>
          </div>
          {hobby.why && (
            <p className="hb-why"><Heart size={15} aria-hidden="true" /> {hobby.why}</p>
          )}
        </div>


      </header>

      <nav className="hb-tabs" hidden={isSessionRunning} role="tablist" aria-label={`${hobby.name} sections`}>
        {TABS.map((tab) => (
          <button
            key={tab.id}
            type="button"
            role="tab"
            id={`hb-tab-${tab.id}`}
            aria-controls={`hb-panel-${tab.id}`}
            aria-selected={activeTab === tab.id}
            tabIndex={activeTab === tab.id ? 0 : -1}
            className={activeTab === tab.id ? 'active' : ''}
            onClick={() => setActiveTab(tab.id)}
            onKeyDown={handleTabKeyDown}
          >
            {tab.label}
          </button>
        ))}
      </nav>

      {isSessionRunning ? (
        <SessionFocus
          startedAt={sessionStartedAt}
          next={next}
          plant={plantStage(days).current}
          motionPreference={motionPreference}
          onFinish={finishSession}
        />
      ) : (
        <>
          {otherActiveHobby && (
            <p className="hb-active-session-notice">
              A session is already running for {otherActiveHobby.name}.{' '}
              <Link to={`/hobbies/${otherActiveHobby.id}`}>Return to that session</Link>
            </p>
          )}
        </>
      )}

      <p className="hb-status" role="status" hidden={isSessionRunning}>{status}</p>

      {undoTask && (
        <div className="hb-undo-toast" role="status" aria-live="polite">
          <span>Step removed</span>
          <button type="button" onClick={undoRemoveTask}>Undo</button>
        </div>
      )}

      {undoSession && (
        <div className="hb-undo-toast hb-undo-session-toast" role="status" aria-live="polite">
          <span>Practice entry removed</span>
          <button type="button" onClick={undoRemoveSession}>Undo</button>
        </div>
      )}

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

      <section
        className="hb-tab-panel hb-today-tab"
        id="hb-panel-today"
        role="tabpanel"
        aria-labelledby="hb-tab-today"
        hidden={activeTab !== 'today' || isSessionRunning}
      >
      {sessionReward && (
        <section className="hb-session-reward" aria-live="polite">
          <PlantIllustration
            stage={sessionReward.currentPlant.key}
            size={72}
            motionPreference={motionPreference}
          />
          <div>
            <p className="eyebrow">SESSION SAVED</p>
            <strong>
              {sessionReward.previousPlant.key !== sessionReward.currentPlant.key
                ? `Your plant grew to ${sessionReward.currentPlant.label}!`
                : 'A little more growth.'}
            </strong>
            <small>
              {sessionReward.previousDays} → {sessionReward.nextDays} practice days
              {' · '}{sessionReward.minutes} min added
            </small>
            <span
              className="hb-bar"
              role="progressbar"
              aria-label="Progress to the next plant stage"
              aria-valuemin={0}
              aria-valuemax={100}
              aria-valuenow={sessionReward.percent}
            >
              <span style={{ width: `${sessionReward.percent}%` }} />
            </span>
            <small>
              {sessionReward.nextPlant
                ? sessionReward.previousPlant.key !== sessionReward.currentPlant.key
                  ? `${sessionReward.remaining} days until ${sessionReward.nextPlant.label}`
                  : `${sessionReward.previousRemaining} → ${sessionReward.remaining} days until ${sessionReward.nextPlant.label}`
                : 'Your plant is fully grown.'}
            </small>
          </div>
        </section>
      )}

      <section className="hb-panel" aria-label="This week">
        <div className="hb-panel-row">
          <div>
            <strong className="hb-big">{doneThisWeek}<span> / {goal}</span></strong>
            <small>days this week</small>
          </div>
        </div>

        <div className="hb-week" aria-label="This week, Monday to Sunday">
          {thisWeek(hobby).map((day) => {
            const isPast = day.key < todayKey()
            return (
              <button
                key={day.key}
                type="button"
                className={`${day.done ? 'on' : ''}${day.isToday ? ' today' : ''}${day.future ? ' future' : ''}`}
                disabled={!isPast}
                onClick={() => togglePastDay(day.key)}
                aria-label={
                  isPast
                    ? `${day.done ? 'Undo check-in' : 'Add a missed check-in'} for ${formatDay(day.key)}`
                    : `${day.label}${day.isToday ? ', today' : ', upcoming'}`
                }
                title={
                  isPast
                    ? day.done ? 'Tap to undo this check-in' : 'Tap if you forgot to check in'
                    : undefined
                }
              >
                <i aria-hidden="true">{day.done && <Icon name="check" size={14} />}</i>
                <small>{day.label}</small>
                <span className="sr-only">{day.key}: {day.done ? 'practiced' : 'not practiced'}</span>
              </button>
            )
          })}
        </div>

        <p className="hb-goal-line">
          {doneThisWeek >= goal
            ? <><Icon name="star" size={16} /> You met your goal this week.</>
            : `${plural(goal - doneThisWeek, 'more day')} to reach your weekly goal.`}
          {streak > 0 && ` · ${plural(streak, 'week')} in a row`}
        </p>
        <p className="hb-hint">Tap a past day to add or undo a missed check-in. Your streak counts weeks, not days.</p>
      </section>



      <section className="hb-plant" aria-label="Your plant">
        <PlantIllustration stage={plant.key} size={104} className="hb-plant-visual" motionPreference={motionPreference} />
        <div>
          <strong>{plant.label}</strong>
          <small>
            {plural(days, 'practice day')}
            {totalMinutes(hobby) > 0 && ` · ${totalMinutes(hobby) < 60 ? `${totalMinutes(hobby)} min logged` : `${hours} h logged`}`}
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

      {sessions.length > 0
        && (!hobby.why || !hobby.reminderTime)
        && !makeStickDismissed && (
          <form className="hb-make-stick" onSubmit={saveMakeItStick}>
            <div>
              <p className="eyebrow">MAKE IT STICK</p>
              <strong>A small reminder of why this matters.</strong>
              <p>Add a reason or a gentle reminder. Both are optional.</p>
            </div>
            {!hobby.why && (
              <label className="hb-field">
                <span>Why does this hobby matter to you?</span>
                <input
                  value={whyDraft}
                  maxLength={120}
                  onChange={(event) => setWhyDraft(event.target.value)}
                  placeholder="e.g. I want to play for my family"
                />
              </label>
            )}
            {!hobby.reminderTime && (
              <label className="hb-field">
                <span>A gentle reminder</span>
                <input
                  type="time"
                  value={reminderDraft}
                  onChange={(event) => setReminderDraft(event.target.value)}
                />
              </label>
            )}
            <div className="hb-make-stick-actions">
              <button type="submit" className="hb-primary">
                Save details
              </button>
              <button
                type="button"
                className="hb-secondary"
                onClick={() => setMakeStickDismissed(true)}
              >
                Not now
              </button>
            </div>
          </form>
        )}

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
              {!isTiny(next.task) && (
                <details className="hb-task-menu hb-next-menu">
                  <summary aria-label={`More options for ${next.task.text}`}>
                    <MoreHorizontal size={20} aria-hidden="true" />
                  </summary>
                  <div>
                    <button
                      type="button"
                      onClick={(event) => {
                        event.currentTarget.closest('details')?.removeAttribute('open')
                        makeSmaller(next.stage.id, next.task)
                      }}
                    >
                      Make it smaller
                    </button>
                  </div>
                </details>
              )}
            </div>
          </>
        ) : taskCount === 0 ? (
          <>
            <h2>What is your first tiny step?</h2>
            <p>Add something small enough to do in two minutes.</p>
            <button
              type="button"
              className="hb-primary"
              onClick={() => setActiveTab('roadmap')}
            >
              Add a step
            </button>
          </>
        ) : (
          <>
            <h2><Icon name="party-popper" size={22} /> Every step is complete.</h2>
            <button
              type="button"
              className="hb-secondary"
              onClick={() => setActiveTab('roadmap')}
            >
              Add new steps
            </button>
          </>
        )}
      </section>

      {showDiaryShortcut && (
        <p className="hb-diary-bridge">
          A moment worth keeping?
          <Link to="/diary">Write about it in your diary</Link>
        </p>
      )}
      </section>

      <section
        className="hb-tab-panel hb-roadmap-tab"
        id="hb-panel-roadmap"
        role="tabpanel"
        aria-labelledby="hb-tab-roadmap"
        hidden={activeTab !== 'roadmap' || isSessionRunning}
      >
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
                      <details className="hb-task-menu">
                        <summary aria-label={`Options for ${task.text}`}>
                          <MoreHorizontal size={19} aria-hidden="true" />
                        </summary>
                        <div>
                          {!isTiny(task) && (
                            <button
                              type="button"
                              onClick={(event) => {
                                event.currentTarget.closest('details')?.removeAttribute('open')
                                makeSmaller(stage.id, task)
                              }}
                            >
                              Make it smaller
                            </button>
                          )}
                          <button
                            type="button"
                            onClick={(event) => {
                              event.currentTarget.closest('details')?.removeAttribute('open')
                              removeTask(stage.id, task.id)
                            }}
                          >
                            Remove step
                          </button>
                        </div>
                      </details>
                    </div>
                    {!task.done &&
                      next?.stage.id === stage.id &&
                      next?.task.id === task.id &&
                      task.tip && (
                        <details className="hb-tip">
                          <summary>Need help?</summary>
                          <p>{task.tip}</p>
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
      </section>

      <section
        className="hb-tab-panel hb-progress-tab"
        id="hb-panel-progress"
        role="tabpanel"
        aria-labelledby="hb-tab-progress"
        hidden={activeTab !== 'progress' || isSessionRunning}
      >
      {days > 0 && (
        <section className="hb-achievement-section" aria-labelledby="hb-achievements-title">
        <div className="hb-achievement-top">
          <div>
            <h2 id="hb-achievements-title" className="hb-h2">Achievements</h2>
            <p>{unlockedCount} of {trophies.length} unlocked</p>
          </div>
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
                            ) : progress?.hint && progress.hint !== item.description ? (
                              <small className="hb-trophy-locked">{progress.hint}</small>
                            ) : null}
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
      )}

      <h2 className="hb-h2">Your last 12 weeks</h2>
      <div className="hb-heatmap-frame">
        <div className="hb-heatmap-day-labels" aria-hidden="true">
          <span />
          <span>M</span>
          <span />
          <span>W</span>
          <span />
          <span>F</span>
          <span />
        </div>

        <div
          className="hb-heatmap"
          role="img"
          aria-label={`Practice calendar for the last 12 weeks. ${plural(days, 'practice day')} in total.`}
        >
          {practiceWeeks.map((week, index) => {
            const date = new Date(`${week[0].key}T12:00:00`)
            const previous = index > 0
              ? new Date(`${practiceWeeks[index - 1][0].key}T12:00:00`)
              : null
            const isNewMonth = !previous ||
              date.getMonth() !== previous.getMonth() ||
              date.getFullYear() !== previous.getFullYear()
            const monthLabel = isNewMonth
              ? date.toLocaleDateString('en-GB', { month: 'short' })
              : ''

            return (
              <div key={week[0].key} className="hb-heat-col">
                <span className="hb-heat-month" aria-hidden="true">{monthLabel}</span>
                {week.map((day) => (
                  <span
                    key={day.key}
                    className={`hb-heat${day.done ? ' on' : ''}${day.future ? ' future' : ''}`}
                    title={`${formatDay(day.key)}${day.done ? ': practiced' : ''}`}
                  />
                ))}
              </div>
            )
          })}
        </div>
      </div>

      <h2 className="hb-h2">Practice log</h2>
      {sessions.length === 0 ? (
        <div className="hb-log-empty">
          <span aria-hidden="true">✍️</span>
          <div>
            <strong>Your practice notes will live here.</strong>
            <p>Your first saved session will light up this space.</p>
          </div>
        </div>
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
                      onClick={() => removeLogEntry(entry.id)}
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

      </section>

      {sessionSheetOpen && (
        <div className="hb-session-overlay">
          <form
            ref={sessionSheetRef}
            className="hb-session-sheet"
            onSubmit={completeSession}
            role="dialog"
            aria-modal="true"
            aria-labelledby="hb-session-title"
          >
            <div className="hb-session-head">
              <PlantIllustration stage={plant.key} size={76} motionPreference={motionPreference} />
              <div>
                <p className="eyebrow">
                  {sessionMode === 'manual' ? 'QUICK PRACTICE LOG' : 'SESSION COMPLETE'}
                </p>
                <h2 id="hb-session-title">
                  {sessionMode === 'manual'
                    ? 'Already practised? Let’s save it.'
                    : 'You showed up. That matters.'}
                </h2>
                <p>
                  {sessionMode === 'manual'
                    ? 'Add a few details about the time you already spent.'
                    : 'Take a moment to celebrate the practice you did.'}
                </p>
              </div>
            </div>

            {next && (
              <div className="hb-session-step">
                <strong>Did you finish your next small step?</strong>
                <div role="group" aria-label="Did you finish the next step?" className="hb-session-choice">
                  <button
                    type="button"
                    className={completeNextStep ? 'active' : ''}
                    aria-pressed={completeNextStep}
                    onClick={() => setCompleteNextStep(true)}
                  >
                    Yes, I did
                  </button>
                  <button
                    type="button"
                    className={!completeNextStep ? 'active' : ''}
                    aria-pressed={!completeNextStep}
                    onClick={() => setCompleteNextStep(false)}
                  >
                    Not yet
                  </button>
                </div>
              </div>
            )}

            <label className="hb-field">
              <span>How many minutes?</span>
              <input
                type="number"
                min="0"
                max="600"
                inputMode="numeric"
                value={minutes}
                onChange={(event) => setMinutes(event.target.value)}
              />
            </label>

            {longSession && (
              <p className="hb-session-long-warning" role="alert">
                This session seems unusually long. How many minutes did you actually practise?
              </p>
            )}

            {sessionMode === 'manual' && (
              <div className="hb-field">
                <span>Quick add</span>
                <div className="hb-session-presets">
                  {[10, 20, 30, 45].map((value) => (
                    <button
                      key={value}
                      type="button"
                      className={`hb-chip${minutes === String(value) ? ' on' : ''}`}
                      aria-pressed={minutes === String(value)}
                      onClick={() => setMinutes(String(value))}
                    >
                      {value} min
                    </button>
                  ))}
                </div>
              </div>
            )}

            <div className="hb-field">
              <span id="hb-session-mood">How did it feel?</span>
              <div className="hb-chips" role="group" aria-labelledby="hb-session-mood">
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
              <span>A note for future you <em>(optional)</em></span>
              <textarea
                rows={3}
                value={note}
                maxLength={300}
                onChange={(event) => setNote(event.target.value)}
                placeholder="What did you practice? What felt good or hard?"
              />
            </label>

            {logError && <p className="hb-error" role="alert">{logError}</p>}

            <div className="hb-session-actions">
              {sessionMode === 'manual' ? (
                <button type="button" className="hb-secondary" onClick={cancelManualLog}>
                  Cancel
                </button>
              ) : (
                <button type="button" className="hb-secondary" onClick={resumeSession}>
                  Keep going
                </button>
              )}
              <button type="submit" className="hb-primary">
                Save session
              </button>
            </div>
          </form>
        </div>
      )}

    </div>
  )
}