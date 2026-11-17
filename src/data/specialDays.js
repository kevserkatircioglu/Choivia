// type: national (Turkish flag) | memorial (infinity) | religious (crescent) | special | week (range)
const FIXED = [
  [1, 1, 'special', 'New Year’s Day'],
  [3, 8, 'special', 'International Women’s Day'],
  [3, 12, 'special', 'National Anthem Day'],
  [3, 18, 'memorial', 'Çanakkale Victory & Martyrs’ Day'],
  [4, 23, 'national', 'National Sovereignty & Children’s Day'],
  [5, 1, 'national', 'Labour & Solidarity Day'],
  [5, 19, 'national', 'Commemoration of Atatürk, Youth & Sports Day'],
  [7, 15, 'national', 'Democracy & National Unity Day'],
  [8, 30, 'national', 'Victory Day'],
  [10, 28, 'special', 'Republic Day Eve (half day)'],
  [10, 29, 'national', 'Republic Day'],
  [11, 10, 'memorial', 'Atatürk Memorial Day — remembered at 09:05'],
  [11, 24, 'special', 'Teachers’ Day'],
  [12, 10, 'special', 'Human Rights Day'],
  [12, 31, 'special', 'New Year’s Eve'],
]
// [startMonth, startDay, endMonth, endDay, name]
const WEEKS = [
  [3, 24, 3, 30, 'Libraries Week'],
  [4, 15, 4, 22, 'Tourism Week'],
  [5, 10, 5, 16, 'Disabled People’s Week'],
  [5, 18, 5, 24, 'Museums Week'],
  [10, 4, 10, 10, 'Animal Protection Week'],
  [11, 10, 11, 16, 'Atatürk Week'],
]
// Movable religious holidays (official Turkish calendar)
const RELIGIOUS = {
  2026: [['03-19', 'Eid al-Fitr Eve (Arife)'], ['03-20', 'Eid al-Fitr (Ramazan Bayramı), day 1'], ['03-21', 'Eid al-Fitr, day 2'], ['03-22', 'Eid al-Fitr, day 3'],
    ['05-26', 'Eid al-Adha Eve (Arife)'], ['05-27', 'Eid al-Adha (Kurban Bayramı), day 1'], ['05-28', 'Eid al-Adha, day 2'], ['05-29', 'Eid al-Adha, day 3'], ['05-30', 'Eid al-Adha, day 4']],
  2027: [['03-08', 'Eid al-Fitr Eve (Arife)'], ['03-09', 'Eid al-Fitr (Ramazan Bayramı), day 1'], ['03-10', 'Eid al-Fitr, day 2'], ['03-11', 'Eid al-Fitr, day 3'],
    ['05-15', 'Eid al-Adha Eve (Arife)'], ['05-16', 'Eid al-Adha (Kurban Bayramı), day 1'], ['05-17', 'Eid al-Adha, day 2'], ['05-18', 'Eid al-Adha, day 3'], ['05-19', 'Eid al-Adha, day 4']],
}
const nthWeekday = (y, m, wd, n) => { const first = new Date(y, m, 1).getDay(); return 1 + ((wd - first + 7) % 7) + (n - 1) * 7 }
const pad = (n) => String(n).padStart(2, '0')

export function specialsFor(y, m, d) {
  const out = []
  FIXED.forEach(([fm, fd, type, name]) => { if (fm === m + 1 && fd === d) out.push({ type, name }) })
  if (m === 4 && d === nthWeekday(y, 4, 0, 2)) out.push({ type: 'special', name: 'Mother’s Day' })
  if (m === 5 && d === nthWeekday(y, 5, 0, 3)) out.push({ type: 'special', name: 'Father’s Day' })
  const mmdd = `${pad(m + 1)}-${pad(d)}`
  ;(RELIGIOUS[y] || []).forEach(([k, name]) => { if (k === mmdd) out.push({ type: 'religious', name }) })
  const t = new Date(y, m, d).getTime()
  WEEKS.forEach(([sm, sd, em, ed, name]) => {
    if (t >= new Date(y, sm - 1, sd).getTime() && t <= new Date(y, em - 1, ed).getTime()) out.push({ type: 'week', name })
  })
  return out
}
// the icon that represents a day in the grid
export const mainKind = (list) => ['memorial', 'national', 'religious', 'special'].find((k) => list.some((s) => s.type === k))
