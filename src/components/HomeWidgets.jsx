import { Link } from 'react-router-dom'
import { ArrowRight, BellRing, Footprints } from 'lucide-react'
import { useStored } from '../lib/useStored.js'
import { eventsKey } from '../lib/keys.js'
import { useStepsCtx } from '../lib/useSteps.js'
import { specialsFor } from '../data/specialDays.js'
import { dayKey } from '../utils/streak.js'
import { KindIcon } from '../pages/Calendar.jsx'
import StepRing from './StepRing.jsx'

export function StepsCard() {
  const s = useStepsCtx()
  const left = Math.max(0, s.goal - s.today)
  return (
    <Link to="/stats" className="px-home-steps" aria-label="Open statistics">
      <StepRing value={s.today} goal={s.goal} size={96} />
      <span className="px-home-steps-txt">
        <small><Footprints size={14} /> STEPS TODAY</small>
        <b>{s.today.toLocaleString('en-US')}</b>
        <em>{left ? `${left.toLocaleString('en-US')} to reach your goal` : 'Goal reached. Great walk!'}</em>
      </span>
      <ArrowRight size={18} className="px-chev" />
    </Link>
  )
}

const label = (diff, time) => (diff === 0 ? (time ? `Today · ${time}` : 'Today') : diff === 1 ? 'Tomorrow' : `In ${diff} days`)

export function ComingUp({ user }) {
  const [events] = useStored(eventsKey(user.id), [])
  const now = new Date(), items = []
  for (let i = 0; i < 14; i += 1) {
    const d = new Date(now.getFullYear(), now.getMonth(), now.getDate() + i), k = dayKey(d)
    events.filter((e) => e.date === k).forEach((e) => items.push({ id: `e${e.id}`, d, diff: i, title: e.title, time: e.time, emoji: e.emoji }))
    specialsFor(d.getFullYear(), d.getMonth(), d.getDate()).filter((s) => ['national', 'memorial', 'religious'].includes(s.type))
      .forEach((s) => items.push({ id: `s${k}${s.name}`, d, diff: i, title: s.name.split(' — ')[0], kind: s.type }))
  }
  return (
    <section className="px-coming" aria-label="Coming up">
      <div className="px-coming-head"><h2><BellRing size={17} /> Coming up</h2><Link to="/calendar">Calendar <ArrowRight size={14} /></Link></div>
      {items.length ? (
        <ul>
          {items.slice(0, 8).map((x) => (
            <li key={x.id} className={`${x.diff === 0 ? 'today ' : ''}${x.kind ? `k-${x.kind}` : ''}`}>
              <span className="px-coming-date"><b>{x.d.getDate()}</b><small>{x.d.toLocaleDateString('en-GB', { month: 'short' })}</small></span>
              <span className="px-coming-title">{x.kind ? <KindIcon kind={x.kind} size={15} /> : <i>{x.emoji}</i>}{x.title}</span>
              <em>{label(x.diff, x.time)}</em>
            </li>
          ))}
        </ul>
      ) : <p className="px-muted">Nothing in the next two weeks. Add a reminder in the calendar.</p>}
    </section>
  )
}
