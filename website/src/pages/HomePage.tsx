import { ArrowRight, ArrowUpRight } from 'lucide-react'
import { useState } from 'react'
import { Link } from 'react-router-dom'

import { useProjects, useProperties, useServices } from '../api/content'
import type { Project, Property, Service } from '../api/types'
import { ProjectItem, ProjectItemSkeleton } from '../components/content/ProjectItem'
import { PropertyItem, PropertyItemSkeleton } from '../components/content/PropertyItem'
import { Media } from '../components/media/Media'
import { ButtonLink } from '../components/ui/Button'
import { ConsultationCta } from '../components/sections/ConsultationCta'
import { FiguresBand } from '../components/sections/FiguresBand'
import { Em, SectionHeading } from '../components/ui/Layout'
import { Reveal } from '../components/ui/Reveal'
import { Skeleton } from '../components/ui/States'
import { trustPillars } from '../content/company'
import { editorial, serviceImage } from '../content/media'
import { numberWord, padIndex } from '../lib/format'
import { listingTypeLabels } from '../lib/labels'
import { routes } from '../lib/routes'

function Hero() {
  const image = editorial.hero
  return (
    <section aria-labelledby="hero-title" className="relative isolate flex min-h-[100svh] flex-col justify-end overflow-hidden bg-band text-photo-ink">
      <img src={image.src} alt={image.alt} className="absolute inset-0 -z-20 size-full object-cover" fetchPriority="high" />
      <div aria-hidden="true" className="scrim-hero absolute inset-0 -z-10" />
      <div className="container-page grid-editorial items-end pt-32 pb-[clamp(40px,6vw,72px)]">
        <div className="desk:col-span-8">
          <p className="label flex items-center gap-4 text-photo-ink">
            <span aria-hidden="true" className="h-px w-10 bg-current" />
            BRIGHTHOMES Construction Service
          </p>
          <h1 id="hero-title" className="mt-7 animate-rise font-display text-hero font-medium">
            Building Dreams,
            <br />
            <em className="font-normal text-photo-accent">Constructing Reality.</em>
          </h1>
          <p className="mt-7 max-w-[440px] text-[15px] leading-[1.6] text-photo-ink/90">Architecture, construction and real estate — one team, from the first drawing to the day you take the keys.</p>
          <div className="mt-9 flex flex-col gap-3 phone:flex-row">
            <ButtonLink to={routes.consultation()} variant="on-photo" arrow>
              Request a consultation
            </ButtonLink>
            <ButtonLink to={routes.construction} variant="on-photo-outline">
              Explore our work
            </ButtonLink>
          </div>
        </div>
        <nav aria-label="Explore" className="hidden desk:col-span-3 desk:col-start-10 desk:block">
          <ul className="border-t border-photo-ink/30">
            {[
              { to: routes.construction, label: 'Construction' },
              { to: routes.realEstate, label: 'Real Estate' },
            ].map((item) => (
              <li key={item.to} className="border-b border-photo-ink/30">
                <Link to={item.to} className="group flex min-h-14 items-center justify-between font-display text-[22px] transition-colors hover:text-photo-accent">
                  {item.label}
                  <ArrowUpRight aria-hidden="true" className="size-4 transition-transform duration-300 group-hover:translate-x-0.5 group-hover:-translate-y-0.5" strokeWidth={1.5} />
                </Link>
              </li>
            ))}
          </ul>
        </nav>
      </div>
      {image.illustrative && <span className="label absolute right-[var(--gutter)] bottom-3 text-[10px] text-photo-ink/75">Illustrative image</span>}
    </section>
  )
}

function Statement() {
  return (
    <section className="container-page py-section">
      <Reveal className="grid-editorial">
        <p className="label text-mute desk:col-span-3">
          <span className="text-bronze">(00)</span> — The practice
        </p>
        <p className="font-display text-statement font-medium desk:col-span-9">
          We design, approve, build and sell — so the people who trust us with a plot of land, a set of drawings or a property search deal with <Em accent>one accountable team</Em> from the first drawing to handover.
        </p>
      </Reveal>
    </section>
  )
}

