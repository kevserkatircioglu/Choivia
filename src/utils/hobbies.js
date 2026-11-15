// Hobi verisi için saf yardımcı fonksiyonlar (React'e bağımlı değil, kolay test edilir).

const pad = (n) => String(n).padStart(2, '0')

// Yerel saate göre YYYY-MM-DD. (toISOString UTC verir; gece yarısı civarında yanlış güne düşer.)
export function toKey(date = new Date()) {
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}`
}

export const todayKey = () => toKey()

export const uid = () => `${Date.now().toString(36)}${Math.random().toString(36).slice(2, 7)}`

export function createHobby({ name, emoji = '🌱', why = '', stages = [] }) {
  return {
    id: uid(),
    name: name.trim(),
    emoji,
    why: why.trim(),
    createdAt: new Date().toISOString(),
    checkins: [], // 'YYYY-MM-DD' listesi
    stages: stages.map((stage) => ({
      id: uid(),
      title: stage.title,
      tasks: stage.tasks.map((text) => ({ id: uid(), text, done: false })),
    })),
  }
}

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

// Son 7 gün (bugün en sonda). Cezalandırıcı seri yerine "bu hafta kaç gün" görünümü için.
export function lastSevenDays(hobby) {
  return Array.from({ length: 7 }, (_, index) => {
    const date = new Date()
    date.setDate(date.getDate() - (6 - index))
    const key = toKey(date)
    return {
      key,
      label: date.toLocaleDateString('en', { weekday: 'narrow' }),
      done: hobby.checkins.includes(key),
      isToday: index === 6,
    }
  })
}
