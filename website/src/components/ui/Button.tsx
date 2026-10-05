import { ArrowUpRight, LoaderCircle } from 'lucide-react'
import type { ButtonHTMLAttributes, ReactNode } from 'react'
import { Link, type LinkProps } from 'react-router-dom'

type Variant = 'primary' | 'secondary' | 'accent' | 'inverse' | 'text'
type Size = 'md' | 'lg'

const base =
  'group inline-flex items-center justify-center gap-3 font-semibold tracking-[0.04em] transition-colors duration-300 disabled:cursor-not-allowed disabled:opacity-60'

const variants: Record<Variant, string> = {
  primary: 'bg-ink text-paper hover:bg-graphite',
  secondary: 'border border-ink/80 text-ink hover:bg-ink hover:text-paper',
  accent: 'bg-bronze-light text-ink hover:bg-paper',
  inverse: 'border border-paper/40 text-paper hover:border-paper hover:bg-paper hover:text-ink',
  text: 'text-ink underline-offset-8 hover:underline decoration-bronze',
}

const sizes: Record<Size, string> = {
  md: 'min-h-11 px-5 text-sm',
  lg: 'min-h-14 px-7 text-[0.95rem]',
}

function buttonClasses(variant: Variant = 'primary', size: Size = 'md', className = '') {
  return [base, variants[variant], variant === 'text' ? 'min-h-11 text-sm' : sizes[size], className].join(' ')
}

function Content({ children, arrow, loading }: { children: ReactNode; arrow?: boolean; loading?: boolean }) {
  return (
    <>
      {loading && <LoaderCircle aria-hidden="true" className="size-4 animate-spin" />}
      <span>{children}</span>
      {arrow && !loading && (
        <ArrowUpRight aria-hidden="true" className="size-4 transition-transform duration-300 group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
      )}
    </>
  )
}

type ButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & { variant?: Variant; size?: Size; arrow?: boolean; loading?: boolean }

export function Button({ variant, size, arrow, loading, className, children, type = 'button', disabled, ...props }: ButtonProps) {
  return (
    <button type={type} className={buttonClasses(variant, size, className)} disabled={disabled || loading} aria-busy={loading || undefined} {...props}>
      <Content arrow={arrow} loading={loading}>
        {children}
      </Content>
    </button>
  )
}

type ButtonLinkProps = LinkProps & { variant?: Variant; size?: Size; arrow?: boolean }

export function ButtonLink({ variant, size, arrow, className, children, ...props }: ButtonLinkProps) {
  return (
    <Link className={buttonClasses(variant, size, className)} {...props}>
      <Content arrow={arrow}>{children}</Content>
    </Link>
  )
}
