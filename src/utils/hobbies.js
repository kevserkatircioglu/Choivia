// Hobi verisi için saf yardımcı fonksiyonlar (React'e bağımlı değil, kolay test edilir).

const pad = (n) => String(n).padStart(2, '0')

// Yerel saate göre YYYY-MM-DD. (toISOString UTC verir; gece yarısı civarında yanlış güne düşer.)
export function toKey(date = new Date()) {
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}`
}

export const todayKey = () => toKey()

export const uid = () => `${Date.now().toString(36)}${Math.random().toString(36).slice(2, 7)}`

export const MOODS = [
  { id: 'great', emoji: '😄', label: 'Great' },
  { id: 'good', emoji: '🙂', label: 'Good' },
  { id: 'okay', emoji: '😐', label: 'Okay' },
  { id: 'hard', emoji: '😓', label: 'Hard' },
]

export const MILESTONES = [1, 3, 7, 14, 30, 50, 100]

const PLANT_STAGES = [
  { min: 0, emoji: '🌱', label: 'Seed' },
  { min: 3, emoji: '🌿', label: 'Sprout' },
  { min: 10, emoji: '🪴', label: 'Growing' },
  { min: 25, emoji: '🌳', label: 'Flourishing' },
  { min: 50, emoji: '🌸', label: 'In bloom' },
]

export function createHobby({
  name,
  emoji = '🌱',
  why = '',
  stages = [],
  goalPerWeek = 3,
  reminderTime = '',
}) {
  return {
    id: uid(),
    name: name.trim(),
    emoji,
    why: why.trim(),
    goalPerWeek,
    reminderTime,
    createdAt: new Date().toISOString(),
    checkins: [], // 'YYYY-MM-DD' listesi (hangi günler pratik yapıldı)
    sessions: [], // { id, date, minutes, mood, note }
    stages: stages.map((stage) => ({
      id: uid(),
      title: stage.title,
      tasks: stage.tasks.map((text) => ({ id: uid(), text, done: false })),
    })),
  }
}

/* ---------- Checklist ilerlemesi ---------- */

export function hobbyProgress(hobby) {
  const tasks = hobby.stages.flatMap((stage) => stage.tasks)
  const done = tasks.filter((task) => task.done).length
  return {
    done,
    total: tasks.length,
    percent: tasks.length ? Math.round((done / tasks.length) * 100) : 0,
  }
}

// İlk tamamlanmamış görev ve ait olduğu aşama. Hepsi bittiyse null.
export function nextTask(hobby) {
  for (const stage of hobby.stages) {
    const task = stage.tasks.find((item) => !item.done)
    if (task) return { stage, task }
  }
  return null
}

/* ---------- Check-in ve günlük ---------- */

export const isCheckedToday = (hobby) => hobby.checkins.includes(todayKey())

// Bugünün check-in'ini aç/kapat. Tekrar basınca geri alınır.
export function toggleCheckin(hobby) {
  const key = todayKey()
  const has = hobby.checkins.includes(key)
  return {
    ...hobby,
    checkins: has ? hobby.checkins.filter((item) => item !== key) : [...hobby.checkins, key],
  }
}

// Bugüne bir günlük kaydı ekler ve bugünü pratik günü sayar.
export function addSession(hobby, { minutes, mood, note }) {
  const key = todayKey()
  return {
    ...hobby,
    checkins: hobby.checkins.includes(key) ? hobby.checkins : [...hobby.checkins, key],
    sessions: [
      ...(hobby.sessions ?? []),
      { id: uid(), date: key, minutes: Number(minutes) || 0, mood: mood || '', note: (note || '').trim() },
    ],
  }
}

export function removeSession(hobby, sessionId) {
  return { ...hobby, sessions: (hobby.sessions ?? []).filter((item) => item.id !== sessionId) }
}

export function sessionsNewestFirst(hobby) {
  return [...(hobby.sessions ?? [])].reverse().sort((a, b) => b.date.localeCompare(a.date))
}

export const totalDays = (hobby) => new Set(hobby.checkins).size

export const totalMinutes = (hobby) =>
  (hobby.sessions ?? []).reduce((sum, item) => sum + (item.minutes || 0), 0)

export function formatDay(key) {
  return new Date(`${key}T00:00:00`).toLocaleDateString('en', { month: 'short', day: 'numeric' })
}

/* ---------- Bitki ve kilometre taşları ---------- */

export function plantStage(total) {
  let index = 0
  PLANT_STAGES.forEach((stage, i) => {
    if (total >= stage.min) index = i
  })
  return { current: PLANT_STAGES[index], next: PLANT_STAGES[index + 1] ?? null }
}

export const latestMilestone = (total) => [...MILESTONES].reverse().find((m) => m <= total) ?? null
export const nextMilestone = (total) => MILESTONES.find((m) => m > total) ?? null

/* ---------- Haftalık hedef (Pazartesi-Pazar) ---------- */

function startOfWeek(date = new Date()) {
  const d = new Date(date.getFullYear(), date.getMonth(), date.getDate())
  d.setDate(d.getDate() - ((d.getDay() + 6) % 7))
  return d
}

function weekKeys(start) {
  return Array.from({ length: 7 }, (_, i) => {
    const d = new Date(start)
    d.setDate(d.getDate() + i)
    return { date: d, key: toKey(d) }
  })
}

export function thisWeek(hobby) {
  const today = todayKey()
  return weekKeys(startOfWeek()).map(({ date, key }) => ({
    key,
    label: date.toLocaleDateString('en', { weekday: 'short' }),
    done: hobby.checkins.includes(key),
    isToday: key === today,
    future: key > today,
  }))
}

export const weekCount = (hobby) => thisWeek(hobby).filter((day) => day.done).length

// Üst üste kaç hafta hedef tutturuldu. Devam eden hafta henüz bitmediği için seriyi bozmaz.
export function weeksStreak(hobby) {
  const goal = hobby.goalPerWeek ?? 3
  const set = new Set(hobby.checkins)
  const countWeek = (start) => weekKeys(start).filter(({ key }) => set.has(key)).length
  const current = startOfWeek()

  let streak = countWeek(current) >= goal ? 1 : 0
  for (let i = 1; i <= 52; i += 1) {
    const start = new Date(current)
    start.setDate(start.getDate() - 7 * i)
    if (countWeek(start) >= goal) streak += 1
    else break
  }
  return streak
}

// Son N hafta, her hafta 7 hücre (Pzt-Paz). Isı haritası için.
export function heatmap(hobby, weeks = 12) {
  const set = new Set(hobby.checkins)
  const today = todayKey()
  const first = startOfWeek()
  first.setDate(first.getDate() - 7 * (weeks - 1))

  return Array.from({ length: weeks }, (_, w) => {
    const start = new Date(first)
    start.setDate(start.getDate() + 7 * w)
    return weekKeys(start).map(({ key }) => ({ key, done: set.has(key), future: key > today }))
  })
}

/* ---------- Hatırlatma (uygulama içi) ---------- */

export function isWaiting(hobby, now = new Date()) {
  if (!hobby.reminderTime || isCheckedToday(hobby)) return false
  const [hours, minutes] = hobby.reminderTime.split(':').map(Number)
  return now.getHours() * 60 + now.getMinutes() >= hours * 60 + (minutes || 0)
}

/* ---------- Yedekleme ---------- */

export function parseBackup(text) {
  const data = JSON.parse(text)
  const list = Array.isArray(data) ? data : data?.hobbies
  if (!Array.isArray(list)) throw new Error('Unsupported file')

  return list.map((hobby) => {
    if (!hobby || typeof hobby.id !== 'string' || typeof hobby.name !== 'string' || !Array.isArray(hobby.stages)) {
      throw new Error('Invalid hobby')
    }
    return {
      emoji: '🌱',
      why: '',
      goalPerWeek: 3,
      reminderTime: '',
      checkins: [],
      sessions: [],
      ...hobby,
      stages: hobby.stages.map((stage) => ({
        id: String(stage.id ?? uid()),
        title: String(stage.title ?? ''),
        tasks: (Array.isArray(stage.tasks) ? stage.tasks : []).map((task) => ({
          id: String(task.id ?? uid()),
          text: String(task.text ?? ''),
          done: Boolean(task.done),
        })),
      })),
    }
  })
}