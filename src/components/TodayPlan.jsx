import { Link } from 'react-router-dom'
import { ArrowRight } from 'lucide-react'

const icon = (h) => (h < 11 ? '🌅' : h < 17 ? '☀️' : h < 20 ? '🌇' : '🌙')
const fmt = (h) => `${String(h).padStart(2, '0')}:00`

export default function TodayPlan({ items, percent, done, total }) {
  const stage = total === 0 ? '🌱' : percent < 40 ? '🌿' : percent < 100 ? '🪴' : '🌸'
  const day = new Date().toLocaleDateString('en-US', { weekday: 'long' }).toUpperCase()
  return (
    <section className="cv-today">
      <div className="cv-today-head">
        <div><p className="eyebrow">TODAY · {day}</p><h2>Your plan for today</h2></div>
        <div className="cv-today-plant" aria-label={`${done} of ${total} done`}><span>{stage}</span><b>{done}/{total}</b></div>
      </div>
      {total === 0 ? (
        <div className="cv-today-empty"><span aria-hidden="true">☀️🗓️✨</span><p>Nothing planned yet. Add your first item and watch your plant grow.</p></div>
      ) : (
        <ol className="cv-today-list">
          {items.map((i) => (
            <li key={i.hour} className={i.done ? 'done' : ''}>
              <span className="cv-today-time"><i>{icon(i.hour)}</i>{fmt(i.hour)}</span>
              <span className="cv-today-text">{i.text}</span>{i.done && <em aria-hidden="true">✨</em>}
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
