import { ArrowLeft, ArrowRight, Check } from 'lucide-react'
import { useEffect, useReducer, useRef, useState } from 'react'
import { DayPicker } from 'react-day-picker'
import 'react-day-picker/style.css'
import { useForm } from 'react-hook-form'
import { Link, useSearchParams } from 'react-router-dom'

import { useSubmitAppointment } from '../api/account'
import { useProject, useProperty, useServices } from '../api/content'
import type { Appointment, ConsultationMode, ConsultationProjectType, ConsultationTimeline } from '../api/types'
import { applyServerErrors, contactRules, useContactDefaults } from '../lib/forms'
import { ConsultationPill } from '../components/ui/Badges'
import { Button, ButtonLink } from '../components/ui/Button'
import { OptionTile, Segmented } from '../components/ui/Controls'
import { FormAlert, TextField } from '../components/ui/FormField'
import { BAR_OFFSET, Em } from '../components/ui/Layout'
import { ErrorState, Skeleton } from '../components/ui/States'
import { useToast } from '../components/ui/toast-context'
import { company } from '../content/company'
import { useAuth } from '../context/useAuth'
import { formatDate } from '../lib/format'
import { consultationModeLabels, projectTypeLabels, timelineLabels } from '../lib/labels'
import { routes } from '../lib/routes'

// W-12 consultation request: four steps held in a reducer (PRD: multi-step form state in
// useReducer until the final submit), with React Hook Form for the contact details.

type Step = 1 | 2 | 3 | 4
type TimeOfDay = 'Morning' | 'Afternoon' | 'Evening'
type Details = { name: string; email: string; phone: string }

type State = {
  step: Step
  services: number[]
  notSure: boolean
  projectType: ConsultationProjectType | ''
  siteLocation: string
  timeline: ConsultationTimeline | ''
  basedAbroad: boolean | null
  notes: string
  details: Details
  date: string
  timeOfDay: TimeOfDay | ''
  mode: ConsultationMode | ''
}

type Action =
  | { type: 'toggle-service'; id: number }
  | { type: 'toggle-not-sure' }
  | { type: 'set'; patch: Partial<Omit<State, 'step'>> }
  | { type: 'go'; step: Step }

const initialState: State = { step: 1, services: [], notSure: false, projectType: '', siteLocation: '', timeline: '', basedAbroad: null, notes: '', details: { name: '', email: '', phone: '' }, date: '', timeOfDay: '', mode: '' }

function reducer(state: State, action: Action): State {
  switch (action.type) {
    case 'toggle-service':
      return { ...state, services: state.services.includes(action.id) ? state.services.filter((id) => id !== action.id) : [...state.services, action.id] }
    case 'toggle-not-sure':
      return { ...state, notSure: !state.notSure }
    case 'set':
      return { ...state, ...action.patch }
    case 'go':
      stepChanged = true
      return { ...state, step: action.step }
  }
}

const STEPS = ['Services', 'Your project', 'Your details', 'Review'] as const

const toIso = (date: Date) => `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`
const fromIso = (value: string) => {
  const [year, month, day] = value.split('-').map(Number)
  return new Date(year, month - 1, day)
}

function StepRail({ step }: { step: Step }) {
  return (
    <ol className="mt-10 space-y-1" aria-label="Steps">
      {STEPS.map((label, index) => {
        const number = (index + 1) as Step
        const done = number < step
        const current = number === step
        return (
          <li key={label} aria-current={current ? 'step' : undefined} className="flex min-h-10 items-center gap-3 text-[13px]">
            <span className={`flex size-6 shrink-0 items-center justify-center rounded-full border text-[11px] font-semibold ${current ? 'border-ink bg-ink text-bg' : done ? 'border-ink text-ink' : 'border-control-line text-ink2'}`}>
              {done ? <Check aria-hidden="true" className="size-3" strokeWidth={2.5} /> : number}
            </span>
            <span className={current ? 'font-semibold text-ink' : 'text-ink2'}>{label}</span>
          </li>
        )
      })}
    </ol>
  )
}

// Set once the visitor has moved between steps; the first step never steals focus on page load.
let stepChanged = false

