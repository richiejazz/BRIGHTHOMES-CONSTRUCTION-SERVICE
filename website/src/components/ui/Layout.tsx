import type { ReactNode } from 'react'

export function Container({ children, className = '' }: { children: ReactNode; className?: string }) {
  return <div className={`mx-auto w-full max-w-[1360px] px-5 sm:px-8 lg:px-12 ${className}`}>{children}</div>
}

type SectionHeadingProps = {
  eyebrow?: string
  title: ReactNode
  intro?: ReactNode
  tone?: 'light' | 'dark'
  as?: 'h1' | 'h2'
  className?: string
  id?: string
}

/** Eyebrow, display headline and optional intro, used to open every major section. */
export function SectionHeading({ eyebrow, title, intro, tone = 'light', as: Heading = 'h2', className = '', id }: SectionHeadingProps) {
  const dark = tone === 'dark'
  return (
    <div className={className}>
      {eyebrow && (
        <p className={`eyebrow mb-5 flex items-center gap-3 ${dark ? 'text-bronze-light' : 'text-bronze-dark'}`}>
          <span aria-hidden="true" className="h-px w-8 bg-current" />
          {eyebrow}
        </p>
      )}
      <Heading id={id} className={`font-display text-[2.6rem] leading-[1.02] tracking-[-0.01em] sm:text-6xl lg:text-[4.25rem] ${dark ? 'text-paper' : 'text-ink'}`}>
        {title}
      </Heading>
      {intro && <div className={`mt-6 max-w-2xl text-base leading-relaxed sm:text-lg ${dark ? 'text-stone-300' : 'text-stone-600'}`}>{intro}</div>}
    </div>
  )
}

/** Page opener used by every interior page. */
export function PageHeader({ eyebrow, title, intro, children }: { eyebrow: string; title: ReactNode; intro?: ReactNode; children?: ReactNode }) {
  return (
    <header className="blueprint-grid relative overflow-hidden bg-ink pb-16 pt-36 text-paper sm:pb-20 sm:pt-44">
      <Container>
        <div className="animate-rise">
          <SectionHeading as="h1" eyebrow={eyebrow} title={title} intro={intro} tone="dark" />
        </div>
        {children}
      </Container>
    </header>
  )
}
