import { ArrowDown } from 'lucide-react'

import { useProjects, useServices } from '../api/content'
import { AchievementStats } from '../components/achievements/AchievementStats'
import { HeroElevation } from '../components/art/Elevations'
import { ProjectCard, ProjectCardSkeleton } from '../components/projects/ProjectCard'
import { ServiceIndex, ServiceIndexSkeleton } from '../components/services/ServiceIndex'
import { ButtonLink } from '../components/ui/Button'
import { Container, SectionHeading } from '../components/ui/Layout'
import { Reveal } from '../components/ui/Reveal'
import { EmptyState, ErrorState, LoadingAnnouncement } from '../components/ui/States'
import { ConsultationCta, ObjectivesSection, TrustSection } from '../components/sections/CompanySections'
import { company } from '../content/company'

function Hero() {
  return (
    <section aria-labelledby="hero-title" className="relative isolate flex min-h-[100svh] flex-col overflow-hidden bg-ink text-paper">
      <div className="blueprint-grid absolute inset-0 -z-20" aria-hidden="true" />
      <HeroElevation className="absolute inset-0 -z-10 size-full animate-fade opacity-45 [animation-delay:300ms] [animation-duration:1.6s] md:opacity-70 lg:opacity-100" />
      <div aria-hidden="true" className="absolute inset-0 -z-10 bg-gradient-to-r from-ink via-ink/85 to-ink/10 lg:via-ink/70 lg:to-transparent" />
      <Container className="flex flex-1 flex-col justify-end pb-14 pt-36 sm:pb-20 lg:justify-center lg:pb-24">
        <div className="max-w-3xl">
          <p className="eyebrow flex animate-rise items-center gap-3 text-bronze-light">
            <span aria-hidden="true" className="h-px w-10 bg-current" />
            Construction · Real Estate · Lagos
          </p>
          <h1 id="hero-title" className="mt-8 animate-rise font-display text-[3.4rem] leading-[0.95] tracking-[-0.02em] [animation-delay:120ms] sm:text-[5.5rem] lg:text-[7.25rem]">
            Building Dreams,
            <span className="block italic text-bronze-light">Constructing Reality.</span>
          </h1>
          <p className="mt-8 max-w-xl animate-rise text-lg leading-relaxed text-stone-300 [animation-delay:240ms]">
            Premium residential and commercial construction in Nigeria — combining engineering excellence, modern design and rigorous project management.
          </p>
          <div className="mt-10 flex animate-rise flex-col gap-3 [animation-delay:360ms] sm:flex-row sm:gap-4">
            <ButtonLink to="/projects" variant="accent" size="lg" arrow>
              Explore Projects
            </ButtonLink>
            <ButtonLink to="/contact" variant="inverse" size="lg">
              Start a Conversation
            </ButtonLink>
          </div>
        </div>
      </Container>
      <Container className="pb-6">
        <div className="flex items-center justify-between border-t border-graphite pt-5 text-[0.68rem] uppercase tracking-[0.2em] text-stone-500">
          <span>Illustrative elevation</span>
          <a href="#introduction" className="inline-flex min-h-11 items-center gap-2 transition-colors hover:text-paper">
            Discover <ArrowDown aria-hidden="true" className="size-3.5" />
          </a>
        </div>
      </Container>
    </section>
  )
}

function Introduction() {
  return (
    <section id="introduction" aria-labelledby="intro-title" className="scroll-mt-20 py-24 sm:py-32">
      <Container className="grid gap-10 lg:grid-cols-12">
        <Reveal className="lg:col-span-3">
          <p id="intro-title" className="eyebrow flex items-center gap-3 text-bronze-dark">
            <span aria-hidden="true" className="h-px w-8 bg-current" />
            Who we are
          </p>
        </Reveal>
        <Reveal className="lg:col-span-9" delay={100}>
          <p className="font-display text-[2rem] leading-[1.15] text-ink sm:text-5xl sm:leading-[1.1]">
            A trusted partner for premium residential and commercial construction — <em className="text-bronze-dark">engineering excellence</em>, modern design and rigorous project management, from first drawing to finished building.
          </p>
          <div className="mt-12 grid gap-8 border-t border-stone-300 pt-8 sm:grid-cols-2">
            <p className="max-w-md leading-relaxed text-stone-600">{company.description}</p>
            <div className="sm:justify-self-end">
              <ButtonLink to="/about" variant="secondary" arrow>
                About BRIGHTHOMES
              </ButtonLink>
            </div>
          </div>
        </Reveal>
      </Container>
    </section>
  )
}

