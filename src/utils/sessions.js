import { addSession, nextTask } from './hobbies.js'

function localDateKey(timestamp) {
  const date = new Date(timestamp)
  const pad = (value) => String(value).padStart(2, '0')

  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}`
}

export function createActiveSession(hobbyId, startedAt = Date.now()) {
  if (typeof hobbyId !== 'string' || !hobbyId.trim()) {
    throw new TypeError('A hobby id is required.')
  }

  if (!Number.isFinite(startedAt)) {
    throw new TypeError('Session start time must be a valid timestamp.')
  }

  return {
    hobbyId,
    startedAt,
    date: localDateKey(startedAt),
  }
}

export function elapsedSessionMinutes(startedAt, now = Date.now()) {
  if (!Number.isFinite(startedAt) || !Number.isFinite(now)) return 0
  return Math.max(1, Math.round(Math.max(0, now - startedAt) / 60000))
}

export function needsDurationReview(minutes) {
  return Number(minutes) > 600
}

export function completePracticeSession(hobby, {
  date,
  minutes,
  mood = '',
  note = '',
  completeNextStep = false,
} = {}) {
  let updated = addSession(hobby, { date, minutes, mood, note })

  if (completeNextStep) {
    const next = nextTask(hobby)

    if (next) {
      updated = {
        ...updated,
        stages: updated.stages.map((stage) => (
          stage.id !== next.stage.id
            ? stage
            : {
                ...stage,
                tasks: stage.tasks.map((task) => (
                  task.id === next.task.id ? { ...task, done: true } : task
                )),
              }
        )),
      }
    }
  }

  return updated
}

export function applyHobbyIntent(hobby, { why = '', reminderTime = '' } = {}) {
  return {
    ...hobby,
    why: why.trim() || hobby.why || '',
    reminderTime: reminderTime || hobby.reminderTime || '',
  }
}
