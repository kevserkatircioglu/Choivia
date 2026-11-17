import { useState } from 'react'
import { Footprints, Minus, Play, Square } from 'lucide-react'
import { useStepsCtx } from '../lib/useSteps.js'
import { readJSON, planKey } from '../lib/keys.js'
import { dayKey } from '../utils/streak.js'
import StepRing from '../components/StepRing.jsx'

const WD = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun']
const weekDays = () => {
  const n = new Date(), mon = new Date(n.getFullYear(), n.getMonth(), n.getDate() - ((n.getDay() + 6) % 7))
  return WD.map((label, i) => { const d = new Date(mon); d.setDate(mon.getDate() + i); return { label, key: dayKey(d), future: dayKey(d) > dayKey(n), today: dayKey(d) === dayKey(n) } })
}

export default function Stats({ user }) {
  const s = useStepsCtx()
  const [custom, setCustom] = useState('')
  const week = weekDays()
  const stepMax = Math.max(s.goal, ...week.map((d) => s.days[d.key] || 0))
  const plan = week.map((d) => { const items = Object.values(readJSON(planKey(user.id, d.key), {})); return { ...d, total: items.length, done: items.filter((x) => x.done).length } })
  const total = plan.reduce((a, d) => a + d.total, 0), done = plan.reduce((a, d) => a + d.done, 0)
  const pct = total ? Math.round((done / total) * 100) : 0
  const weekSteps = week.reduce((a, d) => a + (s.days[d.key] || 0), 0)
  const msg = { unsupported: 'This device has no motion sensor, so use manual entry.', denied: 'Motion access was denied. Allow it in your browser settings.', idle: 'Counts steps while Choivia is open on your phone.', running: 'Counting… keep your phone with you.' }[s.status]

  return (
    <div className="px-page px-stats">
      <header className="px-head"><div><p className="px-eyebrow">STATISTICS</p><h1>Your week</h1></div></header>

      <section className="px-card px-steps">
        <div className="px-card-title"><Footprints size={18} /> Steps today</div>
        <div className="px-steps-body">
          <StepRing value={s.today} goal={s.goal} />
          <div className="px-steps-side">
            {s.status === 'running'
              ? <button type="button" className="px-btn ghost" onClick={s.stop}><Square size={15} /> Stop counting</button>
              : s.status !== 'unsupported' && <button type="button" className="px-btn" onClick={s.start}><Play size={15} /> Start counting</button>}
            <p className="px-muted">{msg}</p>
            <div className="px-adder">
              <button type="button" onClick={() => s.add(-100)} aria-label="Remove 100 steps"><Minus size={16} /></button>
              <button type="button" onClick={() => s.add(100)}>+100</button><button type="button" onClick={() => s.add(500)}>+500</button>
            </div>
            <form className="px-adder" onSubmit={(e) => { e.preventDefault(); const n = parseInt(custom, 10); if (n > 0) s.add(n); setCustom('') }}>
              <input inputMode="numeric" value={custom} onChange={(e) => setCustom(e.target.value.replace(/\D/g, ''))} placeholder="Add steps" aria-label="Add steps manually" /><button type="submit">Add</button>
            </form>
            <label className="px-goal">Daily goal
              <select value={s.goal} onChange={(e) => s.setGoal(Number(e.target.value))}>{[4000, 6000, 8000, 10000, 12000].map((g) => <option key={g} value={g}>{g.toLocaleString('en-US')}</option>)}</select>
            </label>
          </div>
        </div>
        <div className="px-bars" role="img" aria-label="Steps this week">
          {week.map((d) => { const v = s.days[d.key] || 0; return (
            <div key={d.key} className={`px-bar${d.today ? ' today' : ''}${d.future ? ' future' : ''}${v >= s.goal ? ' hit' : ''}`}>
              <small>{v ? (v >= 1000 ? `${(v / 1000).toFixed(1)}k` : v) : ''}</small><span><i style={{ height: `${(v / stepMax) * 100}%` }} /></span><em>{d.label}</em>
            </div>) })}
        </div>
        <p className="px-muted c">{weekSteps.toLocaleString('en-US')} steps this week</p>
      </section>

      <section className="px-card">
        <div className="px-card-title">Plan completion</div>
        <div className="px-plan-sum"><b>{pct}%</b><span>{done} of {total} planned tasks done this week</span></div>
        <div className="px-bars plan">
          {plan.map((d) => (
            <div key={d.key} className={`px-bar${d.today ? ' today' : ''}${d.future ? ' future' : ''}`}>
              <small>{d.total ? `${d.done}/${d.total}` : ''}</small><span><i style={{ height: d.total ? `${(d.done / d.total) * 100}%` : '0%' }} /></span><em>{d.label}</em>
            </div>))}
        </div>
        {!total && <p className="px-muted c">Add tasks in Daily plan and they’ll show up here.</p>}
      </section>
    </div>
  )
}
