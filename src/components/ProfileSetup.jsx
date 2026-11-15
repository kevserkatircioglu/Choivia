
import { useState } from 'react'
import { ArrowRight } from 'lucide-react'
import { Avatar, AvatarPicker } from './Avatar.jsx'
import Logo from './Logo.jsx'
import { readAccounts } from '../lib/auth.js'

export default function ProfileSetup({ user, onDone }) {
  const [avatar, setAvatar] = useState(user.avatar || null)
  const [username, setUsername] = useState(user.username || '')
  const [error, setError] = useState('')
  const [busy, setBusy] = useState(false)

  function handleSubmit(e) {
    e.preventDefault()
    setError('')

    const name = username.trim()

    // Username validation
    if (name.length < 3) {
      setError('Username must be at least 3 characters.')
      return
    }

    if (name.length > 20) {
      setError('Username cannot exceed 20 characters.')
      return
    }

    if (!/^[a-zA-Z0-9_]+$/.test(name)) {
      setError(
        'Username can only contain letters, numbers and underscores.'
      )
      return
    }

    // Avatar validation
    if (!avatar) {
      setError('Please choose an avatar.')
      return
    }

    // Check username availability
    const accounts = readAccounts()

    const existing = accounts.find(
      (account) =>
        account.id !== user.id &&
        account.username?.toLowerCase() === name.toLowerCase()
    )

    if (existing) {
      setError('This username is already taken. Try another one.')
      return
    }

    // Complete profile setup
    setBusy(true)

    try {
      onDone({
        username: name,
        avatar,
      })
    } catch (err) {
      setError(
        err.message || 'Something went wrong. Please try again.'
      )
      setBusy(false)
    }
  }

  return (
    <main className="cv-auth cv-setup">
      <section className="cv-auth-card cv-setup-card">

        {/* Brand */}
        <div className="cv-auth-brand">
          <Logo size={30} /> choivia
        </div>

        {/* Heading */}
        <h1>Create your profile</h1>

        <p>
          Hi{user.firstName ? ` ${user.firstName}` : ''}!
          Choose a username and pick the buddy
          who will join you every day.
        </p>

        {/* Username */}
        <form onSubmit={handleSubmit} className="cv-form">

          <div className="cv-setup-username">
            <label htmlFor="profile-username">
              Choose your username
            </label>

            <input
              id="profile-username"
              type="text"
              value={username}
              onChange={(e) => {
                setUsername(e.target.value)
                setError('')
              }}
              placeholder="e.g. littlebloom"
              minLength={3}
              maxLength={20}
              autoComplete="username"
              required
            />

            <small>
              3–20 characters. Letters, numbers and underscores only.
            </small>
          </div>

          {/* Avatar Preview */}
          <div className="cv-setup-preview">
            {avatar ? (
              <Avatar
                key={avatar}
                id={avatar}
                size={120}
                className="cv-hero-avatar cv-swap"
              />
            ) : (
              <div className="cv-setup-empty">
                🌱
              </div>
            )}
          </div>

          {/* Avatar Selection */}
          <div className="cv-setup-avatar-section">
            <h3>Choose your avatar</h3>

            <p>
              Pick your favorite buddy!
            </p>

            <AvatarPicker
              value={avatar}
              onChange={(value) => {
                setAvatar(value)
                setError('')
              }}
            />
          </div>

          {/* Error */}
          {error && (
            <p className="cv-error" role="alert">
              {error}
            </p>
          )}

          {/* Submit */}
          <button
            className="cv-submit"
            type="submit"
            disabled={busy}
          >
            {busy ? 'One moment…' : 'Let’s go'}

            <ArrowRight size={18} />
          </button>

        </form>

        <p className="cv-foot">
          Your profile is your own little space.
        </p>

      </section>
    </main>
  )
}
