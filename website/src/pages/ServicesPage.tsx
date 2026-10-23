import { ArrowUpRight } from 'lucide-react'
import { Link } from 'react-router-dom'

import { useServices } from '../api/content'
import type { Service } from '../api/types'
import { Media } from '../components/media/Media'
import { ConsultationCta } from '../components/sections/ConsultationCta'
import { PageHeader } from '../components/ui/Layout'
import { EmptyState, ErrorState, LoadingAnnouncement, Skeleton } from '../components/ui/States'
import { serviceImage } from '../content/media'
import { numberWord, padIndex } from '../lib/format'
import { routes } from '../lib/routes'

// W-03 groups the eight services. Grouping is presentational; any service not listed here
// (e.g. one added later in admin) appears under "More services".
const GROUPS = [
  { title: 'Design & approvals', body: 'Drawings, surveys and the approvals that come before a build.', slugs: ['architectural-drawing', 'structural-drawing', 'survey-plan', 'building-approval'] },
  { title: 'Build', body: 'Supervision and management on site, and renovation of existing buildings.', slugs: ['site-supervision', 'construction-management', 'renovation'] },
  { title: 'Property', body: 'Buying, selling, renting and leasing property.', slugs: ['real-estate'] },
]

function ServiceRow({ service, number }: { service: Service; number: number }) {
  const image = serviceImage(service.slug)
  return (
    <li className="border-b border-line">
      <Link to={routes.service(service.slug)} className="group grid grid-cols-[6.5rem_1fr_auto] items-center gap-x-5 py-6 phone:grid-cols-[11rem_1fr_auto] phone:gap-x-8">
        <Media src={image.src} alt="" aspect="aspect-[4/3]" zoom />
        <span className="min-w-0">
          <span className="block text-[11px] font-semibold text-bronze tabular-nums">{padIndex(number)}</span>
          <span className="mt-1 block font-display text-[clamp(24px,2.6vw,36px)] leading-[1.05] font-medium transition-colors group-hover:text-bronze">{service.name}</span>
          <span className="mt-2 hidden text-[13px] leading-[1.55] text-ink2 phone:block">{service.short_description}</span>
        </span>
        <ArrowUpRight aria-hidden="true" className="size-4 transition-transform duration-300 group-hover:translate-x-0.5 group-hover:-translate-y-0.5" strokeWidth={1.5} />
      </Link>
    </li>
  )
}

export default function ServicesPage() {
  const services = useServices()
  const list = services.data ?? []
  const numberOf = (service: Service) => list.findIndex((item) => item.id === service.id)
  const grouped = GROUPS.map((group) => ({ ...group, items: group.slugs.map((slug) => list.find((service) => service.slug === slug)).filter((service): service is Service => Boolean(service)) }))
  const known = new Set(GROUPS.flatMap((group) => group.slugs))
  const more = list.filter((service) => !known.has(service.slug))
  if (more.length) grouped.push({ title: 'More services', body: '', slugs: [], items: more })

  return (
    <>
      <title>Services — BRIGHTHOMES Construction Service</title>
      <PageHeader
        section="Services"
        title="Services"
        intro={`${services.data ? numberWord(list.length) : 'Our'} services that can be engaged on their own or combined into one managed project — from survey plan and drawings to approval, construction and sale.`}
      />
      <section className="container-page pb-section" aria-busy={services.isPending}>
        {services.isPending ? (
          <div className="border-t border-line">
            <LoadingAnnouncement label="Loading services" />
            {[0, 1, 2, 3].map((index) => (
              <div key={index} className="flex gap-8 border-b border-line py-6">
                <Skeleton className="aspect-[4/3] w-28 phone:w-44" />
                <div className="flex-1 space-y-3 pt-2">
                  <Skeleton className="h-3 w-8" />
                  <Skeleton className="h-8 w-1/2" />
                </div>
              </div>
            ))}
          </div>
        ) : services.isError ? (
          <ErrorState title="We couldn’t load our services." error={services.error} onRetry={() => void services.refetch()} />
        ) : list.length === 0 ? (
          <EmptyState title="Our services are being updated.">Please call us or request a consultation in the meantime.</EmptyState>
        ) : (
          <div className="space-y-[clamp(48px,6vw,96px)] border-t border-ink pt-[clamp(32px,4vw,56px)]">
            {grouped
              .filter((group) => group.items.length)
              .map((group) => (
                <div key={group.title} className="grid-editorial gap-y-6">
                  <div className="desk:col-span-3">
                    <h2 className="label text-bronze">{group.title}</h2>
                    {group.body && <p className="mt-3 max-w-[16rem] text-[13px] leading-[1.55] text-ink2">{group.body}</p>}
                  </div>
                  <ol className="border-t border-line desk:col-span-9">
                    {group.items.map((service) => (
                      <ServiceRow key={service.id} service={service} number={numberOf(service)} />
                    ))}
                  </ol>
                </div>
              ))}
          </div>
        )}
      </section>
      <ConsultationCta />
    </>
  )
}
