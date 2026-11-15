import { NavLink } from 'react-router-dom'
import { BookMarked, CalendarDays, CheckCircle2, LayoutDashboard, ListChecks } from 'lucide-react'

const ITEMS = [
  { to: '/', label: 'Home', icon: LayoutDashboard, end: true },
  { to: '/guides', label: 'Guides', icon: ListChecks },
  { to: '/planner', label: 'Plan', icon: CalendarDays },
  { to: '/books', label: 'Books', icon: BookMarked },
  { to: '/progress', label: 'Progress', icon: CheckCircle2 },
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