function ServiceIndexList({ services, compact = false }: { services: Service[]; compact?: boolean }) {
  return (
    <ul className="border-t border-line">
      {services.map((service) => (
        <li key={service.id} className="border-b border-line">
          <Link to={routes.service(service.slug)} className={`group flex items-center justify-between gap-4 transition-[color,padding] duration-300 hover:pl-3 hover:text-bronze ${compact ? 'min-h-12 text-[14px]' : 'min-h-14'}`}>
            {service.name}
            <ArrowUpRight aria-hidden="true" className="size-4 shrink-0" strokeWidth={1.5} />
          </Link>
        </li>
      ))}
    </ul>
  )
}

function ConstructionEntry({ services }: { services: Service[] | undefined }) {
  const construction = services?.filter((service) => service.slug !== 'real-estate')
  return (
    <section className="container-page pb-section">
      <div className="grid-editorial items-center gap-y-12">
        <Reveal className="desk:col-span-7">
          <Media src={editorial.construction.src} alt={editorial.construction.alt} aspect="aspect-[4/3] desk:aspect-[7/6]" illustrative sizes="(min-width: 980px) 58vw, 100vw" />
        </Reveal>
        <Reveal className="desk:col-span-4 desk:col-start-9" delay={120}>
          <p className="label text-mute">
            <span className="text-bronze">(01)</span> Construction
          </p>
          <h2 className="mt-5 font-display text-section font-medium">
            From plan <Em>to structure.</Em>
          </h2>
          <p className="mt-6 text-[15px] leading-[1.6] text-ink2">Architectural and structural drawings, survey plans, building approval, site supervision and construction management — and renovation of existing buildings.</p>
          <div className="mt-8">{construction ? <ServiceIndexList services={construction} compact /> : <Skeleton className="h-64" />}</div>
          <Link to={routes.construction} className="text-link mt-6">
            View construction work <ArrowRight aria-hidden="true" className="arrow size-4" strokeWidth={1.5} />
          </Link>
        </Reveal>
      </div>
    </section>
  )
}

function RealEstateEntry() {
  return (
    <section className="container-page pb-section">
      <div className="grid-editorial items-start gap-y-12">
        <Reveal className="desk:col-span-4 desk:pt-16">
          <p className="label text-mute">
            <span className="text-bronze">(02)</span> Real Estate
          </p>
          <h2 className="mt-5 font-display text-section font-medium">
            Property, <Em>considered.</Em>
          </h2>
          <p className="mt-6 text-[15px] leading-[1.6] text-ink2">Houses, apartments, land and commercial space for sale, rent and lease — presented with the same care we bring to building them, for clients at home and in the diaspora.</p>
          <ul className="mt-7 flex flex-wrap gap-2" aria-label="Listing types">
            {Object.values(listingTypeLabels).map((label) => (
              <li key={label} className="border border-control-line px-2.5 py-1 text-[10px] font-semibold tracking-[0.18em] uppercase">
                {label}
              </li>
            ))}
          </ul>
          <Link to={routes.realEstate} className="text-link mt-7">
            Browse properties <ArrowRight aria-hidden="true" className="arrow size-4" strokeWidth={1.5} />
          </Link>
        </Reveal>
        <div className="grid grid-cols-12 gap-6 desk:col-span-7 desk:col-start-6">
          <Reveal className="col-span-12">
            <Media src={editorial.realEstate.src} alt={editorial.realEstate.alt} aspect="aspect-[16/10]" illustrative labelPosition="top-left" sizes="(min-width: 980px) 55vw, 100vw" />
          </Reveal>
          <Reveal className="col-span-8 col-start-5 -mt-[12%] phone:col-span-6 phone:col-start-7" delay={150}>
            <Media src={editorial.facade.src} alt={editorial.facade.alt} aspect="aspect-[4/5]" className="outline-[12px] outline-bg" sizes="(min-width: 980px) 28vw, 60vw" />
          </Reveal>
        </div>
      </div>
    </section>
  )
}

