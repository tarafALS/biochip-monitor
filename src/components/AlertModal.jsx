import { AlertTriangle, Siren } from 'lucide-react'
import { useI18n } from '../i18n'
import { useSimulation } from '../sim/SimulationContext'

// Pop-up for the newest unacknowledged alert the current user should see
export default function AlertModal({ session }) {
  const { t, locale } = useI18n()
  const { alerts, acknowledge } = useSimulation()
  const alert = alerts.find(
    (a) => !a.ackBy[session.role] && (session.role === 'medical' || a.astronautId === session.astronautId),
  )
  if (!alert) return null

  const critical = alert.level === 'red'
  const Icon = critical ? Siren : AlertTriangle
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 px-4 backdrop-blur-sm" role="alertdialog" aria-modal="true">
      <div
        className={`panel w-full max-w-md animate-rise text-center ${critical ? 'shadow-[0_0_80px_-10px_var(--crit)]' : 'shadow-[0_0_60px_-15px_var(--warn)]'}`}
        style={{ borderColor: critical ? 'var(--crit)' : 'var(--warn)' }}
      >
        <div className="relative mx-auto mb-4 flex h-16 w-16 items-center justify-center">
          <span className={`absolute inset-0 animate-pulseRing rounded-full ${critical ? 'bg-crit/40' : 'bg-warn/40'}`} />
          <Icon className={`relative h-9 w-9 ${critical ? 'text-crit' : 'text-warn'}`} />
        </div>
        <p className={`font-display text-xl font-bold uppercase ${critical ? 'text-crit' : 'text-warn'}`}>{t.alertTitle[alert.level]}</p>
        <p className="mt-1 text-sm text-muted">
          {t.crewNames[alert.astronautId]} · {new Date(alert.time).toLocaleTimeString(locale)}
        </p>
        <p className="mt-4 text-base">{t.alertMsg[alert.level]}</p>
        <button
          autoFocus
          onClick={() => acknowledge(alert.id, session.role)}
          className={`mt-6 w-full rounded-lg px-4 py-2.5 font-semibold text-void ${critical ? 'bg-crit' : 'bg-warn'}`}
        >
          {t.acknowledge}
        </button>
      </div>
    </div>
  )
}
