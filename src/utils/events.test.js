import { describe, expect, it } from 'vitest'
import { upcomingEvents, whenLabel } from './events.js'

const ev = (date, title) => ({ id: date + title, date, title })
describe('upcomingEvents', () => {
  const list = [ev('2026-11-14', 'past'), ev('2026-11-20', 'b'), ev('2026-11-15', 'today'), ev('2027-03-01', 'far')]
  it('keeps only upcoming events inside the horizon, soonest first', () => {
    expect(upcomingEvents(list, '2026-11-15').map((e) => e.title)).toEqual(['today', 'b'])
  })
  it('respects the limit', () => expect(upcomingEvents(list, '2026-11-15', 45, 1)).toHaveLength(1))
  it('labels days', () => { expect(whenLabel(0)).toBe('Today'); expect(whenLabel(1)).toBe('Tomorrow'); expect(whenLabel(5)).toBe('In 5 days') })
})