function ServicesIndex({ services }: { services: Service[] | undefined }) {
  const [active, setActive] = useState(0)
  const current = services?.[active]
  const image = current ? serviceImage(current.slug) : editorial.drafting
  return (
    <section className="bg-paper py-section" aria-labelledby="services-title">
      <div className="container-page">
        <SectionHeading
          number="03"
          label="Services"
          id="services-title"
          title={
            <>
              {services ? `${numberWord(services.length)} services.` : 'Our services.'}
              <br />
              <Em>One accountable team.</Em>
            </>
          }
          action={
            <Link to={routes.services} className="text-link">
              All services <ArrowRight aria-hidden="true" className="arrow size-4" strokeWidth={1.5} />
            </Link>
          }
        />
        <div className="grid-editorial mt-[clamp(40px,5vw,72px)]">
          <div className="hidden desk:col-span-5 desk:block">
            <div className="sticky top-28">
              <Media key={image.src} src={image.src} alt={image.alt} aspect="aspect-[4/5]" className="animate-fade" illustrative />
              {current && (
                <p className="mt-3 flex justify-between text-[12px] text-mute">
                  <span>{padIndex(active)} / {padIndex((services?.length ?? 1) - 1)}</span>
                  <span>{current.name}</span>
                </p>
              )}
            </div>
          </div>
          <ol className="border-t border-line desk:col-span-7 desk:col-start-6">
            {services
              ? services.map((service, index) => (
                  <li key={service.id} className="border-b border-line">
                    <Link
                      to={routes.service(service.slug)}
                      onMouseEnter={() => setActive(index)}
                      onFocus={() => setActive(index)}
                      className="group grid grid-cols-[2.5rem_1fr_auto] items-baseline gap-x-4 py-6 transition-[padding] duration-300 hover:pl-3 focus-visible:pl-3"
                    >
                      <span className="text-[12px] font-semibold text-bronze tabular-nums">{padIndex(index)}</span>
                      <span>
                        <span className={`block font-display text-[clamp(24px,2.4vw,32px)] leading-[1.1] font-medium transition-colors ${index === active ? 'desk:italic' : ''} group-hover:text-bronze`}>{service.name}</span>
                        <span className="mt-1 block text-[13px] leading-[1.55] text-ink2">{service.short_description}</span>
                      </span>
                      <ArrowUpRight aria-hidden="true" className="size-4 self-center" strokeWidth={1.5} />
                    </Link>
                  </li>
                ))
              : Array.from({ length: 6 }, (_, index) => <Skeleton key={index} className="my-4 h-16" />)}
          </ol>
        </div>
      </div>
    </section>
  )
}

function FeaturedProperties({ properties, loading }: { properties: Property[]; loading: boolean }) {
  if (!loading && properties.length === 0) return null
  const [lead, ...rest] = properties
  return (
    <section className="container-page py-section" aria-labelledby="featured-title">
      <SectionHeading
        number="04"
        label="Featured properties"
        id="featured-title"
        title={
          <>
            Selected <Em>listings.</Em>
          </>
        }
        action={
          <Link to={routes.realEstate} className="text-link">
            View all properties <ArrowRight aria-hidden="true" className="arrow size-4" strokeWidth={1.5} />
          </Link>
        }
      />
      <div className="grid-editorial mt-[clamp(40px,5vw,72px)] gap-y-14">
        <div className="desk:col-span-7">{lead ? <PropertyItem property={lead} titleSize="text-[clamp(28px,2.8vw,40px)]" sizes="(min-width: 980px) 56vw, 100vw" /> : <PropertyItemSkeleton />}</div>
        <div className="grid gap-y-14 phone:grid-cols-2 phone:gap-x-6 desk:col-span-5 desk:grid-cols-1">
          {loading && !lead
            ? [0, 1].map((index) => <PropertyItemSkeleton key={index} />)
            : rest.slice(0, 2).map((property) => <PropertyItem key={property.id} property={property} aspect="aspect-[16/10]" titleSize="text-[24px]" sizes="(min-width: 980px) 38vw, 50vw" />)}
        </div>
      </div>
    </section>
  )
}

