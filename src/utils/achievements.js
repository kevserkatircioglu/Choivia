import { getCheckins } from './hobbies.js'
// Başarımlar: hobi verisinden hesaplanır, kazanılınca tarihiyle hobiye kaydedilir.
// Yeni başarım eklemek için GENERIC veya TEMPLATE_ACHIEVEMENTS listesine bir satır eklemek yeterli.
import { todayKey, weekCount, weeksStreak } from './hobbies.js'

function stats(hobby) {
  const sessions = hobby.sessions ?? []
  const tasks = hobby.stages.flatMap((stage) => stage.tasks)
  const dates = [...new Set(getCheckins(hobby))].sort()

  // En az 3 gün ara verip geri dönüldü mü?
  let cameBack = false
  for (let i = 1; i < dates.length; i += 1) {
    const gap = Math.round(
      (new Date(`${dates[i]}T00:00:00`) - new Date(`${dates[i - 1]}T00:00:00`)) / 86400000,
    )
    if (gap >= 4) cameBack = true
  }

  return {
    days: dates.length,
    minutes: sessions.reduce((sum, item) => sum + (item.minutes || 0), 0),
    sessions,
    tasks,
    cameBack,
  }
}

const hasDoneKey = (hobby, key) =>
  hobby.stages.some((stage) => stage.tasks.some((task) => task.key === key && task.done))

const byTask = (id, emoji, title, description, key) => ({
  id,
  emoji,
  title,
  description,
  key,
  test: (hobby) => hasDoneKey(hobby, key),
})

export const GENERIC = [
  { id: 'first-day', emoji: '🌱', title: 'First practice', description: 'Check in for the very first time.', test: (h, s) => s.days >= 1 },
  { id: 'first-step', emoji: '✅', title: 'First step', description: 'Complete your first roadmap step.', test: (h, s) => s.tasks.some((task) => task.done) },
  { id: 'tiny-win', emoji: '🐣', title: 'Tiny win', description: 'Finish a “Just 2 minutes” step. Small counts.', test: (h, s) => s.tasks.some((task) => task.done && task.text.startsWith('Just 2 minutes')) },
  { id: 'first-note', emoji: '✍️', title: 'Dear diary', description: 'Write your first practice note.', test: (h, s) => s.sessions.some((item) => item.note) },
  { id: 'hard-day', emoji: '💪', title: 'Showed up anyway', description: 'Log a session on a day that felt hard.', test: (h, s) => s.sessions.some((item) => item.mood === 'hard') },
  { id: 'days-3', emoji: '🌿', title: 'Three days in', description: 'Practice on 3 different days.', test: (h, s) => s.days >= 3 },
  { id: 'days-7', emoji: '🪴', title: 'A week of practice', description: 'Practice on 7 different days.', test: (h, s) => s.days >= 7 },
  { id: 'days-14', emoji: '🍀', title: 'Two weeks strong', description: 'Practice on 14 different days.', test: (h, s) => s.days >= 14 },
  { id: 'days-30', emoji: '🌳', title: '30 days of practice', description: 'Practice on 30 different days.', test: (h, s) => s.days >= 30 },
  { id: 'days-50', emoji: '🌸', title: 'In full bloom', description: 'Practice on 50 different days.', test: (h, s) => s.days >= 50 },
  { id: 'long-session', emoji: '⏱️', title: 'Deep focus', description: 'Log a single session of 45 minutes or more.', test: (h, s) => s.sessions.some((item) => item.minutes >= 45) },
  { id: 'hours-5', emoji: '⌛', title: 'Five hours in', description: 'Log 5 hours of practice in total.', test: (h, s) => s.minutes >= 300 },
  { id: 'hours-10', emoji: '🕰️', title: 'Ten hours in', description: 'Log 10 hours of practice in total.', test: (h, s) => s.minutes >= 600 },
  { id: 'goal-week', emoji: '🎯', title: 'Goal reached', description: 'Meet your weekly goal.', test: (h) => weekCount(h) >= (h.goalPerWeek ?? 3) },
  { id: 'goal-streak-4', emoji: '🔥', title: 'Four-week rhythm', description: 'Meet your weekly goal 4 weeks in a row.', test: (h) => weeksStreak(h) >= 4 },
  { id: 'comeback', emoji: '🌤️', title: 'Welcome back', description: 'Return after a break of 3 days or more.', test: (h, s) => s.cameBack },
  { id: 'stage-one', emoji: '🧭', title: 'Stage cleared', description: 'Finish every step of a roadmap stage.', test: (h) => h.stages.some((stage) => stage.tasks.length > 0 && stage.tasks.every((task) => task.done)) },
  { id: 'roadmap-done', emoji: '🏆', title: 'Roadmap complete', description: 'Finish every step of your roadmap.', test: (h, s) => s.tasks.length > 0 && s.tasks.every((task) => task.done) },
]

