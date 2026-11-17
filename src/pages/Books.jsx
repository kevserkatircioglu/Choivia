import { useEffect, useMemo, useState } from 'react'
import { BookOpen, Pencil } from 'lucide-react'
import { useStored } from '../lib/useStored.js'
import {
  BOOK_STATUSES,
  bookCounts,
  bookProgress,
  normalizeBook,
  setBookStatus,
  updateBookPages,
} from '../utils/books.js'

const FILTERS = [
  { value: 'all', label: 'All' },
  { value: 'want', label: 'Want to read' },
  { value: 'reading', label: 'Reading' },
  { value: 'finished', label: 'Finished' },
]

export default function Books({ user }) {
  const [books, setBooks] = useStored(`choivia:books:${user.id}`, [])
  const [title, setTitle] = useState('')
  const [filter, setFilter] = useState('all')

  const normalizedBooks = useMemo(
    () => (Array.isArray(books) ? books.map(normalizeBook) : []),
    [books],
  )

  const needsMigration = useMemo(
    () => normalizedBooks.some((book, index) =>
      JSON.stringify(book) !== JSON.stringify(books[index]),
    ),
    [books, normalizedBooks],
  )

  // Convert existing read:true/false entries without losing IDs or titles.
  useEffect(() => {
    if (needsMigration) setBooks(normalizedBooks)
  }, [needsMigration, normalizedBooks, setBooks])

  const counts = bookCounts(normalizedBooks)

  const visibleBooks = normalizedBooks.filter(
    (book) => filter === 'all' || book.status === filter,
  )

  function add(event) {
    event.preventDefault()
    const value = title.trim()
    if (!value) return

    setBooks([
      ...normalizedBooks,
      {
        id: Date.now(),
        title: value,
        status: 'want',
        currentPage: 0,
        totalPages: 0,
        read: false,
      },
    ])
    setTitle('')
    setFilter('all')
  }

  function updateBook(id, transform) {
    setBooks(normalizedBooks.map((book) =>
      book.id === id ? transform(book) : book,
    ))
  }

  function removeBook(id) {
    setBooks(normalizedBooks.filter((book) => book.id !== id))
  }

  return (
    <div className="cv-books">
      <header className="cv-books-head">
        <span className="cv-books-icon" aria-hidden="true">
          <BookOpen size={30} />
        </span>
        <div>
          <p className="eyebrow">YOUR BOOKS</p>
          <h1>My reading list</h1>
          <p>
            {counts.reading} reading · {counts.finished} finished
          </p>
        </div>
      </header>

      <div className="cv-notebook">
        <form onSubmit={add} className="cv-write">
          <input
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Add a book title…"
            aria-label="Book title"
            maxLength={80}
          />
          <button type="submit">
            <Pencil size={15} aria-hidden="true" /> Add book
          </button>
        </form>

        <div className="cv-book-filters" role="group" aria-label="Filter books">
          {FILTERS.map((item) => {
            const count = item.value === 'all'
              ? counts.total
              : counts[item.value]

            return (
              <button
                key={item.value}
                type="button"
                className={filter === item.value ? 'active' : ''}
                aria-pressed={filter === item.value}
                onClick={() => setFilter(item.value)}
              >
                {item.label} <span>{count}</span>
              </button>
            )
          })}
        </div>

        <ul className="cv-book-list">
          {visibleBooks.map((book) => {
            const progress = bookProgress(book)

            return (
              <li key={book.id} className={`cv-book-card ${book.status}`}>
                <div className="cv-book-row">
                  <span className="cv-book-symbol" aria-hidden="true">
                    <BookOpen size={19} />
                  </span>

                  <div className="cv-book-main">
                    <strong>{book.title}</strong>
                    <label className="cv-book-status">
                      <span className="sr-only">
                        Reading status for {book.title}
                      </span>
                      <select
                        value={book.status}
                        onChange={(event) => updateBook(
                          book.id,
                          (current) => setBookStatus(current, event.target.value),
                        )}
                      >
                        {BOOK_STATUSES.map((status) => (
                          <option key={status.value} value={status.value}>
                            {status.label}
                          </option>
                        ))}
                      </select>
                    </label>
                  </div>

                  <button
                    type="button"
                    className="cv-book-remove"
                    onClick={() => removeBook(book.id)}
                    aria-label={`Remove ${book.title}`}
                  >
                    ×
                  </button>
                </div>

                {book.status === 'reading' && (
                  <div className="cv-book-page-tracker">
                    <div className="cv-book-page-fields">
                      <label>
                        Current page
                        <input
                          type="number"
                          min="0"
                          max={book.totalPages || undefined}
                          inputMode="numeric"
                          value={book.currentPage || ''}
                          placeholder="0"
                          onChange={(event) => updateBook(
                            book.id,
                            (current) => updateBookPages(current, {
                              currentPage: event.target.value,
                            }),
                          )}
                        />
                      </label>

                      <label>
                        Total pages
                        <input
                          type="number"
                          min="1"
                          inputMode="numeric"
                          value={book.totalPages || ''}
                          placeholder="Optional"
                          onChange={(event) => updateBook(
                            book.id,
                            (current) => updateBookPages(current, {
                              totalPages: event.target.value,
                            }),
                          )}
                        />
                      </label>
                    </div>

                    {progress !== null ? (
                      <>
                        <div className="cv-book-progress-label">
                          <span>{book.currentPage} of {book.totalPages} pages</span>
                          <strong>{progress}%</strong>
                        </div>
                        <div
                          className="cv-book-progress"
                          role="progressbar"
                          aria-label={`Reading progress for ${book.title}`}
                          aria-valuemin={0}
                          aria-valuemax={book.totalPages}
                          aria-valuenow={book.currentPage}
                        >
                          <span style={{ width: `${progress}%` }} />
                        </div>
                      </>
                    ) : (
                      <p className="cv-book-page-hint">
                        Add total pages to track your progress.
                      </p>
                    )}
                  </div>
                )}
              </li>
            )
          })}

          {visibleBooks.length === 0 && (
            <li className="cv-book-empty">
              {counts.total === 0
                ? 'Your reading list is empty. Add your first book.'
                : 'No books in this category yet.'}
            </li>
          )}
        </ul>
      </div>
    </div>
  )
}
