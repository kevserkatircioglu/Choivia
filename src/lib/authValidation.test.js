import { describe, expect, it } from 'vitest'
import {
  normalizeEmail,
  titleCaseTr,
  validateFirstName,
  validateLastName,
  validateUsername,
  MIN_PASSWORD,
} from './authValidation.js'

describe('auth validation helpers', () => {
  it('keeps the eight-character password rule', () => {
    expect(MIN_PASSWORD).toBe(8)
  })

  it('accepts Turkish names', () => {
    expect(validateFirstName('Şeyma Nur')).toBe('')
    expect(validateLastName('Demirkoparan')).toBe('')
  })

  it('rejects invalid names', () => {
    expect(validateFirstName('Şeyma2')).not.toBe('')
    expect(validateLastName('Demir!')).not.toBe('')
  })

  it('uses Turkish title casing', () => {
    expect(titleCaseTr('şEYMA nUR')).toBe('Şeyma Nur')
    expect(titleCaseTr('ışıl')).toBe('Işıl')
  })

  it('normalizes emails', () => {
    expect(normalizeEmail(' USER@Example.COM ')).toBe('user@example.com')
  })

  it('accepts Turkish usernames', () => {
    expect(validateUsername('seyma.nur')).toBe('')
    expect(validateUsername('şeyma_26')).toBe('')
    expect(validateUsername('littlebloom')).toBe('')
  })

  it('rejects malformed usernames', () => {
    expect(validateUsername('ab')).not.toBe('')
    expect(validateUsername('a b')).not.toBe('')
    expect(validateUsername('.seyma')).not.toBe('')
  })
})
