import { describe, expect, it } from 'vitest'
import {
  bookCounts,
  bookProgress,
  normalizeBook,
  setBookStatus,
  updateBookPages,
} from './books.js'

describe('book migration', () => {
  it('maps legacy unread books to Want to read', () => {
    const result = normalizeBook({ id: 1, title: 'A book', read: false })

    expect(result.id).toBe(1)
    expect(result.title).toBe('A book')
    expect(result.status).toBe('want')
    expect(result.read).toBe(false)
  })

  it('maps legacy read books to Finished', () => {
    const result = normalizeBook({ id: 2, title: 'Another book', read: true })

    expect(result.status).toBe('finished')
    expect(result.read).toBe(true)
  })

  it('preserves valid new statuses and page counts', () => {
    const result = normalizeBook({
      id: 3,
      title: 'Reading now',
      status: 'reading',
      currentPage: 45,
      totalPages: 300,
    })

    expect(result.status).toBe('reading')
    expect(result.currentPage).toBe(45)
    expect(result.totalPages).toBe(300)
  })
})

describe('book progress', () => {
  it('clamps current page to the total page count', () => {
    const result = normalizeBook({
      title: 'A book',
      status: 'reading',
      currentPage: 500,
      totalPages: 200,
    })

    expect(result.currentPage).toBe(200)
    expect(bookProgress(result)).toBe(100)
  })

  it('returns no percentage when total pages are unknown', () => {
    expect(bookProgress({ status: 'reading', currentPage: 12 })).toBe(null)
  })

  it('updates page counts safely', () => {
    const result = updateBookPages(
      { status: 'reading', currentPage: 20, totalPages: 100 },
      { totalPages: 15 },
    )

    expect(result.currentPage).toBe(15)
    expect(result.totalPages).toBe(15)
  })

  it('resets progress when moving a finished book back to Want to read', () => {
    const result = setBookStatus({
      status: 'finished',
      currentPage: 200,
      totalPages: 200,
    }, 'want')

    expect(result.status).toBe('want')
    expect(result.currentPage).toBe(0)
    expect(result.read).toBe(false)
  })

  it('completes page progress when a book is marked Finished', () => {
    const result = setBookStatus({
      status: 'reading',
      currentPage: 40,
      totalPages: 120,
    }, 'finished')

    expect(result.currentPage).toBe(120)
    expect(result.read).toBe(true)
  })
})

describe('book counts', () => {
  it('counts each status', () => {
    const result = bookCounts([
      { read: false },
      { status: 'reading' },
      { read: true },
      { status: 'finished' },
    ])

    expect(result).toEqual({
      total: 4,
      want: 1,
      reading: 1,
      finished: 2,
    })
  })
})
