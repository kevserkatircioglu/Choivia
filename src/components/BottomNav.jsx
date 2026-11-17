import { NavLink } from 'react-router-dom'
import { BarChart3, BookHeart, CalendarDays, Clock3, Home } from 'lucide-react'

const ITEMS = [
  { to: '/', label: 'Home', icon: Home, end: true },
  { to: '/planner', label: 'Plan', icon: Clock3 },
  { to: '/calendar', label: 'Calendar', icon: CalendarDays },
  { to: '/diary', label: 'Diary', icon: BookHeart },
  { to: '/stats', label: 'Stats', icon: BarChart3 },
]

export default function BottomNav() {
  return (
    <nav className="px-bnav" aria-label="Main navigation">
      {ITEMS.map(({ to, label, icon: Icon, end }) => (
        <NavLink key={to} to={to} end={end} className={({ isActive }) => `px-bnav-item${isActive ? ' active' : ''}`}>
          <span><Icon size={21} strokeWidth={1.9} /></span><small>{label}</small>
        </NavLink>
      ))}
    </nav>
  )
}
