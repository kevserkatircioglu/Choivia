import { useEffect, useRef, useState } from 'react'
import {
  ArrowLeft,
  ArrowRight,
  CalendarDays,
  Eye,
  EyeOff,
  Mail,
  ShieldCheck,
  Sprout,
  Trophy,
} from 'lucide-react'

import {
  hashPassword,
  readAccounts,
} from '../lib/auth.js'

import {
  MIN_PASSWORD,
  makeSalt,
  makeCode,
  normalizeEmail,
  titleCaseTr,
  validateFirstName,
  validateLastName,
  saveAccounts,
} from '../lib/authValidation.js'

import {
  mailConfigured,
  sendVerificationCode,
} from '../lib/mailer.js'

import { Avatar } from './Avatar.jsx'
import Logo from './Logo.jsx'
import { AVATARS } from '../data/avatars.js'

const CODE_TTL = 10 * 60 * 1000
const RESEND_SECONDS = 30
const MAX_ATTEMPTS = 5

export default function AuthScreen({ onAuthSuccess }) {
  const [mode, setMode] = useState('register')
  const [step, setStep] = useState('details')

  const [form, setForm] = useState({
    firstName: '',
    lastName: '',
    email: '',
    identifier: '',
    password: '',
    confirm: '',
  })

  const [showPassword, setShowPassword] = useState(false)
  const [error, setError] = useState('')
  const [busy, setBusy] = useState(false)
  const [preview, setPreview] = useState(0)

  const [code, setCode] = useState('')
  const [demoCode, setDemoCode] = useState('')
  const [sentTo, setSentTo] = useState('')
  const [cooldown, setCooldown] = useState(0)

  const pending = useRef(null)
  const isRegister = mode === 'register'

  const update = (field) => (event) => {
    setForm((current) => ({
      ...current,
      [field]: event.target.value,
    }))
    setError('')
  }

  useEffect(() => {
    const timer = window.setInterval(() => {
      setPreview((current) => (current + 1) % AVATARS.length)
    }, 2400)

    return () => window.clearInterval(timer)
  }, [])

  useEffect(() => {
    if (cooldown <= 0) return undefined

    const timer = window.setTimeout(() => {
      setCooldown((current) => Math.max(0, current - 1))
    }, 1000)

    return () => window.clearTimeout(timer)
  }, [cooldown])

  async function issueCode() {
    const current = pending.current

    if (!current) {
      throw new Error('Please restart the registration process.')
    }

    const verificationCode = makeCode()

    pending.current = {
      ...current,
      code: verificationCode,
      expires: Date.now() + CODE_TTL,
      attempts: 0,
    }

    const result = await sendVerificationCode({
      to: current.email,
      name: current.firstName,
      code: verificationCode,
    })

    setDemoCode(result.delivered ? '' : verificationCode)
    setCooldown(RESEND_SECONDS)
    setCode('')
  }

  async function submitDetails(event) {
    event.preventDefault()
    setError('')

    const firstError =
      validateFirstName(form.firstName) ||
      validateLastName(form.lastName)

    if (firstError) {
      setError(firstError)
      return
    }

    const email = normalizeEmail(form.email)

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      setError('Please enter a valid email address.')
      return
    }

    if (form.password.length < MIN_PASSWORD) {
      setError(`Password must be at least ${MIN_PASSWORD} characters.`)
      return
    }

    if (form.password !== form.confirm) {
      setError('Passwords do not match.')
      return
    }

    if (
      readAccounts().some(
        (account) => normalizeEmail(account.email) === email,
      )
    ) {
      setError('This email is already registered. Try logging in.')
      return
    }

    setBusy(true)

    try {
      pending.current = {
        firstName: titleCaseTr(form.firstName),
        lastName: titleCaseTr(form.lastName),
        email,
        password: form.password,
      }

      await issueCode()

      setSentTo(email)
      setStep('verify')
    } catch (err) {
      setError(err.message || 'Unable to send the verification code.')
    } finally {
      setBusy(false)
    }
  }

  async function resendCode() {
    if (cooldown > 0 || busy) return

    setBusy(true)
    setError('')

    try {
      await issueCode()
    } catch (err) {
      setError(err.message || 'Unable to resend the code.')
    } finally {
      setBusy(false)
    }
  }

  async function verifyCode(event) {
    event.preventDefault()
    setError('')

    const current = pending.current

    if (!current) {
      setStep('details')
      return
    }

    if (Date.now() > current.expires) {
      setError('This code has expired. Please request a new code.')
      return
    }

    if (current.attempts >= MAX_ATTEMPTS) {
      setError('Too many attempts. Please request a new code.')
      return
    }

    if (code !== current.code) {
      current.attempts += 1
      setError('That code is not correct. Please check your email.')
      return
    }

    setBusy(true)

    try {
      const accounts = readAccounts()

      if (
        accounts.some(
          (account) => normalizeEmail(account.email) === current.email,
        )
      ) {
        throw new Error('This email is already registered. Please log in.')
      }

      const salt = makeSalt()

      const account = {
        id: crypto.randomUUID
          ? crypto.randomUUID()
          : `${Date.now()}-${makeSalt()}`,
        firstName: current.firstName,
        lastName: current.lastName,
        email: current.email,
        emailVerified: true,
        username: '',
        avatar: null,
        salt,
        passwordHash: await hashPassword(current.password, salt),
      }

      saveAccounts([...accounts, account])

      pending.current = null
      setDemoCode('')

      onAuthSuccess({
        id: account.id,
        firstName: account.firstName,
        lastName: account.lastName,
        email: account.email,
        username: '',
        avatar: null,
      })
    } catch (err) {
      setError(err.message || 'Unable to create your account.')
    } finally {
      setBusy(false)
    }
  }

  async function login(event) {
    event.preventDefault()
    setError('')

    const identifier = form.identifier.trim().toLocaleLowerCase('tr-TR')

    if (!identifier || !form.password) {
      setError('Enter your email or username and password.')
      return
    }

    setBusy(true)

    try {
      const account = readAccounts().find(
        (item) =>
          normalizeEmail(item.email) === identifier ||
          item.username?.toLocaleLowerCase('tr-TR') === identifier,
      )

      if (!account) {
        throw new Error('Account not found. Check your details or sign up.')
      }

      const passwordHash = await hashPassword(
        form.password,
        account.salt,
      )

      if (passwordHash !== account.passwordHash) {
        throw new Error('Wrong password. Please try again.')
      }

      const knownAvatar = AVATARS.some(
        (avatar) => avatar.id === account.avatar,
      )

      onAuthSuccess({
        id: account.id,
        firstName: account.firstName,
        lastName: account.lastName,
        email: account.email,
        username: account.username || '',
        avatar: knownAvatar ? account.avatar : null,
      })
    } catch (err) {
      setError(err.message || 'Unable to log in.')
    } finally {
      setBusy(false)
    }
  }

  const passwordField = (autocomplete) => (
    <label>
      Password

      <span className="cv-password-wrap">
        <input
          type={showPassword ? 'text' : 'password'}
          autoComplete={autocomplete}
          value={form.password}
          onChange={update('password')}
          placeholder={`At least ${MIN_PASSWORD} characters`}
          minLength={MIN_PASSWORD}
          required
        />

        <button
          type="button"
          onClick={() => setShowPassword((visible) => !visible)}
          aria-label={showPassword ? 'Hide password' : 'Show password'}
        >
          {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
        </button>
      </span>
    </label>
  )

  return (
    <main className="cv-auth">
      <div className="cv-auth-float" aria-hidden="true">
        {AVATARS.slice(0, 10).map((avatar, index) => (
          <span key={avatar.id} style={{ '--i': index }}>
            <Avatar id={avatar.id} size={64} />
          </span>
        ))}
      </div>

      <section className="cv-auth-hero">
        <div className="cv-auth-brand">
          <Logo size={34} /> choivia
        </div>

        <div className="cv-auth-mascot">
          <Avatar
            key={preview}
            id={AVATARS[preview].id}
            size={150}
            className="cv-hero-avatar cv-swap"
          />

          <Sprout
            className="cv-auth-sprout"
            size={34}
            aria-hidden="true"
          />
        </div>

        <h1>
          {isRegister ? 'Let’s grow with small steps.' : 'Welcome back!'}
        </h1>

        <p>
          {isRegister
            ? 'Create your own little corner to plan, learn and bloom.'
            : 'Pick up right where you left off.'}
        </p>

        <ul className="cv-perks">
          <li><CalendarDays size={16} /> Weekly goals</li>
          <li><Sprout size={16} /> Growing plant</li>
          <li><Trophy size={16} /> Small wins</li>
        </ul>
      </section>

      <section className="cv-auth-card">
        {step === 'details' && (
          <div className="cv-tabs" role="tablist">
            <button
              type="button"
              role="tab"
              aria-selected={isRegister}
              onClick={() => {
                setMode('register')
                setError('')
                setShowPassword(false)
              }}
            >
              Sign up
            </button>

            <button
              type="button"
              role="tab"
              aria-selected={!isRegister}
              onClick={() => {
                setMode('login')
                setError('')
                setShowPassword(false)
              }}
            >
              Log in
            </button>
          </div>
        )}

        {isRegister && step === 'details' && (
          <form onSubmit={submitDetails} className="cv-form" noValidate>
            <div className="cv-auth-row">
              <label>
                First name
                <input
                  value={form.firstName}
                  onChange={update('firstName')}
                  placeholder="Your first name"
                  autoComplete="given-name"
                  maxLength={40}
                  required
                />
              </label>

              <label>
                Last name
                <input
                  value={form.lastName}
                  onChange={update('lastName')}
                  placeholder="Your last name"
                  autoComplete="family-name"
                  maxLength={40}
                  required
                />
              </label>
            </div>

            <label>
              Email address
              <input
                type="email"
                inputMode="email"
                autoComplete="email"
                value={form.email}
                onChange={update('email')}
                placeholder="name@example.com"
                required
              />
            </label>

            {passwordField('new-password')}

            <label>
              Confirm password
              <input
                type="password"
                autoComplete="new-password"
                value={form.confirm}
                onChange={update('confirm')}
                placeholder="Enter your password again"
                required
              />
            </label>

            {error && <p className="cv-error" role="alert">{error}</p>}

            <button className="cv-submit" type="submit" disabled={busy}>
              {busy ? 'Sending code…' : 'Continue'}
              <ArrowRight size={18} />
            </button>
          </form>
        )}

        {isRegister && step === 'verify' && (
          <form onSubmit={verifyCode} className="cv-form cv-verify" noValidate>
            <button
              type="button"
              className="cv-auth-back"
              onClick={() => {
                setStep('details')
                setError('')
              }}
            >
              <ArrowLeft size={16} /> Back
            </button>

            <span className="cv-verify-icon">
              <Mail size={25} />
            </span>

            <h2>Check your email</h2>

            <p>
              {mailConfigured
                ? 'We sent'
                : 'Demo mode: your code is shown below'}{' '}
              a 6-digit code to <b>{sentTo}</b>.
            </p>

            <label className="cv-code" aria-label="Verification code">
              <input
                inputMode="numeric"
                autoComplete="one-time-code"
                maxLength={6}
                value={code}
                autoFocus
                onChange={(event) =>
                  setCode(event.target.value.replace(/\D/g, '').slice(0, 6))
                }
              />

              {Array.from({ length: 6 }, (_, index) => (
                <i
                  key={index}
                  className={code.length === index ? 'on' : ''}
                >
                  {code[index] || ''}
                </i>
              ))}
            </label>

            {demoCode && (
              <p className="cv-demo-code">
                <ShieldCheck size={16} />
                Demo verification code: <b>{demoCode}</b>
              </p>
            )}

            {error && <p className="cv-error" role="alert">{error}</p>}

            <button
              className="cv-submit"
              type="submit"
              disabled={busy || code.length !== 6}
            >
              {busy ? 'Verifying…' : 'Verify & continue'}
              <ArrowRight size={18} />
            </button>

            <button
              type="button"
              className="cv-resend"
              disabled={busy || cooldown > 0}
              onClick={resendCode}
            >
              {cooldown > 0
                ? `Send a new code in ${cooldown}s`
                : 'Send a new code'}
            </button>
          </form>
        )}

        {!isRegister && (
          <form onSubmit={login} className="cv-form" noValidate>
            <label>
              Email or username
              <input
                autoComplete="username"
                value={form.identifier}
                onChange={update('identifier')}
                placeholder="name@example.com or username"
                required
              />
            </label>

            {passwordField('current-password')}

            {error && <p className="cv-error" role="alert">{error}</p>}

            <button className="cv-submit" type="submit" disabled={busy}>
              {busy ? 'One moment…' : 'Log in'}
              <ArrowRight size={18} />
            </button>
          </form>
        )}

        <p className="cv-foot">
          Your account is stored on this device.
        </p>
      </section>
    </main>
  )
}
