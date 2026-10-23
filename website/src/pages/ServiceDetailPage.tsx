import { ArrowLeft, ArrowUpRight } from 'lucide-react'
import { Link, useParams } from 'react-router-dom'

import { useServices } from '../api/content'
import { Media } from '../components/media/Media'
import { ConsultationCta } from '../components/sections/ConsultationCta'
import { ButtonLink } from '../components/ui/Button'
import { ErrorState, LoadingAnnouncement, Skeleton } from '../components/ui/States'
import { serviceImage } from '../content/media'
import { padIndex } from '../lib/format'
import { routes } from '../lib/routes'
import NotFoundPage from './NotFoundPage'

// W-04 "How an engagement runs". This four-step outline comes from the approved prototype, where it
// is marked as placeholder wording to be confirmed by BRIGHTHOMES (spec §00 placeholder table).
const ENGAGEMENT = [
  { title: 'Consultation', body: 'A conversation about your site, goals and budget.' },
  { title: 'Brief & assessment', body: 'We review the site, documents and requirements.' },
  { title: 'Proposal & scope', body: 'A clear scope of work for you to approve.' },
  { title: 'Delivery', body: 'The work, managed through to handover.' },
]

export default function ServiceDetailPage() {
  const { slug = '' } = useParams()
  const services = useServices()

  if (services.isPending)
    return (
      <div className="grid min-h-[80svh] desk:grid-cols-2" aria-busy="true">
        <LoadingAnnouncement label="Loading service" />
        <div className="container-page pt-40">
          <Skeleton className="h-20 w-24" />
          <Skeleton className="mt-6 h-16 w-3/4" />
          <Skeleton className="mt-6 h-4 w-2/3" />
        </div>
        <Skeleton className="hidden desk:block" />
      </div>
    )
  if (services.isError)
    return (
      <div className="container-page pt-40 pb-section">
        <ErrorState title="We couldn’t load this service." error={services.error} onRetry={() => void services.refetch()} />
      </div>
    )

  const index = services.data.findIndex((item) => item.slug === slug)
  if (index < 0) return <NotFoundPage title="This service isn’t listed." message="It may have been renamed. See all BRIGHTHOMES services instead." />
  const service = services.data[index]
  const image = serviceImage(service.slug)
  const paragraphs = service.description.split(/\n\s*\n/).filter(Boolean)
  const others = services.data.filter((item) => item.id !== service.id)

  return (
    <>
      <title>{`${service.name} — BRIGHTHOMES Construction Service`}</title>
      <section className="grid desk:min-h-[min(92svh,900px)] desk:grid-cols-2">
        <div className="container-page flex flex-col justify-end pt-[calc(72px+48px)] pb-[clamp(48px,6vw,88px)] desk:mr-0 desk:max-w-none desk:pr-[clamp(32px,4vw,72px)] desk:pl-[max(var(--gutter),calc((100vw-var(--container))/2+var(--gutter)))]">
          <Link to={routes.services} className="text-link self-start no-underline">
            <ArrowLeft aria-hidden="true" className="size-4" strokeWidth={1.5} /> All services
          </Link>
          <p className="mt-10 font-display text-[clamp(64px,8vw,112px)] leading-[0.85] text-bronze [font-variant-numeric:lining-nums]">{padIndex(index)}</p>
          <h1 className="mt-4 font-display text-[clamp(44px,5.4vw,80px)] leading-[0.98] font-medium tracking-[-0.015em]">{service.name}</h1>
          <p className="mt-6 max-w-[440px] text-[16px] leading-[1.65] text-ink2">{service.short_description}</p>
          <div className="mt-9 flex flex-col gap-3 phone:flex-row phone:flex-wrap">
            <ButtonLink to={routes.consultation({ service: service.slug })} arrow>
              Request a consultation
            </ButtonLink>
            <ButtonLink to={routes.enquiry({ service: service.slug })} variant="secondary">
              Ask a question
            </ButtonLink>
          </div>
        </div>
        <Media src={image.src} alt={image.alt} aspect="aspect-[4/3] desk:aspect-auto" className="desk:h-full" illustrative eager />
      </section>

      <section className="container-page py-section" aria-labelledby="about-service">
        <div className="grid-editorial gap-y-6">
          <h2 id="about-service" className="label text-bronze desk:col-span-3">
            About this service
          </h2>
          <div className="space-y-5 text-[16px] leading-[1.65] text-ink2 desk:col-span-7 desk:col-start-5">
            {paragraphs.map((text, position) => (
              <p key={position} className={position === 0 ? 'font-display text-[clamp(24px,2.4vw,32px)] leading-[1.25] text-ink' : ''}>
                {text}
              </p>
            ))}
          </div>
        </div>

        <div className="mt-[clamp(64px,8vw,120px)]">
          <h2 className="label text-bronze">How an engagement runs</h2>
          <ol className="mt-6 grid border-t border-ink phone:grid-cols-2 desk:grid-cols-4">
            {ENGAGEMENT.map((step, position) => (
              <li key={step.title} className={`border-line py-7 pr-6 ${position ? 'border-t phone:border-t-0' : ''} ${position % 2 ? 'phone:border-l phone:pl-6' : ''} ${position === 2 ? 'phone:border-t desk:border-t-0 desk:border-l desk:pl-6' : ''} ${position === 3 ? 'phone:border-t desk:border-t-0' : ''}`}>
                <p className="font-display text-[32px] leading-none">{padIndex(position)}</p>
                <h3 className="mt-5 text-[14px] font-semibold">{step.title}</h3>
                <p className="mt-2 text-[13px] leading-[1.55] text-ink2">{step.body}</p>
              </li>
            ))}
          </ol>
        </div>

        <div className="grid-editorial mt-[clamp(64px,8vw,120px)] gap-y-6">
          <h2 className="label text-bronze desk:col-span-3">Other services</h2>
          <ul className="border-t border-line desk:col-span-8 desk:col-start-5">
            {others.map((other) => (
              <li key={other.id} className="border-b border-line">
                <Link to={routes.service(other.slug)} className="flex min-h-14 items-center justify-between gap-4 font-display text-[22px] transition-[padding,color] duration-300 hover:pl-3 hover:text-bronze">
                  {other.name}
                  <ArrowUpRight aria-hidden="true" className="size-4" strokeWidth={1.5} />
                </Link>
              </li>
            ))}
          </ul>
        </div>
      </section>
      <ConsultationCta context={{ service: service.slug }} />
    </>
  )
}
