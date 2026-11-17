import { useCallback, useEffect, useRef, useState } from 'react'
import { Delete } from 'lucide-react'

export default function PinPad({ title, hint, onComplete, footer }) {
  const [pin, setPin] = useState('')
  const [error, setError] = useState('')
  const [shake, setShake] = useState(false)
  const [busy, setBusy] = useState(false)
  const timer = useRef(null)

  const complete = useCallback((value) => {
    setBusy(true)

    Promise.resolve()
      .then(() => onComplete(value))
      .then((message) => {
        if (!message) return

        setError(message)
        setShake(true)

        timer.current = window.setTimeout(() => {
          setPin('')
          setShake(false)
          setBusy(false)
        }, 450)
      })
      .catch(() => {
        setError('Something went wrong. Please try again.')
        setShake(true)

        timer.current = window.setTimeout(() => {
          setPin('')
          setShake(false)
          setBusy(false)
        }, 450)
      })
  }, [onComplete])

  const push = useCallback((digit) => {
    if (busy || pin.length >= 4) return

    const next = pin + digit
    setError('')
    setShake(false)
    setPin(next)

    if (next.length === 4) complete(next)
  }, [busy, pin, complete])

  const remove = useCallback(() => {
    if (busy) return
    setPin((current) => current.slice(0, -1))
    setError('')
    setShake(false)
  }, [busy])

  const handleKeyDown = useCallback((event) => {
    const target = event.target
    if (target?.closest?.('input, textarea, select, [contenteditable="true"]')) return

    if (/^\d$/.test(event.key)) {
      event.preventDefault()
      push(event.key)
    } else if (event.key === 'Backspace') {
      event.preventDefault()
      remove()
    }
  }, [push, remove])

  useEffect(() => {
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [handleKeyDown])

  useEffect(() => () => window.clearTimeout(timer.current), [])

  return (
    <div className="diary-pin">
      <h2>{title}</h2>
      <p className={error ? 'diary-pin-error' : ''} role={error ? 'alert' : undefined} aria-live="polite">
        {error || hint}
      </p>

      <div
        className={`diary-pin-dots${shake ? ' is-shaking' : ''}`}
        role="img"
        aria-label={`${pin.length} of 4 digits entered`}
      >
        {[0, 1, 2, 3].map((index) => (
          <i key={index} className={index < pin.length ? 'is-filled' : ''} />
        ))}
      </div>

      <div className="diary-pin-keys">
        {['1', '2', '3', '4', '5', '6', '7', '8', '9'].map((digit) => (
          <button
            key={digit}
            type="button"
            disabled={busy}
            onClick={() => push(digit)}
          >
            {digit}
          </button>
        ))}

        <span aria-hidden="true" />

        <button type="button" disabled={busy} onClick={() => push('0')}>
          0
        </button>

        <button
          type="button"
          className="diary-pin-delete"
          disabled={busy || !pin.length}
          onClick={remove}
          aria-label="Delete last digit"
        >
          <Delete size={22} />
        </button>
      </div>

      {footer}
    </div>
  )
}
