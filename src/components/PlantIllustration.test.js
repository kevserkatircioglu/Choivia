import { describe, expect, it } from 'vitest'
import {
  PLANT_STAGE_KEYS,
  resolvePlantStage,
} from '../utils/plantStages.js'

describe('PlantIllustration stages', () => {
  it('contains all five growth stages in order', () => {
    expect(PLANT_STAGE_KEYS).toEqual([
      'seed',
      'sprout',
      'growing',
      'flourishing',
      'bloom',
    ])
  })

  it('resolves legacy plant emojis', () => {
    expect(resolvePlantStage('🌱')).toBe('seed')
    expect(resolvePlantStage('🌿')).toBe('sprout')
    expect(resolvePlantStage('🪴')).toBe('growing')
    expect(resolvePlantStage('🌳')).toBe('flourishing')
    expect(resolvePlantStage('🌸')).toBe('bloom')
  })

  it('resolves numeric stages and clamps out-of-range values', () => {
    expect(resolvePlantStage(0)).toBe('seed')
    expect(resolvePlantStage(2)).toBe('growing')
    expect(resolvePlantStage(4)).toBe('bloom')
    expect(resolvePlantStage(99)).toBe('bloom')
    expect(resolvePlantStage(-1)).toBe('seed')
  })

  it('accepts stage objects and uses a safe fallback', () => {
    expect(resolvePlantStage({ key: 'bloom' })).toBe('bloom')
    expect(resolvePlantStage({ emoji: '🌿' })).toBe('sprout')
    expect(resolvePlantStage('unknown-stage')).toBe('seed')
  })
})
