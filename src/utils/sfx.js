// Tiny Web Audio sound effects (no audio files needed).
// Browsers only allow sound after the user has tapped/clicked the page at least once.
let ctx
function getCtx() {
  try {
    ctx = ctx || new (window.AudioContext || window.webkitAudioContext)()
    if (ctx.state === 'suspended') ctx.resume()
    return ctx
  } catch { return null }
}
export const unlockAudio = () => { getCtx() }

function tone(c, freq, t0, dur, type = 'sine', gain = 0.1) {
  const o = c.createOscillator(); const g = c.createGain()
  o.type = type; o.frequency.value = freq
  g.gain.setValueAtTime(0.0001, t0)
  g.gain.linearRampToValueAtTime(gain, t0 + 0.01)
  g.gain.exponentialRampToValueAtTime(0.0001, t0 + dur)
  o.connect(g).connect(c.destination); o.start(t0); o.stop(t0 + dur + 0.05)
}

export function playChime(big = false) {
  const c = getCtx(); if (!c) return
  const t = c.currentTime
  const notes = big ? [1046.5, 1318.5, 1568, 2093, 2637] : [1318.5, 1568, 2093]
  notes.forEach((f, i) => { tone(c, f, t + i * 0.09, 1, 'sine', 0.1); tone(c, f * 2, t + i * 0.09, 0.5, 'triangle', 0.03) })
}

export function playPour(sec = 2.8) {
  const c = getCtx(); if (!c) return
  const t = c.currentTime; const len = Math.floor(c.sampleRate * sec)
  const buf = c.createBuffer(1, len, c.sampleRate); const d = buf.getChannelData(0)
  for (let i = 0; i < len; i++) d[i] = Math.random() * 2 - 1
  const src = c.createBufferSource(); src.buffer = buf
  const f = c.createBiquadFilter(); f.type = 'bandpass'; f.frequency.value = 1900; f.Q.value = 0.8
  const g = c.createGain()
  g.gain.setValueAtTime(0.0001, t); g.gain.linearRampToValueAtTime(0.11, t + 0.3)
  g.gain.setValueAtTime(0.11, t + sec - 0.5); g.gain.linearRampToValueAtTime(0.0001, t + sec)
  src.connect(f).connect(g).connect(c.destination); src.start(t)
}
