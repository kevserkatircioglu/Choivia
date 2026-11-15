import { useState } from 'react'
import { Link } from 'react-router-dom'
import { Flame, LogOut, Settings2, ClipboardList, X } from 'lucide-react'
import { Avatar, AvatarPicker } from './Avatar.jsx'
import Logo from './Logo.jsx'

export default function AppBar({ user, streak, onPick, onLogout }) {
  const [open, setOpen] = useState(false)
  return (
    <>
      <header className="cv-appbar">
        <Link to="/" className="cv-appbar-logo" aria-label="Choivia home"><Logo size={32} /><b>choivia</b></Link>
        <span className="cv-spacer" />
        <span className="cv-streak-chip" aria-label={`${streak?.current || 1} day streak`}><Flame size={18} /> {streak?.current || 1}</span>
        <button type="button" className="cv-me" onClick={() => setOpen(true)} aria-label="Open profile"><Avatar id={user.avatar} size={40} /></button>
      </header>
      {open && (
        <div className="cv-sheet-back" onClick={() => setOpen(false)}>
          <div className="cv-sheet" role="dialog" aria-label="Your profile" onClick={(e) => e.stopPropagation()}>
            <button type="button" className="cv-sheet-x" onClick={() => setOpen(false)} aria-label="Close"><X size={20} /></button>
            <h2>{user.username}</h2>
            <p>Tap an icon to change your buddy</p>
            <AvatarPicker value={user.avatar} onChange={(id) => { onPick(id); setOpen(false) }} />
            <div className="cv-sheet-links">
              <Link to="/profile" onClick={() => setOpen(false)}><Settings2 size={18} /> Preferences</Link>
              <Link to="/study" onClick={() => setOpen(false)}><ClipboardList size={18} /> Usability study</Link>
              <button type="button" onClick={onLogout}><LogOut size={18} /> Log out</button>
            </div>
          </div>
        </div>
      )}
    </>
  )
}