function StepHeading({ step, title, intro }: { step: Step; title: string; intro?: string }) {
  const ref = useRef<HTMLHeadingElement>(null)
  // Move focus to the new step so keyboard and screen-reader users land at its start.
  useEffect(() => {
    if (stepChanged) ref.current?.focus()
  }, [step])
  return (
    <div>
      <p className="label text-[10px] text-mute">
        Step {step} of 4
      </p>
      <h2 ref={ref} tabIndex={-1} className="mt-3 font-display text-[clamp(28px,2.8vw,38px)] leading-[1.1] font-medium outline-none">
        {title}
      </h2>
      {intro && <p className="mt-2 text-[14px] text-ink2">{intro}</p>}
    </div>
  )
}

function StepNav({ onBack, next, nextDisabled, nextLabel = 'Continue', loading, backLabel = 'Back' }: { onBack?: () => void; next: { type: 'submit' } | { onClick: () => void }; nextDisabled?: boolean; nextLabel?: string; loading?: boolean; backLabel?: string }) {
  return (
    <div className="mt-10 flex items-center justify-between gap-4 border-t border-line pt-6">
      {onBack ? (
        <Button variant="secondary" size="compact" onClick={onBack}>
          <ArrowLeft aria-hidden="true" className="size-4" strokeWidth={1.5} /> {backLabel}
        </Button>
      ) : (
        <ButtonLink to={routes.home} variant="secondary" size="compact">
          Cancel
        </ButtonLink>
      )}
      <Button size="compact" type={'type' in next ? 'submit' : 'button'} onClick={'onClick' in next ? next.onClick : undefined} disabled={nextDisabled} loading={loading}>
        {nextLabel} {!loading && <ArrowRight aria-hidden="true" className="size-4" strokeWidth={1.5} />}
      </Button>
    </div>
  )
}

function DetailsStep({ state, dispatch }: { state: State; dispatch: (action: Action) => void }) {
  const defaults = useContactDefaults()
  const { register, handleSubmit, formState } = useForm<Details>({ defaultValues: state.details.name || state.details.email ? state.details : defaults })
  const [dateError, setDateError] = useState<string>()
  const today = new Date()
  today.setHours(0, 0, 0, 0)

  const onSubmit = handleSubmit((details) => {
    if (!state.date) {
      setDateError('Choose a preferred date. It’s a preference — we’ll confirm the exact time with you.')
      return
    }
    dispatch({ type: 'set', patch: { details: { name: details.name.trim(), email: details.email.trim(), phone: details.phone.trim() } } })
    dispatch({ type: 'go', step: 4 })
  })

  return (
    <form noValidate onSubmit={onSubmit}>
      <StepHeading step={3} title="Your details" intro="How we’ll reach you, and when suits you. We’ll confirm the exact time." />
      <div className="mt-8 grid gap-7 phone:grid-cols-2">
        <TextField label="Full name" autoComplete="name" error={formState.errors.name?.message} registration={register('name', contactRules.name)} />
        <TextField label="Phone" type="tel" autoComplete="tel" placeholder="+234 or international" optional error={formState.errors.phone?.message} registration={register('phone', contactRules.phone)} />
      </div>
      <TextField className="mt-7" label="Email" type="email" autoComplete="email" error={formState.errors.email?.message} registration={register('email', contactRules.email)} />

      <fieldset className="mt-9">
        <legend className="label text-mute">Preferred date</legend>
        <p className="mt-1 text-[12px] text-ink2">Sundays aren’t available.</p>
        <DayPicker
          className="bh-daypicker mt-3"
          mode="single"
          weekStartsOn={1}
          selected={state.date ? fromIso(state.date) : undefined}
          onSelect={(date) => {
            setDateError(undefined)
            dispatch({ type: 'set', patch: { date: date ? toIso(date) : '' } })
          }}
          disabled={[{ dayOfWeek: [0] }, { before: today }]}
          startMonth={today}
        />
        {dateError && (
          <p role="alert" className="mt-2 text-[12px] font-semibold text-danger">
            {dateError}
          </p>
        )}
      </fieldset>

      <div className="mt-8 grid gap-7 phone:grid-cols-2">
        <div>
          <p className="label text-mute">Time of day</p>
          <Segmented<TimeOfDay> className="mt-3" label="Time of day" value={state.timeOfDay} onChange={(value) => dispatch({ type: 'set', patch: { timeOfDay: value === state.timeOfDay ? '' : value } })} options={(['Morning', 'Afternoon', 'Evening'] as const).map((value) => ({ value, label: value }))} />
        </div>
        <div>
          <p className="label text-mute">How would you like to meet?</p>
          <Segmented<ConsultationMode>
            className="mt-3"
            label="How would you like to meet?"
            value={state.mode}
            onChange={(value) => dispatch({ type: 'set', patch: { mode: value === state.mode ? '' : value } })}
            options={(Object.keys(consultationModeLabels) as ConsultationMode[]).map((value) => ({ value, label: value === 'in_person' ? 'In person' : value === 'video' ? 'Video' : 'Phone' }))}
          />
          {state.mode === 'in_person' && <p className="mt-2 text-[12px] text-ink2">At the Ibeju-Lekki office or on site.</p>}
          {state.mode === 'video' && <p className="mt-2 text-[12px] text-ink2">Ideal if you’re abroad.</p>}
        </div>
      </div>
      <StepNav onBack={() => dispatch({ type: 'go', step: 2 })} next={{ type: 'submit' }} />
    </form>
  )
}

