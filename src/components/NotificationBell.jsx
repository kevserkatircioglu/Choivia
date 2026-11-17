import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  Bell, BellRing, CalendarClock, Droplets,
  ListChecks, Landmark, Sprout,
} from 'lucide-react'
import useNotifications from '../lib/useNotifications.js'
import '../notifications.css'

const ICON = {
  plan: ListChecks,
  event: CalendarClock,
  water: Droplets,
  special: Landmark,
  hobby: Sprout,
}

const timeLabel = (timestamp) => {
  const date = new Date(timestamp)
  const now = new Date()

  const time = date.toLocaleTimeString('en-GB', {
    hour: '2-digit',
    minute: '2-digit',
  })

  const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate())
  const startOfDate = new Date(date.getFullYear(), date.getMonth(), date.getDate())
  const days = Math.round((startOfToday - startOfDate) / 86400000)

  if (days === 0) return `Today, ${time}`
  if (days === 1) return `Yesterday, ${time}`

  return `${date.toLocaleDateString('en-GB', {
    day: 'numeric',
    month: 'short',
  })}, ${time}`
}

export default function NotificationBell({ uid }) {
  const notifications = useNotifications(uid)
  const [open, setOpen] = useState(false)
  const [permissionDismissed, setPermissionDismissed] = useState(() => {
    try {
      return localStorage.getItem(`choivia:notif-prompt-dismissed:${uid}`) === 'true'
    } catch {
      return false
    }
  })

  const navigate = useNavigate()

  const openNotification = (item) => {
    const fallbackRoutes = {
      plan: '/planner',
      event: '/calendar',
      special: '/calendar',
      hobby: '/hobbies',
      water: '/',
    }

    const legacyHobbyId = item.kind === 'hobby'
      ? String(item.id).split(':').slice(2).join(':')
      : ''

    notifications.markRead(item.id)
    setOpen(false)
    navigate(
      item.href
      || (legacyHobbyId ? `/hobbies/${encodeURIComponent(legacyHobbyId)}` : '')
      || fallbackRoutes[item.kind]
      || '/',
    )
  }

  return (
    <div className="px-bell-wrap">
      <button
        type="button"
        className={`px-bell${open ? ' is-open' : ''}`}
        onClick={() => setOpen((value) => !value)}
        aria-label={`Notifications${notifications.unread ? `, ${notifications.unread} unread` : ''}`}
        aria-expanded={open}
        aria-haspopup="dialog"
      >
        {notifications.unread > 0
          ? <BellRing size={20} />
          : <Bell size={20} />}
        {notifications.unread > 0 && (
          <span className="px-bell-count">
            {notifications.unread > 9 ? '9+' : notifications.unread}
          </span>
        )}
      </button>

      {open && (
        <>
          <button
            type="button"
            className="px-pop-back"
            aria-label="Close notifications"
            onClick={() => setOpen(false)}
          />
          <span className="px-notif-caret" aria-hidden="true" />

          <section
            className="px-notif"
            role="dialog"
            aria-label="Notifications"
          >
            <header className="px-notif-header">
              <div>
                <h2>Notifications</h2>
                <p>
                  {notifications.unread > 0
                    ? `${notifications.unread} unread`
                    : 'No unread'}
                </p>
              </div>

              <div className="px-notif-actions">
                {notifications.unread > 0 && (
                  <button type="button" onClick={notifications.markAllRead}>
                    Mark all read
                  </button>
                )}
                {notifications.list.length > 0 && (
                  <button type="button" onClick={notifications.clear}>
                    Clear
                  </button>
                )}
              </div>
            </header>

            {notifications.perm === 'default' && !permissionDismissed && (
              <div className="px-perm-prompt">
                <span>Get reminders on your phone.</span>
                <div>
                  <button
                    type="button"
                    className="px-perm-enable"
                    onClick={notifications.requestPermission}
                  >
                    Enable
                  </button>
                  <button
                    type="button"
                    className="px-perm-dismiss"
                    onClick={() => {
                      setPermissionDismissed(true)
                      try {
                        localStorage.setItem(`choivia:notif-prompt-dismissed:${uid}`, 'true')
                      } catch {
                        // Keep the choice for this session.
                      }
                    }}
                  >
                    Not now
                  </button>
                </div>
              </div>
            )}

            {notifications.perm === 'denied' && (
              <p className="px-perm-note">
                Phone notifications are blocked in your browser settings.
              </p>
            )}

            {notifications.perm === 'unsupported' && (
              <p className="px-perm-note">
                Phone notifications are not supported in this browser.
              </p>
            )}

            <ul className="px-notif-list">
              {notifications.list.map((item) => {
                const ItemIcon = ICON[item.kind] || Bell

                return (
                  <li key={item.id}>
                    <button
                      type="button"
                      className={`px-notif-item k-${item.kind}${item.read ? '' : ' unread'}`}
                      onClick={() => openNotification(item)}
                    >
                      <span className="px-notif-icon">
                        <ItemIcon size={18} />
                      </span>

                      <span className="px-notif-text">
                        <b>{item.title}</b>
                        <small>{item.body}</small>
                        <time dateTime={new Date(item.at).toISOString()}>
                          {timeLabel(item.at)}
                        </time>
                      </span>

                      {!item.read && (
                        <span className="px-notif-unread" aria-label="Unread" />
                      )}
                    </button>
                  </li>
                )
              })}

              {!notifications.list.length && (
                <li className="px-notif-empty">
                  <Bell size={24} />
                  <b>You’re all caught up.</b>
                  <span>
                    Reminders from your daily plan, calendar and hobbies
                    will appear here.
                  </span>
                </li>
              )}
            </ul>
          </section>
        </>
      )}
    </div>
  )
}
