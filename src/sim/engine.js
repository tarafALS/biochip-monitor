// Simulation of the PPG bracelet + sub-dermal biochip readings.
// Reference values come from "Data Parameters for UI Mockup" and
// Marshall-Goebel et al. (NASA), https://www.ncbi.nlm.nih.gov/pmc/articles/PMC6882489/

export const HEART_RATE_RANGE = { min: 60, max: 90 }

// Stagnation Risk Index thresholds on IJV flow velocity (cm/s)
export const SRI_THRESHOLDS = { moderate: 10, high: 5 }

export const SRI_LEVELS = {
  green: { label: 'Normal / Low Risk', color: '#34d399' },
  yellow: { label: 'Moderate Stasis', color: '#fbbf24' },
  red: { label: 'High Risk / Thrombus Alert', color: '#f43f5e' },
}

export const ALERT_MESSAGES = {
  yellow: 'Warning: IJV blood flow velocity decreased. Stasis risk elevated.',
  red: 'CRITICAL: Severe venous stasis detected. Automated countermeasure ready.',
}

// Target values the readings drift toward in each demo scenario.
// Values from the UI data sheet and the NASA IJV study (CSA 9.8 mm² preflight, 70.3 mm² by flight day 50;
// IJV pressure 5.1 mmHg preflight, 21.1 mmHg in flight).
// Biochip and PPG values are illustrative simulations within published reference ranges.
export const SCENARIOS = {
  normal: {
    label: 'Normal',
    heartRate: 72, flow: 12.5, spo2: 98, ijvArea: 10, ijvPressure: 7,
    dDimer: 0.3, troponin: 6, viscosity: 4.3, shear: 2.4,
    hrv: 45, perfusion: 4.2, resistance: 1.0,
  },
  moderate: {
    label: 'Moderate stasis',
    heartRate: 82, flow: 7.5, spo2: 97, ijvArea: 40, ijvPressure: 14,
    dDimer: 0.7, troponin: 14, viscosity: 5.0, shear: 1.2,
    hrv: 32, perfusion: 2.8, resistance: 1.3,
  },
  critical: {
    label: 'Thrombus risk',
    heartRate: 96, flow: 3, spo2: 94, ijvArea: 70, ijvPressure: 21,
    dDimer: 1.6, troponin: 31, viscosity: 5.9, shear: 0.4,
    hrv: 19, perfusion: 1.6, resistance: 1.7,
  },
  // NASA study: some stasis cases showed retrograde (reverse) flow
  reverse: {
    label: 'Reverse flow',
    heartRate: 98, flow: -2, spo2: 94, ijvArea: 72, ijvPressure: 22,
    dDimer: 1.9, troponin: 34, viscosity: 6.1, shear: 0.2,
    hrv: 17, perfusion: 1.5, resistance: 1.8,
  },
}

// Noise per tick and display precision for each simulated metric
const METRICS = {
  heartRate: { noise: 1.2, digits: 0 },
  flow: { noise: 0.4, digits: 1 },
  spo2: { noise: 0.3, digits: 0, max: 100 },
  ijvArea: { noise: 0.8, digits: 1 },
  ijvPressure: { noise: 0.3, digits: 1 },
  dDimer: { noise: 0.02, digits: 2 },
  troponin: { noise: 0.6, digits: 0 },
  viscosity: { noise: 0.05, digits: 1 },
  shear: { noise: 0.08, digits: 1, min: 0 },
  hrv: { noise: 1.5, digits: 0 },
  perfusion: { noise: 0.1, digits: 1 },
  resistance: { noise: 0.02, digits: 2 },
}

// Reference ranges shown next to the biochip and PPG values
export const REFERENCE = {
  dDimer: { max: 0.5, unit: 'µg/mL' },
  troponin: { max: 26, unit: 'ng/L' },
  viscosity: { max: 5.0, unit: 'cP' },
  shear: { min: 1.0, unit: 'dyn/cm²' },
  hrv: { min: 30, unit: 'ms' },
  perfusion: { min: 2.0, unit: '%' },
  resistance: { max: 1.25, unit: '×' },
}

export function inRange(key, value) {
  const r = REFERENCE[key]
  return (r.max === undefined || value <= r.max) && (r.min === undefined || value >= r.min)
}

