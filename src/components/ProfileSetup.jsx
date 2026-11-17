import { useState } from 'react'
import { ArrowRight, Info } from 'lucide-react'
import { Avatar, AvatarPicker } from './Avatar.jsx'
import Logo from './Logo.jsx'
import { usernameTaken, validateUsername } from '../lib/auth.js'

export default function ProfileSetup({ user, onDone }) {
  const [avatar, setAvatar] = useState(user.avatar || null)
  const [username, setUsername] = useState(user.username || '')
  const [error, setError] = useState('')
  const submit = (e) => {
    e.preventDefault()
    const err = validateUsername(username) || (usernameTaken(username, user.id) ? 'This username is already taken.' : '')
    if (err) return setError(err)
    onDone({ username: username.trim(), avatar })
  }
  return (
    <main className="px-auth px-setup">
      <form className="px-auth-card px-setup-card" onSubmit={submit} noValidate>
        <div className="px-auth-brand"><Logo size={30} /> choivia</div>
        <h1>Set up your profile</h1>
        <p>Hi {user.firstName || 'there'}! Choose a username and the buddy who will join you every day.</p>
        <div className="px-setup-preview">
          {avatar ? <Avatar key={avatar} id={avatar} size={96} className="cv-hero-avatar cv-swap" /> : <div className="px-setup-empty" />}
        </div>
        <label className="px-form-label">Username
          <input value={username} onChange={(e) => { setUsername(e.target.value); setError('') }} placeholder="e.g. kevser.t" maxLength={16} autoCapitalize="none" autoComplete="nickname" />
        </label>
        <AvatarPicker value={avatar} onChange={setAvatar} compact />
        <p className="px-hint-line"><Info size={15} /> You can change your username and avatar any time: open Preferences from your avatar at the top right of the app.</p>
        {error && <p className="px-error" role="alert">{error}</p>}
        <button className="px-submit" type="submit" disabled={!avatar || !username.trim()}>Start using Choivia <ArrowRight size={18} /></button>
      </form>
    </main>
  )
}
