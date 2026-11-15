// Half-dial for the Stagnation Risk Index (0 = free flow, 100 = complete stasis).
// Zones follow the flow thresholds: 10 cm/s -> score 33, 5 cm/s -> score 67.
const ZONES = [
  { from: 0, to: 33, color: 'var(--ok)' },
  { from: 33, to: 67, color: 'var(--warn)' },
  { from: 67, to: 100, color: 'var(--crit)' },
]

const polar = (score, r) => {
  const angle = Math.PI * (1 - score / 100)
  return [100 + r * Math.cos(angle), 100 - r * Math.sin(angle)]
}

const arc = (from, to, r) => {
  const [x1, y1] = polar(from, r)
  const [x2, y2] = polar(to, r)
  return `M ${x1} ${y1} A ${r} ${r} 0 0 1 ${x2} ${y2}`
}

export default function RiskGauge({ score, color }) {
  const [nx, ny] = polar(score, 70)
  return (
    <svg viewBox="0 0 200 116" className="w-full" role="img" aria-label={`Risk index ${score}`}>
      {ZONES.map((z) => (
        <path key={z.from} d={arc(z.from + 0.8, z.to - 0.8, 84)} stroke={z.color} strokeWidth="12" fill="none" opacity="0.28" />
      ))}
      <path d={arc(0.5, Math.max(score, 1), 84)} stroke={color} strokeWidth="12" fill="none" strokeLinecap="round" style={{ transition: 'all .8s ease' }} />
      {[0, 33, 67, 100].map((tick) => {
        const [x1, y1] = polar(tick, 96)
        const [x2, y2] = polar(tick, 102)
        return <line key={tick} x1={x1} y1={y1} x2={x2} y2={y2} stroke="var(--muted)" strokeWidth="1.5" />
      })}
      <line x1="100" y1="100" x2={nx} y2={ny} stroke="var(--fg)" strokeWidth="3" strokeLinecap="round" style={{ transition: 'all .8s ease' }} />
      <circle cx="100" cy="100" r="6" fill="var(--fg)" />
    </svg>
  )
}
