import { describe, expect, it } from 'vitest'
import { milestoneTitle } from './hobbies.js'

describe('milestoneTitle', () => {
  it('returns readable names for every milestone', () => {
    expect(milestoneTitle(1)).toBe('First practice')
    expect(milestoneTitle(3)).toBe('Three days in')
    expect(milestoneTitle(7)).toBe('One week of practice')
    expect(milestoneTitle(14)).toBe('Two weeks of practice')
    expect(milestoneTitle(30)).toBe('One month of practice')
    expect(milestoneTitle(50)).toBe('50 days of practice')
    expect(milestoneTitle(100)).toBe('100 days of practice')
  })
})
