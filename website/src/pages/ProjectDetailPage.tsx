import { ArrowLeft } from 'lucide-react'
import { Link, useParams } from 'react-router-dom'

import { useProject, useProjects, useServices } from '../api/content'
import { isNotFound } from '../api/errors'
import type { Project } from '../api/types'
import { ProjectCard } from '../components/projects/ProjectCard'
import { ProjectGallery } from '../components/projects/ProjectGallery'
import { SaveProjectButton } from '../components/projects/SaveProjectButton'
import { ServiceIcon } from '../components/services/ServiceIndex'
import { Badge, DemoBadge, ProjectStatusBadge } from '../components/ui/Badges'
import { ButtonLink } from '../components/ui/Button'
import { Container } from '../components/ui/Layout'
import { Reveal } from '../components/ui/Reveal'
import { ErrorState, LoadingAnnouncement, Skeleton } from '../components/ui/States'
import { formatMonthYear } from '../lib/format'
import NotFoundPage from './NotFoundPage'

function Facts({ project }: { project: Project }) {
  const facts = [
    { label: 'Category', value: project.category.name },
    { label: 'Status', value: project.status === 'completed' ? 'Completed' : 'Ongoing' },
    project.location && { label: 'Location', value: project.location },
    project.start_date && { label: 'Started', value: formatMonthYear(project.start_date) },
    project.end_date && { label: project.status === 'completed' ? 'Completed' : 'Expected completion', value: formatMonthYear(project.end_date) },
  ].filter((fact): fact is { label: string; value: string } => Boolean(fact))
  return (
    <dl className="grid grid-cols-2 border-t border-graphite sm:grid-cols-3 lg:grid-cols-5">
      {facts.map((fact) => (
        <div key={fact.label} className="border-b border-graphite py-5 pr-4">
          <dt className="eyebrow text-stone-500">{fact.label}</dt>
          <dd className="mt-2 text-paper">{fact.value}</dd>
        </div>
      ))}
    </dl>
  )
}

function RelatedProjects({ project }: { project: Project }) {
  const related = useProjects({ category: project.category.id })
  const items = related.data?.results.filter((item) => item.id !== project.id).slice(0, 3) ?? []
  if (!related.isSuccess || items.length === 0) return null
  return (
    <section aria-labelledby="related-title" className="border-t border-stone-300 py-24 sm:py-28">
      <Container>
        <div className="mb-14 flex flex-wrap items-end justify-between gap-6">
          <h2 id="related-title" className="font-display text-5xl leading-none sm:text-6xl">
            More {project.category.name.toLowerCase()} work
          </h2>
          <ButtonLink to={`/projects?category=${project.category.slug}`} variant="text" arrow>
            View all
          </ButtonLink>
        </div>
        <ul className="grid gap-x-8 gap-y-14 md:grid-cols-3">
          {items.map((item, index) => (
            <Reveal as="li" key={item.id} delay={index * 100}>
              <ProjectCard project={item} aspect="aspect-[4/3]" />
            </Reveal>
          ))}
        </ul>
      </Container>
    </section>
  )
}

function DetailSkeleton() {
  return (
    <>
      <LoadingAnnouncement label="Loading project" />
      <div className="bg-ink pb-16 pt-36 sm:pt-44">
        <Container>
          <Skeleton className="h-3 w-32 bg-graphite" />
          <Skeleton className="mt-8 h-16 w-3/4 bg-graphite" />
          <Skeleton className="mt-6 h-5 w-1/2 bg-graphite" />
        </Container>
      </div>
      <Container className="py-16">
        <Skeleton className="aspect-[16/10] w-full" />
      </Container>
    </>
  )
}

