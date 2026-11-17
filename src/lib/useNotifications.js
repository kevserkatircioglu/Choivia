import { useCallback, useEffect, useState } from 'react'
import { dayKey } from '../utils/streak.js'
import { specialsFor } from '../data/specialDays.js'

const WATER_TIMES = ['10:00', '12:30', '15:00', '17:30', '20:00']
const MAX_AGE = 3 * 60 * 60 * 1000
const MAX_NOTIFICATIONS = 60

const nKey = (uid) => `choivia:notifs:${uid}`
const fKey = (uid) => `choivia:fired:${uid}`

const readJSON = (key, fallback) => {
  try {
    const value = localStorage.getItem(key)
    return value ? JSON.parse(value) : fallback
  } catch {
    return fallback
  }
}

const atTime = (day, hm) => {
  const date = new Date(`${day}T${hm}:00`)
  return Number.isNaN(date.getTime()) ? 0 : date.getTime()
}

function collectDue(uid, now) {
  const day = dayKey(now)
  const out = []

  const plan = readJSON(`choivia:plan:${uid}:${day}`, {})

  Object.entries(plan).forEach(([hour, item]) => {
    if (!item?.text || item.done) return

    const time = `${String(hour).padStart(2, '0')}:00`

    out.push({
      tag: `plan:${day}:${hour}`,
      at: atTime(day, time),
      kind: 'plan',
      title: item.text,
      body: `Scheduled for ${time} in your daily plan`,
      href: '/planner',
    })
  })

  readJSON(`choivia:hobbies:${uid}`, [])
    .filter((hobby) => hobby.reminderTime && hobby.name)
    .forEach((hobby) => {
      out.push({
        tag: `hobby:${day}:${hobby.id}`,
        at: atTime(day, hobby.reminderTime),
        kind: 'hobby',
        title: `Time for ${hobby.name}`,
        body: 'Your hobby reminder. Whenever you’re ready.',
        href: `/hobbies/${encodeURIComponent(hobby.id)}`,
      })
    })

  readJSON(`choivia:events:${uid}`, [])
    .filter((event) => event.date === day && event.title)
    .forEach((event) => {
      const time = event.time || '09:00'

      out.push({
        tag: `event:${event.id}`,
        at: atTime(day, time),
        kind: 'event',
        title: event.title,
        body: event.time
          ? `Calendar reminder · ${event.time}`
          : 'Calendar reminder for today',
        href: '/calendar',
      })
    })

  WATER_TIMES.forEach((time) => {
    out.push({
      tag: `water:${day}:${time}`,
      at: atTime(day, time),
      kind: 'water',
      title: 'Time for a glass of water',
      body: 'A few sips now keep your energy up.',
      href: '/',
    })
  })

  specialsFor(
    now.getFullYear(),
    now.getMonth(),
    now.getDate(),
  )
    .filter((item) => item.type !== 'week' && item.type !== 'special')
    .forEach((item) => {
      out.push({
        tag: `special:${day}:${item.name}`,
        at: atTime(day, '08:00'),
        kind: 'special',
        title: item.name,
        body: 'Special day in the calendar.',
      })
    })

  return out.filter((item) => item.at > 0)
}

async function systemNotify(notification) {
  try {
    if (
      typeof Notification === 'undefined' ||
      Notification.permission !== 'granted'
    ) return

    const options = {
      body: notification.body,
      tag: notification.id,
    }

    const registration = await navigator.serviceWorker?.getRegistration?.()

    if (registration?.showNotification) {
      await registration.showNotification(
        `Choivia · ${notification.title}`,
        options,
      )
    } else {
      new Notification(
        `Choivia · ${notification.title}`,
        options,
      )
    }
  } catch {
    // Browser or operating-system notification errors are non-fatal.
  }
}

export default function useNotifications(uid) {
  const [list, setList] = useState(() => readJSON(nKey(uid), []))
  const [perm, setPerm] = useState(() => (
    typeof Notification === 'undefined'
      ? 'unsupported'
      : Notification.permission
  ))

  useEffect(() => {
    try {
      localStorage.setItem(
        nKey(uid),
        JSON.stringify(list.slice(0, MAX_NOTIFICATIONS)),
      )
    } catch {
      // Ignore local storage errors.
    }
  }, [list, uid])

  useEffect(() => {
    if (!uid) return undefined

    const tick = () => {
      const now = new Date()
      const nowMs = now.getTime()
      const day = dayKey(now)
      const fired = readJSON(fKey(uid), {})
      const fresh = []
      let changed = false

      collectDue(uid, now).forEach((item) => {
        if (fired[item.tag] || item.at > nowMs) return

        fired[item.tag] = day
        changed = true

        if (nowMs - item.at <= MAX_AGE) {
          fresh.push({
            id: item.tag,
            kind: item.kind,
            title: item.title,
            body: item.body,
            href: item.href,
            at: item.at,
            read: false,
          })
        }
      })

      Object.keys(fired).forEach((key) => {
        if (fired[key] !== day) {
          delete fired[key]
          changed = true
        }
      })

      if (changed) {
        try {
          localStorage.setItem(fKey(uid), JSON.stringify(fired))
        } catch {
          // Ignore local storage errors.
        }
      }

      if (!fresh.length) return

      fresh.forEach((item) => {
        void systemNotify(item)
      })

      setList((previous) => (
        [...fresh, ...previous]
          .sort((a, b) => b.at - a.at)
          .slice(0, MAX_NOTIFICATIONS)
      ))
    }

    tick()

    const interval = window.setInterval(tick, 20000)
    document.addEventListener('visibilitychange', tick)

    return () => {
      window.clearInterval(interval)
      document.removeEventListener('visibilitychange', tick)
    }
  }, [uid])

  useEffect(() => {
    const hot = import.meta.hot
    if (!hot) return undefined

    const handleWaterReminder = () => {
      const item = {
        id: `demo:water:${Date.now()}:${Math.random().toString(36).slice(2)}`,
        kind: 'water',
        title: 'Time for a glass of water',
        body: 'A few sips now keep your energy up.',
        href: '/',
        at: Date.now(),
        read: false,
      }

      setList((previous) => [
        item,
        ...previous,
      ].slice(0, MAX_NOTIFICATIONS))

      void systemNotify(item)
    }

    hot.on('choivia:notify-water', handleWaterReminder)

    return () => {
      hot.off('choivia:notify-water', handleWaterReminder)
    }
  }, [])

  const requestPermission = useCallback(async () => {
    if (typeof Notification === 'undefined') {
      setPerm('unsupported')
      return
    }

    try {
      const permission = await Notification.requestPermission()
      setPerm(permission)
    } catch {
      setPerm(Notification.permission)
    }
  }, [])

  const markAllRead = useCallback(() => {
    setList((previous) => previous.map((item) => ({
      ...item,
      read: true,
    })))
  }, [])

  const markRead = useCallback((id) => {
    setList((previous) => previous.map((item) => (
      item.id === id ? { ...item, read: true } : item
    )))
  }, [])

  const clear = useCallback(() => {
    setList([])
  }, [])

  return {
    list,
    perm,
    unread: list.filter((item) => !item.read).length,
    requestPermission,
    markAllRead,
    markRead,
    clear,
  }
}
