import { useState } from 'react'
import { Check, ClipboardPen, Droplets, Dumbbell, Earth, Pill, Rocket, ScanLine, Stethoscope } from 'lucide-react'
import { useI18n } from '../i18n'
import { useManual } from '../sim/ManualContext'

const SYMPTOMS = ['headache', 'neck', 'facial', 'neckPain', 'vision', 'breath']
const MEDS = ['none', 'anticoagulant', 'painkiller', 'other']

const inputClass =
  'w-full rounded-lg border border-line bg-void/60 px-3 py-2 text-sm text-ink placeholder:text-muted focus:border-accent focus:outline-none'

function Field({ label, htmlFor, children }) {
  return (
    <label htmlFor={htmlFor} className="flex flex-col gap-1.5">
      <span className="text-xs text-muted">{label}</span>
      {children}
    </label>
  )
}

function Confirmation({ show, text }) {
  if (!show) return null
  return (
    <span className="inline-flex items-center gap-1.5 text-sm text-ok">
      <Check className="h-4 w-4" /> {text}
    </span>
  )
}

function useFlash() {
  const [shown, setShown] = useState(false)
  const flash = () => {
    setShown(true)
    setTimeout(() => setShown(false), 2500)
  }
  return [shown, flash]
}

function PhaseSwitch({ editable }) {
  const { t } = useI18n()
  const { phase, setPhase } = useManual()
  const icons = { inflight: Rocket, postflight: Earth }
  return (
    <div className="panel flex flex-wrap items-center justify-between gap-3 py-4">
      <p className="eyebrow">{t.manual.phase}</p>
      <div className="flex flex-wrap gap-2">
        {Object.keys(icons).map((id) => {
          const Icon = icons[id]
          const active = phase === id
          if (!editable && !active) return null
          return (
            <button
              key={id}
              disabled={!editable}
              onClick={() => setPhase(id)}
              className={`inline-flex items-center gap-2 rounded-full border px-3 py-1.5 text-sm ${
                active ? 'border-accent bg-accent/15 text-accent' : 'border-line text-muted hover:text-ink'
              }`}
            >
              <Icon className="h-4 w-4" /> {t.manual.phases[id]}
            </button>
          )
        })}
      </div>
    </div>
  )
}

function CheckinForm({ astronautId }) {
  const { t } = useI18n()
  const m = t.manual
  const { addEntry } = useManual()
  const [symptoms, setSymptoms] = useState([])
  const [water, setWater] = useState(1.5)
  const [exercise, setExercise] = useState(30)
  const [medication, setMedication] = useState('none')
  const [note, setNote] = useState('')
  const [sent, flash] = useFlash()

  const toggle = (s) => setSymptoms((list) => (list.includes(s) ? list.filter((x) => x !== s) : [...list, s]))

  const submit = (e) => {
    e.preventDefault()
    addEntry({ astronautId, author: 'astronaut', kind: 'checkin', symptoms, water, exercise, medication, note })
    setSymptoms([])
    setNote('')
    flash()
  }

  return (
    <form onSubmit={submit} className="panel flex flex-col gap-5">
      <div className="flex items-center gap-2">
        <ClipboardPen className="h-4 w-4 text-accent" />
        <p className="eyebrow">{m.checkin}</p>
      </div>

      <div>
        <p className="mb-2 text-sm">{m.symptomsQ}</p>
        <div className="flex flex-wrap gap-2">
          {SYMPTOMS.map((s) => {
            const on = symptoms.includes(s)
            return (
              <button
                type="button"
                key={s}
                onClick={() => toggle(s)}
                aria-pressed={on}
                className={`rounded-full border px-3 py-1.5 text-sm transition-colors ${
                  on ? 'border-warn bg-warn/15 text-warn' : 'border-line text-muted hover:text-ink'
                }`}
              >
                {m.symptoms[s]}
              </button>
            )
          })}
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <Field label={`${m.water} · ${water.toFixed(1)} L`} htmlFor="water">
          <input id="water" type="range" min="0" max="4" step="0.25" value={water} onChange={(e) => setWater(Number(e.target.value))} className="accent-[var(--accent)]" />
        </Field>
        <Field label={`${m.exercise} · ${exercise} ${m.minutes}`} htmlFor="exercise">
          <input id="exercise" type="range" min="0" max="150" step="5" value={exercise} onChange={(e) => setExercise(Number(e.target.value))} className="accent-[var(--accent)]" />
        </Field>
      </div>

      <Field label={m.medication} htmlFor="medication">
        <select id="medication" value={medication} onChange={(e) => setMedication(e.target.value)} className={inputClass}>
          {MEDS.map((id) => (
            <option key={id} value={id}>
              {m.meds[id]}
            </option>
          ))}
        </select>
      </Field>

      <Field label={m.note} htmlFor="checkin-note">
        <textarea id="checkin-note" rows="2" value={note} onChange={(e) => setNote(e.target.value)} placeholder={m.notePh} className={inputClass} />
      </Field>

      <div className="flex flex-wrap items-center gap-4">
        <button type="submit" className="rounded-lg bg-accent px-5 py-2.5 font-semibold text-void hover:brightness-110">
          {m.submit}
        </button>
        <Confirmation show={sent} text={m.sent} />
      </div>
    </form>
  )
}

