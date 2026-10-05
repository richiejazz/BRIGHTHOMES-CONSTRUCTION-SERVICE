import { CheckCircle2 } from 'lucide-react'
import { useState, type ReactNode } from 'react'
import { useForm, type FieldValues, type Path, type UseFormRegisterReturn, type UseFormSetError } from 'react-hook-form'
import { Link } from 'react-router-dom'

import { useSubmitAppointment, useSubmitEnquiry } from '../../api/account'
import { useServices } from '../../api/content'
import { toApiError } from '../../api/errors'
import { useAuth } from '../../context/useAuth'
import { Button } from '../ui/Button'
import { FormAlert, SelectField, TextAreaField, TextField } from '../ui/FormField'
import { useToast } from '../ui/toast-context'

export type ProjectContext = { id: number; title: string }

type ContactValues = { name: string; email: string; phone: string; service: string; message: string }
type EnquiryValues = ContactValues
type AppointmentValues = ContactValues & { preferred_date: string; preferred_time: string; time_window: string }

const contactRules = {
  name: { required: 'Please tell us your name.', maxLength: { value: 160, message: 'Please keep your name under 160 characters.' } },
  email: { required: 'Please enter your email address.', pattern: { value: /^[^\s@]+@[^\s@]+\.[^\s@]+$/, message: 'Please enter a valid email address.' } },
  phone: { pattern: { value: /^[+\d][\d\s()-]{6,}$/, message: 'Please enter a valid phone number.' }, maxLength: { value: 40, message: 'Please enter a shorter phone number.' } },
  message: { maxLength: { value: 4000, message: 'Please keep your message under 4,000 characters.' } },
}

function todayIso() {
  const now = new Date()
  return new Date(now.getTime() - now.getTimezoneOffset() * 60_000).toISOString().slice(0, 10)
}

/** Apply DRF field errors to the form; returns the message for anything not tied to a field. */
function applyServerErrors<T extends FieldValues>(error: unknown, fields: (keyof T)[], setError: UseFormSetError<T>) {
  const apiError = toApiError(error)
  const unmatched: string[] = []
  for (const [field, message] of Object.entries(apiError.fieldErrors)) {
    if (fields.includes(field as keyof T)) setError(field as Path<T>, { type: 'server', message })
    else unmatched.push(message)
  }
  return unmatched[0] ?? (apiError.kind === 'validation' && Object.keys(apiError.fieldErrors).length ? undefined : apiError.message)
}

function useContactDefaults() {
  const { user } = useAuth()
  return { name: user ? `${user.first_name} ${user.last_name}`.trim() : '', email: user?.email ?? '' }
}

function SuccessPanel({ title, children, onReset }: { title: string; children: ReactNode; onReset: () => void }) {
  const { status } = useAuth()
  return (
    <div role="status" className="animate-rise border-l-2 border-bronze py-6 pl-6 sm:pl-8">
      <CheckCircle2 aria-hidden="true" strokeWidth={1.4} className="size-9 text-bronze-dark" />
      <p className="mt-5 font-display text-4xl leading-tight">{title}</p>
      <div className="mt-3 max-w-lg leading-relaxed text-stone-600">{children}</div>
      <div className="mt-8 flex flex-wrap gap-4">
        <Button variant="secondary" onClick={onReset}>
          Send another request
        </Button>
        {status === 'authenticated' && (
          <Link to="/account" className="inline-flex min-h-11 items-center text-sm font-semibold underline decoration-bronze underline-offset-8">
            View in my account
          </Link>
        )}
      </div>
    </div>
  )
}

function ProjectNote({ project }: { project?: ProjectContext }) {
  if (!project) return null
  return (
    <p className="border border-stone-300 bg-bone px-4 py-3 text-sm text-stone-600">
      Regarding project: <span className="font-semibold text-ink">{project.title}</span>
    </p>
  )
}

type ContactFieldsProps = {
  fields: Record<'name' | 'email' | 'phone' | 'service', UseFormRegisterReturn>
  errors: Partial<Record<'name' | 'email' | 'phone' | 'service', string>>
}

function ContactFields({ fields, errors }: ContactFieldsProps) {
  return (
    <>
      <div className="grid gap-8 sm:grid-cols-2">
        <TextField label="Full name" autoComplete="name" error={errors.name} registration={fields.name} />
        <TextField label="Email address" type="email" autoComplete="email" error={errors.email} registration={fields.email} />
      </div>
      <div className="grid gap-8 sm:grid-cols-2">
        <TextField label="Phone number" type="tel" autoComplete="tel" optional error={errors.phone} registration={fields.phone} />
        <ServiceSelect registration={fields.service} error={errors.service} />
      </div>
    </>
  )
}

function ServiceSelect({ registration, error }: { registration: UseFormRegisterReturn; error?: string }) {
  const services = useServices()
  return (
    <SelectField label="Service of interest" optional error={error} registration={registration} disabled={services.isPending} hint={services.isError ? 'Services could not be loaded; you can still describe your needs below.' : undefined}>
      <option value="">{services.isPending ? 'Loading services…' : 'Not sure yet'}</option>
      {services.data?.map((service) => (
        <option key={service.id} value={service.slug}>
          {service.name}
        </option>
      ))}
    </SelectField>
  )
}

function contactFields(register: (name: keyof ContactValues, options?: object) => UseFormRegisterReturn) {
  return { name: register('name', contactRules.name), email: register('email', contactRules.email), phone: register('phone', contactRules.phone), service: register('service') }
}

function contactErrors(errors: Partial<Record<keyof ContactValues, { message?: string }>>) {
  return { name: errors.name?.message, email: errors.email?.message, phone: errors.phone?.message, service: errors.service?.message }
}

