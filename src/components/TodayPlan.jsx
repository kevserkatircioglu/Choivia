import { Link } from 'react-router-dom'
import { ArrowRight } from 'lucide-react'
import Icon from './Icon.jsx'
import PlantIllustration from './PlantIllustration.jsx'
import './PlantIllustration.css'

const icon = (h) => (h < 11 ? 'sunrise' : h < 17 ? 'sun' : h < 20 ? 'sunset' : 'moon')
const fmt = (h) => `${String(h).padStart(2, '0')}:00`

export default function TodayPlan({ items, percent, done, total }) {
  const stage = total === 0 ? 0 : percent < 20 ? 1 : percent < 40 ? 2 : percent < 70 ? 3 : 4
  const day = new Date().toLocaleDateString('en-US', { weekday: 'long' }).toUpperCase()
  return (
    <section className="cv-today">
      <div className="cv-today-head">
        <div><p className="eyebrow">TODAY · {day}</p><h2>Your plan for today</h2></div>
        <div className="cv-today-plant" aria-label={`${done} of ${total} done`}><PlantIllustration stage={stage} size={48} /><b>{done}/{total}</b></div>
      </div>
      {total === 0 ? (
        <div className="cv-today-empty">
          <Icon name="calendar" size={30} aria-hidden="true" />
          <p>Nothing planned yet. Add your first item when you’re ready.</p>
        </div>
      ) : (
        <ol className="cv-today-list">
          {items.map((i) => (
            <li key={i.hour} className={i.done ? 'done' : ''}>
              <span className="cv-today-time"><i><Icon name={icon(i.hour)} size={18} /></i>{fmt(i.hour)}</span>
              <span className="cv-today-text">{i.text}</span>{i.done && <em aria-hidden="true"><Icon name="sparkles" size={16} /></em>}
            </li>
          ))}
        </ol>
      )}
      <div className="cv-today-foot">
        <div className="cv-today-bar"><span style={{ width: `${percent}%` }} /></div><b>{percent}%</b>
        <Link to="/planner" className="cv-today-go">Open daily plan <ArrowRight size={15} /></Link>
      </div>
    </section>
  )
}
