import { describe, expect, it } from 'vitest'
import { achievementProgress } from './achievements.js'

const baseHobby = {
  checkins: [],
  sessions: [],
  stages: [],
  goalPerWeek: 3,
}

describe('achievementProgress', () => {
  it('tracks the first practice day', () => {
    expect(
      achievementProgress(
        { ...baseHobby, checkins: ['2026-11-16'] },
        { id: 'first-day' },
      ),
    ).toEqual({ current: 1, target: 1, unit: 'practice days' })
  })

  it('tracks the daily practice milestones', () => {
    expect(
      achievementProgress(
        { ...baseHobby, checkins: ['2026-11-15', '2026-11-16'] },
        { id: 'days-3' },
      ),
    ).toEqual({ current: 2, target: 3, unit: 'practice days' })
  })

  it('tracks total practice time', () => {
    expect(
      achievementProgress(
        {
          ...baseHobby,
          sessions: [{ minutes: 60 }, { minutes: 60 }],
        },
        { id: 'hours-5' },
      ),
    ).toEqual({ current: 120, target: 300, unit: 'total minutes' })
  })

  it('tracks the longest single session', () => {
    expect(
      achievementProgress(
        { ...baseHobby, sessions: [{ minutes: 30 }, { minutes: 20 }] },
        { id: 'long-session' },
      ),
    ).toEqual({ current: 30, target: 45, unit: 'minutes in one session' })
  })

  it('tracks completed roadmap steps', () => {
    expect(
      achievementProgress(
        {
          ...baseHobby,
          stages: [{
            tasks: [
              { done: true },
              { done: false },
              { done: false },
            ],
          }],
        },
        { id: 'roadmap-done' },
      ),
    ).toEqual({ current: 1, target: 3, unit: 'roadmap steps' })
  })

  it('tracks progress within a stage', () => {
    expect(
      achievementProgress(
        {
          ...baseHobby,
          stages: [{
            tasks: [
              { done: true },
              { done: true },
              { done: false },
            ],
          }],
        },
        { id: 'stage-one' },
      ),
    ).toEqual({ current: 2, target: 3, unit: 'steps in a stage' })
  })

  it('tracks template-specific roadmap tasks', () => {
    expect(
      achievementProgress(
        {
          ...baseHobby,
          stages: [{
            tasks: [{ key: 'bow-hold', done: false }],
          }],
        },
        { id: 'violin-bow', key: 'bow-hold' },
      ),
    ).toEqual({ current: 0, target: 1, unit: 'related steps' })
  })

  it('does not invent a percentage for comeback achievements', () => {
    expect(
      achievementProgress(baseHobby, { id: 'comeback' }),
    ).toEqual({
      hint: 'Return after a break of 3 days or more.',
    })
  })

  it('tracks practice notes and weekly goals', () => {
    const noteProgress = achievementProgress(
      { ...baseHobby, sessions: [{ note: 'Good practice' }] },
      { id: 'first-note' },
    )
    expect(noteProgress.current).toBe(1)

    const weekProgress = achievementProgress(
      {
        ...baseHobby,
        checkins: ['2026-11-16'],
        goalPerWeek: 3,
      },
      { id: 'goal-week' },
    )
    expect(weekProgress.target).toBe(3)
    expect(weekProgress.unit).toBe('days this week')
  })
})
