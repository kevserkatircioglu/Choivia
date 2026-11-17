import { describe, expect, it } from 'vitest'
import {
  ICON_MAP,
  LEGACY_EMOJI_TO_ICON_KEY,
  resolveIconKey,
} from './iconMap.js'

describe('icon compatibility', () => {
  it('maps every legacy emoji to a valid icon', () => {
    Object.entries(LEGACY_EMOJI_TO_ICON_KEY).forEach(
      ([emoji, iconKey]) => {
        expect(ICON_MAP[iconKey], emoji).toBeDefined()
      },
    )
  })

  it('keeps valid icon keys unchanged', () => {
    expect(resolveIconKey('music')).toBe('music')
    expect(resolveIconKey('violin')).toBe('violin')
    expect(resolveIconKey('calendar')).toBe('calendar')
  })

  it('converts existing hobby emojis', () => {
    expect(resolveIconKey('🎻')).toBe('violin')
    expect(resolveIconKey('🎸')).toBe('guitar')
    expect(resolveIconKey('✏️')).toBe('pencil')
    expect(resolveIconKey('🏃')).toBe('footprints')
  })

  it('converts legacy plant stages', () => {
    expect(resolveIconKey('🌱')).toBe('sprout')
    expect(resolveIconKey('🌿')).toBe('leaf')
    expect(resolveIconKey('🌳')).toBe('tree')
    expect(resolveIconKey('🌸')).toBe('flower')
  })

  it('uses a safe fallback for unknown values', () => {
    expect(resolveIconKey('unknown-icon')).toBe('help')
    expect(resolveIconKey(null)).toBe('help')
    expect(resolveIconKey('unknown-icon', 'music')).toBe('music')
  })

  it('does not mutate the original emoji mapping', () => {
    expect(LEGACY_EMOJI_TO_ICON_KEY['🎻']).toBe('violin')
    expect(LEGACY_EMOJI_TO_ICON_KEY['🌱']).toBe('sprout')
  })
})
