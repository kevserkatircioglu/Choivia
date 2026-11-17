import { useState } from 'react'
import { Link } from 'react-router-dom'
import { ArrowRight, Check, Sprout } from 'lucide-react'
import { Avatar } from './Avatar.jsx'
import { getAvatar } from '../data/avatars.js'
import { periodOf } from '../utils/period.js'

const GREET = { morning: 'Good morning', day: 'Good afternoon', evening: 'Good evening', night: 'Good night' }

function message(period, percent) {
  if (period === 'night') return 'Rest is part of success too.'
  if (percent >= 100) return 'You finished everything. Amazing!'
  if (percent >= 50) return 'You are doing great!'
  if (percent > 0) return 'Small steps create big changes.'
  return 'Take one small step for yourself today.'
}

export default function ScenicHero({ user, percent, done, total, nextTitle, nextTo, weeklyActivity }) {
  const [now] = useState(() => new Date())
  const period = periodOf(now.getHours())
  const a = getAvatar(user?.avatar)
  const sleeping = period === 'night'
  return (
    <section className={`cv-scene cv-${period}${percent >= 100 ? ' cv-all-done' : ''}`}>
      <div className="cv-sky" aria-hidden="true">
        <i className="cv-sun" /><i className="cv-moon" />
        {Array.from({ length: 14 }, (_, i) => <b key={i} className="cv-star" style={{ left: `${(i * 37 + 8) % 96}%`, top: `${(i * 23 + 6) % 52}%`, animationDelay: `${i * 0.3}s` }}>✦</b>)}
        <i className="cv-cloud cv-c1" /><i className="cv-cloud cv-c2" />
      </div>
      <div className="cv-hill cv-hill-back" aria-hidden="true" /><div className="cv-hill cv-hill-front" aria-hidden="true" />

      <div className="cv-copy">
        <h2>{GREET[period]}, {user?.username || 'friend'}!</h2>
        <p>{message(period, percent)}</p>
        <Link className="cv-cta" to={nextTo}>{total === 0 ? 'Open daily plan' : nextTitle ? 'Continue' : 'View your plan'} <ArrowRight size={16} /></Link>
      </div>

      <div className={`cv-stage${sleeping ? ' cv-sleeping' : ''}`}>
        {sleeping && <span className="cv-zzz" aria-hidden="true">z<small>z</small><big>Z</big></span>}
        <Avatar id={user?.avatar} size={190} pose={period} className="cv-hero-avatar" />
        <span className="cv-bubble">{sleeping ? (a.sleepy || `${a.name} is sleeping… rest well`) : total === 0 ? 'Plan your first task' : nextTitle ? `Next: ${nextTitle}` : 'All done!'}</span>
      </div>

      <div className="cv-cards">
        <div className="cv-card cv-progress">
          <div className="cv-ring" style={{ '--p': `${percent * 3.6}deg` }}><strong>{percent}%</strong></div>
          <span><b>Daily progress</b><small>{done} / {total} tasks done</small></span>
        </div>
        <div className="cv-card cv-weekly-activity">
          <div className="cv-weekly-activity-head">
            <Sprout size={20} aria-hidden="true" />
            <span>
              <b>Weekly activity</b>
              <small>{weeklyActivity.activeDays} of 7 active days</small>
            </span>
          </div>
          <div className="cv-week" aria-label={`Weekly activity: ${weeklyActivity.activeDays} active days out of 7`}>
            {weeklyActivity.days.map((day) => (
              <span
                key={day.key}
                className={`${day.done ? 'on' : ''}${day.isToday ? ' today' : ''}${day.future ? ' future' : ''}`}
                aria-label={`${day.label}: ${day.done ? 'practice logged' : day.future ? 'upcoming' : 'no practice logged'}`}
              >
                <i>{day.done && <Check size={13} aria-hidden="true" />}</i>
                {day.label}
              </span>
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}
