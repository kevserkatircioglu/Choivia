import { useState } from 'react'
import { Link } from 'react-router-dom'
import { LogOut, Settings2, X } from 'lucide-react'
import { Avatar } from './Avatar.jsx'
import Logo from './Logo.jsx'
import NotificationBell from './NotificationBell.jsx'

export default function AppBar({ user, onLogout }) {
  const [open, setOpen] = useState(false)

  function handleLogout() {
    setOpen(false)
    onLogout()
  }

  return (
    <>
      <header className="cv-appbar">
        <Link to="/" className="cv-appbar-logo" aria-label="Choivia home">
          <Logo size={32} />
          <b>choivia</b>
        </Link>

        <span className="cv-spacer" />

        <NotificationBell uid={user.id} />

        <button
          type="button"
          className="cv-me"
          onClick={() => setOpen((value) => !value)}
          aria-label="Open profile menu"
          aria-expanded={open}
          aria-haspopup="dialog"
        >
          <Avatar id={user.avatar} size={40} />
        </button>
      </header>

      {open && (
        <div
          className="cv-profile-back"
          onClick={() => setOpen(false)}
        >
          <section
            className="cv-profile-menu"
            role="dialog"
            aria-modal="false"
            aria-labelledby="cv-profile-menu-title"
            onClick={(event) => event.stopPropagation()}
          >
            <div className="cv-profile-menu-heading">
              <div>
                <h2 id="cv-profile-menu-title">
                  {user.username ? `@${user.username}` : 'Your profile'}
                </h2>
                <p>Your Choivia account</p>
              </div>

              <button
                type="button"
                className="cv-profile-menu-close"
                onClick={() => setOpen(false)}
                aria-label="Close profile menu"
              >
                <X size={19} />
              </button>
            </div>

            <nav className="cv-profile-menu-links" aria-label="Profile options">
              <Link
                to="/profile"
                onClick={() => setOpen(false)}
              >
                <Settings2 size={18} />
                <span>Preferences</span>
              </Link>

              <button
                type="button"
                onClick={handleLogout}
              >
                <LogOut size={18} />
                <span>Log out</span>
              </button>
            </nav>
          </section>
        </div>
      )}
    </>
  )
}
