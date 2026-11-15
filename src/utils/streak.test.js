import { describe, expect, it } from 'vitest'
import { computeStreak } from './streak.js'

describe('computeStreak', () => {
  it('ilk giriş seriyi 1 yapar', () => expect(computeStreak(null, '2026-11-15').current).toBe(1))
  it('ardışık gün seriyi artırır', () => {
    const s = computeStreak({ current: 3, best: 3, days: ['2026-11-14'] }, '2026-11-15')
    expect(s.current).toBe(4); expect(s.best).toBe(4)
  })
  it('gün atlanırsa seri 1’e döner, en iyi korunur', () => {
    const s = computeStreak({ current: 5, best: 5, days: ['2026-11-12'] }, '2026-11-15')
    expect(s.current).toBe(1); expect(s.best).toBe(5)
  })
  it('aynı gün tekrar girişte değişmez', () => {
    const p = { current: 2, best: 2, days: ['2026-11-15'] }
    expect(computeStreak(p, '2026-11-15').current).toBe(2)
  })
})
