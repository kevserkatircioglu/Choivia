import { useState } from 'react'
import { Link } from 'react-router-dom'
import { ArrowRight, Check, Sprout } from 'lucide-react'
import { Avatar } from './Avatar.jsx'
import { getAvatar } from '../data/avatars.js'
import { periodOf } from '../utils/period.js'

const GREET = {
  morning: 'Good morning',
  day: 'Good afternoon',
  evening: 'Good evening',
  night: 'Good night',
}

function message(period, percent) {
  if (period === 'night') return 'Rest is part of success too.'
  if (percent >= 100) return 'You finished everything. Amazing!'
  if (percent >= 50) return 'You are doing great!'
  if (percent > 0) return 'Small steps create big changes.'
  return 'Take one small step for yourself today.'
}

function displayName(username) {
  const name = String(username || '').trim()
  if (!name) return 'friend'

  const characters = Array.from(name)
  return `${characters[0].toLocaleUpperCase('tr-TR')}${characters.slice(1).join('')}`
}

function displayTask(title) {
  if (!title) return ''
  const prefix = 'Just 2 minutes:'

  return title.startsWith(prefix)
    ? `${title.slice(prefix.length).trim()} (2-min version)`
    : title
}

export default function ScenicHero({
  user,
  percent,
  total,
  nextTitle,
  nextTo,
  weeklyActivity,
}) {
  const [now] = useState(() => new Date())
  const period = periodOf(now.getHours())
  const a = getAvatar(user?.avatar)
  const sleeping = period === 'night'

  return (
    <section className={`cv-scene cv-${period}${percent >= 100 ? ' cv-all-done' : ''}`}>
      <div className="cv-sky" aria-hidden="true">
        <i className="cv-sun" />
        <i className="cv-moon" />

        {Array.from({ length: 14 }, (_, i) => (
          <b
            key={i}
            className="cv-star"
            style={{
              left: `${50 + (i * 31 + 7) % 47}%`,
              top: `${(i * 23 + 6) % 45}%`,
              animationDelay: `${i * 0.3}s`,
            }}
          >
            ✦
          </b>
        ))}

        <i className="cv-cloud cv-c1" />
        <i className="cv-cloud cv-c2" />
      </div>

      <div className="cv-hill cv-hill-back" aria-hidden="true" />
      <div className="cv-hill cv-hill-front" aria-hidden="true" />

      <div className="cv-copy">
        <h1>{GREET[period]}, {displayName(user?.username)}!</h1>
        <p>{message(period, percent)}</p>

        {!sleeping && (
          <Link className="cv-cta" to={nextTo}>
            {total === 0
              ? 'Add one small thing for today'
              : nextTitle
                ? 'Continue'
                : 'View your plan'}
            <ArrowRight size={16} />
          </Link>
        )}
      </div>

      <div className={`cv-stage${sleeping ? ' cv-sleeping' : ''}`}>
        {sleeping && (
          <span className="cv-zzz" aria-hidden="true">
            z<small>z</small><big>Z</big>
          </span>
        )}

        <Avatar
          id={user?.avatar}
          size={150}
          pose={period}
          className="cv-hero-avatar"
        />

        <span className="cv-bubble">
          {sleeping
            ? (a.sleepy || `${a.name} is sleeping… rest well`)
            : total === 0
              ? 'Plan your first task'
              : nextTitle
                ? `Next: ${displayTask(nextTitle)}`
                : 'All done!'}
        </span>
      </div>

      <div className="cv-weekly-activity">
        <div className="cv-weekly-activity-head">
          <Sprout size={19} aria-hidden="true" />
          <span>
            <b>Weekly hobby activity</b>
            <small>{weeklyActivity.activeDays} of 7 active days</small>
          </span>
        </div>

        <div
          className="cv-week"
          aria-label={`Weekly hobby activity: ${weeklyActivity.activeDays} active days out of 7`}
        >
          {weeklyActivity.days.map((day) => (
            <span
              key={day.key}
              className={`${day.done ? 'on' : ''}${day.isToday ? ' today' : ''}${day.future ? ' future' : ''}`}
              aria-label={`${day.label}: ${day.done ? 'hobby practice logged' : day.future ? 'upcoming' : 'no hobby practice logged'}`}
            >
              <i>{day.done && <Check size={12} aria-hidden="true" />}</i>
              {day.label}
            </span>
          ))}
        </div>
      </div>
    </section>
  )
}