// Hobiye özel başarımlar: şablondaki adım anahtarlarına bağlı.
export const TEMPLATE_ACHIEVEMENTS = {
  violin: [
    byTask('violin-bow', '🎻', 'First Bow', 'Learn the bow hold.', 'bow-hold'),
    byTask('violin-tuned', '🎶', 'Tuned and Ready', 'Tune your violin yourself.', 'tune'),
    byTask('violin-finger', '☝️', 'First Finger', 'Place your first finger on the A string.', 'finger-one'),
    byTask('violin-melody', '🎵', 'First Melody', 'Play a whole song without stopping.', 'song-through'),
  ],
  guitar: [
    byTask('guitar-tuned', '🎶', 'In Tune', 'Tune your guitar yourself.', 'g-tune'),
    byTask('guitar-chord', '🎸', 'First Chord', 'Learn your first chord, E minor.', 'g-em'),
    byTask('guitar-switch', '🔁', 'Chord Changer', 'Switch between two chords cleanly.', 'g-switch'),
    byTask('guitar-song', '🎤', 'First Song', 'Play a whole song from start to finish.', 'g-song-through'),
  ],
  drawing: [
    byTask('drawing-shapes', '🔷', 'Steady Hand', 'Draw basic shapes freehand.', 'd-shapes'),
    byTask('drawing-sphere', '🌗', 'Light Catcher', 'Shade your first sphere.', 'd-sphere'),
    byTask('drawing-life', '👀', 'Eyes Open', 'Sketch something from real life.', 'd-life'),
    byTask('drawing-finish', '🖼️', 'Proud Piece', 'Finish a drawing you are proud of.', 'd-finish'),
  ],
  running: [
    byTask('running-first', '👟', 'Out the Door', 'Complete your first walk-run.', 'r-first'),
    byTask('running-10', '🏃', 'Ten Non-Stop', 'Run 10 minutes without stopping.', 'r-10'),
    byTask('running-20', '⚡', 'Twenty Non-Stop', 'Run 20 minutes without stopping.', 'r-20'),
    byTask('running-5k', '🏅', '5K Finisher', 'Run 5 km.', 'r-5k'),
  ],
}


// Calculate meaningful partial progress for locked achievements.
// These values are display-only and never change unlock conditions.
export function achievementProgress(hobby, achievement) {
  const id = achievement.id
  const stages = Array.isArray(hobby.stages) ? hobby.stages : []
  const tasks = stages.flatMap((stage) =>
    Array.isArray(stage.tasks) ? stage.tasks : [],
  )
  const sessions = Array.isArray(hobby.sessions) ? hobby.sessions : []
  const days = new Set(
    getCheckins(hobby),
  ).size

  const progress = (current, target, unit) => ({
    current: Math.min(Math.max(0, current), target),
    target,
    unit,
  })

  const oneStep = (condition, unit) =>
    progress(condition ? 1 : 0, 1, unit)

  if (id === 'first-day') {
    return progress(days, 1, 'practice days')
  }

  if (id === 'first-step') {
    return oneStep(tasks.some((task) => task.done), 'roadmap steps')
  }

  if (id === 'tiny-win') {
    const count = tasks.filter(
      (task) => task.done && task.text?.startsWith('Just 2 minutes'),
    ).length
    return progress(count, 1, 'tiny steps')
  }

  if (id === 'first-note') {
    return oneStep(
      sessions.some((session) => session.note?.trim()),
      'practice notes',
    )
  }

  if (id === 'hard-day') {
    return oneStep(
      sessions.some((session) => session.mood === 'hard'),
      'hard-day sessions',
    )
  }

  if (id.startsWith('days-')) {
    const target = Number(id.slice(5))
    return Number.isFinite(target)
      ? progress(days, target, 'practice days')
      : { hint: 'Keep practicing.' }
  }

  if (id === 'long-session') {
    const longest = Math.max(0, ...sessions.map((session) => session.minutes || 0))
    return progress(longest, 45, 'minutes in one session')
  }

  if (id === 'hours-5' || id === 'hours-10') {
    const totalMinutes = sessions.reduce(
      (sum, session) => sum + (session.minutes || 0),
      0,
    )
    const target = id === 'hours-5' ? 300 : 600
    return progress(totalMinutes, target, 'total minutes')
  }

  if (id === 'goal-week') {
    const goal = hobby.goalPerWeek ?? 3
    return progress(weekCount(hobby), goal, 'days this week')
  }

  if (id === 'goal-streak-4') {
    return progress(weeksStreak(hobby), 4, 'consecutive weeks')
  }

  if (id === 'comeback') {
    return {
      hint: 'Return after a break of 3 days or more.',
    }
  }

  if (id === 'stage-one') {
    const candidates = stages
      .map((stage) => {
        const stageTasks = Array.isArray(stage.tasks) ? stage.tasks : []
        return {
          current: stageTasks.filter((task) => task.done).length,
          target: stageTasks.length,
        }
      })
      .filter((stage) => stage.target > 0)

    const best = candidates.reduce(
      (previous, current) =>
        current.current / current.target > previous.current / previous.target
          ? current
          : previous,
      { current: 0, target: 1 },
    )

    return progress(best.current, best.target, 'steps in a stage')
  }

  if (id === 'roadmap-done') {
    return progress(
      tasks.filter((task) => task.done).length,
      Math.max(tasks.length, 1),
      'roadmap steps',
    )
  }

  if (achievement.key) {
    const task = tasks.find((item) => item.key === achievement.key)
    return oneStep(task?.done, 'related steps')
  }

  return { hint: 'Complete the related activity to unlock this.' }
}

export const achievementsFor = (hobby) => [
  ...GENERIC,
  ...(TEMPLATE_ACHIEVEMENTS[hobby.templateId] ?? []),
]

// Yeni kazanılan başarımları hobiye işler. { hobby, unlocked } döndürür.
export function applyAchievements(hobby) {
  const computed = stats(hobby)
  const have = hobby.achievements ?? {}
  const unlocked = achievementsFor(hobby).filter((item) => !have[item.id] && item.test(hobby, computed))
  if (unlocked.length === 0) return { hobby, unlocked }

  const date = todayKey()
  const achievements = { ...have }
  unlocked.forEach((item) => { achievements[item.id] = date })
  return { hobby: { ...hobby, achievements }, unlocked }
}