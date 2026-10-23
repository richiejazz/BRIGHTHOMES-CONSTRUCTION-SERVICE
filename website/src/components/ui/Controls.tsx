import { Check } from 'lucide-react'
import type { InputHTMLAttributes, ReactNode } from 'react'

// §12 website selection controls. Square, hairline, ink fill when selected. Every control is a
// real button or input, reports its state (aria-pressed / checked) and is at least 40–44px tall.

type Option<T extends string> = { value: T; label: string }

/** Filter chip row: 40px, 1px border, 13px/500; selected = ink fill. */
export function ChipGroup<T extends string>({ label, options, value, onChange, className = '' }: { label: string; options: Option<T>[]; value: T; onChange: (value: T) => void; className?: string }) {
  return (
    <div role="group" aria-label={label} className={`flex flex-wrap gap-2 ${className}`}>
      {options.map((option) => {
        const selected = option.value === value
        return (
          <button
            key={option.value}
            type="button"
            aria-pressed={selected}
            onClick={() => onChange(option.value)}
            className={`inline-flex min-h-10 items-center border px-4 text-[13px] font-medium transition-colors duration-200 ${selected ? 'border-ink bg-ink text-bg' : 'border-control-line text-ink hover:border-ink'}`}
          >
            {option.label}
          </button>
        )
      })}
    </div>
  )
}

/** Segmented control: joined 44px cells, 12px tracked caps; selected = ink fill. */
export function Segmented<T extends string>({ label, options, value, onChange, className = '' }: { label: string; options: Option<T>[]; value: T | ''; onChange: (value: T) => void; className?: string }) {
  return (
    <div role="group" aria-label={label} className={`inline-flex max-w-full flex-wrap ${className}`}>
      {options.map((option) => {
        const selected = option.value === value
        return (
          <button
            key={option.value}
            type="button"
            aria-pressed={selected}
            onClick={() => onChange(option.value)}
            className={`-ml-px inline-flex min-h-11 items-center border px-4 text-[12px] font-semibold tracking-[0.16em] uppercase transition-colors duration-200 first:ml-0 ${selected ? 'relative z-10 border-ink bg-ink text-bg' : 'border-control-line text-ink hover:text-bronze'}`}
          >
            {option.label}
          </button>
        )
      })}
    </div>
  )
}

/** Option tile: 60px, square, 18px check box; selected = 1px ink inset ring. Multi-select. */
export function OptionTile({ label, checked, onChange, description }: { label: string; checked: boolean; onChange: (checked: boolean) => void; description?: ReactNode }) {
  return (
    <label className={`flex min-h-[60px] cursor-pointer items-center gap-4 border px-4 py-3 transition-[box-shadow,border-color] duration-200 ${checked ? 'border-ink shadow-[inset_0_0_0_1px_var(--ink)]' : 'border-control-line hover:border-ink'}`}>
      <input type="checkbox" className="peer sr-only" checked={checked} onChange={(event) => onChange(event.target.checked)} />
      <span aria-hidden="true" className={`flex size-[18px] shrink-0 items-center justify-center border peer-focus-visible:outline-2 peer-focus-visible:outline-offset-3 peer-focus-visible:outline-bronze ${checked ? 'border-ink bg-ink text-bg' : 'border-control-line'}`}>
        {checked && <Check className="size-3" strokeWidth={2.5} />}
      </span>
      <span className="text-[14px] text-ink">
        {label}
        {description && <span className="mt-0.5 block text-[12px] text-mute">{description}</span>}
      </span>
    </label>
  )
}

/** Checkbox: 16px, ink accent, 44px row. */
export function Checkbox({ label, className = '', ...props }: { label: ReactNode } & InputHTMLAttributes<HTMLInputElement>) {
  return (
    <label className={`inline-flex min-h-11 cursor-pointer items-center gap-3 text-[13px] text-ink ${className}`}>
      <input type="checkbox" className="size-4 accent-[var(--ink)]" {...props} />
      {label}
    </label>
  )
}
