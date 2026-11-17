import { describe, expect, it } from 'vitest'
import { mainKind, specialsFor } from './specialDays.js'

describe('specialsFor', () => {
  it('returns fixed national holidays', () => {
    expect(specialsFor(2026, 3, 23)).toContainEqual(
      expect.objectContaining({
        type: 'national',
        name: 'National Sovereignty & Children’s Day',
      }),
    )
  })

  it('includes the 2026 religious holidays', () => {
    expect(specialsFor(2026, 2, 20)).toContainEqual(
      expect.objectContaining({
        type: 'religious',
        name: 'Eid al-Fitr (Ramazan Bayramı), day 1',
      }),
    )
  })

  it('includes the 2027 religious holidays', () => {
    expect(specialsFor(2027, 4, 16)).toContainEqual(
      expect.objectContaining({
        type: 'religious',
        name: 'Eid al-Adha (Kurban Bayramı), day 1',
      }),
    )
  })

  it('includes the 2028 religious holidays', () => {
    expect(specialsFor(2028, 1, 27)).toContainEqual(
      expect.objectContaining({
        type: 'religious',
        name: 'Eid al-Fitr (Ramazan Bayramı), day 1',
      }),
    )
  })

  it('marks religious eve days as half-day holidays', () => {
    expect(specialsFor(2026, 2, 19)).toContainEqual(
      expect.objectContaining({
        type: 'religious',
        time: '13:00',
        isHalfDay: true,
      }),
    )
  })

  it('calculates Mother’s Day dynamically', () => {
    expect(specialsFor(2026, 4, 10)).toContainEqual(
      expect.objectContaining({
        name: 'Mother’s Day',
      }),
    )
  })

  it('calculates Father’s Day dynamically', () => {
    expect(specialsFor(2026, 5, 21)).toContainEqual(
      expect.objectContaining({
        name: 'Father’s Day',
      }),
    )
  })

  it('calculates Libraries Week using the last Monday of March', () => {
    expect(specialsFor(2026, 2, 30)).toContainEqual(
      expect.objectContaining({
        type: 'week',
        name: 'Libraries Week',
      }),
    )

    expect(specialsFor(2026, 3, 5)).toContainEqual(
      expect.objectContaining({
        name: 'Libraries Week',
      }),
    )

    expect(
      specialsFor(2026, 2, 29).some(
        (item) => item.name === 'Libraries Week',
      ),
    ).toBe(false)
  })

  it('returns an empty array for invalid dates', () => {
    expect(specialsFor(2026, 12, 1)).toEqual([])
    expect(specialsFor(2026, 1, 30)).toEqual([])
    expect(specialsFor(2026, 2, 0)).toEqual([])
  })

  it('prioritizes memorial and national days for calendar icons', () => {
    expect(
      mainKind([
        { type: 'week', name: 'Example Week' },
        { type: 'religious', name: 'Example Holiday' },
        { type: 'national', name: 'Example National Day' },
      ]),
    ).toBe('national')

    expect(mainKind([])).toBeUndefined()
  })
})
