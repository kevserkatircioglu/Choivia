import { describe, expect, it } from 'vitest'
import { getHobbyTheme } from './hobbyTheme.js'

describe('getHobbyTheme', () => {
  it.each(['violin', 'guitar', 'drawing', 'running'])(
    'uses the %s template theme',
    (templateId) => {
      expect(getHobbyTheme({ templateId })).toBe(templateId)
    },
  )

  it('accepts a template id directly', () => {
    expect(getHobbyTheme('drawing')).toBe('drawing')
  })

  it('uses the garden theme for custom hobbies', () => {
    expect(getHobbyTheme({ templateId: '' })).toBe('garden')
    expect(getHobbyTheme({ name: 'Pottery' })).toBe('garden')
    expect(getHobbyTheme(null)).toBe('garden')
  })
})
