import { useId, type InputHTMLAttributes, type ReactNode, type SelectHTMLAttributes, type TextareaHTMLAttributes } from 'react'
import type { UseFormRegisterReturn } from 'react-hook-form'

type Tone = 'light' | 'dark'

const control = {
  light: 'border-stone-300 bg-transparent text-ink placeholder:text-stone-400 focus:border-bronze-dark focus:shadow-[0_1px_0_0_var(--color-bronze-dark)] aria-[invalid=true]:border-danger',
  dark: 'border-graphite bg-transparent text-paper placeholder:text-stone-500 focus:border-bronze-light focus:shadow-[0_1px_0_0_var(--color-bronze-light)] aria-[invalid=true]:border-[#e3907f]',
}

type FieldShellProps = {
  label: string
  error?: string
  hint?: string
  optional?: boolean
  tone?: Tone
  className?: string
  children: (ids: { id: string; describedBy?: string }) => ReactNode
}

function FieldShell({ label, error, hint, optional, tone = 'light', className = '', children }: FieldShellProps) {
  const id = useId()
  const hintId = hint ? `${id}-hint` : undefined
  const errorId = error ? `${id}-error` : undefined
  const describedBy = [hintId, errorId].filter(Boolean).join(' ') || undefined
  return (
    <div className={className}>
      <label htmlFor={id} className={`eyebrow flex items-baseline justify-between gap-3 ${tone === 'dark' ? 'text-stone-300' : 'text-stone-600'}`}>
        <span>{label}</span>
        {optional && <span className="text-[0.65rem] font-medium tracking-[0.12em] normal-case opacity-80">Optional</span>}
      </label>
      {children({ id, describedBy })}
      {hint && !error && (
        <p id={hintId} className={`mt-2 text-sm ${tone === 'dark' ? 'text-stone-400' : 'text-stone-500'}`}>
          {hint}
        </p>
      )}
      {error && (
        <p id={errorId} className={`mt-2 text-sm font-medium ${tone === 'dark' ? 'text-[#e3907f]' : 'text-danger'}`}>
          {error}
        </p>
      )}
    </div>
  )
}

type Common = { label: string; error?: string; hint?: string; optional?: boolean; tone?: Tone; className?: string; registration: UseFormRegisterReturn }

const controlBase = 'mt-3 block w-full rounded-none border-0 border-b px-0 py-3 text-base outline-none transition-colors duration-200 focus-visible:outline-none'

export function TextField({ label, error, hint, optional, tone = 'light', className, registration, ...props }: Common & InputHTMLAttributes<HTMLInputElement>) {
  return (
    <FieldShell label={label} error={error} hint={hint} optional={optional} tone={tone} className={className}>
      {({ id, describedBy }) => (
        <input id={id} aria-invalid={error ? true : undefined} aria-describedby={describedBy} aria-required={!optional || undefined} className={`${controlBase} ${control[tone]}`} {...registration} {...props} />
      )}
    </FieldShell>
  )
}

export function TextAreaField({ label, error, hint, optional, tone = 'light', className, registration, ...props }: Common & TextareaHTMLAttributes<HTMLTextAreaElement>) {
  return (
    <FieldShell label={label} error={error} hint={hint} optional={optional} tone={tone} className={className}>
      {({ id, describedBy }) => (
        <textarea id={id} rows={5} aria-invalid={error ? true : undefined} aria-describedby={describedBy} aria-required={!optional || undefined} className={`${controlBase} resize-y ${control[tone]}`} {...registration} {...props} />
      )}
    </FieldShell>
  )
}

export function SelectField({ label, error, hint, optional, tone = 'light', className, registration, children, ...props }: Common & SelectHTMLAttributes<HTMLSelectElement>) {
  return (
    <FieldShell label={label} error={error} hint={hint} optional={optional} tone={tone} className={className}>
      {({ id, describedBy }) => (
        <select id={id} aria-invalid={error ? true : undefined} aria-describedby={describedBy} className={`${controlBase} cursor-pointer ${control[tone]} ${tone === 'dark' ? '[&>option]:bg-ink' : ''}`} {...registration} {...props}>
          {children}
        </select>
      )}
    </FieldShell>
  )
}

/** Form-level error summary, announced to assistive technology. */
export function FormAlert({ message }: { message?: string }) {
  if (!message) return null
  return (
    <p role="alert" className="border-l-2 border-danger bg-danger/5 px-4 py-3 text-sm font-medium text-danger">
      {message}
    </p>
  )
}
