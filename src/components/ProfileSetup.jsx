import { useState } from 'react'
import { ArrowRight } from 'lucide-react'
import { Avatar, AvatarPicker } from './Avatar.jsx'
import Logo from './Logo.jsx'

export default function ProfileSetup({ user, onDone }) {
  const [avatar, setAvatar] = useState(null)
  return (
    <main className="cv-auth cv-setup">
      <section className="cv-auth-card cv-setup-card">
        <div className="cv-auth-brand"><Logo size={30} /> choivia</div>
        <h1>Create your profile</h1>
        <p>Hi {user.username}! Pick the buddy who will join you every day.</p>
        <div className="cv-setup-preview">
          {avatar ? <Avatar key={avatar} id={avatar} size={120} className="cv-hero-avatar cv-swap" /> : <div className="cv-setup-empty">🌱</div>}
        </div>
        <AvatarPicker value={avatar} onChange={setAvatar} />
        <button className="cv-submit" type="button" disabled={!avatar} onClick={() => onDone(avatar)}>Let’s go <ArrowRight size={18} /></button>
      </section>
    </main>
  )
}
