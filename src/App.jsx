import { useState } from 'react'
import {
  ArrowRight,
  ArrowUpRight,
  BookMarked,
  CalendarDays,
  Leaf,
  LayoutDashboard,
  Sparkles,
  UserRound,
} from 'lucide-react'
import { Link, NavLink, Route, Routes, useNavigate } from 'react-router-dom'
import './App.css'
import './choivia-extra.css'
import AuthScreen from './components/AuthScreen.jsx'
import AppBar from './components/AppBar.jsx'
import Logo from './components/Logo.jsx'
import ProfileSetup from './components/ProfileSetup.jsx'
import WateringOverlay from './components/WateringOverlay.jsx'
import BottomNav from './components/BottomNav.jsx'
import SaplingTransition from './components/SaplingTransition.jsx'
import ScenicHero from './components/ScenicHero.jsx'
import { Avatar, AvatarPicker } from './components/Avatar.jsx'
import Planner from './pages/Planner.jsx'
import Books from './pages/Books.jsx'
import { useStored } from './lib/useStored.js'
import { AUTH_STORAGE_KEY, SESSION_STORAGE_KEY, readAccounts } from './lib/auth.js'
import { dayKey, markWatered, touchStreak } from './utils/streak.js'
import { AVATARS } from './data/avatars.js'

const PLAN_HOURS = Array.from({ length: 13 }, (_, i) => i + 8)
const formatHour = (h) => `${String(h).padStart(2, '0')}:00`

function Sidebar() {
  const navigation = [
    { to: '/', label: 'Dashboard', icon: LayoutDashboard, end: true },
    { to: '/planner', label: 'Daily plan', icon: CalendarDays },
    { to: '/books', label: 'Reading nook', icon: BookMarked },
    { to: '/profile', label: 'Profile', icon: UserRound },
  ]

  return (
    <aside className="sidebar">
      <Link to="/" className="brand" aria-label="Choivia home">
        <Logo size={34} />
        <span className="brand-name">choivia</span>
      </Link>

      <div className="sidebar-label">YOUR WORKSPACE</div>
      <nav className="side-nav" aria-label="Main navigation">
        {navigation.map(({ to, label, icon: Icon, end }) => (
          <NavLink
            key={to}
            to={to}
            end={end}
            className={({ isActive }) => `nav-link${isActive ? ' active' : ''}`}
          >
            <Icon size={18} strokeWidth={1.8} />
            <span>{label}</span>
          </NavLink>
        ))}
      </nav>

      <div className="sidebar-bottom">
        <div className="sidebar-note-icon"><Sparkles size={17} /></div>
        <p className="sidebar-note-title">Small steps add up.</p>
        <p className="sidebar-note-text">
          You don’t have to do everything today. Just find your next step.
        </p>
      </div>
    </aside>
  )
}

function Dashboard({ user, streak }) {
  // Bugünün planı Planner ile aynı anahtardan okunur.
  const [plan] = useStored(`choivia:plan:${user.id}:${dayKey()}`, {})

  const items = PLAN_HOURS.filter((h) => plan[h]).map((h) => ({ hour: h, ...plan[h] }))
  const total = items.length
  const done = items.filter((item) => item.done).length
  const percent = total ? Math.round((done / total) * 100) : 0
  const next = items.find((item) => !item.done)

  return (
    <div className="dashboard-page dashboard-v2">
      <header className="dashboard-heading-v2">
        <div>
          <p className="dashboard-overline"><span /> YOUR DAY, YOUR HOBBIES</p>
          <h1>Make space for <em>what you love.</em></h1>
          <p className="dashboard-subtitle">Plan your day, build habits, grow your hobbies.</p>
        </div>

        <Link to="/profile" className="dashboard-profile-chip">
          <span className="dashboard-profile-avatar"><Avatar id={user?.avatar} size={34} /></span>
          <span>
            <strong>Your space</strong>
            <small>Profile and avatar</small>
          </span>
          <ArrowUpRight size={16} />
        </Link>
      </header>

      <ScenicHero
        user={user}
        percent={percent}
        done={done}
        total={total}
        nextTitle={next?.text}
        nextTo="/planner"
        streak={streak}
      />

      <div className="dashboard-content-grid-v2">
        <div className="dashboard-main-column-v2">
          <section className="dashboard-next-card-v2">
            <div className="dashboard-next-topline">
              <div>
                <p className="dashboard-overline muted-overline">TODAY</p>
                <h2>Your plan for today</h2>
              </div>
              <span className="dashboard-next-index">
                {String(done).padStart(2, '0')} <span>/ {String(total).padStart(2, '0')}</span>
              </span>
            </div>

            {total === 0 ? (
              <div className="dashboard-next-task">
                <h3>Nothing planned yet.</h3>
                <p>Add your first item to the daily plan and watch your plant grow.</p>
                <Link to="/planner" className="text-link">
                  Open daily plan <ArrowRight size={14} />
                </Link>
              </div>
            ) : (
              <>
                <ul className="dashboard-today-list">
                  {items.map((item) => (
                    <li key={item.hour} className={item.done ? 'done' : ''}>
                      <strong>{formatHour(item.hour)}</strong>
                      <span>{item.text}</span>
                    </li>
                  ))}
                </ul>
                <div className="dashboard-next-bottom">
                  <div className="dashboard-next-track">
                    <span style={{ width: `${percent}%` }} />
                  </div>
                  <strong>{percent}%</strong>
                  <Link to="/planner" aria-label="Open daily plan">
                    <ArrowRight size={18} />
                  </Link>
                </div>
              </>
            )}
          </section>
        </div>

        <aside className="dashboard-side-column-v2">
          <section className="dashboard-note-panel-v2">
            <span className="note-flower">✳</span>
            <div>
              <strong>A gentle reminder</strong>
              <p>You do not have to figure everything out today. Start wherever you are.</p>
            </div>
          </section>
        </aside>
      </div>

      <footer className="dashboard-footer-v2">
        <span>Made for the in-between moments of your day.</span>
        <span>
          GROW AT YOUR OWN PACE <Leaf size={13} />
        </span>
      </footer>
    </div>
  )
}

