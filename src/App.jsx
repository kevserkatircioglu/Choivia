import { useState } from 'react'
import { ArrowRight, ArrowUpRight, BarChart3, BookHeart, BookMarked, CalendarDays, Clock3, Home as HomeIcon, Leaf, Settings2, Sprout } from 'lucide-react'
import { Link, NavLink, Route, Routes, useLocation, useNavigate } from 'react-router-dom'
import './App.css'
import './choivia-extra.css'
import './choivia-pro.css'
import AuthScreen from './components/AuthScreen.jsx'
import AppBar from './components/AppBar.jsx'
import Logo from './components/Logo.jsx'
import ProfileSetup from './components/ProfileSetup.jsx'
import WateringOverlay from './components/WateringOverlay.jsx'
import BottomNav from './components/BottomNav.jsx'
import RouteTransition from './components/RouteTransition.jsx'
import ScenicHero from './components/ScenicHero.jsx'
import { Avatar } from './components/Avatar.jsx'
import Calendar from './pages/Calendar.jsx'
import Preferences from './pages/Preferences.jsx'
import TodayPlan from './components/TodayPlan.jsx'
import { ComingUp, StepsCard } from './components/HomeWidgets.jsx'
import Diary from './pages/Diary.jsx'
import Stats from './pages/Stats.jsx'
import useSteps, { StepsContext } from './lib/useSteps.js'
import Planner from './pages/Planner.jsx'
import Books from './pages/Books.jsx'
import { useStored } from './lib/useStored.js'
import { AUTH_STORAGE_KEY, SESSION_STORAGE_KEY, readAccounts } from './lib/auth.js'
import { dayKey, markWatered, touchStreak } from './utils/streak.js'
import { AVATARS } from './data/avatars.js'
import './hobbies.css'
import Hobbies, { TodayHobbies } from './pages/Hobbies.jsx'
import HobbyDetail from './pages/HobbyDetail.jsx'

const PLAN_HOURS = Array.from({ length: 16 }, (_, i) => i + 7) // same 07:00–22:00 range as the Planner

function Sidebar({ streak }) {
  const navigation = [
    { to: '/', label: 'Home', icon: HomeIcon, end: true },
    { to: '/planner', label: 'Daily plan', icon: Clock3 },
    { to: '/calendar', label: 'Calendar', icon: CalendarDays },
    { to: '/diary', label: 'Diary', icon: BookHeart },
    { to: '/stats', label: 'Statistics', icon: BarChart3 },
    { to: '/hobbies', label: 'Hobbies', icon: Sprout },
    { to: '/books', label: 'Reading book', icon: BookMarked },
    { to: '/profile', label: 'Preferences', icon: Settings2 },
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

      <div className="cv-side-card">
        <span className="cv-side-flame" aria-hidden="true">🔥</span>
        <b>{streak?.current || 1} day streak</b>
        <small>Best: {streak?.best || 1}</small>
        <p>Come back tomorrow and your plant will bloom again 🌱</p>
      </div>
    </aside>
  )
}

function Home({ user, streak }) {
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
          <StepsCard />
          <TodayHobbies user={user} />
          <TodayPlan items={items} percent={percent} done={done} total={total} />
        </div>

        <aside className="dashboard-side-column-v2">
          <ComingUp user={user} />
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

function Shell({ user, streak, setStreak, onPick, onLogout }) {
  const { pathname } = useLocation()
  const steps = useSteps(user.id)
  const [watered, setWatered] = useState(false)
  const needsWater = streak && !watered && streak.watered !== dayKey()

  return (
    <StepsContext.Provider value={steps}>
      <div className="app-shell">
        <RouteTransition />
        {needsWater && (
          <WateringOverlay
            days={streak.current}
            onDone={() => {
              markWatered(user.id)
              setWatered(true)
              setStreak((s) => ({ ...s, watered: dayKey() }))
            }}
          />
        )}
        <Sidebar streak={streak} />
        <div className="app-main">
          <AppBar user={user} streak={streak} onPick={onPick} onLogout={onLogout} />
          <main className="page-container">
            <div key={pathname} className="px-page-in">
              <Routes>
                <Route path="/hobbies" element={<Hobbies user={user} />} />
                <Route path="/hobbies/:hobbyId" element={<HobbyDetail user={user} />} />
                <Route path="/" element={<Home user={user} streak={streak} />} />
                <Route path="/calendar" element={<Calendar user={user} />} />
                <Route path="/planner" element={<Planner user={user} />} />
                <Route path="/diary" element={<Diary user={user} />} />
                <Route path="/stats" element={<Stats user={user} />} />
                <Route path="/books" element={<Books user={user} />} />
                <Route
                  path="/profile"
                  element={<Preferences user={user} streak={streak} onUpdateUser={onPick.update} onLogout={onLogout} />}
                />
                <Route
                  path="*"
                  element={
                    <div className="empty-state">
                      <h2>Page not found</h2>
                      <Link to="/" className="text-link">
                        Return to home <ArrowRight size={15} />
                      </Link>
                    </div>
                  }
                />
              </Routes>
            </div>
          </main>
        </div>
        <BottomNav />
      </div>
    </StepsContext.Provider>
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
  if (!user.username || !AVATARS.some((a) => a.id === user.avatar)) {
    return <ProfileSetup user={user} onDone={(changes) => updateUserProfile(changes)} />
  }

  const onPick = Object.assign((avatar) => updateUserProfile({ avatar }), { update: updateUserProfile })
  return <Shell key={user.id} user={user} streak={streak} setStreak={setStreak} onPick={onPick} onLogout={handleLogout} />
}

export default App
