// Turkish flag drawn as SVG (emoji flags do not render on Windows).
const star = (cx, cy, R, r) =>
  Array.from({ length: 10 }, (_, i) => {
    const a = (Math.PI / 5) * i - Math.PI / 2 + Math.PI / 10 * 0
    const rad = i % 2 ? r : R
    return `${(cx + rad * Math.cos(a)).toFixed(2)},${(cy + rad * Math.sin(a)).toFixed(2)}`
  }).join(' ')

export default function Flag({ size = 18 }) {
  return (
    <svg viewBox="0 0 30 20" width={size * 1.5} height={size} role="img" aria-label="Turkish flag" className="px-flag-svg">
      <rect width="30" height="20" rx="2.5" fill="#E30A17" />
      <circle cx="11" cy="10" r="5" fill="#fff" />
      <circle cx="12.4" cy="10" r="4" fill="#E30A17" />
      <polygon points={star(16.6, 10, 2.5, 1)} fill="#fff" transform="rotate(18 16.6 10)" />
    </svg>
  )
}