function Received({ record }: { record: Appointment }) {
  const { status } = useAuth()
  return (
    <section className={`container-page ${BAR_OFFSET} min-h-[70svh] pb-section`} aria-labelledby="received-title">
      <title>Request received — BRIGHTHOMES Construction Service</title>
      <div className="max-w-2xl animate-rise">
        <ConsultationPill status={record.status} long />
        <h1 id="received-title" tabIndex={-1} className="mt-8 font-display text-[clamp(48px,6vw,88px)] leading-[0.98] font-medium tracking-[-0.015em]">
          Request <Em>received.</Em>
        </h1>
        <p className="mt-6 text-[16px] leading-[1.65] text-ink2">
          Thank you. Your consultation request ({record.reference}) has been sent. BRIGHTHOMES will contact you to confirm a date and time — until then it shows as a request{status === 'authenticated' ? ' in your account' : ''}.
        </p>
        <div className="mt-9 flex flex-col gap-3 phone:flex-row">
          {status === 'authenticated' ? (
            <ButtonLink to={routes.account.consultations} arrow>
              View consultations
            </ButtonLink>
          ) : (
            <ButtonLink to={routes.register} arrow>
              Create an account to follow it
            </ButtonLink>
          )}
          <ButtonLink to={routes.home} variant="secondary">
            Back to home
          </ButtonLink>
        </div>
      </div>
    </section>
  )
}

