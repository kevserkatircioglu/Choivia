export default function StepRing({ value, goal, size = 150 }) {
  const R = 54, C = 2 * Math.PI * R, p = Math.min(1, value / goal)
  return (
    <svg viewBox="0 0 130 130" width={size} height={size} className="px-stepring" role="img" aria-label={`${value} of ${goal} steps`}>
      <defs><linearGradient id="sg" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stopColor="#9bd68a" /><stop offset="1" stopColor="#2f7a55" /></linearGradient></defs>
      <circle cx="65" cy="65" r={R} className="bg" /><circle cx="65" cy="65" r={R} className="fg" stroke="url(#sg)" strokeDasharray={`${p * C} ${C}`} transform="rotate(-90 65 65)" />
      <text x="65" y="64" textAnchor="middle" className="n">{value.toLocaleString('en-US')}</text><text x="65" y="82" textAnchor="middle" className="s">of {goal.toLocaleString('en-US')} steps</text>
    </svg>
  )
}

