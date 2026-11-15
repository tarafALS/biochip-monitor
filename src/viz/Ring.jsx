// Circular meter, used for SpO2
export default function Ring({ value, min = 85, max = 100, color }) {
  const r = 34
  const c = 2 * Math.PI * r
  const ratio = Math.min(1, Math.max(0, (value - min) / (max - min)))
  return (
    <svg viewBox="0 0 80 80" className="h-20 w-20 -rotate-90" aria-hidden="true">
      <circle cx="40" cy="40" r={r} stroke="var(--line)" strokeWidth="7" fill="none" />
      <circle
        cx="40"
        cy="40"
        r={r}
        stroke={color}
        strokeWidth="7"
        fill="none"
        strokeLinecap="round"
        strokeDasharray={c}
        strokeDashoffset={c * (1 - ratio)}
        style={{ transition: 'stroke-dashoffset .8s ease' }}
      />
    </svg>
  )
}
