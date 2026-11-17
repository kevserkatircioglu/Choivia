export const planKey = (uid, day) => `choivia:plan:${uid}:${day}`
export const eventsKey = (uid) => `choivia:events:${uid}`
export const stepsKey = (uid) => `choivia:steps:${uid}`
export const diaryKey = (uid) => `choivia:diary:${uid}`
export const pinKey = (uid) => `choivia:diarypin:${uid}`
export const readJSON = (key, fallback) => { try { const v = localStorage.getItem(key); return v ? JSON.parse(v) : fallback } catch { return fallback } }
