
import { useState } from 'react'
import { ArrowRight } from 'lucide-react'
import { Avatar, AvatarPicker } from './Avatar.jsx'
import Logo from './Logo.jsx'
import { readAccounts } from '../lib/auth.js'

export default function ProfileSetup({ user, onDone }) {
  const [avatar, setAvatar] = useState(user.avatar || null)
  const [username, setUsername] = useState(user.username || '')
  const [error, setError] = useState('')

  function handleSubmit() {
    const name = username.trim()

    if (name.length < 3) {
      setError('Username must be at least 3 characters.')
      return
    }

    if (!avatar) {
      setError('Please choose an avatar.')
      return
    }

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

    setError('')
    onDone({ username: name, avatar })
  }

  return (
    <main className="cv-auth cv-setup">
      <section className="cv-auth-card cv-setup-card">
        <div className="cv-auth-brand">
          <Logo size={30} /> choivia
        </div>

        <h1>Create your profile</h1>

        <p>Hi! Choose a username and pick the buddy who will join you every day.</p>

        <div className="cv-setup-username">
          <label htmlFor="profile-username">Username</label>
          <input
            id="profile-username"
            type="text"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            placeholder="Choose your username"
            minLength={3}
            maxLength={20}
          />
        </div>

        <div className="cv-setup-preview">
          {avatar ? (
            <Avatar
              key={avatar}
              id={avatar}
              size={120}
              className="cv-hero-avatar cv-swap"
            />
          ) : (
            <div className="cv-setup-empty">🌱</div>
          )}
        </div>

        <AvatarPicker value={avatar} onChange={setAvatar} />

        {error && (
          <p className="cv-error" role="alert">
            {error}
          </p>
        )}

        <button
          className="cv-submit"
          type="button"
          onClick={handleSubmit}
        >
          Let’s go <ArrowRight size={18} />
        </button>
      </section>
    </main>
  )
}

