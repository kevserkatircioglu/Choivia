export const PLANT_STAGE_KEYS = Object.freeze([
  'seed',
  'sprout',
  'growing',
  'flourishing',
  'bloom',
])

const LEGACY_STAGES = {
  '🌱': 'seed',
  '🌿': 'sprout',
  '🪴': 'growing',
  '🌳': 'flourishing',
  '🌸': 'bloom',
}

export function resolvePlantStage(stage = 'seed') {
  const value =
    stage && typeof stage === 'object'
      ? stage.key ?? stage.emoji
      : stage

  if (typeof value === 'number' && Number.isFinite(value)) {
    const index = Math.max(0, Math.min(4, Math.floor(value)))
    return PLANT_STAGE_KEYS[index]
  }

  const key = LEGACY_STAGES[value] ?? value
  return PLANT_STAGE_KEYS.includes(key) ? key : 'seed'
}
