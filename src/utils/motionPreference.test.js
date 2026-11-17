import { describe, expect, it } from 'vitest'
import {
  normalizeMotionPreference,
  shouldReduceMotion,
} from './motionPreference.js'

describe('motion preference', () => {
  it('uses system as the fallback preference', () => {
    expect(normalizeMotionPreference(null)).toBe('system')
    expect(normalizeMotionPreference('invalid')).toBe('system')
  })

  it('follows the operating system in system mode', () => {
    expect(shouldReduceMotion('system', true)).toBe(true)
    expect(shouldReduceMotion('system', false)).toBe(false)
  })

  it('always reduces motion when explicitly selected', () => {
    expect(shouldReduceMotion('reduce', false)).toBe(true)
    expect(shouldReduceMotion('reduce', true)).toBe(true)
  })

  it('falls back to the system setting for unsupported values', () => {
    expect(shouldReduceMotion('full', true)).toBe(true)
    expect(shouldReduceMotion('full', false)).toBe(false)
  })
})
