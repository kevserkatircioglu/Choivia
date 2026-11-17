import { describe, expect, it } from 'vitest'
import {
  filterDiaryMonths,
  getDiarySearchSnippet,
  matchesDiarySearch,
  normalizeDiarySearch,
} from './diarySearch.js'

describe('diary search', () => {
  it('normalizes case, whitespace, and combining marks', () => {
    expect(normalizeDiarySearch('  İSTANBUL\n Güzel  ')).toBe('istanbul guzel')
  })

  it('treats an empty query as no filter', () => {
    expect(matchesDiarySearch('A quiet day', '')).toBe(true)
    expect(matchesDiarySearch('A quiet day', '   ')).toBe(true)
  })

  it('returns false when the text does not contain the query', () => {
    expect(matchesDiarySearch('A quiet day', 'holiday')).toBe(false)
  })

  it('matches Turkish dotted and dotless I correctly', () => {
    expect(matchesDiarySearch('İzmir is beautiful', 'izmir')).toBe(true)
    expect(matchesDiarySearch('Işıklar were on', 'ışık')).toBe(true)
    expect(matchesDiarySearch('Işıklar were on', 'işık')).toBe(false)
  })

  it('filters month groups and removes groups without matches', () => {
    const months = [
      { key: '2026-11', items: ['2026-11-17', '2026-11-16'] },
      { key: '2026-10', items: ['2026-10-30'] },
    ]
    const entries = {
      '2026-11-17': { text: 'A quiet walk by the sea' },
      '2026-11-16': { text: 'Finished a book today' },
      '2026-10-30': { text: 'A sunny afternoon in İzmir' },
    }

    expect(filterDiaryMonths(months, entries, 'book')).toEqual([
      { key: '2026-11', items: ['2026-11-16'] },
    ])
  })

  it('returns the original month groups for an empty query', () => {
    const months = [{ key: '2026-11', items: ['2026-11-17'] }]
    expect(filterDiaryMonths(months, {}, '')).toBe(months)
  })

  it('returns null for a query with no match', () => {
    expect(getDiarySearchSnippet('A quiet day', 'busy')).toBeNull()
  })

  it('returns the original matching text for highlighting', () => {
    expect(getDiarySearchSnippet('A walk through İzmir today', 'izmir')).toEqual({
      leading: false,
      before: 'A walk through ',
      match: 'İzmir',
      after: ' today',
      trailing: false,
    })
  })
})
