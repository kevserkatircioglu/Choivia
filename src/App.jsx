import { useEffect, useState } from 'react'
import { ArrowRight, BookHeart, BookMarked, CalendarDays, Clock3, Home as HomeIcon, Settings2, Sprout } from 'lucide-react'
import { Link, NavLink, Route, Routes, useNavigate } from 'react-router-dom'
import './App.css'
import './choivia-extra.css'
import AuthScreen from './components/AuthScreen.jsx'
import AppBar from './components/AppBar.jsx'
import Logo from './components/Logo.jsx'
import ProfileSetup from './components/ProfileSetup.jsx'
import BottomNav from './components/BottomNav.jsx'
import SaplingTransition from './components/SaplingTransition.jsx'
import ScenicHero from './components/ScenicHero.jsx'
import Calendar from './pages/Calendar.jsx'
import Diary from './pages/Diary.jsx'
import Preferences from './pages/Preferences.jsx'
import TodayPlan from './components/TodayPlan.jsx'
import UpcomingEvents from './components/UpcomingEvents.jsx'
import Planner from './pages/Planner.jsx'
import Books from './pages/Books.jsx'
import { useStored } from './lib/useStored.js'
import { AUTH_STORAGE_KEY, SESSION_STORAGE_KEY, readAccounts } from './lib/auth.js'
import { dayKey } from './utils/streak.js'
import { AVATARS } from './data/avatars.js'
import './hobbies.css'
import Hobbies, { TodayHobbies } from './pages/Hobbies.jsx'
import HobbyDetail from './pages/HobbyDetail.jsx'
import { weeklyActivity } from './utils/hobbies.js'
import { getMotionPreference, shouldReduceMotion } from './utils/motionPreference.js'

const PLAN_HOURS = Array.from({ length: 13 }, (_, i) => i + 8)

function Sidebar() {
  const navigation = [
    { to: '/', label: 'Home', icon: HomeIcon, end: true },
    { to: '/planner', label: 'Daily plan', icon: Clock3 },
    { to: '/calendar', label: 'Calendar', icon: CalendarDays },
    { to: '/hobbies', label: 'Hobbies', icon: Sprout },
    { to: '/books', label: 'Reading list', icon: BookMarked },
    { to: '/diary', label: 'Diary', icon: BookHeart },
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

    </aside>
  )
}

function Home({ user }) {
  const [plan, setPlan] = useStored(`choivia:plan:${user.id}:${dayKey()}`, {})
  const [hobbies] = useStored(`choivia:hobbies:${user.id}`, [])

  const items = PLAN_HOURS.filter((h) => plan[h]).map((h) => ({ hour: h, ...plan[h] }))
  const total = items.length
  const done = items.filter((item) => item.done).length
  const percent = total ? Math.round((done / total) * 100) : 0
  const next = items.find((item) => !item.done)
  const activity = weeklyActivity(hobbies)

  const availableHours = PLAN_HOURS.filter((hour) => !plan[hour])
const currentHour = new Date().getHours()

const defaultHour = availableHours.reduce(
  (closest, hour) =>
    Math.abs(hour - currentHour) < Math.abs(closest - currentHour)
      ? hour
      : closest,
  availableHours[0] ?? '',
)

const addHomeTask = (text, hour) => {
  const cleanText = String(text ?? '').trim()
  const selectedHour = Number(hour)

  if (
    !cleanText ||
    !PLAN_HOURS.includes(selectedHour) ||
    plan[selectedHour]
  ) {
    return false
  }

  setPlan((currentPlan) => {
    if (currentPlan[selectedHour]) return currentPlan

    return {
      ...currentPlan,
      [selectedHour]: {
        text: cleanText,
        done: false,
      },
    }
  })

  return true
}

  return (
    <div className="dashboard-page dashboard-v2">
      <ScenicHero
        user={user}
        percent={percent}
        done={done}
        total={total}
        nextTitle={next?.text}
        nextTo="/planner"
        weeklyActivity={activity}
      />

      <div className="dashboard-content-grid-v2">
        <div className="dashboard-main-column-v2">
          <TodayHobbies user={user} />
          <TodayPlan
            items={items}
            percent={percent}
            done={done}
            total={total}
            availableHours={availableHours}
            defaultHour={defaultHour}
            onAddTask={addHomeTask}
          />
        </div>

        <aside className="dashboard-side-column-v2">
          <UpcomingEvents user={user} />

          <Link to="/diary" className="cv-home-diary-card">
            <span className="cv-home-diary-icon">
              <BookHeart size={22} strokeWidth={1.7} aria-hidden="true" />
            </span>
            <span className="cv-home-diary-content">
              <span className="cv-home-diary-eyebrow">A MOMENT FOR YOU</span>
              <strong>Your daily diary</strong>
              <span className="cv-home-diary-description">
                Pause for a moment, collect your thoughts and reflect on your day.
              </span>
              <span className="cv-home-diary-action">Open today's page <span aria-hidden="true">→</span></span>
            </span>
          </Link>
        </aside>
      </div>

    </div>
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

  useEffect(() => {
    if (!user?.id) {
      document.documentElement.classList.remove('choivia-reduce-motion')
      return undefined
    }

    const media = window.matchMedia('(prefers-reduced-motion: reduce)')

    const updateMotion = () => {
      const preference = getMotionPreference(user.id)
      const reduce = shouldReduceMotion(preference, media.matches)

      document.documentElement.classList.toggle('choivia-reduce-motion', reduce)
    }

    updateMotion()

    window.addEventListener('choivia:motion-preference-change', updateMotion)
    media.addEventListener('change', updateMotion)

    return () => {
      window.removeEventListener('choivia:motion-preference-change', updateMotion)
      media.removeEventListener('change', updateMotion)
    }
  }, [user?.id])

  function handleAuthSuccess(nextUser) {
    localStorage.setItem(SESSION_STORAGE_KEY, JSON.stringify(nextUser))
    setUser(nextUser)
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

  if (!user) {
    return (
      <>
        <SaplingTransition />
        <AuthScreen onAuthSuccess={handleAuthSuccess} />
      </>
    )
  }
  if (
    !user.username?.trim() ||
    !AVATARS.some((a) => a.id === user.avatar)
  ) {
    return (
      <>
        <SaplingTransition />
        <ProfileSetup
          user={user}
          onDone={(changes) => updateUserProfile(changes)}
        />
      </>
    )
  }

  return (
    <div className="app-shell">
      <SaplingTransition />
      <Sidebar />
      <div className="app-main">
        <AppBar
          user={user}
          onPick={(avatar) => updateUserProfile({ avatar })}
          onLogout={handleLogout}
        />
        <main className="page-container">
          <Routes>
            <Route path="/hobbies" element={<Hobbies user={user} />} />
            <Route path="/hobbies/:hobbyId" element={<HobbyDetail user={user} />} />
            <Route path="/" element={<Home user={user} />} />
            <Route path="/calendar" element={<Calendar user={user} />} />
            <Route path="/planner" element={<Planner user={user} />} />
            <Route path="/books" element={<Books user={user} />} />
            <Route path="/diary" element={<Diary user={user} />} />
            <Route
              path="/profile"
              element={<Preferences user={user} onUpdateUser={updateUserProfile} onLogout={handleLogout} />}
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
        </main>
      </div>
      <BottomNav />
    </div>
  )
}

export default App