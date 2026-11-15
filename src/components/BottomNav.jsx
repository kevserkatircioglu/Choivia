import { NavLink } from 'react-router-dom'
import { BookMarked, CalendarDays, Clock3, Home, Sprout } from 'lucide-react'

const ITEMS = [
  { to: '/', label: 'Home', icon: Home, end: true },
  { to: '/planner', label: 'Plan', icon: Clock3 },
  { to: '/calendar', label: 'Calendar', icon: CalendarDays },
  { to: '/hobbies', label: 'Hobbies', icon: Sprout },
  { to: '/books', label: 'Books', icon: BookMarked },
]

export default function BottomNav() {
  return (
    <nav className="cv-bottom-nav" aria-label="Main navigation">
      {ITEMS.map(({ to, label, icon: Icon, end }) => (
        <NavLink key={to} to={to} end={end} className={({ isActive }) => `cv-tab${isActive ? ' active' : ''}`}>
          <Icon size={22} strokeWidth={1.9} /><span>{label}</span>
        </NavLink>
      ))}
    </nav>
  )
}
