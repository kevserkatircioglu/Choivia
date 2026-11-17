import { useEffect, useMemo, useRef, useState } from 'react'
import { BookHeart, ChevronLeft, Lock, LockKeyhole } from 'lucide-react'
import PinPad from '../components/PinPad.jsx'
import { hashPassword, makeSalt, readAccounts } from '../lib/auth.js'
import { diaryKey, pinKey, readJSON } from '../lib/keys.js'
import { dayKey } from '../utils/streak.js'

const long = (k) => new Date(`${k}T00:00`).toLocaleDateString('en-GB', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })
const short = (k) => new Date(`${k}T00:00`).toLocaleDateString('en-GB', { day: 'numeric', month: 'short' })

export default function Diary({ user }) {
  const [pin, setPin] = useState(() => readJSON(pinKey(user.id), null))
  const [unlocked, setUnlocked] = useState(false) // leaving the page locks the diary again
  const [firstPin, setFirstPin] = useState(null)
  const [forgot, setForgot] = useState(false)
  const [pw, setPw] = useState('')
  const [pwErr, setPwErr] = useState('')

  const savePin = async (p) => {
    const salt = makeSalt(), rec = { salt, hash: await hashPassword(p, salt) }
    localStorage.setItem(pinKey(user.id), JSON.stringify(rec)); setPin(rec); setFirstPin(null); setUnlocked(true)
  }

  if (forgot) {
    const reset = async (e) => {
      e.preventDefault()
      const acc = readAccounts().find((a) => a.id === user.id)
      if (!acc || await hashPassword(pw, acc.salt) !== acc.passwordHash) return setPwErr('That password is not correct.')
      localStorage.removeItem(pinKey(user.id)); setPin(null); setForgot(false); setPw(''); setPwErr('')
    }
    return (
      <div className="px-page px-diary-lock"><form className="px-card px-pin" onSubmit={reset}>
        <LockKeyhole size={30} /><h2>Reset your diary PIN</h2><p>Enter your account password. Your entries stay safe.</p>
        <input type="password" className="px-input" value={pw} onChange={(e) => { setPw(e.target.value); setPwErr('') }} placeholder="Account password" autoComplete="current-password" />
        {pwErr && <p className="err" role="alert">{pwErr}</p>}
        <button className="px-btn" type="submit" disabled={!pw}>Continue</button>
        <button type="button" className="px-link" onClick={() => setForgot(false)}>Cancel</button>
      </form></div>
    )
  }

  if (!pin) {
    return (
      <div className="px-page px-diary-lock"><div className="px-card">
        <span className="px-pin-ico"><BookHeart size={28} /></span>
        {firstPin === null
          ? <PinPad key="a" title="Create a diary PIN" hint="Choose 4 digits. Only you can open your diary." onComplete={(p) => { setFirstPin(p) }} />
          : <PinPad key="b" title="Confirm your PIN" hint="Enter the same 4 digits again."
              onComplete={(p) => (p === firstPin ? savePin(p) : (setTimeout(() => setFirstPin(null), 500), 'The PINs did not match. Let’s start over.'))} />}
      </div></div>
    )
  }

  if (!unlocked) {
    return (
      <div className="px-page px-diary-lock"><div className="px-card">
        <span className="px-pin-ico"><Lock size={26} /></span>
        <PinPad title="My diary" hint="Enter your PIN" onComplete={async (p) => (await hashPassword(p, pin.salt) === pin.hash ? (setUnlocked(true), '') : 'Wrong PIN, try again.')}
          footer={<button type="button" className="px-link" onClick={() => setForgot(true)}>Forgot PIN?</button>} />
      </div></div>
    )
  }
  return <Notebook user={user} onLock={() => setUnlocked(false)} />
}

function Notebook({ user, onLock }) {
  const today = dayKey()
  const [entries, setEntries] = useState(() => readJSON(diaryKey(user.id), {}))
  const [day, setDay] = useState(today)
  const [saved, setSaved] = useState(true)
  const timer = useRef(null)
  const days = useMemo(() => Object.keys(entries).filter((k) => k !== today && entries[k].text?.trim()).sort().reverse(), [entries, today])
  const isToday = day === today

  useEffect(() => () => clearTimeout(timer.current), [])
  const write = (text) => {
    const next = { ...entries, [today]: { text, updated: Date.now() } }
    setEntries(next); setSaved(false)
    clearTimeout(timer.current)
    timer.current = setTimeout(() => { try { localStorage.setItem(diaryKey(user.id), JSON.stringify(next)) } catch { /* ignore */ } setSaved(true) }, 500)
  }
  const text = entries[day]?.text || ''

  return (
    <div className="px-page px-diary">
      <header className="px-head">
        <div><p className="px-eyebrow">MY DIARY</p><h1>{isToday ? 'Today’s page' : short(day)}</h1></div>
        <button type="button" className="px-pill" onClick={onLock}><Lock size={15} /> Lock</button>
      </header>
      {!isToday && <button type="button" className="px-link left" onClick={() => setDay(today)}><ChevronLeft size={16} /> Back to today</button>}
      <article className="px-paper">
        <i className="px-ribbon" aria-hidden="true" />
        <p className="px-paper-date">{long(day)}</p>
        <textarea value={text} readOnly={!isToday} onChange={(e) => write(e.target.value)} spellCheck={false}
          placeholder={isToday ? 'Dear diary…' : ''} aria-label={`Diary page for ${long(day)}`} />
        <small className="px-paper-foot">{isToday ? (saved ? 'Saved on this device' : 'Saving…') : 'Past pages are read-only'}</small>
      </article>
      {!!days.length && (
        <section className="px-card"><h2 className="px-h2">Earlier pages</h2>
          <ul className="px-diary-days">{days.map((k) => (
            <li key={k}><button type="button" className={k === day ? 'on' : ''} onClick={() => setDay(k)}><b>{short(k)}</b><span>{entries[k].text.trim().slice(0, 60)}</span></button></li>
          ))}</ul>
        </section>
      )}
    </div>
  )
}
