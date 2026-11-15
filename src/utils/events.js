export function upcomingEvents(events, todayKey, horizonDays = 45, limit = 5) {
  const t = new Date(`${todayKey}T00:00`)
  return events
    .map((e) => ({ ...e, in: Math.round((new Date(`${e.date}T00:00`) - t) / 86400000) }))
    .filter((e) => e.in >= 0 && e.in <= horizonDays)
    .sort((a, b) => a.in - b.in || a.title.localeCompare(b.title))
    .slice(0, limit)
}
export const whenLabel = (n) => (n === 0 ? 'Today' : n === 1 ? 'Tomorrow' : `In ${n} days`)
