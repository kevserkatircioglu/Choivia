import { useState } from 'react'
import { Link } from 'react-router-dom'
import { BookMarked, Flame, LogOut, Settings2, Sprout, X } from 'lucide-react'
import { Avatar, AvatarPicker } from './Avatar.jsx'
import NotificationBell from './NotificationBell.jsx'
import Logo from './Logo.jsx'

export default function AppBar({ user, streak, onPick, onLogout }) {
  const [open, setOpen] = useState(false)
  const close = () => setOpen(false)
  return (
    <>
      <header className="cv-appbar">
        <Link to="/" className="cv-appbar-logo" aria-label="Choivia home"><Logo size={32} /><b>choivia</b></Link>
        <span className="cv-spacer" />
        <span className="cv-streak-chip" aria-label={`${streak?.current || 1} day streak`}><Flame size={18} /> {streak?.current || 1}</span>
        <NotificationBell uid={user.id} />
        <button type="button" className="cv-me" onClick={() => setOpen(true)} aria-label="Open profile menu"><Avatar id={user.avatar} size={40} /></button>
      </header>
      {open && (
        <div className="cv-sheet-back" onClick={close}>
          <div className="cv-sheet" role="dialog" aria-label="Your profile" onClick={(e) => e.stopPropagation()}>
            <button type="button" className="cv-sheet-x" onClick={close} aria-label="Close"><X size={20} /></button>
            <h2>{user.username}</h2>
            <p>Tap an icon to change your avatar</p>
            <AvatarPicker value={user.avatar} onChange={(id) => { onPick(id); close() }} />
            <div className="cv-sheet-links">
              <Link to="/hobbies" onClick={close}><Sprout size={18} /> Hobbies</Link>
              <Link to="/books" onClick={close}><BookMarked size={18} /> Reading book</Link>
              <Link to="/profile" onClick={close}><Settings2 size={18} /> Preferences (username, password)</Link>
              <button type="button" onClick={onLogout}><LogOut size={18} /> Log out</button>
            </div>
          </div>
        </div>
      )}
    </>
  )
}