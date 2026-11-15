import { Check, Pause, Play, Syringe } from 'lucide-react'
import { useI18n } from '../i18n'
import { useSimulation } from '../sim/SimulationContext'

const STEPS = ['detect', 'analyze', 'ready', 'release']

// How far along the loop each countermeasure state is
const REACHED = { standby: 1, ready: 3, held: 3, released: 4 }

export default function ClosedLoop({ astronautId, role }) {
  const { t } = useI18n()
  const { astronauts, actuator, approve, hold, resume } = useSimulation()
  const { countermeasure: cm, reservoir } = astronauts[astronautId]
  const status = actuator(astronautId)
  const active = status === 'Active'
  const reached = REACHED[cm.state]

  return (
    <div className="panel flex flex-col gap-4">
      <div className="flex items-center justify-between gap-3">
        <p className="eyebrow">{t.actuator}</p>
        <span
          className={`inline-flex items-center gap-2 rounded-full px-3 py-1 font-display text-sm font-semibold ${
            active ? 'bg-crit/15 text-crit' : 'bg-accent/10 text-accent'
          }`}
        >
          <span className="relative flex h-2 w-2">
            <span className={`absolute inline-flex h-full w-full animate-pulseRing rounded-full ${active ? 'bg-crit' : 'bg-accent'}`} />
            <span className={`relative inline-flex h-2 w-2 rounded-full ${active ? 'bg-crit' : 'bg-accent'}`} />
          </span>
          {t.actuatorStatus[status]}
        </span>
      </div>

      {role === 'medical' && (
      <ol className="grid grid-cols-4 gap-2">
        {STEPS.map((step, i) => {
          const done = i < reached
          return (
            <li key={step} className="flex flex-col items-center gap-2 text-center">
              <span
                className={`flex h-9 w-9 items-center justify-center rounded-full border font-display text-sm transition-colors ${
                  done ? (i >= 2 ? 'border-crit bg-crit/20 text-crit' : 'border-accent bg-accent/15 text-accent') : 'border-line text-muted'
                }`}
              >
                {i === 3 ? <Syringe className="h-4 w-4" /> : i + 1}
              </span>
              <span className={`text-[11px] leading-tight ${done ? 'text-ink' : 'text-muted'}`}>{t.loop[step]}</span>
            </li>
          )
        })}
      </ol>
      )}

      <p className="text-sm text-muted">{t.cm[cm.state].replace('{s}', cm.countdown)}</p>

      <div className="flex items-center justify-between gap-3 text-xs">
        <span className="text-muted">{t.reservoir}</span>
        <span className="flex items-center gap-2">
          <span className="flex gap-1">
            {[0, 1, 2].map((i) => (
              <span key={i} className={`h-2.5 w-5 rounded-sm ${i < reservoir ? 'bg-accent' : 'bg-white/10'}`} />
            ))}
          </span>
          <span className={reservoir === 0 ? 'text-crit' : 'text-ink'}>{t.doses.replace('{n}', reservoir)}</span>
        </span>
      </div>

      {cm.state === 'ready' && (
        <div className="h-1.5 overflow-hidden rounded-full bg-line">
          <div className="h-full bg-crit transition-all duration-1000" style={{ width: `${(cm.countdown / 30) * 100}%` }} />
        </div>
      )}

      {role === 'medical' && (cm.state === 'ready' || cm.state === 'held') && (
        <div className="flex flex-wrap gap-2">
          <button
            onClick={() => approve(astronautId)}
            className="inline-flex items-center gap-2 rounded-lg bg-crit px-4 py-2 text-sm font-semibold text-white hover:brightness-110"
          >
            <Check className="h-4 w-4" /> {t.approve}
          </button>
          {cm.state === 'ready' ? (
            <button
              onClick={() => hold(astronautId)}
              className="inline-flex items-center gap-2 rounded-lg border border-line px-4 py-2 text-sm hover:border-ink"
            >
              <Pause className="h-4 w-4" /> {t.hold}
            </button>
          ) : (
            <button
              onClick={() => resume(astronautId)}
              className="inline-flex items-center gap-2 rounded-lg border border-line px-4 py-2 text-sm hover:border-ink"
            >
              <Play className="h-4 w-4" /> {t.resume}
            </button>
          )}
        </div>
      )}
    </div>
  )
}
