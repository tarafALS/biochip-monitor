import { useState } from 'react'
import { ArrowRight, Rocket, Stethoscope } from 'lucide-react'
import { useI18n } from '../i18n'
import { CREW, SCENARIOS } from '../sim/engine'
import VeinFlow from '../viz/VeinFlow'
import LanguageToggle from './LanguageToggle'
import Logo from './Logo'

export default function RoleSelect({ onSelect }) {
  const { t } = useI18n()
  const [astronautId, setAstronautId] = useState(CREW[0].id)
  const normal = SCENARIOS.normal

  return (
    <div className="relative z-[1] mx-auto flex min-h-screen max-w-6xl flex-col px-4 py-6 sm:px-8">
      <header className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Logo />
          <div>
            <p className="font-display text-lg font-bold leading-none">{t.appName}</p>
            <p className="eyebrow mt-1">{t.tagline}</p>
          </div>
        </div>
        <LanguageToggle />
      </header>

      <section className="grid flex-1 items-center gap-10 py-10 lg:grid-cols-[1.1fr_1fr]">
        <div className="animate-rise">
          <h1 className="font-display text-4xl font-bold leading-tight sm:text-5xl lg:text-6xl">{t.heroTitle}</h1>
          <p className="mt-5 max-w-xl text-lg text-muted">{t.heroText}</p>
        </div>
        <div className="panel animate-rise overflow-hidden p-0" style={{ animationDelay: '.1s' }}>
          <div className="flex items-center justify-between px-5 pt-4">
            <p className="eyebrow">{t.liveFlow}</p>
            <p className="num text-sm text-ok">
              {normal.flow} cm/s · {t.levels.green}
            </p>
          </div>
          <div className="h-48">
            <VeinFlow flow={normal.flow} area={normal.ijvArea} color="var(--ok)" />
          </div>
        </div>
      </section>

      <section className="pb-6">
        <p className="eyebrow mb-4">{t.chooseRole}</p>
        <div className="grid gap-5 md:grid-cols-2">
          <div className="panel flex flex-col gap-4">
            <div className="flex items-center gap-4">
              <span className="flex h-12 w-12 items-center justify-center rounded-full bg-accent/10 text-accent ring-1 ring-accent/40">
                <Rocket className="h-6 w-6" />
              </span>
              <div>
                <h2 className="font-display text-xl font-semibold">{t.astronaut}</h2>
                <p className="text-sm text-muted">{t.astronautDesc}</p>
              </div>
            </div>
            <div className="flex flex-col gap-3 sm:flex-row">
              <select
                id="astronaut-select"
                value={astronautId}
                onChange={(e) => setAstronautId(e.target.value)}
                className="flex-1 rounded-lg border border-line bg-void px-3 py-2.5 text-sm"
              >
                {CREW.map((a) => (
                  <option key={a.id} value={a.id}>
                    {t.crewNames[a.id]} · {t.crewRoles[a.id]}
                  </option>
                ))}
              </select>
              <button
                onClick={() => onSelect({ role: 'astronaut', astronautId })}
                className="inline-flex items-center justify-center gap-2 rounded-lg bg-accent px-5 py-2.5 font-semibold text-void hover:brightness-110"
              >
                {t.enterAstronaut} <ArrowRight className="h-4 w-4 rtl:rotate-180" />
              </button>
            </div>
          </div>

          <div className="panel flex flex-col gap-4">
            <div className="flex items-center gap-4">
              <span className="flex h-12 w-12 items-center justify-center rounded-full bg-blood/10 text-blood ring-1 ring-blood/40">
                <Stethoscope className="h-6 w-6" />
              </span>
              <div>
                <h2 className="font-display text-xl font-semibold">{t.medical}</h2>
                <p className="text-sm text-muted">{t.medicalDesc}</p>
              </div>
            </div>
            <button
              onClick={() => onSelect({ role: 'medical', astronautId: CREW[0].id })}
              className="inline-flex items-center justify-center gap-2 rounded-lg bg-blood px-5 py-2.5 font-semibold text-void hover:brightness-110"
            >
              {t.enterMedical} <ArrowRight className="h-4 w-4 rtl:rotate-180" />
            </button>
          </div>
        </div>
      </section>
    </div>
  )
}
