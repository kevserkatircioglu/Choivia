import { describe, expect, it } from 'vitest'
import { weeklyActivity } from './hobbies.js'

describe('weeklyActivity', () => {
  const monday = new Date(2026, 10, 16, 12)

  it('counts unique active days across all hobbies', () => {
    const sunday = new Date(2026, 10, 22, 12)
    const result = weeklyActivity([
      { checkins: ['2026-11-16', '2026-11-17'] },
      { checkins: ['2026-11-16', '2026-11-22'] },
    ], sunday)

    expect(result.activeDays).toBe(3)
    expect(result.days.filter((day) => day.done)).toHaveLength(3)
  })

  it('uses Monday through Sunday', () => {
    const result = weeklyActivity([], monday)

    expect(result.days).toHaveLength(7)
    expect(result.days[0].key).toBe('2026-11-16')
    expect(result.days[6].key).toBe('2026-11-22')
    expect(result.days[0].isToday).toBe(true)
    expect(result.days[1].future).toBe(true)
  })

  it('does not count future or out-of-week check-ins', () => {
    const thursday = new Date(2026, 10, 19, 12)
    const result = weeklyActivity([
      { checkins: ['2026-11-15', '2026-11-18', '2026-11-22', '2026-11-23'] },
    ], thursday)

    expect(result.activeDays).toBe(1)
    expect(result.days[2].done).toBe(true)
    expect(result.days[6].done).toBe(false)
  })

  it('handles missing hobby records safely', () => {
    expect(weeklyActivity(null, monday).activeDays).toBe(0)
    expect(weeklyActivity([{}, { checkins: null }], monday).activeDays).toBe(0)
  })
})
