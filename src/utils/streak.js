// Streak = consecutive days opened. Stored per user in localStorage.
const key = (uid) => `choivia:streak:${uid}`
export const dayKey = (d = new Date()) =>
  `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`
const diffDays = (a, b) => Math.round((new Date(b + 'T00:00') - new Date(a + 'T00:00')) / 86400000)

export function computeStreak(prev, today) {
  const days = prev?.days ?? []
  if (days.includes(today)) return { ...prev, days }
  const last = days[days.length - 1]
  const current = last && diffDays(last, today) === 1 ? (prev.current || 0) + 1 : 1
  return { current, best: Math.max(prev?.best || 0, current), days: [...days, today].slice(-60) }
}

export function touchStreak(uid, now = new Date()) {
  let prev = null
  try { prev = JSON.parse(localStorage.getItem(key(uid))) } catch { /* yoksay */ }
  const next = computeStreak(prev, dayKey(now))
  try { localStorage.setItem(key(uid), JSON.stringify(next)) } catch { /* yoksay */ }
  return next
}

export function lastSevenDays(streak, now = new Date()) {
  return Array.from({ length: 7 }, (_, i) => {
    const d = new Date(now); d.setDate(now.getDate() - (6 - i))
    return { key: dayKey(d), label: ['S', 'M', 'T', 'W', 'T', 'F', 'S'][d.getDay()], done: !!streak?.days?.includes(dayKey(d)), today: i === 6 }
  })
}

export function markWatered(uid, today = dayKey()) {
  try {
    const cur = JSON.parse(localStorage.getItem(key(uid)))
    localStorage.setItem(key(uid), JSON.stringify({ ...cur, watered: today }))
  } catch { /* ignore */ }
}
