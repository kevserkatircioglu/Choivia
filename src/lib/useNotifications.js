import { useCallback, useEffect, useRef, useState } from 'react'
import { dayKey } from '../utils/streak.js'
import { specialsFor } from '../data/specialDays.js'
import { eventsKey, planKey, readJSON } from './keys.js'

const WATER_TIMES = ['10:00', '12:30', '15:00', '17:30', '20:00']
const MAX_AGE = 3 * 3600 * 1000 // missed reminders older than this are skipped silently
const nKey = (uid) => `choivia:notifs:${uid}`
const fKey = (uid) => `choivia:fired:${uid}`
const atTime = (day, hm) => new Date(`${day}T${hm}:00`).getTime()

function collectDue(uid, now) {
  const day = dayKey(now), out = []
  Object.entries(readJSON(planKey(uid, day), {})).forEach(([h, p]) => {
    const hm = `${String(h).padStart(2, '0')}:00`
    if (p && !p.done) out.push({ tag: `plan:${day}:${h}`, at: atTime(day, hm), kind: 'plan', title: p.text, body: `Scheduled for ${hm} in your daily plan` })
  })
  readJSON(`choivia:hobbies:${uid}`, []).filter((hb) => hb.reminderTime).forEach((hb) => {
    out.push({ tag: `hobby:${day}:${hb.id}`, at: atTime(day, hb.reminderTime), kind: 'hobby', title: `Time for ${hb.name}`, body: 'Your hobby reminder. Whenever you’re ready.' })
  })
  readJSON(eventsKey(uid), []).filter((e) => e.date === day).forEach((e) => {
    out.push({ tag: `event:${e.id}`, at: atTime(day, e.time || '09:00'), kind: 'event', title: e.title, body: e.time ? `Calendar reminder · ${e.time}` : 'Calendar reminder for today' })
  })
  WATER_TIMES.forEach((t) => out.push({ tag: `water:${day}:${t}`, at: atTime(day, t), kind: 'water', title: 'Time for a glass of water', body: 'A few sips now keep your energy up.' }))
  specialsFor(now.getFullYear(), now.getMonth(), now.getDate()).filter((s) => s.type !== 'week' && s.type !== 'special').forEach((s) => {
    out.push({ tag: `special:${day}:${s.name}`, at: atTime(day, '08:00'), kind: 'special', title: s.name, body: 'Special day in the calendar' })
  })
  return out
}

async function systemNotify(n) {
  try {
    if (typeof Notification === 'undefined' || Notification.permission !== 'granted') return
    const opts = { body: n.body, icon: `${import.meta.env.BASE_URL}icons/icon-192.png`, tag: n.id }
    const reg = await navigator.serviceWorker?.getRegistration?.()
    if (reg) reg.showNotification(`Choivia · ${n.title}`, opts)
    else new Notification(`Choivia · ${n.title}`, opts)
  } catch { /* ignore */ }
}

export default function useNotifications(uid) {
  const [list, setList] = useState(() => readJSON(nKey(uid), []))
  const [perm, setPerm] = useState(() => (typeof Notification === 'undefined' ? 'unsupported' : Notification.permission))
  const listRef = useRef(list)
  useEffect(() => { listRef.current = list; try { localStorage.setItem(nKey(uid), JSON.stringify(list.slice(0, 60))) } catch { /* ignore */ } }, [list, uid])

  useEffect(() => {
    const tick = () => {
      const now = new Date(), nowMs = now.getTime(), day = dayKey(now)
      const fired = readJSON(fKey(uid), {})
      const fresh = []
      collectDue(uid, now).forEach((d) => {
        if (fired[d.tag] || d.at > nowMs) return
        fired[d.tag] = day
        if (nowMs - d.at <= MAX_AGE) fresh.push({ id: `${d.tag}`, kind: d.kind, title: d.title, body: d.body, at: d.at, read: false })
      })
      if (!fresh.length) return
      Object.keys(fired).forEach((k) => { if (fired[k] !== day) delete fired[k] })
      try { localStorage.setItem(fKey(uid), JSON.stringify(fired)) } catch { /* ignore */ }
      fresh.forEach(systemNotify)
      setList((prev) => [...fresh, ...prev].sort((a, b) => b.at - a.at).slice(0, 60))
    }
    tick()
    const t = setInterval(tick, 20000)
    document.addEventListener('visibilitychange', tick)
    return () => { clearInterval(t); document.removeEventListener('visibilitychange', tick) }
  }, [uid])

  const requestPermission = useCallback(async () => {
    if (typeof Notification === 'undefined') return
    setPerm(await Notification.requestPermission())
  }, [])
  return {
    list, perm, unread: list.filter((n) => !n.read).length, requestPermission,
    markAllRead: () => setList((p) => p.map((n) => ({ ...n, read: true }))),
    markRead: (id) => setList((p) => p.map((n) => (n.id === id ? { ...n, read: true } : n))),
    clear: () => setList([]),
  }
}
