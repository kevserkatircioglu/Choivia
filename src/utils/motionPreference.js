export const MOTION_OPTIONS = ['system', 'reduce']

export function normalizeMotionPreference(value) {
  return MOTION_OPTIONS.includes(value) ? value : 'system'
}

export function shouldReduceMotion(preference, systemPrefersReducedMotion = false) {
  const normalized = normalizeMotionPreference(preference)

  if (normalized === 'reduce') return true
  if (normalized === 'full') return false

  return Boolean(systemPrefersReducedMotion)
}

export function getMotionPreference(userId) {
  if (!userId) return 'system'

  try {
    return normalizeMotionPreference(
      localStorage.getItem(`choivia:motion:${userId}`),
    )
  } catch {
    return 'system'
  }
}

export function saveMotionPreference(userId, preference) {
  const normalized = normalizeMotionPreference(preference)
  if (!userId) return normalized

  try {
    localStorage.setItem(`choivia:motion:${userId}`, normalized)
  } catch {
    // Keep the current session usable when storage is unavailable.
  }

  return normalized
}
