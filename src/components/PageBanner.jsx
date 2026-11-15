const KINDS = {
  guides: { text: 'Pick a path and bloom', items: ['📚', '🌿', '✏️', '🧭', '✨'], tint: 'mint' },
  jobs: { text: 'Your career path starts here', items: ['💼', '💻', '📄', '🎯', '🤝', '✉️'], tint: 'peach' },
  progress: { text: 'Every footprint is a step forward', tint: 'sky' },
}

export default function PageBanner({ kind, percent = 0 }) {
  const k = KINDS[kind]
  const filled = Math.round(percent / 10)
  return (
    <div className={`cv-banner cv-banner-${k.tint}`} aria-hidden="true">
      {kind === 'progress' ? (
        <div className="cv-prints">
          {Array.from({ length: 10 }, (_, i) => <span key={i} className={i < filled ? 'on' : ''} style={{ '--i': i }}>{i % 2 ? '👣' : '🐾'}</span>)}
          <span className="cv-flag">{percent >= 100 ? '🌳' : '🏁'}</span>
        </div>
      ) : (
        <div className="cv-stickers">{k.items.map((e, i) => <span key={e} style={{ '--i': i }}>{e}</span>)}</div>
      )}
      <p>{k.text}</p>
    </div>
  )
}
