import { createContext, useCallback, useContext, useEffect, useRef, useState } from 'react'
import { useStored } from './useStored.js'
import { stepsKey } from './keys.js'
import { dayKey } from '../utils/streak.js'

// Counts steps from the phone's accelerometer (DeviceMotion) while the app is open.
// Works in mobile browsers/PWAs. Background counting would need a native app (Health APIs).
const THRESH = 1.3, MIN_GAP = 320

export default function useSteps(uid) {
  const [data, setData] = useStored(stepsKey(uid), { days: {}, goal: 8000, auto: false })
  const [status, setStatus] = useState(typeof window !== 'undefined' && 'DeviceMotionEvent' in window ? 'idle' : 'unsupported')
  const pend = useRef(0)
  const handler = useRef(null)

  const add = useCallback((n) => setData((d) => {
    const k = dayKey(), v = Math.max(0, (d.days[k] || 0) + n)
    const days = { ...d.days, [k]: v }
    Object.keys(days).sort().slice(0, -60).forEach((x) => delete days[x])
    return { ...d, days }
  }), [setData])

  const attach = useCallback(() => {
    let avg = 9.8, smooth = 0, prev = 0, last = 0
    handler.current = (e) => {
      const a = e.accelerationIncludingGravity; if (!a) return
      const m = Math.hypot(a.x || 0, a.y || 0, a.z || 0)
      smooth = smooth * 0.6 + (m - avg) * 0.4; avg = avg * 0.92 + m * 0.08
      const t = e.timeStamp || performance.now()
      if (smooth > THRESH && prev <= THRESH && t - last > MIN_GAP) { last = t; pend.current += 1 }
      prev = smooth
    }
    window.addEventListener('devicemotion', handler.current)
    setStatus('running')
  }, [])
  const detach = useCallback(() => { if (handler.current) window.removeEventListener('devicemotion', handler.current); handler.current = null }, [])

  useEffect(() => {
    const t = setInterval(() => { if (pend.current) { const n = pend.current; pend.current = 0; add(n) } }, 1500)
    return () => clearInterval(t)
  }, [add])
  useEffect(() => {
    // Android/desktop resume automatically; iOS needs a tap for permission.
    const t = setTimeout(() => {
      if (data.auto && status === 'idle' && typeof DeviceMotionEvent.requestPermission !== 'function') attach()
    }, 0)
    return () => { clearTimeout(t); detach() } // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const start = async () => {
    try {
      if (typeof DeviceMotionEvent.requestPermission === 'function') {
        if (await DeviceMotionEvent.requestPermission() !== 'granted') return setStatus('denied')
      }
      attach(); setData((d) => ({ ...d, auto: true }))
    } catch { setStatus('denied') }
  }
  const stop = () => { detach(); setStatus('idle'); setData((d) => ({ ...d, auto: false })) }
  return {
    today: data.days[dayKey()] || 0, goal: data.goal, days: data.days, status, start, stop, add,
    setGoal: (g) => setData((d) => ({ ...d, goal: Math.min(50000, Math.max(1000, g)) })),
  }
}

export const StepsContext = createContext(null)
export const useStepsCtx = () => useContext(StepsContext)
