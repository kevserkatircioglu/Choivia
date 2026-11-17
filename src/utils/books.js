export const BOOK_STATUSES = [
  { value: 'want', label: 'Want to read' },
  { value: 'reading', label: 'Reading' },
  { value: 'finished', label: 'Finished' },
]

const VALID_STATUSES = new Set(BOOK_STATUSES.map((item) => item.value))

const pageCount = (value) => {
  const number = Number(value)
  return Number.isFinite(number) ? Math.max(0, Math.floor(number)) : 0
}

export function normalizeBook(book) {
  const status = VALID_STATUSES.has(book?.status)
    ? book.status
    : book?.read
      ? 'finished'
      : 'want'

  const totalPages = pageCount(book?.totalPages)
  let currentPage = pageCount(book?.currentPage)

  if (totalPages > 0) currentPage = Math.min(currentPage, totalPages)
  if (status === 'finished' && totalPages > 0) currentPage = totalPages

  return {
    ...book,
    status,
    currentPage,
    totalPages,
    // Keep the legacy field for compatibility with older Choivia data.
    read: status === 'finished',
  }
}

export function setBookStatus(book, status) {
  if (!VALID_STATUSES.has(status)) return normalizeBook(book)

  const normalized = normalizeBook(book)
  const currentPage = status === 'want' ? 0 : normalized.currentPage

  return normalizeBook({
    ...normalized,
    status,
    currentPage,
    read: status === 'finished',
  })
}

export function updateBookPages(book, changes) {
  const normalized = normalizeBook(book)

  return normalizeBook({
    ...normalized,
    currentPage: Object.hasOwn(changes, 'currentPage')
      ? pageCount(changes.currentPage)
      : normalized.currentPage,
    totalPages: Object.hasOwn(changes, 'totalPages')
      ? pageCount(changes.totalPages)
      : normalized.totalPages,
  })
}

export function bookProgress(book) {
  const normalized = normalizeBook(book)
  if (normalized.totalPages === 0) return null

  return Math.round((normalized.currentPage / normalized.totalPages) * 100)
}

export function bookCounts(books) {
  const normalized = Array.isArray(books) ? books.map(normalizeBook) : []

  return {
    total: normalized.length,
    want: normalized.filter((book) => book.status === 'want').length,
    reading: normalized.filter((book) => book.status === 'reading').length,
    finished: normalized.filter((book) => book.status === 'finished').length,
  }
}
