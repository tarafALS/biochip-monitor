import { Cpu, Earth, Satellite, ServerCog, Unplug, UserRound, Watch, Wifi, WifiOff } from 'lucide-react'
import { useI18n } from '../i18n'
import { DEVICES } from '../sim/engine'
import { useSimulation } from '../sim/SimulationContext'

const NODE_ICONS = { body: UserRound, ppg: Watch, chip: Cpu, twin: ServerCog, earth: Earth }
const CHAIN = ['body', 'ppg', 'chip', 'twin', 'earth']

function Wire({ down }) {
  return (
    <div className={`wire ${down ? 'down' : ''} ms-[27.5px] h-8 w-px md:ms-0 md:mt-7 md:h-px md:w-auto md:flex-1`} aria-hidden="true">
      {!down && (
        <>
          <span className="packet" />
          <span className="packet" />
        </>
      )}
    </div>
  )
}

function DataPath({ online }) {
  const { t } = useI18n()
  const c = t.conn
  return (
    <div className="flex flex-col md:flex-row md:items-start">
      {CHAIN.map((id, i) => {
        const Icon = NODE_ICONS[id]
        const lost = !online && id === 'earth'
        return (
          <div key={id} className="contents">
            {i > 0 && <Wire down={!online && id === 'earth'} />}
            <div className="flex items-center gap-3 md:w-28 md:flex-col md:text-center">
              <span
                className={`flex h-14 w-14 shrink-0 items-center justify-center rounded-full ring-1 ${
                  lost ? 'bg-crit/10 text-crit ring-crit/50' : id === 'earth' ? 'bg-blood/10 text-blood ring-blood/40' : 'bg-accent/10 text-accent ring-accent/40'
                }`}
              >
                <Icon className="h-6 w-6" />
              </span>
              <div>
                <p className="text-sm font-medium">{c.nodes[id]}</p>
                <p className="text-xs text-muted">{lost ? c.offline : c.nodeSub[id]}</p>
              </div>
            </div>
          </div>
        )
      })}
    </div>
  )
}

function Meter({ label, value, color }) {
  return (
    <div>
      <div className="mb-1 flex justify-between text-xs text-muted">
        <span>{label}</span>
        <span className="num text-ink">{Math.round(value)}%</span>
      </div>
      <div className="h-1.5 overflow-hidden rounded-full bg-white/5">
        <div className="h-full rounded-full transition-all duration-700" style={{ width: `${value}%`, background: color }} />
      </div>
    </div>
  )
}

export default function Connection({ astronautId }) {
  const { t } = useI18n()
  const c = t.conn
  const { astronauts, linkOnline, toggleLink } = useSimulation()
  const { devices, earthLink } = astronauts[astronautId].connection
  const secondsAgo = Math.max(0, Math.round((Date.now() - earthLink.lastSync) / 1000))

  return (
    <div className="flex flex-col gap-5">
      <div className="panel flex flex-col gap-6">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <p className="eyebrow">{c.chain}</p>
          <button
            onClick={toggleLink}
            className={`inline-flex items-center gap-2 rounded-full border px-3 py-1.5 text-sm ${
              linkOnline ? 'border-line text-muted hover:border-crit hover:text-crit' : 'border-accent text-accent'
            }`}
          >
            {linkOnline ? <Unplug className="h-4 w-4" /> : <Wifi className="h-4 w-4" />}
            {linkOnline ? c.cut : c.restore}
          </button>
        </div>
        <DataPath online={linkOnline} />
      </div>

      {!linkOnline && (
        <div className="panel flex items-start gap-3 border-crit/60" style={{ borderColor: 'rgb(var(--crit-rgb) / .6)' }}>
          <WifiOff className="mt-0.5 h-5 w-5 shrink-0 text-crit" />
          <p className="text-sm">{c.autonomy}</p>
        </div>
      )}

      <div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-4">
        {DEVICES.map((id) => {
          const d = devices[id]
          const Icon = NODE_ICONS[id]
          return (
            <div key={id} className="panel flex flex-col gap-4">
              <div className="flex items-center justify-between gap-2">
                <div className="flex items-center gap-2">
                  <Icon className="h-4 w-4 text-accent" />
                  <p className="text-sm font-medium">{c.nodes[id]}</p>
                </div>
                <span className="inline-flex items-center gap-1.5 text-xs text-ok">
                  <span className="h-1.5 w-1.5 rounded-full bg-ok" /> {c.online}
                </span>
              </div>
              <Meter label={c.battery} value={d.battery} color={d.battery > 30 ? 'var(--ok)' : 'var(--warn)'} />
              <Meter label={c.signal} value={d.signal} color="var(--accent)" />
            </div>
          )
        })}

        <div className="panel flex flex-col gap-3" style={!linkOnline ? { borderColor: 'rgb(var(--crit-rgb) / .6)' } : undefined}>
          <div className="flex items-center justify-between gap-2">
            <div className="flex items-center gap-2">
              <Satellite className="h-4 w-4 text-blood" />
              <p className="text-sm font-medium">{c.earthLink}</p>
            </div>
            <span className={`inline-flex items-center gap-1.5 text-xs ${linkOnline ? 'text-ok' : 'text-crit'}`}>
              <span className={`h-1.5 w-1.5 rounded-full ${linkOnline ? 'bg-ok' : 'bg-crit'}`} /> {linkOnline ? c.online : c.offline}
            </span>
          </div>
          <dl className="grid grid-cols-2 gap-x-3 gap-y-2 text-sm">
            <dt className="text-muted">{c.latency}</dt>
            <dd className="num text-end">
              <bdi dir="ltr">{linkOnline ? `${earthLink.latencyMs} ms` : '—'}</bdi>
            </dd>
            <dt className="text-muted">{c.lastSync}</dt>
            <dd className="num text-end">{c.secondsAgo.replace('{s}', secondsAgo)}</dd>
            <dt className="text-muted">{c.sent}</dt>
            <dd className="num text-end">{earthLink.packetsSent}</dd>
            <dt className="text-muted">{c.queued}</dt>
            <dd className={`num text-end ${earthLink.queued ? 'text-warn' : ''}`}>{earthLink.queued}</dd>
          </dl>
        </div>
      </div>

      <div className="panel">
        <p className="eyebrow mb-3">{c.payload}</p>
        <ul className="flex flex-wrap gap-2">
          {c.payloadItems.map((item) => (
            <li key={item} className="rounded-full border border-line px-3 py-1.5 text-sm text-muted">
              {item}
            </li>
          ))}
        </ul>
      </div>
    </div>
  )
}
