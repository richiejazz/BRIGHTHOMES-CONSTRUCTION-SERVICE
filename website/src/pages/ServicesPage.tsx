import { useEffect } from 'react'
import { useLocation } from 'react-router-dom'

import { useServices } from '../api/content'
import { ConsultationCta } from '../components/sections/CompanySections'
import { ServiceIcon } from '../components/services/ServiceIndex'
import { ButtonLink } from '../components/ui/Button'
import { Container, PageHeader } from '../components/ui/Layout'
import { Reveal } from '../components/ui/Reveal'
import { EmptyState, ErrorState, LoadingAnnouncement, Skeleton } from '../components/ui/States'
import { padIndex } from '../lib/format'

export default function ServicesPage() {
  const services = useServices()
  const { hash } = useLocation()

  // Scroll to a service anchor once the API content has rendered.
  useEffect(() => {
    if (!hash || !services.isSuccess) return
    document.getElementById(decodeURIComponent(hash.slice(1)))?.scrollIntoView({ block: 'start' })
  }, [hash, services.isSuccess])

  return (
    <>
      <title>Services — BRIGHTHOMES Construction Service</title>
      <PageHeader eyebrow="Services" title="From first drawing to final handover." intro="Eight disciplines covering design, approvals, supervision, management, renovation and real estate — delivered by one accountable team.">
        {services.isSuccess && services.data.length > 0 && (
          <nav aria-label="Services on this page" className="mt-14 border-t border-graphite pt-6">
            <ul className="flex flex-wrap gap-x-6 gap-y-1">
              {services.data.map((service, index) => (
                <li key={service.id}>
                  <a href={`#${service.slug}`} className="inline-flex min-h-11 items-center gap-2 text-sm text-stone-300 transition-colors hover:text-paper">
                    <span className="text-xs text-stone-500">{padIndex(index)}</span>
                    {service.name}
                  </a>
                </li>
              ))}
            </ul>
          </nav>
        )}
      </PageHeader>

      <section aria-label="Service details" className="py-20 sm:py-28">
        <Container>
          {services.isPending ? (
            <div className="space-y-6">
              <LoadingAnnouncement label="Loading services" />
              {[0, 1, 2].map((index) => (
                <div key={index} className="grid gap-6 border-t border-stone-300 py-12 lg:grid-cols-12">
                  <Skeleton className="h-10 w-2/3 lg:col-span-5" />
                  <div className="space-y-3 lg:col-span-7">
                    <Skeleton className="h-4 w-full" />
                    <Skeleton className="h-4 w-5/6" />
                  </div>
                </div>
              ))}
            </div>
          ) : services.isError ? (
            <ErrorState error={services.error} onRetry={() => void services.refetch()} />
          ) : services.data.length === 0 ? (
            <EmptyState title="Our services are being updated." action={<ButtonLink to="/contact" arrow>Contact us</ButtonLink>}>
              Please get in touch to discuss your project in the meantime.
            </EmptyState>
          ) : (
            <ol>
              {services.data.map((service, index) => (
                <Reveal as="li" key={service.id} className="border-t border-stone-300 last:border-b">
                  <article id={service.slug} aria-labelledby={`${service.slug}-title`} className="grid scroll-mt-28 gap-8 py-14 sm:py-20 lg:grid-cols-12 lg:gap-10">
                    <div className="flex items-start gap-6 lg:col-span-5">
                      <span className="pt-3 text-xs font-semibold tracking-[0.2em] text-stone-500">{padIndex(index)}</span>
                      <div>
                        <ServiceIcon slug={service.slug} className="size-9 text-bronze-dark" />
                        <h2 id={`${service.slug}-title`} className="mt-6 font-display text-[2.6rem] leading-[1.02] sm:text-6xl">
                          {service.name}
                        </h2>
                      </div>
                    </div>
                    <div className="lg:col-span-6 lg:col-start-7 lg:pt-16">
                      <p className="text-xl leading-relaxed text-ink">{service.short_description}</p>
                      {service.description && service.description !== service.short_description && <p className="mt-5 leading-relaxed text-stone-600">{service.description}</p>}
                      <div className="mt-8 flex flex-wrap gap-x-6 gap-y-3">
                        <ButtonLink to={`/contact?service=${service.slug}`} variant="secondary" arrow>
                          Enquire about {service.name.toLowerCase()}
                        </ButtonLink>
                        <ButtonLink to={`/contact?type=consultation&service=${service.slug}`} variant="text">
                          Request a consultation
                        </ButtonLink>
                      </div>
                    </div>
                  </article>
                </Reveal>
              ))}
            </ol>
          )}
        </Container>
      </section>
      <ConsultationCta />
    </>
  )
}