function ProfilePage({ user, onUpdateUser, onLogout }) {
  return (
    <>
      <section className="choivia-identity-card">
        <div className="choivia-identity-avatar"><Avatar id={user?.avatar} size={72} /></div>
        <div className="choivia-identity-copy">
          <p className="eyebrow">YOUR CHOIVIA ACCOUNT</p>
          <h2>{user?.username || 'Friend'}</h2>
          <p>Your little corner for plans, hobbies and new beginnings.</p>
        </div>
        <button className="choivia-logout-button" type="button" onClick={onLogout}>Log out</button>
      </section>

      <section className="choivia-avatar-card">
        <div>
          <h2>Your avatar</h2>
          <p>Tap an icon to change it.</p>
        </div>
        <AvatarPicker value={user?.avatar} onChange={(avatar) => onUpdateUser({ avatar })} />
      </section>
    </>
  )
}

function App() {
  const navigate = useNavigate()
  const [user, setUser] = useState(() => {
    try {
      const value = localStorage.getItem(SESSION_STORAGE_KEY)
      return value ? JSON.parse(value) : null
    } catch {
      return null
    }
  })
  const [streak, setStreak] = useState(() => (user ? touchStreak(user.id) : null))
  const [watered, setWatered] = useState(false)

  function handleAuthSuccess(nextUser) {
    localStorage.setItem(SESSION_STORAGE_KEY, JSON.stringify(nextUser))
    setUser(nextUser)
    setStreak(touchStreak(nextUser.id))
  }

  function handleLogout() {
    localStorage.removeItem(SESSION_STORAGE_KEY)
    setUser(null)
    navigate('/')
  }

  function updateUserProfile(changes) {
    const updated = { ...user, ...changes }
    setUser(updated)
    localStorage.setItem(SESSION_STORAGE_KEY, JSON.stringify(updated))
    const accounts = readAccounts().map((a) => (a.id === user.id ? { ...a, ...changes } : a))
    localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(accounts))
  }

  if (!user) return <AuthScreen onAuthSuccess={handleAuthSuccess} />
  if (!AVATARS.some((a) => a.id === user.avatar)) {
    return <ProfileSetup user={user} onDone={(avatar) => updateUserProfile({ avatar })} />
  }

  const needsWater = streak && !watered && streak.watered !== dayKey()

  return (
    <div className="app-shell">
      <SaplingTransition />
      {needsWater && (
        <WateringOverlay
          days={streak.current}
          onDone={() => {
            markWatered(user.id)
            setWatered(true)
          }}
        />
      )}
      <Sidebar />
      <div className="app-main">
        <AppBar
          user={user}
          streak={streak}
          onPick={(avatar) => updateUserProfile({ avatar })}
          onLogout={handleLogout}
        />
        <main className="page-container">
          <Routes>
            <Route path="/" element={<Dashboard user={user} streak={streak} />} />
            <Route path="/planner" element={<Planner user={user} />} />
            <Route path="/books" element={<Books user={user} />} />
            <Route
              path="/profile"
              element={<ProfilePage user={user} onUpdateUser={updateUserProfile} onLogout={handleLogout} />}
            />
            <Route
              path="*"
              element={
                <div className="empty-state">
                  <h2>Page not found</h2>
                  <Link to="/" className="text-link">
                    Return to dashboard <ArrowRight size={15} />
                  </Link>
                </div>
              }
            />
          </Routes>
        </main>
      </div>
      <BottomNav />
    </div>
  )
}

export default App