export const CREW = [
  { id: 'A1', name: 'Astronaut 1', role: 'Commander' },
  { id: 'A2', name: 'Astronaut 2', role: 'Flight Engineer' },
  { id: 'A3', name: 'Astronaut 3', role: 'Mission Specialist' },
]

const noise = (amount) => (Math.random() - 0.5) * 2 * amount
const approach = (current, target, rate) => current + (target - current) * rate
const round = (value, digits = 1) => Number(value.toFixed(digits))

export function sriLevel(flow) {
  if (flow < SRI_THRESHOLDS.high) return 'red'
  if (flow <= SRI_THRESHOLDS.moderate) return 'yellow'
  return 'green'
}

// 0 = free flow (15 cm/s or more), 100 = complete stasis or reverse flow (negative velocity)
export function sriScore(flow) {
  return Math.round(Math.min(100, Math.max(0, ((15 - flow) / 15) * 100)))
}

export function initialReading(scenario = 'normal') {
  const { label: _label, ...values } = SCENARIOS[scenario]
  return { time: Date.now(), ...values }
}

// One tick (1 second) of sensor data, drifting gradually toward the scenario target
export function nextReading(prev, scenario) {
  const target = SCENARIOS[scenario]
  const reading = { time: Date.now() }
  for (const [key, m] of Object.entries(METRICS)) {
    let value = approach(prev[key], target[key], 0.08) + noise(m.noise)
    if (m.max !== undefined) value = Math.min(m.max, value)
    if (m.min !== undefined) value = Math.max(m.min, value)
    reading[key] = round(value, m.digits)
  }
  return reading
}

// AI Digital Twin: compares live flow with the astronaut's own preflight baseline
// and projects the risk forward from the recent trend (stand-in for the LSTM model)
export function twinAnalysis(history, baselineFlow = 12.5) {
  const now = history[history.length - 1]
  const past = history[Math.max(0, history.length - 30)]
  const deviation = Math.round((Math.abs(now.flow - baselineFlow) / baselineFlow) * 100)
  const trend = now.flow - past.flow // cm/s over the last 30 s
  const forecast = Math.round(Math.min(99, Math.max(1, sriScore(now.flow) - trend * 12)))
  const level = sriLevel(now.flow)
  const clot = level === 'red' ? 'likely' : level === 'yellow' || forecast > 50 ? 'possible' : 'none'
  return { deviation, trend: round(trend), forecast, clot }
}

// Seconds the closed loop waits for a human decision before releasing on its own
// (Earth links can lag or drop on long missions, so the chip must be able to act alone)
export const AUTO_RELEASE_SECONDS = 30

export function actuatorStatus(countermeasure) {
  return countermeasure.state === 'standby' ? 'Monitoring' : 'Active'
}

export function nextCountermeasure(cm, level) {
  if (level === 'green' && cm.state !== 'standby') return { state: 'standby', countdown: 0 }
  if (level === 'red' && cm.state === 'standby') return { state: 'ready', countdown: AUTO_RELEASE_SECONDS }
  if (cm.state === 'ready') {
    return cm.countdown <= 1 ? { state: 'released', countdown: 0 } : { ...cm, countdown: cm.countdown - 1 }
  }
  return cm
}

export const DEVICES = ['ppg', 'chip', 'twin']

export function initialConnection() {
  return {
    devices: Object.fromEntries(
      DEVICES.map((id) => [id, { id, battery: 100 - Math.floor(Math.random() * 15), signal: 90 }]),
    ),
    earthLink: { online: true, latencyMs: 600, lastSync: Date.now(), packetsSent: 0, queued: 0 },
  }
}

// Earth link: one packet per second while online; while offline the onboard
// system keeps working and queues packets, then flushes them on reconnect.
export function nextConnection(prev, linkOnline) {
  const devices = Object.fromEntries(
    Object.entries(prev.devices).map(([id, d]) => [
      id,
      {
        ...d,
        battery: Math.max(5, round(d.battery - Math.random() * 0.02, 2)),
        signal: Math.round(Math.min(100, Math.max(60, d.signal + noise(3)))),
      },
    ]),
  )
  const link = prev.earthLink
  const earthLink = linkOnline
    ? {
        online: true,
        latencyMs: Math.round(Math.min(2000, Math.max(300, link.latencyMs + noise(60)))),
        lastSync: Date.now(),
        packetsSent: link.packetsSent + 1 + link.queued,
        queued: 0,
      }
    : { ...link, online: false, queued: link.queued + 1 }
  return { devices, earthLink }
}
