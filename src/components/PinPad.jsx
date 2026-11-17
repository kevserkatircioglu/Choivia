import { useCallback, useEffect, useState } from 'react'
import { Delete } from 'lucide-react'

// iPhone-style 4-digit keypad. onComplete(pin) may return an error message (string) to shake and reset.
export default function PinPad({ title, hint, onComplete, footer }) {
  const [pin, setPin] = useState('')
  const [error, setError] = useState('')
  const [shake, setShake] = useState(false)

  const push = useCallback((d) => setPin((p) => (p.length < 4 ? p + d : p)), [])
  useEffect(() => {
    if (pin.length !== 4) return undefined
    let live = true
    Promise.resolve(onComplete(pin)).then((err) => {
      if (!live || !err) return
      setError(err); setShake(true)
      setTimeout(() => { if (live) { setPin(''); setShake(false) } }, 450)
    })
    return () => { live = false }
  }, [pin]) // eslint-disable-line react-hooks/exhaustive-deps
  useEffect(() => {
    const onKey = (e) => {
      if (/^\d$/.test(e.key)) { setError(''); push(e.key) } else if (e.key === 'Backspace') setPin((p) => p.slice(0, -1))
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [push])

  return (
    <div className="px-pin">
      <h2>{title}</h2>
      <p className={error ? 'err' : ''} role={error ? 'alert' : undefined}>{error || hint}</p>
      <div className={`px-pin-dots${shake ? ' shake' : ''}`} aria-label={`${pin.length} of 4 digits entered`}>
        {[0, 1, 2, 3].map((i) => <i key={i} className={i < pin.length ? 'on' : ''} />)}
      </div>
      <div className="px-pin-keys">
        {['1', '2', '3', '4', '5', '6', '7', '8', '9'].map((d) => <button key={d} type="button" onClick={() => { setError(''); push(d) }}>{d}</button>)}
        <span />
        <button type="button" onClick={() => { setError(''); push('0') }}>0</button>
        <button type="button" className="del" onClick={() => setPin((p) => p.slice(0, -1))} aria-label="Delete"><Delete size={22} /></button>
      </div>
      {footer}
    </div>
  )
}
