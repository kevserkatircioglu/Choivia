function foldDiaryText(value) {
  return String(value ?? '')
    .toLocaleLowerCase('tr-TR')
    .normalize('NFD')
    .replace(/\p{M}/gu, '')
}

export function normalizeDiarySearch(value) {
  return foldDiaryText(value)
    .replace(/\s+/gu, ' ')
    .trim()
}

function locateDiaryMatch(text, query) {
  const needle = normalizeDiarySearch(query)
  if (!needle) return null

  const source = String(text ?? '')
  let normalized = ''
  const sourceRanges = []
  let sourceOffset = 0

  for (const character of source) {
    const sourceEnd = sourceOffset + character.length
    const folded = foldDiaryText(character)

    for (let index = 0; index < folded.length; index += 1) {
      let unit = folded[index]

      if (/\s/u.test(unit)) {
        unit = ' '

        if (normalized.endsWith(' ')) {
          sourceRanges[sourceRanges.length - 1].end = sourceEnd
          continue
        }
      }

      normalized += unit
      sourceRanges.push({ start: sourceOffset, end: sourceEnd })
    }

    // Keep combining marks inside the highlighted original substring.
    if (!folded && sourceRanges.length > 0) {
      sourceRanges[sourceRanges.length - 1].end = sourceEnd
    }

    sourceOffset = sourceEnd
  }

  const matchIndex = normalized.indexOf(needle)
  if (matchIndex < 0) return null

  return {
    start: sourceRanges[matchIndex].start,
    end: sourceRanges[matchIndex + needle.length - 1].end,
  }
}

export function matchesDiarySearch(text, query) {
  if (!normalizeDiarySearch(query)) return true
  return locateDiaryMatch(text, query) !== null
}

export function filterDiaryMonths(months, entries, query) {
  if (!normalizeDiarySearch(query)) return months

  return months
    .map(({ key, items }) => ({
      key,
      items: items.filter((day) => (
        locateDiaryMatch(entries?.[day]?.text ?? '', query) !== null
      )),
    }))
    .filter(({ items }) => items.length > 0)
}

export function getDiarySearchSnippet(text, query, before = 48, after = 72) {
  const source = String(text ?? '')
  const match = locateDiaryMatch(source, query)
  if (!match) return null

  const start = Math.max(0, match.start - before)
  const end = Math.min(source.length, match.end + after)

  return {
    leading: start > 0,
    before: source.slice(start, match.start),
    match: source.slice(match.start, match.end),
    after: source.slice(match.end, end),
    trailing: end < source.length,
  }
}
