import { useState } from 'react'
import { ArrowRight, Info } from 'lucide-react'
import { Avatar } from './Avatar.jsx'
import Logo from './Logo.jsx'
import {
  validateUsername,
  usernameTaken,
} from '../lib/authValidation.js'
import { AVATARS } from '../data/avatars.js'

export default function ProfileSetup({ user, onDone }) {
  const [avatar, setAvatar] = useState(user.avatar || null)
  const [username, setUsername] = useState(user.username || '')
  const [error, setError] = useState('')
  const [busy, setBusy] = useState(false)

  function handleSubmit(event) {
    event.preventDefault()
    setError('')

    const cleanUsername = username.trim()
    const validationError = validateUsername(cleanUsername)

    if (validationError) {
      setError(validationError)
      return
    }

    if (usernameTaken(cleanUsername, user.id)) {
      setError('This username is already taken. Please choose another.')
      return
    }

    if (!avatar) {
      setError('Please choose your avatar.')
      return
    }

    setBusy(true)

    try {
      onDone({
        username: cleanUsername,
        avatar,
      })
    } catch (err) {
      setError(err.message || 'Unable to save your profile.')
      setBusy(false)
    }
  }

  return (
    <main className="cv-auth cv-setup">
      <section className="cv-auth-card cv-setup-card">
        <div className="cv-auth-brand">
          <Logo size={30} /> choivia
        </div>

        <h1>Create your profile</h1>

        <p>
          Hi{user.firstName ? ` ${user.firstName}` : ''}! Choose a username
          and pick the buddy who will join you every day.
        </p>

        <form onSubmit={handleSubmit} className="cv-form">
          <div className="cv-setup-username">
            <label htmlFor="profile-username">
              Choose your username
            </label>

            <input
              id="profile-username"
              type="text"
              value={username}
              onChange={(event) => {
                setUsername(event.target.value)
                setError('')
              }}
              placeholder="e.g. littlebloom"
              minLength={3}
              maxLength={16}
              autoCapitalize="none"
              autoComplete="username"
              required
            />

            <small>
              3–16 characters. Letters, numbers, dots and underscores.
              Turkish characters are supported.
            </small>
          </div>

          {avatar && (
            <div className="cv-setup-preview">
              <Avatar
                id={avatar}
                size={112}
                className="cv-hero-avatar cv-swap"
              />
            </div>
          )}

          <div className="cv-setup-avatar-section">
            <h3>Choose your avatar</h3>
            <p>Pick your favorite buddy!</p>

            <div className="cv-avatar-grid">
              {AVATARS.map((item) => (
                <button
                  type="button"
                  key={item.id}
                  className={`cv-avatar-pick${avatar === item.id ? ' selected' : ''}`}
                  aria-pressed={avatar === item.id}
                  onClick={() => {
                    setAvatar(item.id)
                    setError('')
                  }}
                >
                  <Avatar id={item.id} size={64} />
                  <span>{item.name || item.id}</span>
                </button>
              ))}
            </div>
          </div>

          <p className="cv-setup-hint">
            <Info size={16} />
            You can change your username and avatar later from Preferences.
          </p>

          {error && <p className="cv-error" role="alert">{error}</p>}

          <button
            className="cv-submit"
            type="submit"
            disabled={busy || !avatar || !username.trim()}
          >
            {busy ? 'One moment…' : 'Start using Choivia'}
            <ArrowRight size={18} />
          </button>
        </form>

        <p className="cv-foot">Your profile is your own little space.</p>
      </section>
    </main>
  )
}