function BaselineForm({ astronautId }) {
  const { t } = useI18n()
  const m = t.manual
  const { baselines, saveBaseline } = useManual()
  const [draft, setDraft] = useState(baselines[astronautId])
  const [saved, flash] = useFlash()
  const [editing, setEditing] = useState(astronautId)

  // Reload the form when the medical team switches astronaut
  if (editing !== astronautId) {
    setEditing(astronautId)
    setDraft(baselines[astronautId])
  }

  const set = (key) => (e) => setDraft((d) => ({ ...d, [key]: e.target.type === 'number' ? Number(e.target.value) : e.target.value }))
  const numbers = [
    ['heartRate', m.restingHr, 'BPM'],
    ['flow', m.baseFlow, 'cm/s'],
    ['ijvArea', m.baseArea, 'mm²'],
    ['cvp', m.cvp, 'mmHg'],
  ]

  const submit = (e) => {
    e.preventDefault()
    saveBaseline(astronautId, draft)
    flash()
  }

  return (
    <form onSubmit={submit} className="panel flex flex-col gap-5">
      <div>
        <div className="flex items-center gap-2">
          <ScanLine className="h-4 w-4 text-accent" />
          <p className="eyebrow">{m.baseline}</p>
        </div>
        <p className="mt-1 text-sm text-muted">{m.baselineSub}</p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        {numbers.map(([key, label, unit]) => (
          <Field key={key} label={`${label} (${unit})`} htmlFor={`base-${key}`}>
            <input id={`base-${key}`} type="number" step="0.1" value={draft[key]} onChange={set(key)} className={`${inputClass} num`} />
          </Field>
        ))}
      </div>

      <Field label={m.mri} htmlFor="base-mri">
        <select id="base-mri" value={draft.mri} onChange={set('mri')} className={inputClass}>
          {Object.entries(m.mriOpts).map(([id, label]) => (
            <option key={id} value={id}>
              {label}
            </option>
          ))}
        </select>
      </Field>

      <Field label={m.baselineNotes} htmlFor="base-notes">
        <textarea id="base-notes" rows="2" value={draft.notes} onChange={set('notes')} className={inputClass} />
      </Field>

      <div className="flex flex-wrap items-center gap-4">
        <button type="submit" className="rounded-lg bg-accent px-5 py-2.5 font-semibold text-void hover:brightness-110">
          {m.save}
        </button>
        <Confirmation show={saved} text={m.saved} />
      </div>
    </form>
  )
}

