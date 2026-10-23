import { AlertCircle, Lock, type LucideIcon } from 'lucide-react'
import type { ReactNode } from 'react'

import { toApiError } from '../../api/errors'
import { company } from '../../content/company'
import { Button } from './Button'

/** §22 skeleton: mirrors the final layout, shimmering stone → paper → stone. Never a spinner. */
export function Skeleton({ className = '' }: { className?: string }) {
  return <div aria-hidden="true" className={`skeleton ${className}`} />
}

/** Visually hidden loading announcement to pair with skeletons (aria-busy lives on the container). */
export function LoadingAnnouncement({ label = 'Loading' }: { label?: string }) {
  return (
    <p role="status" className="sr-only">
      {label}…
    </p>
  )
}

type StateProps = { title: string; children?: ReactNode; action?: ReactNode; icon?: LucideIcon; className?: string; role?: string }

function StatePanel({ title, children, action, icon: Icon, className = '', role }: StateProps) {
  return (
    <div role={role} className={`flex flex-col items-center border border-line px-6 py-[clamp(48px,7vw,88px)] text-center ${className}`}>
      {Icon && <Icon aria-hidden="true" className="size-6 text-bronze" strokeWidth={1.4} />}
      <p className="mt-5 font-display text-[clamp(26px,2.4vw,32px)] leading-[1.1] font-medium text-ink">{title}</p>
      {children && <div className="mt-3 max-w-md text-[14px] leading-[1.6] text-ink2">{children}</div>}
      {action && <div className="mt-7 flex flex-wrap justify-center gap-3">{action}</div>}
    </div>
  )
}

/** §20: name what is missing, why it matters, and give one next action. */
export function EmptyState(props: StateProps) {
  return <StatePanel {...props} />
}

/** §21: plain language, a recovery path (Try again) and the phone number. */
export function ErrorState({ error, onRetry, title = 'We couldn’t load this.', className }: { error: unknown; onRetry?: () => void; title?: string; className?: string }) {
  const { kind, message } = toApiError(error)
  if (kind === 'forbidden') return <AccessDenied className={className} />
  return (
    <StatePanel
      role="alert"
      icon={AlertCircle}
      title={title}
      className={className}
      action={
        <>
          {onRetry && (
            <Button size="compact" onClick={onRetry}>
              Try again
            </Button>
          )}
          <a href={company.phones[0].href} className="btn btn-secondary btn-compact">
            Call {company.phones[0].display}
          </a>
        </>
      }
    >
      {message}
    </StatePanel>
  )
}

export function AccessDenied({ className }: { className?: string }) {
  return (
    <StatePanel role="alert" icon={Lock} title="This isn’t available to your account." className={className}>
      If you think you should have access, please contact BRIGHTHOMES on {company.phones[0].display}.
    </StatePanel>
  )
}
