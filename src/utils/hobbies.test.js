import { describe, expect, it } from 'vitest'
import {
  addSession,
  getCheckins,
  getManualCheckins,
  removeSession,
  sessionMinutesForDate,
  toggleCheckinForDate,
} from './hobbies.js'

const baseHobby = {
  id: 'hobby-1',
  checkins: ['2026-11-17'],
  sessions: [],
}

describe('date-based hobby check-ins', () => {
  it('adds a missed past day without changing other check-ins', () => {
    const updated = toggleCheckinForDate(baseHobby, '2026-11-16')

    expect(updated.checkins).toEqual(['2026-11-16', '2026-11-17'])
  })

  it('removes only the selected day when toggled again', () => {
    const updated = toggleCheckinForDate(
      { ...baseHobby, checkins: ['2026-11-16', '2026-11-17'] },
      '2026-11-16',
    )

    expect(updated.checkins).toEqual(['2026-11-17'])
  })

  it('does not add duplicate dates', () => {
    const updated = toggleCheckinForDate(baseHobby, '2026-11-17')

    expect(updated.checkins).not.toContain('2026-11-17')
    expect(updated.checkins).toEqual([])
  })

  it('rejects dates that do not use YYYY-MM-DD format', () => {
    expect(() => toggleCheckinForDate(baseHobby, '17/11/2026'))
      .toThrow('Check-in date must use YYYY-MM-DD format.')
  })
})

describe('hobby session creation', () => {
  it('saves a session on a selected past date and adds its check-in', () => {
    const updated = addSession(baseHobby, {
      date: '2026-11-15',
      minutes: '20',
      mood: 'good',
      note: '  Practised slowly.  ',
    })

    expect(updated.checkins).toEqual(['2026-11-15', '2026-11-17'])
    expect(updated.sessions).toHaveLength(1)
    expect(updated.sessions[0]).toMatchObject({
      date: '2026-11-15',
      minutes: 20,
      mood: 'good',
      note: 'Practised slowly.',
    })
  })

  it('does not duplicate the check-in when a session is saved for an already marked day', () => {
    const updated = addSession(baseHobby, {
      date: '2026-11-17',
      minutes: 5,
    })

    expect(updated.checkins).toEqual(['2026-11-17'])
    expect(updated.sessions).toHaveLength(1)
  })

  it('preserves older sessions', () => {
    const hobby = {
      ...baseHobby,
      sessions: [{ id: 'old-session', date: '2026-11-10', minutes: 10, mood: '', note: '' }],
    }

    const updated = addSession(hobby, {
      date: '2026-11-17',
      minutes: 15,
    })

    expect(updated.sessions).toHaveLength(2)
    expect(updated.sessions[0].id).toBe('old-session')
  })

  it('rejects an invalid session date', () => {
    expect(() => addSession(baseHobby, { date: 'yesterday' }))
      .toThrow('Session date must use YYYY-MM-DD format.')
  })
})


describe('hobby session deletion', () => {
  it('removes only the selected session and preserves its check-in', () => {
    const hobby = {
      ...baseHobby,
      checkins: ['2026-11-17'],
      manualCheckins: ['2026-11-17'],
      sessions: [
        { id: 'session-1', date: '2026-11-17', minutes: 20, mood: 'good', note: '' },
      ],
    }

    const updated = removeSession(hobby, 'session-1')

    expect(updated.sessions).toEqual([])
    expect(updated.checkins).toEqual(['2026-11-17'])
  })

  it('preserves other sessions when one session is removed', () => {
    const hobby = {
      ...baseHobby,
      sessions: [
        { id: 'session-1', date: '2026-11-17', minutes: 20 },
        { id: 'session-2', date: '2026-11-16', minutes: 10 },
      ],
    }

    const updated = removeSession(hobby, 'session-1')

    expect(updated.sessions).toEqual([hobby.sessions[1]])
  })
})


describe('derived check-in sources', () => {
  it('migrates old check-ins into manual dates and session dates', () => {
    const legacy = {
      ...baseHobby,
      checkins: ['2026-11-17', '2026-11-16'],
      sessions: [
        { id: 'session-1', date: '2026-11-17', minutes: 15 },
      ],
    }

    expect(getManualCheckins(legacy)).toEqual(['2026-11-16'])
    expect(getCheckins(legacy)).toEqual(['2026-11-16', '2026-11-17'])
  })

  it('uses session dates as practice days', () => {
    const hobby = {
      ...baseHobby,
      checkins: [],
      manualCheckins: [],
      sessions: [
        { id: 'session-1', date: '2026-11-16', minutes: 10 },
        { id: 'session-2', date: '2026-11-17', minutes: 20 },
      ],
    }

    expect(getCheckins(hobby)).toEqual(['2026-11-16', '2026-11-17'])
  })

  it('removing the last session removes only its derived day', () => {
    const legacy = {
      ...baseHobby,
      checkins: ['2026-11-17', '2026-11-16'],
      sessions: [
        { id: 'session-1', date: '2026-11-17', minutes: 15 },
      ],
    }

    const updated = removeSession(legacy, 'session-1')

    expect(updated.checkins).toEqual(['2026-11-16'])
    expect(updated.manualCheckins).toEqual(['2026-11-16'])
  })

  it('does not let a manual toggle erase a session-derived day', () => {
    const hobby = {
      ...baseHobby,
      checkins: [],
      manualCheckins: [],
      sessions: [
        { id: 'session-1', date: '2026-11-17', minutes: 15 },
      ],
    }

    const updated = toggleCheckinForDate(hobby, '2026-11-17')

    expect(updated.checkins).toEqual(['2026-11-17'])
    expect(updated.sessions).toHaveLength(1)
  })

  it('adds and removes a manual historical day independently', () => {
    const added = toggleCheckinForDate(
      { ...baseHobby, checkins: [], manualCheckins: [] },
      '2026-11-16',
    )
    const removed = toggleCheckinForDate(added, '2026-11-16')

    expect(added.manualCheckins).toEqual(['2026-11-16'])
    expect(removed.checkins).toEqual([])
    expect(removed.manualCheckins).toEqual([])
  })

  it('totals saved minutes for one calendar date', () => {
    const hobby = {
      ...baseHobby,
      sessions: [
        { id: 'session-1', date: '2026-11-17', minutes: 10 },
        { id: 'session-2', date: '2026-11-17', minutes: 15 },
        { id: 'session-3', date: '2026-11-16', minutes: 30 },
      ],
    }

    expect(sessionMinutesForDate(hobby, '2026-11-17')).toBe(25)
  })
})
