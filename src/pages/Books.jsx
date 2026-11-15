import { useState } from 'react'
import { useStored } from '../lib/useStored.js'

export default function Books({ user }) {
  const [books, setBooks] = useStored(`choivia:books:${user.id}`, [])
  const [title, setTitle] = useState('')
  const add = (e) => {
    e.preventDefault(); const t = title.trim(); if (!t) return
    setBooks([...books, { id: Date.now(), title: t, read: false }]); setTitle('')
  }
  return (
    <div className="cv-books">
      <header className="cv-books-head"><span aria-hidden="true">📖</span><div><p className="eyebrow">READING NOOK</p><h1>Books I want to read</h1><p>{books.filter((b) => b.read).length} of {books.length} finished</p></div></header>
      <div className="cv-notebook">
        <i className="cv-ribbon" aria-hidden="true" />
        <form onSubmit={add} className="cv-write">
          <input value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Write a book title…" aria-label="Book title" maxLength={80} />
          <button type="submit">Write it ✍️</button>
        </form>
        <ul>
          {books.map((b) => (
            <li key={b.id} className={b.read ? 'read' : ''}>
              <button type="button" className="cv-tick" onClick={() => setBooks(books.map((x) => x.id === b.id ? { ...x, read: !x.read } : x))} aria-label={b.read ? 'Mark unread' : 'Mark read'}>{b.read ? '✓' : ''}</button>
              <span className="cv-ink" style={{ '--n': b.title.length }}>{b.title}</span>
              <button type="button" className="cv-del" onClick={() => setBooks(books.filter((x) => x.id !== b.id))} aria-label="Remove">×</button>
            </li>
          ))}
          {!books.length && <li className="cv-hint">Your notebook is empty. Add the first book! 🌱</li>}
        </ul>
      </div>
    </div>
  )
}