function Achievements() {
  return (
    <section aria-labelledby="record-title" className="blueprint-grid bg-ink py-24 text-paper sm:py-32">
      <Container>
        <div className="mb-16 flex flex-col justify-between gap-8 lg:flex-row lg:items-end">
          <SectionHeading id="record-title" tone="dark" eyebrow="Track record" title={<>Delivered, completed,<br className="hidden sm:block" /> fully compliant.</>} />
          <ButtonLink to="/achievements" variant="inverse" arrow className="self-start lg:self-auto">
            Our achievements
          </ButtonLink>
        </div>
        <AchievementStats />
      </Container>
    </section>
  )
}

function Services() {
  const services = useServices()
  return (
    <section aria-labelledby="services-title" className="bg-bone py-24 sm:py-32">
      <Container>
        <div className="mb-16 flex flex-col justify-between gap-8 lg:flex-row lg:items-end">
          <SectionHeading id="services-title" eyebrow="What we do" title="Every stage of the build, under one roof." intro="From drawings and approvals to supervision, management and real estate — eight disciplines, one accountable team." />
          <ButtonLink to="/services" variant="secondary" arrow className="self-start lg:self-auto">
            Explore services
          </ButtonLink>
        </div>
        {services.isPending ? (
          <>
            <LoadingAnnouncement label="Loading services" />
            <ServiceIndexSkeleton />
          </>
        ) : services.isError ? (
          <ErrorState error={services.error} onRetry={() => void services.refetch()} />
        ) : services.data.length === 0 ? (
          <EmptyState title="Our services are being updated.">Please contact us to discuss your project in the meantime.</EmptyState>
        ) : (
          <ServiceIndex services={services.data} />
        )}
      </Container>
    </section>
  )
}

function FeaturedProjects() {
  const projects = useProjects({ page: 1 })
  const featured = projects.data?.results.slice(0, 3) ?? []
  const hasDemo = featured.some((project) => project.is_demo)
  return (
    <section aria-labelledby="projects-title" className="py-24 sm:py-32">
      <Container>
        <div className="mb-16 flex flex-col justify-between gap-8 lg:flex-row lg:items-end">
          <SectionHeading id="projects-title" eyebrow="Projects" title="Selected work." intro="Residential and commercial projects, completed and ongoing." />
          <ButtonLink to="/projects" variant="secondary" arrow className="self-start lg:self-auto">
            View all projects
          </ButtonLink>
        </div>
        {projects.isPending ? (
          <div className="grid gap-10 lg:grid-cols-12">
            <LoadingAnnouncement label="Loading projects" />
            <div className="lg:col-span-7">
              <ProjectCardSkeleton aspect="aspect-[4/3]" />
            </div>
            <div className="grid gap-10 sm:grid-cols-2 lg:col-span-5 lg:grid-cols-1">
              <ProjectCardSkeleton aspect="aspect-[16/10]" />
              <ProjectCardSkeleton aspect="aspect-[16/10]" />
            </div>
          </div>
        ) : projects.isError ? (
          <ErrorState error={projects.error} onRetry={() => void projects.refetch()} />
        ) : featured.length === 0 ? (
          <EmptyState title="Our portfolio is being prepared." action={<ButtonLink to="/contact" arrow>Discuss your project</ButtonLink>}>
            Project case studies will be published here soon.
          </EmptyState>
        ) : (
          <>
            <div className="grid gap-x-10 gap-y-14 lg:grid-cols-12">
              <Reveal className="lg:col-span-7">
                <ProjectCard project={featured[0]} aspect="aspect-[4/3]" titleSize="lg" sizes="(min-width: 1024px) 58vw, 100vw" />
              </Reveal>
              {featured.length > 1 && (
                <div className="grid gap-x-8 gap-y-14 sm:grid-cols-2 lg:col-span-5 lg:grid-cols-1">
                  {featured.slice(1).map((project, index) => (
                    <Reveal key={project.id} delay={(index + 1) * 120}>
                      <ProjectCard project={project} aspect="aspect-[16/10]" sizes="(min-width: 1024px) 40vw, (min-width: 640px) 50vw, 100vw" />
                    </Reveal>
                  ))}
                </div>
              )}
            </div>
            {hasDemo && <p className="mt-12 border-l-2 border-bronze pl-4 text-sm text-stone-600">Projects marked “Demo content” are placeholders used while the portfolio is prepared. They are not BRIGHTHOMES projects.</p>}
          </>
        )}
      </Container>
    </section>
  )
}

export default function HomePage() {
  return (
    <>
      <title>BRIGHTHOMES Construction Service — Building Dreams, Constructing Reality.</title>
      <Hero />
      <Introduction />
      <Achievements />
      <TrustSection />
      <Services />
      <FeaturedProjects />
      <ObjectivesSection />
      <ConsultationCta />
    </>
  )
}
