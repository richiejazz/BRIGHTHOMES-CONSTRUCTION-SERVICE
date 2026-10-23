import { ArrowLeft } from 'lucide-react'
import { useState } from 'react'
import { Link, useParams, useSearchParams } from 'react-router-dom'

import { useProperty } from '../api/content'
import { isNotFound } from '../api/errors'
import { Media } from '../components/media/Media'
import { Viewer, type GalleryImage } from '../components/media/Viewer'
import { ButtonLink } from '../components/ui/Button'
import { Segmented } from '../components/ui/Controls'
import { BAR_OFFSET } from '../components/ui/Layout'
import { EmptyState, ErrorState, LoadingAnnouncement, Skeleton } from '../components/ui/States'
import { padIndex } from '../lib/format'
import { isClosed } from '../lib/labels'
import { coverImage } from '../lib/projects'
import { routes } from '../lib/routes'
import NotFoundPage from './NotFoundPage'

type Mode = 'grid' | 'sequence'

/** Grid rhythm (§16): 21:9 full width, then a 7:5 pair, repeating. */
function gridCell(index: number) {
  const position = index % 3
  return position === 0 ? { span: 'phone:col-span-2', aspect: 'aspect-[4/3] phone:aspect-[21/9]' } : { span: '', aspect: 'aspect-[7/5]' }
}

export default function PropertyGalleryPage() {
  const { slug = '' } = useParams()
  const [params, setParams] = useSearchParams()
  const mode: Mode = params.get('view') === 'sequence' ? 'sequence' : 'grid'
  const query = useProperty(slug)
  const [viewer, setViewer] = useState<number | null>(null)

  if (query.isPending)
    return (
      <div className={`container-page ${BAR_OFFSET} pb-section`} aria-busy="true">
        <LoadingAnnouncement label="Loading gallery" />
        <Skeleton className="h-14 w-2/3" />
        <Skeleton className="mt-10 aspect-[21/9] w-full" />
      </div>
    )
  if (query.isError) {
    if (isNotFound(query.error)) return <NotFoundPage title="This property isn’t listed." message="It may have been removed or unpublished." />
    return (
      <div className={`container-page ${BAR_OFFSET} pb-section`}>
        <ErrorState title="We couldn’t load this gallery." error={query.error} onRetry={() => void query.refetch()} />
      </div>
    )
  }

  const property = query.data
  const cover = coverImage(property.images)
  const ordered = cover ? [cover, ...property.images.filter((image) => image.id !== cover.id)] : property.images
  const images: GalleryImage[] = ordered.map((image) => ({ id: image.id, src: image.image, alt: image.alt_text, caption: image.caption }))
  const closed = isClosed(property.status) && !property.is_demo

  return (
    <>
      <title>{`${property.title} — Gallery — BRIGHTHOMES Real Estate`}</title>
      <header className={`container-page ${BAR_OFFSET}`}>
        <div className="flex flex-wrap items-center justify-between gap-4">
          <Link to={routes.property(property.slug)} className="text-link no-underline">
            <ArrowLeft aria-hidden="true" className="size-4" strokeWidth={1.5} /> Back to property
          </Link>
          <Segmented<Mode>
            label="Gallery layout"
            value={mode}
            onChange={(value) => setParams(value === 'grid' ? {} : { view: value }, { replace: true })}
            options={[
              { value: 'grid', label: 'Grid' },
              { value: 'sequence', label: 'Sequence' },
            ]}
          />
        </div>
        <p className="label mt-10 text-[10px] text-bronze">
          Gallery · {images.length} {images.length === 1 ? 'image' : 'images'}
          {property.is_demo && ' · Illustrative'}
        </p>
        <div className="mt-4 flex flex-col gap-6 border-b border-line pb-8 desk:flex-row desk:items-end desk:justify-between">
          <h1 className="font-display text-[clamp(40px,5vw,72px)] leading-[1] font-medium tracking-[-0.015em]">{property.title}</h1>
          {!closed && (
            <ButtonLink to={`${routes.property(property.slug)}#enquire`} className="shrink-0">
              Enquire about this property
            </ButtonLink>
          )}
        </div>
      </header>

      <section className="container-page py-[clamp(32px,4vw,64px)] pb-section" aria-label="Photos">
        {images.length === 0 ? (
          <EmptyState title="No photos yet.">Photos for this listing will be added soon.</EmptyState>
        ) : mode === 'grid' ? (
          <div className="grid gap-4 phone:grid-cols-2">
            {images.map((image, index) => {
              const cell = gridCell(index)
              return (
                <button key={image.id} type="button" onClick={() => setViewer(index)} className={`group relative block text-left ${cell.span}`} aria-label={`Open photo ${index + 1} of ${images.length}`}>
                  <Media src={image.src} alt={image.alt} aspect={cell.aspect} greyscale={closed} zoom illustrative={property.is_demo && index === 0} />
                  <span className="label absolute top-3 left-3 bg-bg px-2 py-1 text-[10px] text-ink">{padIndex(index)}</span>
                </button>
              )
            })}
          </div>
        ) : (
          <ol className="space-y-12">
            {images.map((image, index) => (
              <li key={image.id}>
                <button type="button" onClick={() => setViewer(index)} className="group block w-full text-left" aria-label={`Open photo ${index + 1} of ${images.length}`}>
                  <Media src={image.src} alt={image.alt} aspect="aspect-[16/9]" greyscale={closed} zoom illustrative={property.is_demo} />
                </button>
                <p className="mt-3 text-[13px] text-ink2">
                  <span className="font-semibold text-ink tabular-nums">{padIndex(index)}</span> — {image.caption || image.alt || 'Photograph'}
                </p>
              </li>
            ))}
          </ol>
        )}
      </section>
      <Viewer images={images} index={viewer} onIndexChange={setViewer} onClose={() => setViewer(null)} title={property.title} illustrative={property.is_demo} />
    </>
  )
}
