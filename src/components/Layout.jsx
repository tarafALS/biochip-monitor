import { Activity, ClipboardList, LogOut, Radio } from 'lucide-react'
import { useI18n } from '../i18n'
import { CREW, SCENARIOS, SRI_LEVELS } from '../sim/engine'
import { useManual } from '../sim/ManualContext'
import { useSimulation } from '../sim/SimulationContext'
import AlertModal from './AlertModal'
import LanguageToggle from './LanguageToggle'
import Logo from './Logo'

export const PAGES = [
  { id: 'chip', icon: Activity },
  { id: 'manual', icon: ClipboardList },
  { id: 'connection', icon: Radio },
]

const FLIGHT_DAY = 50 // matches the in-flight measurement point of the NASA IJV study

function MissionClock() {
  const { t } = useI18n()
  const { phase } = useManual()
  const { linkOnline } = useSimulation()
  const now = new Date()
  return (
    <div className="rounded-lg border border-line px-3 py-2">
      <p className="eyebrow">{t.missionTime}</p>
      <p className="num mt-1 text-lg text-accent">{now.toISOString().slice(11, 19)}</p>
      <p className={`mt-1 flex items-center gap-1.5 text-xs ${linkOnline ? 'text-ok' : 'text-crit'}`}>
        <span className={`h-1.5 w-1.5 rounded-full ${linkOnline ? 'bg-ok' : 'bg-crit'}`} />
        {t.conn.earthLink} · {linkOnline ? t.conn.online : t.conn.offline}
      </p>
      <p className="text-xs text-muted">
        {phase === 'postflight' ? (
          t.manual.phases.postflight
        ) : (
          <>
            {t.flightDay} <span className="num text-ink">{FLIGHT_DAY}</span>
          </>
        )}
      </p>
    </div>
  )
}

function DemoControls({ astronautId }) {
  const { t } = useI18n()
  const { astronauts, setScenario } = useSimulation()
  const current = astronauts[astronautId].scenario
  return (
    <div className="flex flex-wrap items-center gap-2">
      <span className="eyebrow">{t.demo}</span>
      {Object.keys(SCENARIOS).map((id) => (
        <button
          key={id}
          onClick={() => setScenario(astronautId, id)}
          className={`rounded-full border px-3 py-1 text-xs transition-colors ${
            current === id ? 'border-accent bg-accent/15 text-accent' : 'border-line text-muted hover:text-ink'
          }`}
        >
          {t.scenarios[id]}
        </button>
      ))}
    </div>
  )
}

export default function Layout({ session, onSessionChange, page, onPageChange, children }) {
  const { t } = useI18n()
  const { astronauts } = useSimulation()
  const { phase } = useManual()
  const isMedical = session.role === 'medical'

  return (
    <div className="relative z-[1] flex min-h-screen flex-col lg:flex-row">
      <aside className="flex flex-col gap-5 border-line bg-void/70 px-4 py-5 backdrop-blur lg:sticky lg:top-0 lg:h-screen lg:w-64 lg:border-e">
        <div className="flex items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <Logo />
            <div>
              <p className="font-display font-bold leading-none">{t.appName}</p>
              <p className={`mt-1 text-xs font-medium ${isMedical ? 'text-blood' : 'text-accent'}`}>
                {isMedical ? t.medical : `${t.crewNames[session.astronautId]} · ${t.crewRoles[session.astronautId]}`}
              </p>
            </div>
          </div>
          <div className="lg:hidden">
            <LanguageToggle />
          </div>
        </div>

        <div className="hidden lg:block">
          <MissionClock />
        </div>

        <nav className="flex gap-1 overflow-x-auto lg:flex-col">
          {PAGES.map(({ id, icon: Icon }) => (
            <button
              key={id}
              onClick={() => onPageChange(id)}
              className={`flex shrink-0 items-center gap-3 rounded-lg px-3 py-2.5 text-sm transition-colors ${
                page === id ? 'bg-accent/10 text-accent ring-1 ring-accent/30' : 'text-muted hover:bg-white/5 hover:text-ink'
              }`}
            >
              <Icon className="h-4 w-4" /> {t.pages[id]}
            </button>
          ))}
        </nav>

        {isMedical && (
          <div>
            <p className="eyebrow mb-2">{t.crew}</p>
            <div className="flex gap-2 overflow-x-auto lg:flex-col">
              {CREW.map((a) => {
                const { level, reading } = astronauts[a.id]
                const selected = session.astronautId === a.id
                return (
                  <button
                    key={a.id}
                    onClick={() => onSessionChange({ ...session, astronautId: a.id })}
                    className={`flex shrink-0 items-center gap-3 rounded-lg border px-3 py-2 text-start text-sm transition-colors ${
                      selected ? 'border-accent/60 bg-white/5' : 'border-line hover:bg-white/5'
                    }`}
                  >
                    <span className="relative flex h-2.5 w-2.5">
                      {level !== 'green' && (
                        <span className="absolute inline-flex h-full w-full animate-pulseRing rounded-full" style={{ background: SRI_LEVELS[level].color }} />
                      )}
                      <span className="relative h-2.5 w-2.5 rounded-full" style={{ background: SRI_LEVELS[level].color }} />
                    </span>
                    <span className="flex-1">{t.crewNames[a.id]}</span>
                    <span className="num text-xs text-muted">{reading.flow.toFixed(1)}</span>
                  </button>
                )
              })}
            </div>
          </div>
        )}

        <div className="mt-auto hidden flex-col gap-3 lg:flex">
          <LanguageToggle />
          <button onClick={() => onSessionChange(null)} className="flex items-center gap-2 text-sm text-muted hover:text-ink">
            <LogOut className="h-4 w-4 rtl:rotate-180" /> {t.switchRole}
          </button>
        </div>
      </aside>

      <main className="min-w-0 flex-1 px-4 py-6 sm:px-8">
        <header className="mb-6 flex flex-col gap-4 xl:flex-row xl:items-end xl:justify-between">
          <div>
            <p className="eyebrow">{isMedical ? t.crewNames[session.astronautId] : phase === 'postflight' ? t.manual.phases.postflight : `${t.flightDay} ${FLIGHT_DAY}`}</p>
            <h1 className="font-display text-3xl font-bold">{t.pages[page]}</h1>
          </div>
          <DemoControls astronautId={session.astronautId} />
        </header>
        {children}
        <button onClick={() => onSessionChange(null)} className="mt-8 flex items-center gap-2 text-sm text-muted hover:text-ink lg:hidden">
          <LogOut className="h-4 w-4 rtl:rotate-180" /> {t.switchRole}
        </button>
      </main>

      <AlertModal session={session} />
    </div>
  )
}
