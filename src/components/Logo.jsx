// Mark: a vein cross-section with a pulse line through it
export default function Logo({ className = 'h-9 w-9' }) {
  return (
    <svg viewBox="0 0 40 40" className={className} aria-hidden="true">
      <circle cx="20" cy="20" r="18" fill="none" stroke="var(--accent)" strokeWidth="1.5" opacity="0.5" />
      <circle cx="20" cy="20" r="11" fill="rgba(251,92,116,.18)" stroke="var(--blood)" strokeWidth="1.5" />
      <path d="M4 21h9l3-7 4 13 3-9 2 3h11" fill="none" stroke="var(--accent)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  )
}
