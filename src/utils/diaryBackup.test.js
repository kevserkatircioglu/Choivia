import { describe, expect, it } from 'vitest'
import { parseImport } from './diaryBackup.js'

describe('parseImport', () => {
  it('reads a versioned Choivia diary backup', () => {
    const raw = JSON.stringify({
      app: 'choivia-diary',
      version: 1,
      entries: {
        '2026-11-16': {
          text: 'A peaceful day.',
          mood: 'good',
          updated: 123,
        },
      },
    })

    expect(parseImport(raw)).toEqual({
      '2026-11-16': {
        text: 'A peaceful day.',
        mood: 'good',
        updated: 123,
      },
    })
  })

  it('supports a plain date-keyed diary object', () => {
    const raw = JSON.stringify({
      '2026-11-15': { text: 'A quiet afternoon.' },
    })

    expect(parseImport(raw)).toEqual({
      '2026-11-15': { text: 'A quiet afternoon.' },
    })
  })

  it('keeps mood-only entries', () => {
    const raw = JSON.stringify({
      entries: {
        '2026-11-15': { text: '', mood: 'great' },
      },
    })

    expect(parseImport(raw)).toEqual({
      '2026-11-15': { text: '', mood: 'great' },
    })
  })

  it('ignores demo entries and invalid dates', () => {
    const raw = JSON.stringify({
      entries: {
        '2026-11-15': { text: 'Demo text.', demo: true },
        '2026-02-30': { text: 'Invalid date.' },
        'not-a-date': { text: 'Invalid key.' },
        '2026-11-14': { text: 'Real page.' },
      },
    })

    expect(parseImport(raw)).toEqual({
      '2026-11-14': { text: 'Real page.' },
    })
  })

  it('rejects malformed JSON', () => {
    expect(() => parseImport('{invalid')).toThrow('not valid JSON')
  })

  it('rejects a different app', () => {
    expect(() => parseImport(JSON.stringify({
      app: 'another-app',
      version: 1,
      entries: {},
    }))).toThrow('another application')
  })

  it('rejects unsupported versions', () => {
    expect(() => parseImport(JSON.stringify({
      app: 'choivia-diary',
      version: 2,
      entries: {},
    }))).toThrow('not supported')
  })

  it('rejects backups without valid pages', () => {
    expect(() => parseImport(JSON.stringify({
      entries: {},
    }))).toThrow('No valid diary pages')
  })
})
