import { RotateCcw } from 'lucide-react'
import type { ReactNode } from 'react'

import { toApiError } from '../../api/errors'
import { Button } from './Button'

export function Skeleton({ className = '' }: { className?: string }) {
  return <div aria-hidden="true" className={`animate-shimmer bg-stone-200 ${className}`} />
}

/** Visually hidden loading announcement to pair with skeletons. */
export function LoadingAnnouncement({ label = 'Loading' }: { label?: string }) {
  return (
    <p role="status" className="sr-only">
      {label}…
    </p>
  )
}

type StateProps = { title: string; children?: ReactNode; action?: ReactNode; tone?: 'light' | 'dark'; className?: string }

function StatePanel({ title, children, action, tone = 'light', className = '', role }: StateProps & { role?: string }) {
  const dark = tone === 'dark'
  return (
    <div role={role} className={`border-l-2 border-bronze py-8 pl-6 sm:pl-8 ${className}`}>
      <p className={`font-display text-3xl leading-tight ${dark ? 'text-paper' : 'text-ink'}`}>{title}</p>
      {children && <div className={`mt-3 max-w-xl leading-relaxed ${dark ? 'text-stone-300' : 'text-stone-600'}`}>{children}</div>}
      {action && <div className="mt-6 flex flex-wrap gap-3">{action}</div>}
    </div>
  )
}

export function EmptyState(props: StateProps) {
  return <StatePanel {...props} />
}

export function ErrorState({ error, onRetry, title = 'We couldn’t load this', tone, className }: { error: unknown; onRetry?: () => void; title?: string; tone?: 'light' | 'dark'; className?: string }) {
  return (
    <StatePanel
      role="alert"
      title={title}
      tone={tone}
      className={className}
      action={
        onRetry && (
          <Button variant={tone === 'dark' ? 'inverse' : 'secondary'} onClick={onRetry}>
            <RotateCcw aria-hidden="true" className="-ml-1 size-4" />
            Try again
          </Button>
        )
      }
    >
      {toApiError(error).message}
    </StatePanel>
  )
}
