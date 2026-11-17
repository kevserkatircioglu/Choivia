import { useState } from 'react'
import { Check, KeyRound, LogOut, Pencil } from 'lucide-react'
import { Avatar, AvatarPicker } from '../components/Avatar.jsx'
import { changePassword, renameAccount } from '../lib/auth.js'

function Msg({ m }) { return m ? <p className={`cv-msg ${m.ok ? 'ok' : 'bad'}`} role="status">{m.text}</p> : null }

export default function Preferences({ user, streak, onUpdateUser, onLogout }) {
  const [name, setName] = useState(user.username || '')
  const [nameMsg, setNameMsg] = useState(null)
  const [pw, setPw] = useState({ cur: '', next: '', again: '' })
  const [pwMsg, setPwMsg] = useState(null)

  function saveName(e) {
    e.preventDefault()
    const err = renameAccount(user.id, name)
    if (err) return setNameMsg({ text: err })
    onUpdateUser({ username: name.trim() }); setNameMsg({ ok: true, text: 'Username updated.' })
  }
  async function savePw(e) {
    e.preventDefault()
    if (pw.next !== pw.again) return setPwMsg({ text: 'New passwords do not match.' })
    const err = await changePassword(user.id, pw.cur, pw.next)
    if (err) return setPwMsg({ text: err })
    setPw({ cur: '', next: '', again: '' }); setPwMsg({ ok: true, text: 'Password changed.' })
  }

  return (
    <div className="cv-pref">
      <header className="cv-pref-hero">
        <Avatar id={user.avatar} size={84} className="cv-hero-avatar" />
        <div><p className="eyebrow">PREFERENCES</p><h1>{user.username}</h1>{user.email && <p>{user.email}</p>}<p>🔥 {streak?.current || 1} day streak · best {streak?.best || 1}</p></div>
      </header>

      <section className="cv-pref-card">
        <h2>Your buddy</h2><p>Tap an icon to change your avatar.</p>
        <AvatarPicker value={user.avatar} onChange={(avatar) => onUpdateUser({ avatar })} />
      </section>

      <section className="cv-pref-card">
        <h2><Pencil size={18} /> Change username</h2>
        <form onSubmit={saveName} className="cv-pref-form">
          <label>New username<input value={name} onChange={(e) => { setName(e.target.value); setNameMsg(null) }} minLength={3} maxLength={16} required autoComplete="username" /></label>
          <button type="submit" className="cv-pref-btn"><Check size={16} /> Save</button>
        </form>
        <Msg m={nameMsg} />
      </section>

      <section className="cv-pref-card">
        <h2><KeyRound size={18} /> Change password</h2>
        <form onSubmit={savePw} className="cv-pref-form">
          <label>Current password<input type="password" value={pw.cur} onChange={(e) => setPw({ ...pw, cur: e.target.value })} autoComplete="current-password" required /></label>
          <label>New password<input type="password" value={pw.next} onChange={(e) => setPw({ ...pw, next: e.target.value })} autoComplete="new-password" minLength={4} required /></label>
          <label>Repeat new password<input type="password" value={pw.again} onChange={(e) => setPw({ ...pw, again: e.target.value })} autoComplete="new-password" required /></label>
          <button type="submit" className="cv-pref-btn"><Check size={16} /> Update password</button>
        </form>
        <Msg m={pwMsg} />
      </section>

      <button type="button" className="cv-pref-logout" onClick={onLogout}><LogOut size={18} /> Log out</button>
    </div>
  )
}
