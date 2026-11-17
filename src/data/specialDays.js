// Turkish public holidays, commemorative days and special weeks.
// monthIndex arguments in specialsFor() are zero-based (January = 0).

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
  [10, 28, 'special', 'Republic Day Eve (half day)', {
    time: '13:00',
    isHalfDay: true,
  }],
  [10, 29, 'national', 'Republic Day'],
  [11, 10, 'memorial', 'Atatürk Memorial Day — remembered at 09:05'],
  [11, 24, 'special', 'Teachers’ Day'],
  [12, 10, 'special', 'Human Rights Day'],
  [12, 31, 'special', 'New Year’s Eve'],
]

// Fixed-date special weeks.
// Libraries Week is calculated separately because its dates change each year.
const WEEKS = [
  [4, 15, 4, 22, 'Tourism Week'],
  [5, 10, 5, 16, 'Disabled People’s Week'],
  [5, 18, 5, 24, 'Museums Week'],
  [10, 4, 10, 10, 'Animal Protection Week'],
  [11, 10, 11, 16, 'Atatürk Week'],
]

// Official religious holiday dates, maintained by calendar year.
// Arife days begin at 13:00 and are half-day public holidays.
const RELIGIOUS = {
  2026: [
    ['03-19', 'Eid al-Fitr Eve (Arife)', {
      time: '13:00',
      isHalfDay: true,
    }],
    ['03-20', 'Eid al-Fitr (Ramazan Bayramı), day 1'],
    ['03-21', 'Eid al-Fitr, day 2'],
    ['03-22', 'Eid al-Fitr, day 3'],

    ['05-26', 'Eid al-Adha Eve (Arife)', {
      time: '13:00',
      isHalfDay: true,
    }],
    ['05-27', 'Eid al-Adha (Kurban Bayramı), day 1'],
    ['05-28', 'Eid al-Adha, day 2'],
    ['05-29', 'Eid al-Adha, day 3'],
    ['05-30', 'Eid al-Adha, day 4'],
  ],

  2027: [
    ['03-08', 'Eid al-Fitr Eve (Arife)', {
      time: '13:00',
      isHalfDay: true,
    }],
    ['03-09', 'Eid al-Fitr (Ramazan Bayramı), day 1'],
    ['03-10', 'Eid al-Fitr, day 2'],
    ['03-11', 'Eid al-Fitr, day 3'],

    ['05-15', 'Eid al-Adha Eve (Arife)', {
      time: '13:00',
      isHalfDay: true,
    }],
    ['05-16', 'Eid al-Adha (Kurban Bayramı), day 1'],
    ['05-17', 'Eid al-Adha, day 2'],
    ['05-18', 'Eid al-Adha, day 3'],
    ['05-19', 'Eid al-Adha, day 4'],
  ],

  2028: [
    ['02-26', 'Eid al-Fitr Eve (Arife)', {
      time: '13:00',
      isHalfDay: true,
    }],
    ['02-27', 'Eid al-Fitr (Ramazan Bayramı), day 1'],
    ['02-28', 'Eid al-Fitr, day 2'],
    ['02-29', 'Eid al-Fitr, day 3'],

    ['05-04', 'Eid al-Adha Eve (Arife)', {
      time: '13:00',
      isHalfDay: true,
    }],
    ['05-05', 'Eid al-Adha (Kurban Bayramı), day 1'],
    ['05-06', 'Eid al-Adha, day 2'],
    ['05-07', 'Eid al-Adha, day 3'],
    ['05-08', 'Eid al-Adha, day 4'],
  ],
}

const pad = (n) => String(n).padStart(2, '0')

function isValidDate(year, monthIndex, day) {
  if (
    !Number.isInteger(year) ||
    year < 100 ||
    !Number.isInteger(monthIndex) ||
    monthIndex < 0 ||
    monthIndex > 11 ||
    !Number.isInteger(day)
  ) {
    return false
  }

  const date = new Date(year, monthIndex, day)

  return (
    date.getFullYear() === year &&
    date.getMonth() === monthIndex &&
    date.getDate() === day
  )
}

function nthWeekday(year, monthIndex, weekday, occurrence) {
  const firstDay = new Date(year, monthIndex, 1).getDay()

  return (
    1 +
    ((weekday - firstDay + 7) % 7) +
    (occurrence - 1) * 7
  )
}

function lastMondayOfMarch(year) {
  const lastDay = new Date(year, 3, 0)
  const offset = (lastDay.getDay() + 6) % 7

  return new Date(
    year,
    2,
    lastDay.getDate() - offset,
  )
}

function addDays(date, amount) {
  const result = new Date(date)
  result.setDate(result.getDate() + amount)
  return result
}

function isWithin(date, start, end) {
  const from = new Date(date.getFullYear(), start[0] - 1, start[1])
  const to = new Date(date.getFullYear(), end[0] - 1, end[1])

  return date >= from && date <= to
}

/**
 * Returns special days for a specific date.
 *
 * @param {number} year - Full calendar year.
 * @param {number} monthIndex - Zero-based month (January = 0).
 * @param {number} day - Day of the month.
 * @returns {Array<{type: string, name: string, time?: string, isHalfDay?: boolean}>}
 */
export function specialsFor(year, monthIndex, day) {
  if (!isValidDate(year, monthIndex, day)) {
    return []
  }

  const result = []
  const date = new Date(year, monthIndex, day)
  const month = monthIndex + 1

  // Fixed national and special days.
  FIXED.forEach(([fixedMonth, fixedDay, type, name, options]) => {
    if (fixedMonth === month && fixedDay === day) {
      result.push({
        type,
        name,
        ...(options || {}),
      })
    }
  })

  // Mother's Day: second Sunday of May.
  if (monthIndex === 4 && day === nthWeekday(year, 4, 0, 2)) {
    result.push({
      type: 'special',
      name: 'Mother’s Day',
    })
  }

  // Father's Day: third Sunday of June.
  if (monthIndex === 5 && day === nthWeekday(year, 5, 0, 3)) {
    result.push({
      type: 'special',
      name: 'Father’s Day',
    })
  }

  // Religious holidays.
  const mmdd = `${pad(month)}-${pad(day)}`

  ;(RELIGIOUS[year] || []).forEach(([dateKey, name, options]) => {
    if (dateKey === mmdd) {
      result.push({
        type: 'religious',
        name,
        ...(options || {}),
      })
    }
  })

  // Libraries Week: last Monday of March through Sunday.
  const libraryStart = lastMondayOfMarch(year)
  const libraryEnd = addDays(libraryStart, 6)

  if (date >= libraryStart && date <= libraryEnd) {
    result.push({
      type: 'week',
      name: 'Libraries Week',
    })
  }

  // Other special weeks.
  WEEKS.forEach(([startMonth, startDay, endMonth, endDay, name]) => {
    if (
      isWithin(
        date,
        [startMonth, startDay],
        [endMonth, endDay],
      )
    ) {
      result.push({
        type: 'week',
        name,
      })
    }
  })

  return result
}

// Priority used when selecting the main icon for a calendar day.
export const mainKind = (list = []) =>
  ['memorial', 'national', 'religious', 'special'].find(
    (kind) => list.some((item) => item.type === kind),
  )
