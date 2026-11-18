import { useState } from 'react'
import { Link } from 'react-router-dom'
import { Plus, Clock3, ChevronDown } from 'lucide-react'
import Icon from './Icon.jsx'
import PlantIllustration from './PlantIllustration.jsx'
import './PlantIllustration.css'

const icon = (h) => (h < 11 ? 'sunrise' : h < 17 ? 'sun' : h < 20 ? 'sunset' : 'moon')
const fmt = (h) => `${String(h).padStart(2, '0')}:00`

export default function TodayPlan({
  items,
  percent,
  done,
  total,
  availableHours = [],
  defaultHour = '',
  onAddTask,
}) {
  const [draft, setDraft] = useState('')
  const [selectedHour, setSelectedHour] = useState(String(defaultHour ?? ''))
  const [timePickerOpen, setTimePickerOpen] = useState(false)

  const effectiveSelectedHour = availableHours.length
    ? String(
        availableHours.includes(Number(selectedHour))
          ? Number(selectedHour)
          : availableHours.includes(Number(defaultHour))
            ? defaultHour
            : availableHours[0],
      )
    : ''

  const stage = total === 0 ? 0 : percent < 20 ? 1 : percent < 40 ? 2 : percent < 70 ? 3 : 4
  const day = new Date().toLocaleDateString('en-US', { weekday: 'long' }).toUpperCase()

  const handleAdd = (event) => {
    event.preventDefault()

    const text = draft.trim()
    if (!text || effectiveSelectedHour === '') return

    const added = onAddTask?.(text, Number(effectiveSelectedHour))

    if (added) {
      setDraft('')
      setTimePickerOpen(false)
    }
  }

  return (
    <section className="cv-today">
      <div className="cv-today-head">
        <div>
          <p className="eyebrow">TODAY · {day}</p>
          <h2>Your plan for today</h2>
        </div>

        {total > 0 && (
          <div className="cv-today-plant" aria-label={`${done} of ${total} tasks done`}>
            <PlantIllustration stage={stage} size={48} />
            <b>{done}/{total}</b>
          </div>
        )}
      </div>

      {total === 0 ? (
        <div className="cv-today-empty">
          <Icon name="calendar" size={30} aria-hidden="true" />
          <p>Nothing planned yet. Add one small thing below whenever you’re ready.</p>
        </div>
      ) : (
        <ol className="cv-today-list">
          {items.map((i) => (
            <li key={i.hour} className={i.done ? 'done' : ''}>
              <span className="cv-today-time">
                <i><Icon name={icon(i.hour)} size={18} /></i>
                {fmt(i.hour)}
              </span>
              <span className="cv-today-text">{i.text}</span>
              {i.done && <em aria-hidden="true"><Icon name="sparkles" size={16} /></em>}
            </li>
          ))}
        </ol>
      )}

      <div className="cv-today-quick-add">
        {availableHours.length > 0 ? (
          <form onSubmit={handleAdd}>
            <div className="cv-quick-add-fields">
              <input
                className="cv-quick-add-input"
                type="text"
                value={draft}
                onChange={(event) => setDraft(event.target.value)}
                placeholder="What's one small thing for today?"
                aria-label="One small thing for today"
                maxLength={120}
              />

              <button
                type="button"
                className="cv-time-picker-trigger"
                aria-expanded={timePickerOpen}
                aria-controls="cv-time-options"
                onClick={() => setTimePickerOpen((open) => !open)}
              >
                <Clock3 size={15} aria-hidden="true" />
                <span>{fmt(Number(effectiveSelectedHour))}</span>
                <ChevronDown
                  size={15}
                  className={timePickerOpen ? 'cv-time-chevron open' : 'cv-time-chevron'}
                  aria-hidden="true"
                />
              </button>
            </div>

            {timePickerOpen && (
              <div
                className="cv-time-options"
                id="cv-time-options"
                role="group"
                aria-label="Choose a time"
              >
                {availableHours.map((hour) => (
                  <button
                    type="button"
                    key={hour}
                    className={`cv-time-option${Number(effectiveSelectedHour) === hour ? ' selected' : ''}`}
                    aria-pressed={Number(effectiveSelectedHour) === hour}
                    onClick={() => {
                      setSelectedHour(String(hour))
                      setTimePickerOpen(false)
                    }}
                  >
                    {fmt(hour)}
                  </button>
                ))}
              </div>
            )}

            <button
              type="submit"
              className="cv-quick-add-submit"
              disabled={!draft.trim() || effectiveSelectedHour === ''}
            >
              <Plus size={16} />
              Add
            </button>
          </form>
        ) : (
          <p className="cv-no-hours">
            All time slots are filled. You can adjust your schedule in the{' '}
            <Link to="/planner">daily planner</Link>.
          </p>
        )}
      </div>

      {total > 0 && (
        <div className="cv-today-foot">
          <div
            className="cv-today-bar"
            role="progressbar"
            aria-label="Daily plan progress"
            aria-valuemin={0}
            aria-valuemax={100}
            aria-valuenow={percent}
          >
            <span style={{ width: `${percent}%` }} />
          </div>
          <b>{percent}%</b>
        </div>
      )}
    </section>
  )
}
