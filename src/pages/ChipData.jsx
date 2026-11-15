import { BrainCircuit, Cpu, HeartPulse, Watch, Wind } from 'lucide-react'
import { useI18n } from '../i18n'
import { HEART_RATE_RANGE, REFERENCE, SRI_LEVELS, SRI_THRESHOLDS, inRange, sriScore, twinAnalysis } from '../sim/engine'
import { useManual } from '../sim/ManualContext'
import { useSimulation } from '../sim/SimulationContext'
import ClosedLoop from '../components/ClosedLoop'
import EcgTrace from '../viz/EcgTrace'
import RiskGauge from '../viz/RiskGauge'
import Ring from '../viz/Ring'
import TrendChart from '../viz/TrendChart'
import VeinFlow from '../viz/VeinFlow'

const REFERENCE_URL = 'https://www.ncbi.nlm.nih.gov/pmc/articles/PMC6882489/'

// Hero: risk level, live vein animation and gauge in one place
function StatusHero({ reading, level, role }) {
  const { t } = useI18n()
  const color = SRI_LEVELS[level].color
  return (
    <div className="panel overflow-hidden p-0" style={{ borderColor: `${color}55` }}>
      <div
        className="pointer-events-none absolute inset-0 opacity-[0.12]"
        style={{ background: `radial-gradient(600px 220px at 0% 0%, ${color}, transparent 70%)` }}
      />
      <div className="relative grid gap-4 px-5 pt-5 sm:grid-cols-[1fr_200px] sm:items-center">
        <div>
          <p className="eyebrow">{t.sri}</p>
          <p className="mt-2 font-display text-3xl font-bold sm:text-4xl" style={{ color }}>
            {t.levels[level]}
          </p>
          {reading.flow < 0 && (
            <span className="mt-3 inline-flex items-center gap-2 rounded-full bg-crit/15 px-3 py-1 text-sm font-semibold text-crit">
              <span className="h-2 w-2 animate-pulse rounded-full bg-crit" /> {t.reverseFlow}
            </span>
          )}
          {role === 'astronaut' && <p className="mt-3 max-w-xl text-lg">{t.astronautAdvice[level]}</p>}
        </div>
        <div className="text-center">
          <RiskGauge score={sriScore(reading.flow)} color={color} />
          <p className="num -mt-1 text-3xl font-bold" style={{ color }}>
            {reading.flow.toFixed(1)}
            <span className="ms-1 text-sm text-muted">cm/s</span>
          </p>
          <p className="mt-1 text-xs text-muted">
            {t.distension}{' '}
            <bdi dir="ltr">
              <span className="num text-ink">{reading.ijvArea.toFixed(1)}</span> mm²
            </bdi>
            {' · '}
            {t.pressure}{' '}
            <bdi dir="ltr">
              <span className="num text-ink">{reading.ijvPressure.toFixed(1)}</span> mmHg
            </bdi>
          </p>
        </div>
      </div>
      <div className="relative h-32">
        <VeinFlow flow={reading.flow} area={reading.ijvArea} color={color} />
      </div>
    </div>
  )
}

function VitalTile({ icon: Icon, label, value, unit, color, children }) {
  return (
    <div className="panel flex flex-col gap-3">
      <div className="flex items-center gap-2 text-muted">
        <Icon className="h-4 w-4" style={{ color }} />
        <p className="eyebrow">{label}</p>
      </div>
      <div className="flex items-end justify-between gap-3">
        <p className="num text-4xl font-bold" style={{ color }}>
          {value}
          <span className="ms-1 text-base font-medium text-muted">{unit}</span>
        </p>
        {children}
      </div>
    </div>
  )
}

// Compact list of secondary readings with an in-range dot
function MetricList({ icon: Icon, title, keys, reading }) {
  const { t } = useI18n()
  return (
    <div className="panel flex flex-col gap-3">
      <div className="flex items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          <Icon className="h-4 w-4 text-accent" />
          <p className="eyebrow">{title}</p>
        </div>
        <span className="rounded-full border border-line px-2 py-0.5 text-[10px] text-muted">{t.simulated}</span>
      </div>
      <ul className="flex flex-col divide-y divide-white/5">
        {keys.map((key) => {
          const ok = inRange(key, reading[key])
          return (
            <li key={key} className="flex items-center justify-between gap-3 py-2 text-sm">
              <span className="flex min-w-0 items-center gap-2 text-muted">
                <span className={`h-1.5 w-1.5 shrink-0 rounded-full ${ok ? 'bg-ok' : 'bg-warn'}`} />
                {t.metric[key]}
              </span>
              <span dir="ltr" className={`num shrink-0 ${ok ? 'text-ink' : 'text-warn'}`}>
                {reading[key]} <span className="text-xs text-muted">{REFERENCE[key].unit}</span>
              </span>
            </li>
          )
        })}
      </ul>
    </div>
  )
}

