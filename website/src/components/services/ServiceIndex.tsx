import { Building2, ClipboardList, Frame, Hammer, HardHat, KeyRound, LandPlot, PencilRuler, Stamp, type LucideIcon } from 'lucide-react'
import { Link } from 'react-router-dom'

import type { Service } from '../../api/types'
import { padIndex } from '../../lib/format'
import { Reveal } from '../ui/Reveal'
import { Skeleton } from '../ui/States'

const icons: Record<string, LucideIcon> = {
  'architectural-drawing': PencilRuler,
  'structural-drawing': Frame,
  'site-supervision': HardHat,
  'construction-management': ClipboardList,
  'real-estate': KeyRound,
  renovation: Hammer,
  'survey-plan': LandPlot,
  'building-approval': Stamp,
}

export function ServiceIcon({ slug, className = 'size-6' }: { slug: string; className?: string }) {
  const Icon = icons[slug] ?? Building2
  return <Icon aria-hidden="true" strokeWidth={1.4} className={className} />
}

/** Numbered, ruled index of services — a drawing-register layout rather than a card grid. */
export function ServiceIndex({ services, tone = 'light' }: { services: Service[]; tone?: 'light' | 'dark' }) {
  const dark = tone === 'dark'
  return (
    <ol className={`grid border-t sm:grid-cols-2 lg:grid-cols-4 ${dark ? 'border-graphite' : 'border-stone-300'}`}>
      {services.map((service, index) => (
        <Reveal as="li" key={service.id} delay={(index % 4) * 70} className={`group relative border-b sm:[&:nth-child(odd)]:border-r lg:border-r lg:[&:nth-child(4n)]:border-r-0 ${dark ? 'border-graphite' : 'border-stone-300'}`}>
          <div className={`flex h-full flex-col p-6 transition-colors duration-500 sm:p-8 ${dark ? 'hover:bg-charcoal' : 'hover:bg-bone'}`}>
            <div className="flex items-start justify-between">
              <span className={`text-xs font-semibold tracking-[0.2em] text-stone-500`}>{padIndex(index)}</span>
              <ServiceIcon slug={service.slug} className={`size-7 ${dark ? 'text-bronze-light' : 'text-bronze-dark'}`} />
            </div>
            <h3 className={`mt-12 font-display text-[1.9rem] leading-[1.05] ${dark ? 'text-paper' : 'text-ink'}`}>
              <Link to={`/services#${service.slug}`} className="after:absolute after:inset-0">
                {service.name}
              </Link>
            </h3>
            <p className={`mt-3 text-[0.95rem] leading-relaxed ${dark ? 'text-stone-400' : 'text-stone-600'}`}>{service.short_description}</p>
          </div>
        </Reveal>
      ))}
    </ol>
  )
}

export function ServiceIndexSkeleton() {
  return (
    <div className="grid border-t border-stone-300 sm:grid-cols-2 lg:grid-cols-4" aria-hidden="true">
      {Array.from({ length: 8 }, (_, index) => (
        <div key={index} className="border-b border-stone-300 p-6 sm:p-8">
          <Skeleton className="h-3 w-8" />
          <Skeleton className="mt-12 h-8 w-3/4" />
          <Skeleton className="mt-4 h-4 w-full" />
          <Skeleton className="mt-2 h-4 w-2/3" />
        </div>
      ))}
    </div>
  )
}
