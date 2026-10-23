import { ArrowLeft, ArrowRight, ArrowUpRight } from 'lucide-react'
import { useState } from 'react'
import { Link, useParams } from 'react-router-dom'

import { useProject, useProjects, useServices } from '../api/content'
import { isNotFound } from '../api/errors'
import type { Project } from '../api/types'
import { SaveTextButton } from '../components/content/SaveButton'
import { EnquiryForm } from '../components/forms/RequestForms'
import { Media } from '../components/media/Media'
import { Viewer, type GalleryImage } from '../components/media/Viewer'
import { ProjectStatusLabel } from '../components/ui/Badges'
import { BAR_OFFSET, Em } from '../components/ui/Layout'
import { Reveal } from '../components/ui/Reveal'
import { ErrorState, LoadingAnnouncement, Skeleton } from '../components/ui/States'
import { padIndex } from '../lib/format'
import { coverImage } from '../lib/projects'
import { routes } from '../lib/routes'
import NotFoundPage from './NotFoundPage'

function Facts({ project }: { project: Project }) {
  const facts = [
    { label: 'Category', value: project.category.name },
    { label: 'Status', value: <ProjectStatusLabel status={project.status} className="text-[14px] text-ink" /> },
    { label: 'Building type', value: project.building_type || 'To be confirmed' },
    { label: 'Location', value: project.location || 'Location to be confirmed' },
  ]
  return (
    <dl className="grid grid-cols-2 border-y border-line desk:grid-cols-4">
      {facts.map((fact, index) => (
        <div key={fact.label} className={`border-line py-5 pr-4 ${index % 2 ? 'border-l pl-4 desk:pl-6' : ''} ${index >= 2 ? 'border-t desk:border-t-0' : ''} ${index === 2 ? 'desk:border-l desk:pl-6' : ''}`}>
          <dt className="label text-[10px] text-mute">{fact.label}</dt>
          <dd className="mt-2 text-[14px] text-ink">{fact.value}</dd>
        </div>
      ))}
    </dl>
  )
}

/** 7/5 then 5/7 alternating crops; any image opens the full-screen viewer (W-06 gallery, §16). */
function Gallery({ images, title, illustrative, onOpen }: { images: GalleryImage[]; title: string; illustrative: boolean; onOpen: (index: number) => void }) {
  const rows: GalleryImage[][] = []
  for (let index = 0; index < images.length; index += 2) rows.push(images.slice(index, index + 2))
  return (
    <section className="container-page py-section" aria-labelledby="gallery-title">
      <div className="flex flex-wrap items-baseline justify-between gap-4">
        <h2 id="gallery-title" className="label text-bronze">
          Gallery
        </h2>
        <p className="text-[12px] text-ink2">Select an image to view full screen</p>
      </div>
      <div className="mt-8 space-y-6">
        {rows.map((row, rowIndex) => (
          <div key={rowIndex} className="grid gap-6 phone:grid-cols-12">
            {row.map((image, position) => {
              const index = rowIndex * 2 + position
              const wide = (rowIndex % 2 === 0) === (position === 0)
              const span = row.length === 1 ? 'phone:col-span-12' : wide ? 'phone:col-span-7' : 'phone:col-span-5'
              return (
                <button key={image.id} type="button" onClick={() => onOpen(index)} className={`group block text-left ${span}`} aria-label={`Open photo ${index + 1} of ${images.length}: ${image.alt || title}`}>
                  {/* The wide tile's ratio sets the row height; only the narrow tile stretches to match it (an
                      aspect ratio plus full height would derive a width wider than the tile). */}
                  <Media src={image.src} alt={image.alt} aspect={wide || row.length === 1 ? 'aspect-[4/3]' : 'aspect-[4/5] phone:aspect-auto phone:h-full'} zoom illustrative={illustrative} />
                  {image.caption && <span className="mt-2 block text-[12px] text-ink2">{image.caption}</span>}
                </button>
              )
            })}
          </div>
        ))}
      </div>
    </section>
  )
}

function DetailSkeleton() {
  return (
    <div className={`container-page ${BAR_OFFSET} pb-section`} aria-busy="true">
      <LoadingAnnouncement label="Loading project" />
      <Skeleton className="h-3 w-40" />
      <Skeleton className="mt-8 h-20 w-3/4" />
      <Skeleton className="mt-10 h-16 w-full" />
      <Skeleton className="mt-10 aspect-[21/9] w-full" />
    </div>
  )
}

