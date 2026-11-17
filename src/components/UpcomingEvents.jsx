import { Link } from 'react-router-dom'
import { ArrowRight } from 'lucide-react'
import Icon from './Icon.jsx'
import { useStored } from '../lib/useStored.js'
import { dayKey } from '../utils/streak.js'
import { upcomingEvents, whenLabel } from '../utils/events.js'

const MON = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']

export default function UpcomingEvents({ user }) {
  const [events] = useStored(`choivia:events:${user.id}`, [])
  const list = upcomingEvents(events, dayKey())
  return (
    <section className="cv-up">
      <div className="cv-up-head"><h2>Coming up</h2><Link to="/calendar" className="text-link">Calendar <ArrowRight size={14} /></Link></div>
      {list.length === 0 ? (
        <p className="cv-up-empty"><Icon name="calendar" size={18} /> Nothing coming up. Add a birthday, exam or goal in your calendar.</p>
      ) : (
        <ul>
          {list.map((e) => {
            const [, m, d] = e.date.split('-')
            return (
              <li key={e.id} className={e.in <= 1 ? 'soon' : ''}>
                <span className="cv-up-date"><b>{Number(d)}</b>{MON[Number(m) - 1]}</span>
                <span className="cv-up-title"><Icon name={e.emoji || '⭐'} size={16} /> {e.title}</span>
                <span className="cv-up-chip">{whenLabel(e.in)}</span>
              </li>
            )
          })}
        </ul>
      )}
    </section>
  )
}
