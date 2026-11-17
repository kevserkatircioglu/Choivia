import { useState } from 'react'
import { Bell, BellRing, CalendarClock, Droplets, ListChecks, Landmark, Sprout } from 'lucide-react'
import useNotifications from '../lib/useNotifications.js'

const ICON = { plan: ListChecks, event: CalendarClock, water: Droplets, special: Landmark, hobby: Sprout }
const hm = (t) => new Date(t).toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' })
const when = (t) => {
  const d = new Date(t), n = new Date()
  const days = Math.round((new Date(n.getFullYear(), n.getMonth(), n.getDate()) - new Date(d.getFullYear(), d.getMonth(), d.getDate())) / 86400000)
  return days === 0 ? `Today, ${hm(t)}` : days === 1 ? `Yesterday, ${hm(t)}` : `${d.toLocaleDateString('en-GB', { day: 'numeric', month: 'short' })}, ${hm(t)}`
}

export default function NotificationBell({ uid }) {
  const n = useNotifications(uid)
  const [open, setOpen] = useState(false)
  return (
    <div className="px-bell-wrap">
      <button type="button" className="px-bell" onClick={() => setOpen(!open)} aria-label={`Notifications${n.unread ? `, ${n.unread} unread` : ''}`} aria-expanded={open}>
        {n.unread ? <BellRing size={20} /> : <Bell size={20} />}{n.unread > 0 && <i>{n.unread > 9 ? '9+' : n.unread}</i>}
      </button>
      {open && (
        <>
          <div className="px-pop-back" onClick={() => setOpen(false)} />
          <section className="px-notif" role="dialog" aria-label="Notifications">
            <header><h2>Notifications</h2>
              <span>{n.unread > 0 && <button type="button" onClick={n.markAllRead}>Mark all read</button>}{n.list.length > 0 && <button type="button" onClick={n.clear}>Clear</button>}</span></header>
            {n.perm === 'default' && <button type="button" className="px-perm" onClick={n.requestPermission}><BellRing size={16} /> Allow notifications on this phone</button>}
            {n.perm === 'denied' && <p className="px-perm-note">Phone notifications are blocked in your browser settings.</p>}
            <ul>
              {n.list.map((x) => { const Icon = ICON[x.kind] || Bell; return (
                <li key={x.id} className={`k-${x.kind}${x.read ? '' : ' unread'}`} onClick={() => n.markRead(x.id)}>
                  <span className="ico"><Icon size={18} /></span>
                  <span className="txt"><b>{x.title}</b><small>{x.body}</small></span>
                  <time>{when(x.at)}</time>
                </li>) })}
              {!n.list.length && <li className="empty"><Bell size={22} /><span>You’re all caught up.<small>Reminders from your plan and calendar will appear here.</small></span></li>}
            </ul>
          </section>
        </>
      )}
    </div>
  )
}