function serviceId(slug: string, services: { id: number; slug: string }[] | undefined) {
  return services?.find((service) => service.slug === slug)?.id ?? null
}

export function EnquiryForm({ project, defaultService = '' }: { project?: ProjectContext; defaultService?: string }) {
  const defaults = useContactDefaults()
  const notify = useToast()
  const services = useServices()
  const submit = useSubmitEnquiry()
  const [formError, setFormError] = useState<string>()
  const { register, handleSubmit, setError, reset, formState } = useForm<EnquiryValues>({
    values: { ...defaults, phone: '', service: services.isSuccess ? defaultService : '', message: '' },
    resetOptions: { keepDirtyValues: true },
  })

  if (submit.isSuccess) {
    return (
      <SuccessPanel
        title="Thank you — we’ve received your enquiry."
        onReset={() => {
          submit.reset()
          reset()
        }}
      >
        A member of the BRIGHTHOMES team will be in touch using the details you provided.
      </SuccessPanel>
    )
  }

  const onSubmit = handleSubmit((values) => {
    setFormError(undefined)
    submit.mutate(
      { name: values.name.trim(), email: values.email.trim(), phone: values.phone.trim(), message: values.message.trim(), service: serviceId(values.service, services.data), project: project?.id ?? null },
      {
        onSuccess: () => notify({ tone: 'success', title: 'Enquiry sent', description: 'We’ll be in touch soon.' }),
        onError: (error) => {
          const message = applyServerErrors(error, ['name', 'email', 'phone', 'message'], setError)
          setFormError(message)
          notify({ tone: 'error', title: 'Your enquiry wasn’t sent', description: message ?? 'Please review the highlighted fields.' })
        },
      },
    )
  })

  return (
    <form noValidate onSubmit={onSubmit} className="space-y-8" aria-label="Enquiry form">
      <ProjectNote project={project} />
      <ContactFields fields={contactFields(register)} errors={contactErrors(formState.errors)} />
      <TextAreaField label="How can we help?" error={formState.errors.message?.message} registration={register('message', { ...contactRules.message, required: 'Please tell us a little about your project.' })} />
      <FormAlert message={formError} />
      <Button type="submit" size="lg" arrow loading={submit.isPending}>
        {submit.isPending ? 'Sending…' : 'Send enquiry'}
      </Button>
    </form>
  )
}

export function AppointmentForm({ project, defaultService = '' }: { project?: ProjectContext; defaultService?: string }) {
  const defaults = useContactDefaults()
  const notify = useToast()
  const services = useServices()
  const submit = useSubmitAppointment()
  const [formError, setFormError] = useState<string>()
  const { register, handleSubmit, setError, reset, formState } = useForm<AppointmentValues>({
    values: { ...defaults, phone: '', service: services.isSuccess ? defaultService : '', message: '', preferred_date: '', preferred_time: '', time_window: '' },
    resetOptions: { keepDirtyValues: true },
  })
  const minDate = todayIso()

  if (submit.isSuccess) {
    return (
      <SuccessPanel
        title="Your consultation request is in."
        onReset={() => {
          submit.reset()
          reset()
        }}
      >
        We’ll contact you to confirm a suitable date and time. Your preferred slot is a request, not yet a confirmed booking.
      </SuccessPanel>
    )
  }

  const onSubmit = handleSubmit((values) => {
    setFormError(undefined)
    submit.mutate(
      {
        name: values.name.trim(),
        email: values.email.trim(),
        phone: values.phone.trim(),
        message: values.message.trim(),
        service: serviceId(values.service, services.data),
        project: project?.id ?? null,
        preferred_date: values.preferred_date,
        preferred_time: values.preferred_time || null,
        time_window: values.time_window,
      },
      {
        onSuccess: () => notify({ tone: 'success', title: 'Consultation requested', description: 'We’ll be in touch to confirm.' }),
        onError: (error) => {
          const message = applyServerErrors(error, ['name', 'email', 'phone', 'message', 'preferred_date', 'preferred_time', 'time_window'], setError)
          setFormError(message)
          notify({ tone: 'error', title: 'Your request wasn’t sent', description: message ?? 'Please review the highlighted fields.' })
        },
      },
    )
  })

  return (
    <form noValidate onSubmit={onSubmit} className="space-y-8" aria-label="Consultation request form">
      <ProjectNote project={project} />
      <ContactFields fields={contactFields(register)} errors={contactErrors(formState.errors)} />
      <div className="grid gap-8 sm:grid-cols-3">
        <TextField
          label="Preferred date"
          type="date"
          min={minDate}
          error={formState.errors.preferred_date?.message}
          registration={register('preferred_date', { required: 'Please choose a preferred date.', validate: (value) => value >= minDate || 'Please choose a date from today onwards.' })}
        />
        <TextField label="Preferred time" type="time" optional error={formState.errors.preferred_time?.message} registration={register('preferred_time')} />
        <SelectField label="Or a time of day" optional error={formState.errors.time_window?.message} registration={register('time_window')}>
          <option value="">No preference</option>
          <option value="Morning">Morning</option>
          <option value="Afternoon">Afternoon</option>
        </SelectField>
      </div>
      <TextAreaField label="Anything we should know?" optional error={formState.errors.message?.message} registration={register('message', contactRules.message)} />
      <FormAlert message={formError} />
      <Button type="submit" size="lg" arrow loading={submit.isPending}>
        {submit.isPending ? 'Sending…' : 'Request consultation'}
      </Button>
    </form>
  )
}
