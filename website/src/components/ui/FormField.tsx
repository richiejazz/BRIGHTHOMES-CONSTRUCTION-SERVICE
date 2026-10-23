import { AlertCircle } from 'lucide-react'
import { useId, type InputHTMLAttributes, type ReactNode, type SelectHTMLAttributes, type TextareaHTMLAttributes } from 'react'
import type { UseFormRegisterReturn } from 'react-hook-form'

// §12 website fields are architectural: an 11px tracked label above a single underline.
// The underline uses --control-line (≥ 3:1 on every surface) so a field is identifiable on its own;
// focus turns it bronze; errors turn it danger and are always explained in words.

type FieldShellProps = {
  label: string
  error?: string
  hint?: string
  optional?: boolean
  className?: string
  children: (ids: { id: string; describedBy?: string }) => ReactNode
}

function FieldShell({ label, error, hint, optional, className = '', children }: FieldShellProps) {
  const id = useId()
  const hintId = hint ? `${id}-hint` : undefined
  const errorId = error ? `${id}-error` : undefined
  const describedBy = [hintId, errorId].filter(Boolean).join(' ') || undefined
  return (
    <div className={className}>
      <label htmlFor={id} className="label flex items-baseline justify-between gap-3 text-mute">
        <span>{label}</span>
        {optional && <span className="text-[11px] font-medium tracking-normal normal-case">Optional</span>}
      </label>
      {children({ id, describedBy })}
      {hint && !error && (
        <p id={hintId} className="mt-2 text-[13px] text-mute">
          {hint}
        </p>
      )}
      {error && (
        <p id={errorId} className="mt-2 text-[12px] font-semibold text-danger">
          {error}
        </p>
      )}
    </div>
  )
}

type Common = { label: string; error?: string; hint?: string; optional?: boolean; className?: string; registration: UseFormRegisterReturn }

const controlBase =
  'mt-1 block w-full rounded-none border-0 border-b border-control-line bg-transparent px-0 text-[16px] text-ink outline-none transition-colors duration-200 placeholder:text-mute focus:border-bronze focus-visible:outline-none aria-[invalid=true]:border-danger disabled:opacity-60'

export function TextField({ label, error, hint, optional, className, registration, ...props }: Common & InputHTMLAttributes<HTMLInputElement>) {
  return (
    <FieldShell label={label} error={error} hint={hint} optional={optional} className={className}>
      {({ id, describedBy }) => (
        <input id={id} aria-invalid={error ? true : undefined} aria-describedby={describedBy} aria-required={!optional || undefined} className={`${controlBase} h-[50px]`} {...registration} {...props} />
      )}
    </FieldShell>
  )
}

export function TextAreaField({ label, error, hint, optional, className, registration, ...props }: Common & TextareaHTMLAttributes<HTMLTextAreaElement>) {
  return (
    <FieldShell label={label} error={error} hint={hint} optional={optional} className={className}>
      {({ id, describedBy }) => (
        <textarea id={id} rows={4} aria-invalid={error ? true : undefined} aria-describedby={describedBy} aria-required={!optional || undefined} className={`${controlBase} min-h-[110px] resize-y py-3 leading-[1.6]`} {...registration} {...props} />
      )}
    </FieldShell>
  )
}

export function SelectField({ label, error, hint, optional, className, registration, children, ...props }: Common & SelectHTMLAttributes<HTMLSelectElement>) {
  return (
    <FieldShell label={label} error={error} hint={hint} optional={optional} className={className}>
      {({ id, describedBy }) => (
        <select id={id} aria-invalid={error ? true : undefined} aria-describedby={describedBy} className={`${controlBase} h-[50px] cursor-pointer [&>option]:bg-paper [&>option]:text-ink`} {...registration} {...props}>
          {children}
        </select>
      )}
    </FieldShell>
  )
}

/** Form-level error summary with a red rule (§21), announced to assistive technology. */
export function FormAlert({ message, title }: { message?: string; title?: string }) {
  if (!message) return null
  return (
    <div role="alert" className="flex gap-3 border-l-2 border-danger bg-paper px-4 py-3 text-[14px] text-ink">
      <AlertCircle aria-hidden="true" className="mt-0.5 size-4 shrink-0 text-danger" strokeWidth={1.8} />
      <p>
        {title && <strong className="font-semibold">{title} </strong>}
        {message}
      </p>
    </div>
  )
}