function SelectedProjects({ projects, loading }: { projects: Project[]; loading: boolean }) {
  if (!loading && projects.length === 0) return null
  // Asymmetric 7 / 4 / 8-column crops (W-01 (05)).
  const layout = [
    { cell: 'desk:col-span-7', aspect: 'aspect-[4/3]' },
    { cell: 'desk:col-span-4 desk:col-start-9 desk:mt-40', aspect: 'aspect-[4/5]' },
    { cell: 'desk:col-span-8 desk:col-start-3', aspect: 'aspect-[16/9]' },
  ]
  return (
    <section className="bg-stone py-section" aria-labelledby="projects-title">
      <div className="container-page">
        <SectionHeading
          onStone
          number="05"
          label="Selected projects"
          id="projects-title"
          title={
            <>
              Work, <Em>in detail.</Em>
            </>
          }
          action={
            <Link to={routes.construction} className="text-link">
              All case studies <ArrowRight aria-hidden="true" className="arrow size-4" strokeWidth={1.5} />
            </Link>
          }
        />
        <div className="grid-editorial mt-[clamp(40px,5vw,72px)] gap-y-16">
          {loading && projects.length === 0
            ? layout.map((item, index) => (
                <div key={index} className={item.cell}>
                  <ProjectItemSkeleton aspect={item.aspect} />
                </div>
              ))
            : projects.slice(0, 3).map((project, index) => (
                <Reveal key={project.id} className={layout[index].cell}>
                  <ProjectItem project={project} index={index} aspect={layout[index].aspect} sizes="(min-width: 980px) 60vw, 100vw" />
                </Reveal>
              ))}
        </div>
      </div>
    </section>
  )
}

function WhyUs() {
  const numerals = ['I.', 'II.', 'III.']
  return (
    <section className="container-page py-section" aria-labelledby="why-title">
      <div className="grid-editorial gap-y-12">
        <div className="desk:col-span-4">
          <p className="label text-mute">
            <span className="text-bronze">(07)</span> Why BRIGHTHOMES
          </p>
          <h2 id="why-title" className="mt-5 font-display text-section font-medium">
            Why clients <Em>trust us.</Em>
          </h2>
        </div>
        <ol className="grid gap-10 phone:grid-cols-3 desk:col-span-8">
          {trustPillars.map((pillar, index) => (
            <li key={pillar.title} className="border-t border-ink pt-6">
              <p className="font-display text-[28px] text-bronze">{numerals[index]}</p>
              <h3 className="mt-4 text-[15px] font-semibold">{pillar.title}</h3>
              <p className="mt-3 text-[14px] leading-[1.6] text-ink2">{pillar.body}</p>
            </li>
          ))}
        </ol>
      </div>
    </section>
  )
}

export default function HomePage() {
  const services = useServices()
  const featuredProperties = useProperties({ is_featured: true })
  const latestProperties = useProperties({}, { enabled: featuredProperties.isSuccess && featuredProperties.data.count === 0 })
  const featuredProjects = useProjects({ is_featured: true })
  const latestProjects = useProjects({}, { enabled: featuredProjects.isSuccess && featuredProjects.data.count < 3 })

  const properties = featuredProperties.data?.count ? featuredProperties.data.results : (latestProperties.data?.results ?? [])
  // Featured projects lead; the latest fill any remaining places.
  const projectPool = [...(featuredProjects.data?.results ?? []), ...(latestProjects.data?.results ?? [])]
  const projects = projectPool.filter((project, index) => projectPool.findIndex((other) => other.id === project.id) === index)

  return (
    <>
      <title>BRIGHTHOMES Construction Service — Building Dreams, Constructing Reality.</title>
      <Hero />
      <Statement />
      <ConstructionEntry services={services.data} />
      <RealEstateEntry />
      <ServicesIndex services={services.data} />
      <FeaturedProperties properties={properties} loading={featuredProperties.isPending || latestProperties.isFetching} />
      <SelectedProjects projects={projects} loading={featuredProjects.isPending || latestProjects.isFetching} />
      <FiguresBand number="06" />
      <WhyUs />
      <ConsultationCta number="08" />
    </>
  )
}
