import { createContext, useContext, useEffect, useReducer, useRef } from 'react'
import {
  AUTO_RELEASE_SECONDS,
  CREW,
  actuatorStatus,
  initialConnection,
  initialReading,
  nextConnection,
  nextCountermeasure,
  nextReading,
  sriLevel,
} from './engine'

const HISTORY_LENGTH = 120 // two minutes of one-second samples
const LEVEL_RANK = { green: 0, yellow: 1, red: 2 }

function createAstronautState() {
  const reading = initialReading()
  return {
    scenario: 'normal',
    reading,
    history: [reading],
    level: sriLevel(reading.flow),
    peak: 'green', // highest level since flow was last normal; stops repeat alerts when readings hover at a threshold
    countermeasure: { state: 'standby', countdown: 0 },
    reservoir: 3, // anticoagulant doses left in the biochip
    connection: initialConnection(),
  }
}

const initialState = {
  astronauts: Object.fromEntries(CREW.map((a) => [a.id, createAstronautState()])),
  alerts: [],
  linkOnline: true,
}

function updateAstronaut(state, id, changes) {
  return { ...state, astronauts: { ...state.astronauts, [id]: { ...state.astronauts[id], ...changes } } }
}

function reducer(state, action) {
  switch (action.type) {
    case 'tick': {
      const newAlerts = []
      const astronauts = Object.fromEntries(
        Object.entries(state.astronauts).map(([id, a]) => {
          const reading = nextReading(a.reading, a.scenario)
          const level = sriLevel(reading.flow)
          const raised = LEVEL_RANK[level] > LEVEL_RANK[a.peak]
          const peak = level === 'green' ? 'green' : raised ? level : a.peak
          if (raised) {
            newAlerts.push({ id: `${id}-${reading.time}`, astronautId: id, level, time: reading.time, ackBy: {} })
          }
          const countermeasure = nextCountermeasure(a.countermeasure, level)
          // A released dose brings the flow back toward normal
          const justReleased = countermeasure.state === 'released' && a.countermeasure.state !== 'released'
          const scenario = justReleased ? 'normal' : a.scenario
          const reservoir = justReleased ? Math.max(0, a.reservoir - 1) : a.reservoir
          return [
            id,
            {
              ...a,
              scenario,
              reading,
              level,
              peak,
              countermeasure,
              reservoir,
              history: [...a.history, reading].slice(-HISTORY_LENGTH),
              connection: nextConnection(a.connection, state.linkOnline),
            },
          ]
        }),
      )
      return { ...state, astronauts, alerts: [...newAlerts, ...state.alerts].slice(0, 50) }
    }
    case 'setScenario':
      return updateAstronaut(state, action.astronautId, { scenario: action.scenario })
    case 'approve':
      return updateAstronaut(state, action.astronautId, {
        countermeasure: { state: 'released', countdown: 0 },
        scenario: 'normal',
        reservoir: Math.max(0, state.astronauts[action.astronautId].reservoir - 1),
      })
    case 'hold':
      return updateAstronaut(state, action.astronautId, { countermeasure: { state: 'held', countdown: 0 } })
    case 'resume':
      return updateAstronaut(state, action.astronautId, {
        countermeasure: { state: 'ready', countdown: AUTO_RELEASE_SECONDS },
      })
    case 'toggleLink':
      return { ...state, linkOnline: !state.linkOnline }
    case 'acknowledge':
      return {
        ...state,
        alerts: state.alerts.map((alert) =>
          alert.id === action.alertId ? { ...alert, ackBy: { ...alert.ackBy, [action.role]: true } } : alert,
        ),
      }
    case 'replace':
      return action.state
    default:
      return state
  }
}

const SimulationContext = createContext(null)

// Several open tabs or windows (e.g. astronaut on one screen, medical team on another)
// share one simulation: one tab leads and runs the clock, the others mirror its state
// and forward their actions to it. If the leader closes, another tab takes over.
const CHANNEL = 'biochip-sim'
const TAB_ID = Math.random().toString(36).slice(2)

function useTabSync(state, dispatch) {
  const channel = useRef(null)
  const leader = useRef(typeof BroadcastChannel === 'undefined')
  const lastHeard = useRef(Date.now() - 1500) // take over after ~1 s if no leader answers
  const stateRef = useRef(state)
  stateRef.current = state

  useEffect(() => {
    if (typeof BroadcastChannel === 'undefined') return
    const ch = new BroadcastChannel(CHANNEL)
    channel.current = ch
    ch.onmessage = ({ data }) => {
      if (data.type === 'state') {
        // two leaders after a race: the lower id keeps leading
        if (leader.current && data.from > TAB_ID) return
        leader.current = false
        lastHeard.current = Date.now()
        dispatch({ type: 'replace', state: data.state })
      } else if (data.type === 'hello' && leader.current) {
        ch.postMessage({ type: 'state', from: TAB_ID, state: stateRef.current })
      } else if (data.type === 'action' && leader.current) {
        dispatch(data.action)
      }
    }
    ch.postMessage({ type: 'hello' })
    return () => ch.close()
  }, [dispatch])

  useEffect(() => {
    const timer = setInterval(() => {
      if (!leader.current && Date.now() - lastHeard.current > 2500) leader.current = true
      if (leader.current) dispatch({ type: 'tick' })
    }, 1000)
    return () => clearInterval(timer)
  }, [dispatch])

  useEffect(() => {
    if (leader.current) channel.current?.postMessage({ type: 'state', from: TAB_ID, state })
  }, [state])

  return (action) => (leader.current ? dispatch(action) : channel.current.postMessage({ type: 'action', action }))
}

export function SimulationProvider({ children }) {
  const [state, dispatch] = useReducer(reducer, initialState)
  const send = useTabSync(state, dispatch)

  const value = {
    ...state,
    setScenario: (astronautId, scenario) => send({ type: 'setScenario', astronautId, scenario }),
    approve: (astronautId) => send({ type: 'approve', astronautId }),
    hold: (astronautId) => send({ type: 'hold', astronautId }),
    resume: (astronautId) => send({ type: 'resume', astronautId }),
    toggleLink: () => send({ type: 'toggleLink' }),
    acknowledge: (alertId, role) => send({ type: 'acknowledge', alertId, role }),
    actuator: (astronautId) => actuatorStatus(state.astronauts[astronautId].countermeasure),
  }
  return <SimulationContext.Provider value={value}>{children}</SimulationContext.Provider>
}

export function useSimulation() {
  return useContext(SimulationContext)
}