function NoteForm({ astronautId }) {
  const { t } = useI18n()
  const m = t.manual
  const { addEntry } = useManual()
  const [note, setNote] = useState('')

  const submit = (e) => {
    e.preventDefault()
    if (!note.trim()) return
    addEntry({ astronautId, author: 'medical', kind: 'note', note: note.trim() })
    setNote('')
  }

  return (
    <form onSubmit={submit} className="panel flex flex-col gap-3">
      <div className="flex items-center gap-2">
        <Stethoscope className="h-4 w-4 text-blood" />
        <p className="eyebrow">{m.clinicalNote}</p>
      </div>
      <textarea id="clinical-note" rows="3" value={note} onChange={(e) => setNote(e.target.value)} placeholder={m.notePhMed} className={inputClass} />
      <button type="submit" className="self-start rounded-lg bg-blood px-5 py-2 font-semibold text-void hover:brightness-110">
        {m.addNote}
      </button>
    </form>
  )
}

function Log({ astronautId }) {
  const { t, lang, locale } = useI18n()
  const m = t.manual
  const { entries } = useManual()
  const mine = entries.filter((e) => e.astronautId === astronautId)

  return (
    <div className="panel flex flex-col gap-3">
      <p className="eyebrow">{m.log}</p>
      {mine.length === 0 && <p className="text-sm text-muted">{m.empty}</p>}
      <ul className="flex max-h-[28rem] flex-col gap-3 overflow-y-auto">
        {mine.map((e) => {
          const fromAstronaut = e.author === 'astronaut'
          const note = lang === 'ar' && e.noteAr ? e.noteAr : e.note
          return (
            <li key={e.id} className="rounded-lg border border-line p-3">
              <div className="flex flex-wrap items-center justify-between gap-2 text-xs">
                <span className={`inline-flex items-center gap-1.5 font-medium ${fromAstronaut ? 'text-accent' : 'text-blood'}`}>
                  {fromAstronaut ? <Rocket className="h-3.5 w-3.5" /> : <Stethoscope className="h-3.5 w-3.5" />}
                  {fromAstronaut ? m.byAstronaut : m.byMedical}
                  {e.example && <span className="rounded-full border border-line px-1.5 text-[10px] text-muted">{m.example}</span>}
                </span>
                <span className="num text-muted">{new Date(e.time).toLocaleString(locale)}</span>
              </div>
              {e.kind === 'checkin' && (
                <div className="mt-2 flex flex-wrap gap-x-4 gap-y-1 text-sm">
                  <span className={e.symptoms.length ? 'text-warn' : 'text-ok'}>
                    {e.symptoms.length ? e.symptoms.map((s) => m.symptoms[s]).join(lang === 'ar' ? '، ' : ', ') : m.noSymptoms}
                  </span>
                  <span className="inline-flex items-center gap-1 text-muted">
                    <Droplets className="h-3.5 w-3.5" /> <span className="num text-ink">{e.water}</span> L
                  </span>
                  <span className="inline-flex items-center gap-1 text-muted">
                    <Dumbbell className="h-3.5 w-3.5" /> <span className="num text-ink">{e.exercise}</span> {m.minutes}
                  </span>
                  <span className="inline-flex items-center gap-1 text-muted">
                    <Pill className="h-3.5 w-3.5" /> {m.meds[e.medication]}
                  </span>
                </div>
              )}
              {note && <p className="mt-2 text-sm">{note}</p>}
            </li>
          )
        })}
      </ul>
    </div>
  )
}

export default function ManualInputs({ astronautId, role }) {
  const isMedical = role === 'medical'
  return (
    <div className="flex flex-col gap-5">
      <PhaseSwitch editable={isMedical} />
      <div className="grid gap-5 lg:grid-cols-2">
        {isMedical ? <BaselineForm astronautId={astronautId} /> : <CheckinForm astronautId={astronautId} />}
        <div className="flex flex-col gap-5">
          {isMedical && <NoteForm astronautId={astronautId} />}
          <Log astronautId={astronautId} />
        </div>
      </div>
    </div>
  )
}
