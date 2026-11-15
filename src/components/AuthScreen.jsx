import { useEffect, useState } from 'react'
import { ArrowRight, Flame, Sprout, Trophy } from 'lucide-react'
import { AUTH_STORAGE_KEY, hashPassword, readAccounts } from '../lib/auth.js'
import { Avatar } from './Avatar.jsx'
import Logo from './Logo.jsx'
import { AVATARS } from '../data/avatars.js'

export default function AuthScreen({ onAuthSuccess }) {
  const [mode, setMode] = useState('register')
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [confirm, setConfirm] = useState('')
  const [error, setError] = useState('')
  const [busy, setBusy] = useState(false)
  const [preview, setPreview] = useState(0)
  const isRegister = mode === 'register'

  useEffect(() => {
    const t = setInterval(() => setPreview((n) => (n + 1) % AVATARS.length), 2000)
    return () => clearInterval(t)
  }, [])

  async function submit(e) {
    e.preventDefault(); setError('')
    const name = username.trim()
    if (name.length < 3) return setError('Username must be at least 3 characters.')
    if (password.length < 8) return setError('Password must be at least 8 characters.')
    if (isRegister && password !== confirm) return setError('Passwords do not match.')
    setBusy(true)
    try {
      const accounts = readAccounts()
      const existing = accounts.find((a) => a.username.toLowerCase() === name.toLowerCase())
      if (isRegister) {
        if (existing) throw new Error('This username is taken. Try another one.')
        const salt = Array.from(crypto.getRandomValues(new Uint8Array(16)), (b) => b.toString(16).padStart(2, '0')).join('')
        const account = { id: crypto.randomUUID(), username: name, avatar: null, salt, passwordHash: await hashPassword(password, salt) }
        localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify([...accounts, account]))
        onAuthSuccess({ id: account.id, username: name, avatar: null })
      } else {
        if (!existing) throw new Error('Account not found. Check your username or sign up.')
        if (await hashPassword(password, existing.salt) !== existing.passwordHash) throw new Error('Wrong password, please try again.')
        const known = AVATARS.some((a) => a.id === existing.avatar)
        onAuthSuccess({ id: existing.id, username: existing.username, avatar: known ? existing.avatar : null })
      }
    } catch (err) { setError(err.message || 'Something went wrong. Please try again.') }
    finally { setBusy(false) }
  }

  return (
    <main className="cv-auth">
      <div className="cv-auth-float" aria-hidden="true">
        {AVATARS.slice(0, 10).map((a, i) => <span key={a.id} style={{ '--i': i }}><Avatar id={a.id} size={64} /></span>)}
      </div>
      <section className="cv-auth-hero">
        <div className="cv-auth-brand"><Logo size={34} /> choivia</div>
        <div className="cv-auth-mascot"><Avatar key={preview} id={AVATARS[preview].id} size={150} className="cv-hero-avatar cv-swap" /><i className="cv-auth-sprout">🌱</i></div>
        <h1>{isRegister ? 'Let’s grow with small steps.' : 'Welcome back!'}</h1>
        <p>{isRegister ? 'Create your own little corner to plan, learn and bloom.' : 'Pick up right where you left off.'}</p>
        <ul className="cv-perks">
          <li><Flame size={16} /> Daily streak</li><li><Sprout size={16} /> Growing plant</li><li><Trophy size={16} /> Small wins</li>
        </ul>
      </section>
      <section className="cv-auth-card">
        <div className="cv-tabs" role="tablist">
          <button type="button" role="tab" aria-selected={isRegister} onClick={() => { setMode('register'); setError('') }}>Sign up</button>
          <button type="button" role="tab" aria-selected={!isRegister} onClick={() => { setMode('login'); setError('') }}>Log in</button>
        </div>
        <form onSubmit={submit} className="cv-form">
          <label>Username<input autoComplete="username" value={username} onChange={(e) => setUsername(e.target.value)} placeholder="e.g. kevser" required minLength={3} /></label>
          <label>Password<input type="password" autoComplete={isRegister ? 'new-password' : 'current-password'} value={password} onChange={(e) => setPassword(e.target.value)} placeholder="At least 8 characters" required minLength={8} /></label>
          {isRegister && <label>Confirm password<input type="password" autoComplete="new-password" value={confirm} onChange={(e) => setConfirm(e.target.value)} required /></label>}
          {error && <p className="cv-error" role="alert">{error}</p>}
          <button className="cv-submit" type="submit" disabled={busy}>{busy ? 'One moment…' : isRegister ? 'Create my space' : 'Log in'} <ArrowRight size={18} /></button>
        </form>
        <p className="cv-foot">Demo accounts are stored in this browser on this device.</p>
      </section>
    </main>
  )
}
