const DATE_KEY = /^\d{4}-\d{2}-\d{2}$/
const MOOD_VALUES = new Set(['great', 'good', 'okay', 'low', 'tough'])
const MAX_IMPORT_SIZE = 10 * 1024 * 1024

function isValidDateKey(key) {
  if (!DATE_KEY.test(key)) return false

  const date = new Date(`${key}T00:00:00.000Z`)

  return (
    !Number.isNaN(date.getTime()) &&
    date.toISOString().slice(0, 10) === key
  )
}

function normalizeEntry(entry) {
  if (!entry || typeof entry !== 'object' || Array.isArray(entry)) return null
  if (entry.demo === true) return null

  const text = typeof entry.text === 'string' ? entry.text : ''
  const mood = MOOD_VALUES.has(entry.mood) ? entry.mood : undefined

  if (!text.trim() && !mood) return null

  const normalized = { text }

  if (mood) normalized.mood = mood

  if (Number.isFinite(entry.updated)) {
    normalized.updated = entry.updated
  }

  return normalized
}

function cleanEntries(entries) {
  const result = {}

  if (!entries || typeof entries !== 'object' || Array.isArray(entries)) {
    return result
  }

  Object.entries(entries).forEach(([key, entry]) => {
    if (!isValidDateKey(key)) return

    const normalized = normalizeEntry(entry)
    if (normalized) result[key] = normalized
  })

  return result
}

function download(filename, content, type) {
  const url = URL.createObjectURL(new Blob([content], { type }))
  const link = document.createElement('a')

  link.href = url
  link.download = filename
  document.body.appendChild(link)
  link.click()
  link.remove()

  window.setTimeout(() => URL.revokeObjectURL(url), 1000)
}

const stamp = () => new Date().toISOString().slice(0, 10)

export function exportJSON(entries) {
  const payload = {
    app: 'choivia-diary',
    version: 1,
    exportedAt: new Date().toISOString(),
    entries: cleanEntries(entries),
  }

  download(
    `choivia-diary-${stamp()}.json`,
    JSON.stringify(payload, null, 2),
    'application/json;charset=utf-8',
  )
}

export function exportMarkdown(entries, formatDate, moods) {
  const labels = Object.fromEntries(
    moods.map((mood) => [mood.value, mood.label]),
  )

  const safeEntries = cleanEntries(entries)

  const body = Object.keys(safeEntries)
    .sort()
    .map((key) => {
      const entry = safeEntries[key]
      const lines = [`## ${formatDate(key)}`]

      if (entry.mood && labels[entry.mood]) {
        lines.push(`Mood: ${labels[entry.mood]}`)
      }

      if (entry.text.trim()) lines.push(entry.text.trim())

      return lines.join('\n\n')
    })
    .join('\n\n---\n\n')

  download(
    `choivia-diary-${stamp()}.md`,
    `# My diary\n\n${body || 'No diary entries yet.'}\n`,
    'text/markdown;charset=utf-8',
  )
}

export function parseImport(raw) {
  if (typeof raw !== 'string' || raw.length > MAX_IMPORT_SIZE) {
    throw new Error('The backup file is empty or too large.')
  }

  let data

  try {
    data = JSON.parse(raw)
  } catch {
    throw new Error('This file is not valid JSON.')
  }

  if (!data || typeof data !== 'object' || Array.isArray(data)) {
    throw new Error('This does not look like a diary backup.')
  }

  if (data.app !== undefined && data.app !== 'choivia-diary') {
    throw new Error('This backup belongs to another application.')
  }

  if (data.version !== undefined && data.version !== 1) {
    throw new Error('This backup version is not supported.')
  }

  const source = data.entries !== undefined ? data.entries : data

  if (!source || typeof source !== 'object' || Array.isArray(source)) {
    throw new Error('No diary pages were found in this file.')
  }

  const result = cleanEntries(source)

  if (!Object.keys(result).length) {
    throw new Error('No valid diary pages were found in this file.')
  }

  return result
}
