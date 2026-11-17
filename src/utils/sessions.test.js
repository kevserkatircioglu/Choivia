import { describe, expect, it } from 'vitest'
import {
  applyHobbyIntent,
  completePracticeSession,
  createActiveSession,
  elapsedSessionMinutes,
  needsDurationReview,
} from './sessions.js'

const hobby = {
  id: 'hobby-1',
  checkins: [],
  sessions: [],
  why: '',
  reminderTime: '',
  stages: [
    {
      id: 'stage-1',
      title: 'First steps',
      tasks: [
        { id: 'task-1', text: 'Practise the first note', minutes: 5, done: false },
        { id: 'task-2', text: 'Repeat the note', minutes: 5, done: false },
      ],
    },
  ],
}

describe('persistent practice sessions', () => {
  it('stores the hobby, start timestamp and local calendar date', () => {
    const startedAt = new Date(2026, 10, 18, 9, 30).getTime()

    expect(createActiveSession('hobby-1', startedAt)).toEqual({
      hobbyId: 'hobby-1',
      startedAt,
      date: '2026-11-18',
    })
  })

  it('rejects a missing hobby id or invalid timestamp', () => {
    expect(() => createActiveSession('', 1000)).toThrow()
    expect(() => createActiveSession('hobby-1', Number.NaN)).toThrow()
  })

  it('calculates elapsed minutes without depending on component state', () => {
    const startedAt = 1000

    expect(elapsedSessionMinutes(startedAt, startedAt + 120000)).toBe(2)
    expect(elapsedSessionMinutes(startedAt, startedAt)).toBe(1)
  })

  it('asks for duration review when a session exceeds ten hours', () => {
    expect(needsDurationReview(600)).toBe(false)
    expect(needsDurationReview(601)).toBe(true)
  })
})

describe('completed practice sessions', () => {
  it('keeps the start date when a session crosses midnight', () => {
    const startedAt = new Date(2026, 10, 17, 23, 59).getTime()
    const active = createActiveSession('hobby-1', startedAt)

    const updated = completePracticeSession(hobby, {
      date: active.date,
      minutes: 10,
    })

    expect(updated.sessions[0].date).toBe('2026-11-17')
    expect(updated.checkins).toContain('2026-11-17')
  })

  it('completes only the next unfinished roadmap task when requested', () => {
    const updated = completePracticeSession(hobby, {
      date: '2026-11-18',
      minutes: 10,
      completeNextStep: true,
    })

    expect(updated.stages[0].tasks[0].done).toBe(true)
    expect(updated.stages[0].tasks[1].done).toBe(false)
  })

  it('does not complete a roadmap task when the user says not yet', () => {
    const updated = completePracticeSession(hobby, {
      date: '2026-11-18',
      minutes: 10,
      completeNextStep: false,
    })

    expect(updated.stages[0].tasks.every((task) => !task.done)).toBe(true)
  })

  it('saves the reason and reminder separately from a session', () => {
    const updated = applyHobbyIntent(hobby, {
      why: '  I want to play for my family  ',
      reminderTime: '18:30',
    })

    expect(updated.why).toBe('I want to play for my family')
    expect(updated.reminderTime).toBe('18:30')
    expect(updated.sessions).toEqual([])
  })

  it('does not overwrite an existing reason or reminder with empty values', () => {
    const existing = {
      ...hobby,
      why: 'For fun',
      reminderTime: '19:00',
    }

    const updated = applyHobbyIntent(existing, {})

    expect(updated.why).toBe('For fun')
    expect(updated.reminderTime).toBe('19:00')
  })
})
