import { ArrowRight, LoaderCircle } from 'lucide-react'
import type { ButtonHTMLAttributes, ReactNode } from 'react'
import { Link, type LinkProps } from 'react-router-dom'

// §11 website buttons: rectangles with tracked capitals, 54px tall, radius 0. Styles live in
// index.css (.btn, .btn-primary …) so the header, footer and pages share one definition.

type Variant = 'primary' | 'secondary' | 'on-photo' | 'on-photo-outline' | 'on-band' | 'text'
type Size = 'md' | 'compact'

function buttonClasses(variant: Variant = 'primary', size: Size = 'md', className = '') {
  if (variant === 'text') return `text-link ${className}`
  return ['btn', `btn-${variant}`, size === 'compact' ? 'btn-compact' : '', 'disabled:cursor-not-allowed disabled:opacity-40', className].join(' ')
}

function Content({ children, arrow, loading }: { children: ReactNode; arrow?: boolean; loading?: boolean }) {
  return (
    <>
      {loading && <LoaderCircle aria-hidden="true" className="size-4 animate-spin" />}
      {children}
      {arrow && !loading && <ArrowRight aria-hidden="true" strokeWidth={1.5} className="arrow size-4 transition-transform duration-250 group-hover:translate-x-1" />}
    </>
  )
}

type ButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & { variant?: Variant; size?: Size; arrow?: boolean; loading?: boolean }

export function Button({ variant, size, arrow, loading, className, children, type = 'button', disabled, ...props }: ButtonProps) {
  return (
    <button type={type} className={`group ${buttonClasses(variant, size, className)}`} disabled={disabled || loading} aria-busy={loading || undefined} {...props}>
      <Content arrow={arrow} loading={loading}>
        {children}
      </Content>
    </button>
  )
}

type ButtonLinkProps = LinkProps & { variant?: Variant; size?: Size; arrow?: boolean }

export function ButtonLink({ variant, size, arrow, className, children, ...props }: ButtonLinkProps) {
  return (
    <Link className={`group ${buttonClasses(variant, size, className)}`} {...props}>
      <Content arrow={arrow}>{children}</Content>
    </Link>
  )
}