export default function ProjectDetailPage() {
  const { slug = '' } = useParams()
  const query = useProject(slug)
  const services = useServices()
  const list = useProjects({})
  const [viewer, setViewer] = useState<number | null>(null)

  if (query.isPending) return <DetailSkeleton />
  if (query.isError) {
    if (isNotFound(query.error)) return <NotFoundPage title="This project isn’t available." message="It may have been moved or unpublished. Browse our other construction work instead." />
    return (
      <div className={`container-page ${BAR_OFFSET} pb-section`}>
        <ErrorState title="We couldn’t load this project." error={query.error} onRetry={() => void query.refetch()} />
      </div>
    )
  }

  const project = query.data
  const cover = coverImage(project.images)
  const images: GalleryImage[] = project.images.map((image) => ({ id: image.id, src: image.image, alt: image.alt_text, caption: image.caption }))
  const delivered = services.data?.filter((service) => project.services.includes(service.id)) ?? []
  const paragraphs = project.description.split(/\n\s*\n/).filter(Boolean)
  const half = Math.ceil(paragraphs.length / 2)
  const others = list.data?.results ?? []
  const position = others.findIndex((item) => item.id === project.id)
  const next = others.length > 1 ? others[(position + 1) % others.length] : null

  return (
    <>
      <title>{`${project.title} — BRIGHTHOMES Construction Service`}</title>
      <header className={`container-page ${BAR_OFFSET}`}>
        <Link to={routes.construction} className="text-link no-underline">
          <ArrowLeft aria-hidden="true" className="size-4" strokeWidth={1.5} /> All projects
        </Link>
        <p className="label mt-8 text-bronze">Case study{project.is_demo ? ' — Illustrative' : ''}</p>
        <div className="mt-5 flex flex-col gap-8 desk:flex-row desk:items-end desk:justify-between">
          <h1 className="max-w-[16ch] font-display text-[clamp(48px,8vw,128px)] leading-[0.96] font-medium tracking-[-0.015em] break-words">{project.title}</h1>
          <div className="shrink-0 desk:pb-4">
            <SaveTextButton kind="project" id={project.id} />
          </div>
        </div>
        <div className="mt-[clamp(32px,4vw,56px)]">
          <Facts project={project} />
        </div>
      </header>

      <div className="mt-[clamp(32px,4vw,56px)]">
        <Media src={cover?.image} alt={cover?.alt_text ?? project.title} aspect="aspect-[4/3] phone:aspect-[21/9]" illustrative={project.is_demo} eager sizes="100vw" />
      </div>

      <section className="container-page py-section" aria-labelledby="story-title">
        <div className="grid-editorial gap-y-8">
          <h2 id="story-title" className="label text-bronze desk:col-span-3">
            The project
          </h2>
          <div className="desk:col-span-8 desk:col-start-5">
            <p className="font-display text-[clamp(26px,2.6vw,36px)] leading-[1.2] font-medium">{project.summary}</p>
            {paragraphs.length > 0 && (
              <div className="mt-8 grid gap-6 text-[15px] leading-[1.6] text-ink2 phone:grid-cols-2">
                <div className="space-y-4">{paragraphs.slice(0, half).map((text, index) => <p key={index}>{text}</p>)}</div>
                <div className="space-y-4">{paragraphs.slice(half).map((text, index) => <p key={index}>{text}</p>)}</div>
              </div>
            )}
            {project.is_demo && (
              <p className="mt-8 border border-line px-4 py-3 text-[13px] leading-[1.55] text-ink2">
                Illustrative case study — this is not a BRIGHTHOMES project. It is a placeholder shown while the portfolio is prepared.
              </p>
            )}
          </div>
        </div>

        {delivered.length > 0 && (
          <div className="grid-editorial mt-[clamp(56px,6vw,96px)] gap-y-6">
            <h2 className="label text-bronze desk:col-span-3">Services delivered</h2>
            <ol className="border-t border-line desk:col-span-8 desk:col-start-5">
              {delivered.map((service, index) => (
                <li key={service.id} className="border-b border-line">
                  <Link to={routes.service(service.slug)} className="group flex min-h-14 items-center gap-5 transition-[padding,color] duration-300 hover:pl-3 hover:text-bronze">
                    <span className="text-[11px] font-semibold text-bronze tabular-nums">{padIndex(index)}</span>
                    <span className="flex-1 font-display text-[22px]">{service.name}</span>
                    <ArrowUpRight aria-hidden="true" className="size-4" strokeWidth={1.5} />
                  </Link>
                </li>
              ))}
            </ol>
          </div>
        )}
      </section>

      {images.length > 0 && <Gallery images={images} title={project.title} illustrative={project.is_demo} onOpen={setViewer} />}
      <Viewer images={images} index={viewer} onIndexChange={setViewer} onClose={() => setViewer(null)} title={project.title} illustrative={project.is_demo} />

      <section className="bg-paper py-section" aria-labelledby="enquire-title">
        <div className="container-page grid-editorial gap-y-12">
          <Reveal className="desk:col-span-5">
            <p className="label text-bronze">Enquire</p>
            <h2 id="enquire-title" className="mt-5 font-display text-[clamp(40px,4.4vw,64px)] leading-[1] font-medium">
              Planning something <Em>similar?</Em>
            </h2>
            <p className="mt-6 max-w-sm text-[15px] leading-[1.6] text-ink2">Send a short note about your site and what you’d like to build. You can also book a full consultation.</p>
            <Link to={routes.consultation({ project: project.slug })} className="text-link mt-6">
              Request a consultation <ArrowRight aria-hidden="true" className="arrow size-4" strokeWidth={1.5} />
            </Link>
          </Reveal>
          <div className="desk:col-span-6 desk:col-start-7">
            <EnquiryForm context={{ project: { id: project.id, title: project.title } }} defaultMessage={`Hello, I’d like to discuss a project similar to ${project.title}.`} />
          </div>
        </div>
      </section>

      {next && (
        <Link to={routes.project(next.slug)} className="group block bg-band text-band-ink">
          <div className="container-page flex flex-wrap items-center justify-between gap-6 py-[clamp(48px,6vw,88px)]">
            <div>
              <p className="label text-band-mute">Next project</p>
              <p className="mt-4 font-display text-[clamp(32px,4vw,56px)] leading-[1] font-medium transition-colors group-hover:text-band-accent">{next.title}</p>
            </div>
            <ArrowRight aria-hidden="true" className="size-6 transition-transform duration-300 group-hover:translate-x-1" strokeWidth={1.25} />
          </div>
        </Link>
      )}
    </>
  )
}
