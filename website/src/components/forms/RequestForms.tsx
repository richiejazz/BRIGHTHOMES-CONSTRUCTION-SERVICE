import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { Link } from 'react-router-dom'

import { useSubmitEnquiry } from '../../api/account'
import { useServices } from '../../api/content'
import type { ContactMethod, Enquiry } from '../../api/types'
import { useAuth } from '../../context/useAuth'
import { applyServerErrors, contactRules, useContactDefaults } from '../../lib/forms'
import { contactMethodLabels } from '../../lib/labels'
import { routes } from '../../lib/routes'
import { Button } from '../ui/Button'
import { Segmented } from '../ui/Controls'
import { FormAlert, SelectField, TextAreaField, TextField } from '../ui/FormField'
import { useToast } from '../ui/toast-context'

export type EnquiryContext = { project?: { id: number; title: string }; property?: { id: number; title: string }; serviceSlug?: string }

type EnquiryValues = { name: string; email: string; phone: string; service: string; message: string }

/** Inline confirmation (W-11 "Message sent"). */
function Sent({ enquiry, onReset }: { enquiry: Enquiry; onReset: () => void }) {
  const { status } = useAuth()
  return (
    <div role="status" className="animate-rise">
      <p className="font-display text-[clamp(30px,3vw,40px)] leading-[1.05] font-medium">Message sent.</p>
      <p className="mt-3 max-w-md text-[15px] leading-[1.6] text-ink2">
        Thank you. Someone from BRIGHTHOMES will reply by phone or email. Your reference is <strong className="font-semibold text-ink">{enquiry.reference}</strong>.
      </p>
      <div className="mt-6 flex flex-wrap items-center gap-x-8 gap-y-3">
        <button type="button" className="text-link" onClick={onReset}>
          Send another message
        </button>
        {status === 'authenticated' && (
          <Link to={routes.account.enquiries} className="text-link">
            View your enquiries
          </Link>
        )}
      </div>
    </div>
  )
}

/**
 * Enquiry form for the contact page (W-11), project detail (W-06) and the property panel (W-08).
 * `compact` stacks every field for narrow panels.
 */
export function EnquiryForm({
  context = {},
  defaultMessage = '',
  compact = false,
  showService = false,
  submitLabel = 'Send enquiry',
  closed = false,
}: {
  context?: EnquiryContext
  defaultMessage?: string
  compact?: boolean
  showService?: boolean
  submitLabel?: string
  /** Enquiries are closed (sold / rented / unavailable listing). */
  closed?: boolean
}) {
  const defaults = useContactDefaults()
  const notify = useToast()
  const services = useServices()
  const submit = useSubmitEnquiry()
  const [formError, setFormError] = useState<string>()
  const [method, setMethod] = useState<ContactMethod | ''>('')
  const { register, handleSubmit, setError, reset, formState } = useForm<EnquiryValues>({
    values: { ...defaults, service: services.isSuccess ? (context.serviceSlug ?? '') : '', message: defaultMessage },
    resetOptions: { keepDirtyValues: true },
  })

  if (submit.isSuccess) {
    return (
      <Sent
        enquiry={submit.data}
        onReset={() => {
          submit.reset()
          reset()
          setMethod('')
        }}
      />
    )
  }

  const onSubmit = handleSubmit((values) => {
    setFormError(undefined)
    const serviceSlug = showService ? values.service : context.serviceSlug
    submit.mutate(
      {
        name: values.name.trim(),
        email: values.email.trim(),
        phone: values.phone.trim(),
        message: values.message.trim(),
        preferred_contact: method,
        service: services.data?.find((service) => service.slug === serviceSlug)?.id ?? null,
        project: context.project?.id ?? null,
        property: context.property?.id ?? null,
      },
      {
        onSuccess: () => notify({ tone: 'success', title: 'Enquiry sent' }),
        onError: (error) => setFormError(applyServerErrors(error, ['name', 'email', 'phone', 'message'], setError)),
      },
    )
  })

  const twoUp = compact ? '' : 'phone:grid-cols-2'
  return (
    <form noValidate onSubmit={onSubmit} className="space-y-7" aria-label="Enquiry form">
      <div className={`grid gap-7 ${twoUp}`}>
        <TextField label="Full name" autoComplete="name" placeholder="Your name" error={formState.errors.name?.message} registration={register('name', contactRules.name)} />
        <TextField label="Phone" type="tel" autoComplete="tel" placeholder="+234 or international" optional error={formState.errors.phone?.message} registration={register('phone', contactRules.phone)} />
      </div>
      <TextField label="Email" type="email" autoComplete="email" placeholder="you@example.com" error={formState.errors.email?.message} registration={register('email', contactRules.email)} />
      {showService && (
        <SelectField label="Topic" optional registration={register('service')} disabled={services.isPending}>
          <option value="">{services.isPending ? 'Loading…' : 'General enquiry'}</option>
          {services.data?.map((service) => (
            <option key={service.id} value={service.slug}>
              {service.name}
            </option>
          ))}
        </SelectField>
      )}
      <TextAreaField label="Message" placeholder="Tell us a little about what you need" error={formState.errors.message?.message} registration={register('message', { ...contactRules.message, required: 'Please write a short message.' })} />
      <div>
        <p className="label text-mute" id="contact-method-label">
          Best way to reach you <span className="ml-2 text-[11px] font-medium tracking-normal normal-case">Optional</span>
        </p>
        <Segmented
          className="mt-3"
          label="Best way to reach you"
          value={method}
          onChange={(value) => setMethod(value === method ? '' : value)}
          options={(Object.keys(contactMethodLabels) as ContactMethod[]).map((value) => ({ value, label: contactMethodLabels[value] }))}
        />
      </div>
      <FormAlert message={formError} />
      <div className={`flex flex-wrap items-center gap-x-6 gap-y-3 ${compact ? '' : 'justify-between'}`}>
        {!compact && <p className="text-[12px] text-mute">We’ll reply by phone or email.</p>}
        <Button type="submit" loading={submit.isPending} disabled={closed} className={compact ? 'w-full' : ''}>
          {submit.isPending ? 'Sending…' : submitLabel}
        </Button>
      </div>
    </form>
  )
}
