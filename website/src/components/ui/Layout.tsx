import type { ReactNode } from 'react'

/** §23 container: max-width 1440, padding-inline clamp(20px, 5vw, 72px). */
export function Container({ children, className = '' }: { children: ReactNode; className?: string }) {
  return <div className={`container-page ${className}`}>{children}</div>
}

/** Space reserved under the fixed 72px bar on pages without a full-bleed hero. */
export const BAR_OFFSET = 'pt-[calc(72px+clamp(48px,6.5vw,104px))]'

/**
 * Page title composition (W-03, W-05, W-07): "BRIGHTHOMES / SECTION" label, the page title in
 * Cormorant at clamp(64px, 10vw, 160px), and an introduction set to the right on wide screens.
 */
export function PageHeader({ section, title, intro, note, children }: { section: string; title: ReactNode; intro?: ReactNode; note?: ReactNode; children?: ReactNode }) {
  return (
    <header className={`container-page ${BAR_OFFSET}`}>
      <div className="grid-editorial items-end pb-[clamp(32px,4vw,56px)]">
        <div className="desk:col-span-8">
          <p className="label text-mute">BRIGHTHOMES / {section}</p>
          <h1 className="mt-6 font-display text-page-title font-medium break-words">{title}</h1>
        </div>
        {intro && (
          <p className="max-w-[420px] text-[15px] leading-[1.6] text-ink2 desk:col-span-4 desk:justify-self-end desk:pb-3">
            {intro}
            {note && <span className="text-bronze"> {note}</span>}
          </p>
        )}
      </div>
      {children}
    </header>
  )
}

/**
 * Numbered section heading (§02 editorial structure): "(03) SERVICES" over a Cormorant heading
 * whose second phrase is an italic completion — "Eight services. *One accountable team.*"
 */
export function SectionHeading({
  number,
  label,
  title,
  action,
  id,
  className = '',
  as: Heading = 'h2',
  onStone = false,
}: {
  number?: string
  label: string
  title: ReactNode
  action?: ReactNode
  id?: string
  className?: string
  as?: 'h1' | 'h2'
  /** Labels on --stone use ink2: --mute is 4.4:1 there in light mode, short of AA. */
  onStone?: boolean
}) {
  return (
    <div className={`flex flex-wrap items-end justify-between gap-x-8 gap-y-6 ${className}`}>
      <div>
        <p className={`label ${onStone ? 'text-ink2' : 'text-mute'}`}>
          {number && <span className="text-bronze">({number}) </span>}
          {label}
        </p>
        <Heading id={id} className="mt-5 font-display text-section font-medium">
          {title}
        </Heading>
      </div>
      {action}
    </div>
  )
}

/** Italic completion for headlines: one italic phrase carries the emphasis (§04). */
export function Em({ children, accent = false }: { children: ReactNode; accent?: boolean }) {
  return <em className={`font-normal ${accent ? 'text-bronze' : ''}`}>{children}</em>
}
