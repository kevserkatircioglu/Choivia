import { useEffect, useRef, useState } from 'react'
import { ArrowLeft, ArrowRight, Eye, EyeOff, Mail, ShieldCheck } from 'lucide-react'
import {
  MIN_PASSWORD, hashPassword, isGmail, makeCode, makeSalt, normalizeEmail, readAccounts, saveAccounts,
  titleCaseTr, validateFirstName, validateLastName,
} from '../lib/auth.js'
import { mailConfigured, sendVerificationCode } from '../lib/mailer.js'
import { Avatar } from './Avatar.jsx'
import Logo from './Logo.jsx'
import { AVATARS } from '../data/avatars.js'

const CODE_TTL = 10 * 60 * 1000

export default function AuthScreen({ onAuthSuccess }) {
  const [mode, setMode] = useState('register')
  const [step, setStep] = useState('details') // details | verify
  const [f, setF] = useState({ first: '', last: '', email: '', password: '', identifier: '' })
  const [show, setShow] = useState(false)
  const [error, setError] = useState('')
  const [busy, setBusy] = useState(false)
  const [preview, setPreview] = useState(0)
  const [code, setCode] = useState('')
  const [demoCode, setDemoCode] = useState('')
  const [sentTo, setSentTo] = useState('')
  const [cooldown, setCooldown] = useState(0)
  const pending = useRef(null)
  const isRegister = mode === 'register'
  const set = (k) => (e) => setF((p) => ({ ...p, [k]: e.target.value }))

  useEffect(() => {
    const t = setInterval(() => setPreview((n) => (n + 1) % AVATARS.length), 2400)
    return () => clearInterval(t)
  }, [])
  useEffect(() => {
    if (cooldown <= 0) return undefined
    const t = setTimeout(() => setCooldown((c) => c - 1), 1000)
    return () => clearTimeout(t)
  }, [cooldown])

  async function issueCode(first, email) {
    const c = makeCode()
    pending.current = { ...pending.current, code: c, expires: Date.now() + CODE_TTL, attempts: 0 }
    const res = await sendVerificationCode({ to: email, name: first, code: c })
    setDemoCode(res.delivered ? '' : c)
    setCooldown(30)
  }

  async function submitDetails(e) {
    e.preventDefault(); setError('')
    const err = validateFirstName(f.first) || validateLastName(f.last)
    if (err) return setError(err)
    if (!isGmail(f.email)) return setError('Please enter a valid Gmail address (name@gmail.com).')
    if (f.password.length < MIN_PASSWORD) return setError(`Password must be at least ${MIN_PASSWORD} characters.`)
    const email = normalizeEmail(f.email)
    if (readAccounts().some((a) => a.email === email)) return setError('An account with this Gmail already exists. Try logging in.')
    setBusy(true)
    try {
      const first = titleCaseTr(f.first), last = titleCaseTr(f.last)
      pending.current = { first, last, email, password: f.password }
      await issueCode(first, email)
      setSentTo(email); setCode(''); setStep('verify')
    } catch (er) { setError(er.message || 'Something went wrong.') } finally { setBusy(false) }
  }

  async function resend() {
    if (cooldown > 0) return
    setError(''); setBusy(true)
    try { await issueCode(pending.current.first, pending.current.email) } catch (er) { setError(er.message) } finally { setBusy(false) }
  }

  async function verify(e) {
    e.preventDefault(); setError('')
    const p = pending.current
    if (!p) return setStep('details')
    if (Date.now() > p.expires) return setError('This code has expired. Tap “Send a new code”.')
    if (p.attempts >= 5) return setError('Too many attempts. Please request a new code.')
    if (code !== p.code) { p.attempts += 1; return setError('That code is not correct. Please check your email.') }
    setBusy(true)
    try {
      const salt = makeSalt()
      const account = {
        id: crypto.randomUUID(), email: p.email, firstName: p.first, lastName: p.last,
        username: null, avatar: null, salt, passwordHash: await hashPassword(p.password, salt),
      }
      saveAccounts([...readAccounts(), account])
      onAuthSuccess({ id: account.id, email: p.email, firstName: p.first, lastName: p.last, username: null, avatar: null })
    } catch (er) { setError(er.message || 'Something went wrong.') } finally { setBusy(false) }
  }

  async function login(e) {
    e.preventDefault(); setError('')
    const id = f.identifier.trim().toLowerCase()
    if (!id || !f.password) return setError('Enter your Gmail (or username) and password.')
    setBusy(true)
    try {
      const acc = readAccounts().find((a) => a.email === id || a.username?.toLowerCase() === id)
      if (!acc) throw new Error('Account not found. Check your details or sign up.')
      if (await hashPassword(f.password, acc.salt) !== acc.passwordHash) throw new Error('Wrong password, please try again.')
      const known = AVATARS.some((a) => a.id === acc.avatar)
      onAuthSuccess({ id: acc.id, email: acc.email, firstName: acc.firstName, lastName: acc.lastName, username: acc.username || null, avatar: known ? acc.avatar : null })
    } catch (er) { setError(er.message) } finally { setBusy(false) }
  }

  const pwField = (autoComplete) => (
    <label>Password
      <span className="px-pw">
        <input type={show ? 'text' : 'password'} autoComplete={autoComplete} value={f.password} onChange={set('password')} placeholder={`At least ${MIN_PASSWORD} characters`} />
        <button type="button" onClick={() => setShow(!show)} aria-label={show ? 'Hide password' : 'Show password'}>{show ? <EyeOff size={18} /> : <Eye size={18} />}</button>
      </span>
    </label>
  )

  return (
    <main className="px-auth">
      <section className="px-auth-hero">
        <div className="px-auth-brand"><Logo size={34} /> choivia</div>
        <div className="px-auth-mascot"><Avatar key={preview} id={AVATARS[preview].id} size={132} className="cv-hero-avatar cv-swap" /></div>
        <h1>{isRegister ? 'Your personal planner, beautifully simple.' : 'Welcome back.'}</h1>
        <p>{isRegister ? 'Plan your days, keep a private diary and build small habits.' : 'Pick up right where you left off.'}</p>
      </section>

      <section className="px-auth-card">
        {step === 'details' && (
          <div className="px-tabs" role="tablist">
            <button type="button" role="tab" aria-selected={isRegister} onClick={() => { setMode('register'); setError('') }}>Sign up</button>
            <button type="button" role="tab" aria-selected={!isRegister} onClick={() => { setMode('login'); setError('') }}>Log in</button>
          </div>
        )}

        {isRegister && step === 'details' && (
          <form onSubmit={submitDetails} className="px-form" noValidate>
            <div className="px-row2">
              <label>First name<input autoComplete="given-name" value={f.first} onChange={set('first')} placeholder="name" maxLength={30} /></label>
              <label>Last name<input autoComplete="family-name" value={f.last} onChange={set('last')} placeholder="surname" maxLength={20} /></label>
            </div>
            <label>Gmail<input type="email" inputMode="email" autoComplete="email" value={f.email} onChange={set('email')} placeholder="name@gmail.com" /></label>
            {pwField('new-password')}
            {error && <p className="px-error" role="alert">{error}</p>}
            <button className="px-submit" type="submit" disabled={busy}>{busy ? 'Sending code…' : 'Continue'} <ArrowRight size={18} /></button>
          </form>
        )}

        {isRegister && step === 'verify' && (
          <form onSubmit={verify} className="px-form px-verify" noValidate>
            <button type="button" className="px-back" onClick={() => { setStep('details'); setError('') }}><ArrowLeft size={16} /> Back</button>
            <span className="px-verify-ico"><Mail size={26} /></span>
            <h2>Check your email</h2>
            <p>We {mailConfigured ? 'sent' : 'would send'} a 6-digit code to <b>{sentTo}</b>.</p>
            <label className="px-code" aria-label="Verification code">
              <input inputMode="numeric" autoComplete="one-time-code" maxLength={6} value={code} autoFocus
                onChange={(e) => setCode(e.target.value.replace(/\D/g, '').slice(0, 6))} />
              {Array.from({ length: 6 }, (_, i) => <i key={i} className={code.length === i ? 'on' : ''}>{code[i] || ''}</i>)}
            </label>
            {demoCode && <p className="px-demo"><ShieldCheck size={16} /> Demo mode: no mail server is connected, so your code is <b>{demoCode}</b></p>}
            {error && <p className="px-error" role="alert">{error}</p>}
            <button className="px-submit" type="submit" disabled={busy || code.length < 6}>Verify &amp; continue <ArrowRight size={18} /></button>
            <button type="button" className="px-link" disabled={cooldown > 0 || busy} onClick={resend}>{cooldown > 0 ? `Send a new code in ${cooldown}s` : 'Send a new code'}</button>
          </form>
        )}

        {!isRegister && (
          <form onSubmit={login} className="px-form" noValidate>
            <label>Gmail or username<input autoComplete="username" value={f.identifier} onChange={set('identifier')} placeholder="name@gmail.com" /></label>
            {pwField('current-password')}
            {error && <p className="px-error" role="alert">{error}</p>}
            <button className="px-submit" type="submit" disabled={busy}>{busy ? 'One moment…' : 'Log in'} <ArrowRight size={18} /></button>
          </form>
        )}
        <p className="px-foot">Accounts are stored on this device (demo).</p>
      </section>
    </main>
  )
}