function TwinCard({ history, astronautId, reading, level }) {
  const { t } = useI18n()
  const { baselines } = useManual()
  const twin = twinAnalysis(history, baselines[astronautId].flow)
  const clotColor = { none: 'var(--ok)', possible: 'var(--warn)', likely: 'var(--crit)' }[twin.clot]
  // The PPG bracelet acts as an external check on the implant, reducing false alarms
  const ppgAbnormal = !inRange('perfusion', reading.perfusion) || !inRange('resistance', reading.resistance)
  const dual = level === 'green' ? 'both' : ppgAbnormal ? 'confirmed' : 'single'
  return (
    <div className="panel flex flex-col gap-3">
      <div className="flex items-center gap-2">
        <BrainCircuit className="h-4 w-4 text-accent" />
        <p className="eyebrow">{t.twin}</p>
      </div>
      <div className="grid grid-cols-3 gap-3 text-center">
        <div>
          <p className="num text-2xl font-bold">{twin.deviation}%</p>
          <p className="text-[11px] leading-tight text-muted">{t.deviation}</p>
        </div>
        <div>
          <p className="num text-2xl font-bold" style={{ color: twin.forecast > 66 ? 'var(--crit)' : twin.forecast > 33 ? 'var(--warn)' : 'var(--ok)' }}>
            {twin.forecast}
          </p>
          <p className="text-[11px] leading-tight text-muted">{t.forecast}</p>
        </div>
        <div>
          <p className="num text-2xl font-bold" dir="ltr">
            {twin.trend > 0 ? '+' : ''}
            {twin.trend}
          </p>
          <p className="text-[11px] leading-tight text-muted">{t.trend30}</p>
        </div>
      </div>
      <div className="flex items-center justify-between gap-3 text-sm">
        <span className="text-[11px] text-muted">{t.dualLabel}</span>
        <span className={dual === 'single' ? 'text-warn' : dual === 'confirmed' ? 'text-crit' : 'text-ok'}>{t.dual[dual]}</span>
      </div>
      <div className="rounded-lg border px-3 py-2 text-sm" style={{ borderColor: `${clotColor}66` }}>
        <p className="text-[11px] text-muted">{t.clotLabel}</p>
        <p className="font-medium" style={{ color: clotColor }}>
          {t.clot[twin.clot]}
        </p>
      </div>
    </div>
  )
}

function AlertLog() {
  const { t, locale } = useI18n()
  const { alerts } = useSimulation()
  return (
    <div className="panel">
      <p className="eyebrow mb-3">{t.alerts}</p>
      {alerts.length === 0 ? (
        <p className="text-sm text-muted">{t.noAlerts}</p>
      ) : (
        <ul className="flex max-h-44 flex-col gap-2 overflow-y-auto">
          {alerts.map((a) => (
            <li key={a.id} className="flex items-start gap-3 rounded-lg border border-line px-3 py-2 text-sm">
              <span className="mt-1.5 h-2 w-2 shrink-0 rounded-full" style={{ background: SRI_LEVELS[a.level].color }} />
              <div className="min-w-0 flex-1">
                <p>{t.alertMsg[a.level]}</p>
                <p className="text-xs text-muted">
                  {t.crewNames[a.astronautId]} · <span className="num">{new Date(a.time).toLocaleTimeString(locale)}</span>
                </p>
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}

export default function ChipData({ astronautId, role }) {
  const { t } = useI18n()
  const { astronauts } = useSimulation()
  const { reading, level, history } = astronauts[astronautId]
  const color = SRI_LEVELS[level].color
  const hrOk = reading.heartRate >= HEART_RATE_RANGE.min && reading.heartRate <= HEART_RATE_RANGE.max

  const isMedical = role === 'medical'

  return (
    <div className="flex flex-col gap-5">
      <StatusHero reading={reading} level={level} role={role} />

      <div className="grid gap-5 lg:grid-cols-2 xl:grid-cols-[1fr_1fr_1.3fr]">
        <VitalTile icon={HeartPulse} label={t.heartRate} value={reading.heartRate} unit="BPM" color={hrOk ? 'var(--fg)' : 'var(--warn)'}>
          <div className="h-12 w-28">
            <EcgTrace bpm={reading.heartRate} color={hrOk ? '#5eead4' : '#fbbf24'} />
          </div>
        </VitalTile>
        <VitalTile icon={Wind} label={t.spo2} value={reading.spo2} unit="%" color="var(--fg)">
          <Ring value={reading.spo2} color={reading.spo2 >= 95 ? 'var(--accent)' : 'var(--warn)'} />
        </VitalTile>
        <div className="lg:col-span-2 xl:col-span-1">
          <ClosedLoop astronautId={astronautId} role={role} />
        </div>
      </div>

      <div className={`grid gap-5 lg:grid-cols-2 ${isMedical ? 'xl:grid-cols-3' : ''}`}>
        <MetricList icon={Cpu} title={t.biochip} keys={['dDimer', 'troponin', 'viscosity', 'shear']} reading={reading} />
        <MetricList icon={Watch} title={t.ppg} keys={['hrv', 'perfusion', 'resistance']} reading={reading} />
        {isMedical && (
          <div className="lg:col-span-2 xl:col-span-1">
            <TwinCard history={history} astronautId={astronautId} reading={reading} level={level} />
          </div>
        )}
      </div>

      <div className={`grid gap-5 ${isMedical ? 'lg:grid-cols-2' : ''}`}>
          <div className="panel">
            <p className="eyebrow mb-3">{t.flowTrend}</p>
            <TrendChart
              data={history}
              dataKey="flow"
              unit="cm/s"
              color={color}
              domain={[-4, 16]}
              lines={[
                { y: 0, color: '#8494b0' },
                { y: SRI_THRESHOLDS.moderate, color: '#fbbf24' },
                { y: SRI_THRESHOLDS.high, color: '#f43f5e' },
              ]}
            />
          </div>
        {isMedical && <AlertLog />}
      </div>

      {isMedical && (
        <p className="text-xs text-muted">
          <a href={REFERENCE_URL} target="_blank" rel="noreferrer" className="underline decoration-line underline-offset-4 hover:text-accent">
            {t.source}
          </a>
        </p>
      )}
    </div>
  )
}