export default function ConsultationPage() {
  const [params] = useSearchParams()
  const services = useServices()
  const projectSlug = params.get('project') ?? ''
  const propertySlug = params.get('property') ?? ''
  const project = useProject(projectSlug, { enabled: Boolean(projectSlug) })
  const property = useProperty(propertySlug, { enabled: Boolean(propertySlug) })
  const submit = useSubmitAppointment()
  const notify = useToast()
  const [state, dispatch] = useReducer(reducer, initialState)
  useEffect(() => {
    stepChanged = false
  }, [])
  const [formError, setFormError] = useState<string>()

  // Pre-select the service the visitor came from (spec A-13 "Book a consultation pre-selects the service").
  const [prefilled, setPrefilled] = useState(false)
  if (!prefilled && services.isSuccess) {
    setPrefilled(true)
    const slug = params.get('service') ?? (propertySlug ? 'real-estate' : '')
    const match = services.data.find((service) => service.slug === slug)
    if (match) dispatch({ type: 'toggle-service', id: match.id })
  }

  if (submit.isSuccess) return <Received record={submit.data} />

  const chosen = services.data?.filter((service) => state.services.includes(service.id)) ?? []
  const canContinue = state.services.length > 0 || state.notSure
  const regarding = project.data?.title ?? property.data?.title

  const send = () => {
    setFormError(undefined)
    const context = [regarding && `Regarding: ${regarding}`, state.notes.trim()].filter(Boolean).join('\n\n')
    submit.mutate(
      {
        name: state.details.name,
        email: state.details.email,
        phone: state.details.phone,
        message: context,
        services: state.services,
        services_not_sure: state.notSure,
        project_type: state.projectType,
        site_location: state.siteLocation.trim(),
        timeline: state.timeline,
        based_abroad: state.basedAbroad,
        preferred_date: state.date,
        time_window: state.timeOfDay,
        mode: state.mode,
        project: project.data?.id ?? null,
        property: property.data?.id ?? null,
      },
      {
        onSuccess: () => notify({ tone: 'success', title: 'Consultation requested' }),
        onError: (error) => setFormError(applyServerErrors(error, [], () => undefined) ?? 'Please review your answers and try again.'),
      },
    )
  }

  const review: { label: string; value: string }[] = [
    { label: 'Services', value: [...chosen.map((service) => service.name), ...(state.notSure ? ['Not sure yet'] : [])].join(', ') },
    ...(regarding ? [{ label: 'Regarding', value: regarding }] : []),
    { label: 'Project', value: state.projectType ? projectTypeLabels[state.projectType] : 'Not specified' },
    ...(state.siteLocation ? [{ label: 'Location', value: state.siteLocation }] : []),
    { label: 'Timeline', value: state.timeline ? timelineLabels[state.timeline] : 'Not specified' },
    { label: 'Based abroad', value: state.basedAbroad === null ? 'Not specified' : state.basedAbroad ? 'Yes' : 'No' },
    { label: 'Preferred time', value: [state.date && formatDate(state.date), state.timeOfDay].filter(Boolean).join(' · ') },
    { label: 'Meeting', value: state.mode ? consultationModeLabels[state.mode] : 'No preference' },
    { label: 'Contact', value: [state.details.name, state.details.email, state.details.phone].filter(Boolean).join(' · ') },
  ]

  return (
    <section className={`container-page ${BAR_OFFSET} pb-section`}>
      <title>Request a consultation — BRIGHTHOMES Construction Service</title>
      <div className="grid-editorial gap-y-10">
        <aside className="desk:col-span-3">
          <p className="label text-mute">Consultation request</p>
          <h1 className="mt-5 font-display text-[clamp(36px,3.6vw,52px)] leading-[1] font-medium">
            Start with a <Em>conversation.</Em>
          </h1>
          <div className="hidden desk:block">
            <StepRail step={state.step} />
          </div>
          <p className="mt-8 hidden max-w-[15rem] text-[12px] leading-[1.55] text-ink2 desk:block">This sends a request. BRIGHTHOMES will contact you to confirm a date and time.</p>
          {/* Below 980px the rail stacks above the form as a compact progress bar (§23). */}
          <div className="mt-6 desk:hidden" aria-hidden="true">
            <div className="grid grid-cols-4 gap-1.5">
              {STEPS.map((label, index) => (
                <span key={label} className={`h-0.5 ${index + 1 <= state.step ? 'bg-ink' : 'bg-line2'}`} />
              ))}
            </div>
          </div>
        </aside>

        <div className="border-t border-ink pt-8 desk:col-span-8 desk:col-start-5">
          {services.isPending ? (
            <div aria-busy="true">
              <Skeleton className="h-8 w-1/2" />
              <div className="mt-8 grid gap-3 phone:grid-cols-2">
                {Array.from({ length: 8 }, (_, index) => (
                  <Skeleton key={index} className="h-[60px]" />
                ))}
              </div>
            </div>
          ) : services.isError ? (
            <ErrorState title="We couldn’t load the services list." error={services.error} onRetry={() => void services.refetch()} />
          ) : state.step === 1 ? (
            <div>
              <StepHeading step={1} title="What can we help with?" intro="Choose all that apply." />
              <div className="mt-8 grid gap-3 phone:grid-cols-2" role="group" aria-label="Services">
                {services.data.map((service) => (
                  <OptionTile key={service.id} label={service.name} checked={state.services.includes(service.id)} onChange={() => dispatch({ type: 'toggle-service', id: service.id })} />
                ))}
                <OptionTile label="Not sure yet" checked={state.notSure} onChange={() => dispatch({ type: 'toggle-not-sure' })} />
              </div>
              {regarding && (
                <p className="mt-6 border-l-2 border-bronze pl-4 text-[13px] text-ink2">
                  Regarding <span className="font-semibold text-ink">{regarding}</span>
                </p>
              )}
              <StepNav next={{ onClick: () => dispatch({ type: 'go', step: 2 }) }} nextDisabled={!canContinue} />
              {!canContinue && <p className="mt-3 text-right text-[12px] text-ink2">Choose at least one option to continue.</p>}
            </div>
          ) : state.step === 2 ? (
            <div>
              <StepHeading step={2} title="About your project" intro="Everything here is optional — share what you know." />
              <div className="mt-8">
                <p className="label text-mute">Project type</p>
                <Segmented<ConsultationProjectType>
                  className="mt-3"
                  label="Project type"
                  value={state.projectType}
                  onChange={(value) => dispatch({ type: 'set', patch: { projectType: value === state.projectType ? '' : value } })}
                  options={(Object.keys(projectTypeLabels) as ConsultationProjectType[]).map((value) => ({ value, label: projectTypeLabels[value] }))}
                />
              </div>
              <div className="mt-8 grid gap-7 phone:grid-cols-2">
                <label className="block">
                  <span className="label text-mute">Site or property location</span>
                  <input value={state.siteLocation} onChange={(event) => dispatch({ type: 'set', patch: { siteLocation: event.target.value } })} maxLength={180} placeholder="e.g. Ibeju-Lekki, Lagos" className="mt-1 block h-[50px] w-full border-0 border-b border-control-line bg-transparent text-[16px] outline-none placeholder:text-mute focus:border-bronze" />
                </label>
                <label className="block">
                  <span className="label text-mute">Timeline</span>
                  <select value={state.timeline} onChange={(event) => dispatch({ type: 'set', patch: { timeline: event.target.value as ConsultationTimeline | '' } })} className="mt-1 block h-[50px] w-full cursor-pointer border-0 border-b border-control-line bg-transparent text-[16px] outline-none focus:border-bronze [&>option]:bg-paper">
                    <option value="">Choose a timeline</option>
                    {(Object.keys(timelineLabels) as ConsultationTimeline[]).map((value) => (
                      <option key={value} value={value}>
                        {timelineLabels[value]}
                      </option>
                    ))}
                  </select>
                </label>
              </div>
              <div className="mt-8">
                <p className="label text-mute">Are you based outside Nigeria?</p>
                <Segmented<'no' | 'yes'>
                  className="mt-3"
                  label="Are you based outside Nigeria?"
                  value={state.basedAbroad === null ? '' : state.basedAbroad ? 'yes' : 'no'}
                  onChange={(value) => dispatch({ type: 'set', patch: { basedAbroad: value === 'yes' } })}
                  options={[
                    { value: 'no', label: 'No' },
                    { value: 'yes', label: 'Yes' },
                  ]}
                />
              </div>
              <label className="mt-8 block">
                <span className="label text-mute">Anything else we should know?</span>
                <textarea value={state.notes} onChange={(event) => dispatch({ type: 'set', patch: { notes: event.target.value } })} rows={4} maxLength={4000} placeholder="Plot size, drawings you already have, budget range…" className="mt-1 block min-h-[110px] w-full resize-y border-0 border-b border-control-line bg-transparent py-3 text-[16px] leading-[1.6] outline-none placeholder:text-mute focus:border-bronze" />
              </label>
              <StepNav onBack={() => dispatch({ type: 'go', step: 1 })} next={{ onClick: () => dispatch({ type: 'go', step: 3 }) }} />
            </div>
          ) : state.step === 3 ? (
            <DetailsStep state={state} dispatch={dispatch} />
          ) : (
            <div>
              <StepHeading step={4} title="Review your request" />
              <dl className="mt-8 border-t border-line">
                {review.map((row) => (
                  <div key={row.label} className="grid gap-1 border-b border-line py-4 phone:grid-cols-[10rem_1fr] phone:gap-6">
                    <dt className="label text-[10px] text-mute">{row.label}</dt>
                    <dd className="text-[14px] break-words text-ink">{row.value}</dd>
                  </div>
                ))}
              </dl>
              {state.notes && <p className="mt-4 text-[13px] whitespace-pre-line text-ink2">{state.notes}</p>}
              <p className="mt-6 text-[13px] leading-[1.55] text-ink2">Submitting sends a consultation request. It is not confirmed until BRIGHTHOMES contacts you.</p>
              <div className="mt-6">
                <FormAlert message={formError} />
              </div>
              <StepNav onBack={() => dispatch({ type: 'go', step: 3 })} next={{ onClick: send }} nextLabel={submit.isPending ? 'Sending…' : 'Send request'} loading={submit.isPending} />
            </div>
          )}
          {state.step < 4 && (
            <p className="mt-10 text-[12px] text-ink2">
              Prefer to talk now? Call{' '}
              <a href={company.phones[0].href} className="underline decoration-control-line underline-offset-4 hover:text-bronze">
                {company.phones[0].display}
              </a>{' '}
              or send a <Link to={routes.contact} className="underline decoration-control-line underline-offset-4 hover:text-bronze">message</Link>.
            </p>
          )}
        </div>
      </div>
    </section>
  )
}