export default function ProjectDetailPage() {
  const { slug = '' } = useParams()
  const query = useProject(slug)
  const services = useServices()

  if (query.isPending) return <DetailSkeleton />
  if (query.isError) {
    if (isNotFound(query.error)) return <NotFoundPage title="This project isn’t available." message="It may have been unpublished or the link may be incorrect." />
    return (
      <div className="bg-ink pb-24 pt-40">
        <Container>
          <ErrorState tone="dark" error={query.error} onRetry={() => void query.refetch()} />
        </Container>
      </div>
    )
  }

  const project = query.data
  const projectServices = services.data?.filter((service) => project.services.includes(service.id)) ?? []
  const enquiryParams = new URLSearchParams({ project: project.slug })

  return (
    <article>
      <title>{`${project.title} — BRIGHTHOMES Projects`}</title>
      <header className="blueprint-grid bg-ink pb-14 pt-32 text-paper sm:pt-40">
        <Container>
          <Link to="/projects" className="inline-flex min-h-11 items-center gap-2 text-sm text-stone-400 transition-colors hover:text-paper">
            <ArrowLeft aria-hidden="true" className="size-4" /> All projects
          </Link>
          <div className="mt-8 flex flex-wrap items-center gap-3">
            {project.is_demo && <DemoBadge />}
            {!project.is_published && <Badge tone="outline-dark">Unpublished</Badge>}
            <ProjectStatusBadge status={project.status} onDark />
            <span className="eyebrow text-bronze-light">{project.category.name}</span>
          </div>
          <h1 className="mt-6 max-w-5xl animate-rise font-display text-[3rem] leading-[0.98] tracking-[-0.015em] sm:text-7xl lg:text-[5.5rem]">{project.title}</h1>
          <p className="mt-6 max-w-2xl animate-rise text-lg leading-relaxed text-stone-300 [animation-delay:120ms]">{project.summary}</p>
          <div className="mt-14">
            <Facts project={project} />
          </div>
        </Container>
      </header>

      {project.is_demo && (
        <div className="border-b border-bronze/40 bg-bronze-light/20">
          <Container className="py-4 text-sm text-ink">
            <strong className="font-semibold">Demonstration record.</strong> This entry is placeholder content used while the BRIGHTHOMES portfolio is prepared. It is not a real BRIGHTHOMES project.
          </Container>
        </div>
      )}

      <section aria-label="Project images" className="pt-12 sm:pt-16">
        <Container>
          <ProjectGallery images={project.images} seed={project.id} title={project.title} />
        </Container>
      </section>

      <section aria-labelledby="overview-title" className="py-20 sm:py-28">
        <Container className="grid gap-14 lg:grid-cols-12 lg:gap-10">
          <div className="lg:col-span-7">
            <h2 id="overview-title" className="eyebrow flex items-center gap-3 text-bronze-dark">
              <span aria-hidden="true" className="h-px w-8 bg-current" />
              Project overview
            </h2>
            <div className="mt-8 space-y-5 text-lg leading-relaxed text-graphite">
              {project.description
                .split(/\n{2,}/)
                .filter(Boolean)
                .map((paragraph, index) => (
                  <p key={index} className="whitespace-pre-line">
                    {paragraph}
                  </p>
                ))}
            </div>
          </div>
          <aside className="space-y-12 lg:col-span-4 lg:col-start-9" aria-label="Project actions">
            {projectServices.length > 0 && (
              <div>
                <h2 className="eyebrow text-stone-500">Services on this project</h2>
                <ul className="mt-4 border-t border-stone-300">
                  {projectServices.map((service) => (
                    <li key={service.id}>
                      <Link to={`/services#${service.slug}`} className="flex min-h-14 items-center gap-4 border-b border-stone-300 py-3 transition-colors hover:text-bronze-dark">
                        <ServiceIcon slug={service.slug} className="size-5 text-bronze-dark" />
                        <span className="font-medium">{service.name}</span>
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            )}
            <div className="border-l-2 border-bronze pl-6">
              <p className="font-display text-3xl leading-tight">Planning something similar?</p>
              <p className="mt-3 leading-relaxed text-stone-600">Tell us about your project or request a consultation with the BRIGHTHOMES team.</p>
              <div className="mt-6 flex flex-col gap-3">
                <ButtonLink to={`/contact?${enquiryParams}`} arrow>
                  Enquire about this project
                </ButtonLink>
                <ButtonLink to={`/contact?type=consultation&${enquiryParams}`} variant="secondary">
                  Request a consultation
                </ButtonLink>
                <SaveProjectButton project={project} />
              </div>
            </div>
          </aside>
        </Container>
      </section>

      <RelatedProjects project={project} />
    </article>
  )
}
