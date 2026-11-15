import { createContext, useContext, useEffect, useState } from 'react'
import { CREW } from './engine'

// Manual inputs shared by both roles: astronaut check-ins, clinical notes,
// each astronaut's preflight baseline (feeds the Digital Twin) and mission phase.
// Kept in the browser so a demo survives a page reload.

const STORAGE_KEY = 'biochip-manual-v2'
const HOUR = 3600 * 1000

// Preflight values from the NASA IJV study: CSA 9.8 mm², pressure 5.1 mmHg
const DEFAULT_BASELINE = { heartRate: 68, flow: 12.5, ijvArea: 9.8, cvp: 5.1, mri: 'normal', notes: '' }

function exampleState() {
  const now = Date.now()
  return {
    phase: 'inflight',
    baselines: Object.fromEntries(CREW.map((a) => [a.id, { ...DEFAULT_BASELINE }])),
    entries: [
      {
        id: 'ex-1',
        astronautId: 'A1',
        author: 'astronaut',
        kind: 'checkin',
        time: now - 3 * HOUR,
        symptoms: ['headache', 'facial'],
        water: 2.0,
        exercise: 45,
        medication: 'none',
        note: 'Mild morning headache, gone after breakfast.',
        noteAr: 'صداع خفيف في الصباح، زال بعد الإفطار.',
        example: true,
      },
      {
        id: 'ex-2',
        astronautId: 'A1',
        author: 'medical',
        kind: 'note',
        time: now - 2 * HOUR,
        note: 'Reviewed FD50 ultrasound. Left IJV distended, flow within range. Continue daily check-ins.',
        noteAr: 'راجعنا تصوير الموجات فوق الصوتية في اليوم 50 من الرحلة. الوريد الوداجي الأيسر متوسّع، والتدفق ضمن المعدل الطبيعي. يُرجى الاستمرار في التسجيل اليومي.',
        example: true,
      },
    ],
  }
}

function load() {
  try {
    const saved = JSON.parse(localStorage.getItem(STORAGE_KEY))
    if (saved?.baselines && saved?.entries) return saved
  } catch {
    // storage unavailable or corrupt: start from the examples
  }
  return exampleState()
}

const ManualContext = createContext(null)

export function ManualProvider({ children }) {
  const [state, setState] = useState(load)

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(state))
    } catch {
      // storage unavailable: inputs last for this session only
    }
  }, [state])

  useEffect(() => {
    const onStorage = (e) => {
      if (e.key !== STORAGE_KEY || !e.newValue) return
      try {
        setState(JSON.parse(e.newValue))
      } catch {
        // ignore a malformed write from another tab
      }
    }
    window.addEventListener('storage', onStorage)
    return () => window.removeEventListener('storage', onStorage)
  }, [])

  const value = {
    ...state,
    addEntry: (entry) =>
      setState((s) => ({ ...s, entries: [{ ...entry, id: `e-${Date.now()}`, time: Date.now() }, ...s.entries] })),
    saveBaseline: (astronautId, baseline) =>
      setState((s) => ({ ...s, baselines: { ...s.baselines, [astronautId]: baseline } })),
    setPhase: (phase) => setState((s) => ({ ...s, phase })),
    reset: () => setState(exampleState()),
  }
  return <ManualContext.Provider value={value}>{children}</ManualContext.Provider>
}

export function useManual() {
  return useContext(ManualContext)
}
