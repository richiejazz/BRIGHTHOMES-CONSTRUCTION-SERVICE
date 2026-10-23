import { ArrowLeft, Check, Info, MapPin } from 'lucide-react'
import { useState } from 'react'
import { Link, useParams } from 'react-router-dom'

import { useProperties, useProperty } from '../api/content'
import { isNotFound } from '../api/errors'
import type { Property } from '../api/types'
import { PropertyItem } from '../components/content/PropertyItem'
import { SaveTextButton } from '../components/content/SaveButton'
import { EnquiryForm } from '../components/forms/RequestForms'
import { Media } from '../components/media/Media'
import { Viewer, type GalleryImage } from '../components/media/Viewer'
import { ListingTag, PropertyStatusLabel } from '../components/ui/Badges'
import { ButtonLink } from '../components/ui/Button'
import { BAR_OFFSET } from '../components/ui/Layout'
import { ErrorState, LoadingAnnouncement, Skeleton } from '../components/ui/States'
import { company } from '../content/company'
import { formatPrice, isClosed, propertyFacts, propertyStatusLabels } from '../lib/labels'
import { coverImage } from '../lib/projects'
import { routes } from '../lib/routes'
import NotFoundPage from './NotFoundPage'

/** §14 detail behaviour by availability. Illustrative listings behave as open, with no availability claim. */
function behaviour(property: Property) {
  if (!property.is_demo && isClosed(property.status)) {
    const label = property.status === 'unavailable' ? 'currently unavailable' : propertyStatusLabels[property.status].toLowerCase()
    return { closed: true as const, notice: `This property is ${label}. Enquiries are closed — browse similar properties below.` }
  }
  if (property.listing_type === 'coming_soon' || property.status === 'coming_soon') {
    return { closed: false as const, submit: 'Register interest', message: `Hello, I’d like to register interest in ${property.title}. Please let me know when details are available.` }
  }
  if (property.status === 'reserved' && !property.is_demo) {
    return { closed: false as const, notice: 'This property is reserved. Join the waiting list and we’ll contact you if it becomes available.', submit: 'Join the waiting list', message: `Hello, please add me to the waiting list for ${property.title}.` }
  }
  return { closed: false as const, submit: 'Enquire about this property', message: `Hello, I’m interested in ${property.title}. Please share more details and viewing availability.` }
}

function Mosaic({ property, images, onOpen }: { property: Property; images: GalleryImage[]; onOpen: (index: number) => void }) {
  const closed = isClosed(property.status) && !property.is_demo
  const [first, second, third] = images
  const tile = (image: GalleryImage | undefined, index: number, className: string, aspect: string) =>
    image ? (
      <button type="button" onClick={() => onOpen(index)} className={`group block ${className}`} aria-label={`Open photo ${index + 1} of ${images.length}`}>
        <Media src={image.src} alt={image.alt} aspect={aspect} className="h-full" greyscale={closed} zoom eager={index === 0} />
      </button>
    ) : (
      <div className={`bg-stone ${className} ${aspect}`} aria-hidden="true" />
    )
  return (
    <div className="relative">
      <div className="grid gap-3 desk:grid-cols-12 desk:grid-rows-2">
        {tile(first, 0, 'desk:col-span-8 desk:row-span-2', 'aspect-[4/3] desk:aspect-auto desk:h-full')}
        <div className="hidden desk:col-span-4 desk:row-span-2 desk:grid desk:grid-rows-2 desk:gap-3">
          {tile(second, 1, '', 'aspect-[4/3]')}
          {tile(third, 2, '', 'aspect-[4/3]')}
        </div>
      </div>
      <ListingTag listing={property.listing_type} className="absolute top-3 left-3" />
      <div className="absolute right-3 bottom-3 flex flex-wrap items-center justify-end gap-2">
        {property.is_demo && <span className="inline-flex min-h-6 items-center bg-black/65 px-2.5 text-[10px] font-semibold tracking-[0.18em] text-[#EEE8DD] uppercase">Illustrative image</span>}
        {images.length > 0 && (
          <Link to={routes.propertyGallery(property.slug)} className="inline-flex min-h-9 items-center bg-bg px-3 text-[10px] font-semibold tracking-[0.18em] text-ink uppercase hover:text-bronze">
            View all {images.length} photos
          </Link>
        )}
      </div>
    </div>
  )
}

function EnquiryPanel({ property }: { property: Property }) {
  const price = formatPrice(property)
  const plan = behaviour(property)
  const struck = plan.closed && price.note
  return (
    <aside id="enquire" aria-label="Enquire about this property" className="scroll-mt-28 border border-line2 bg-paper">
      <div className="p-6 phone:p-7">
        <div className="flex items-center justify-between gap-4">
          <ListingTag listing={property.listing_type} inverse />
          <PropertyStatusLabel status={property.status} demo={property.is_demo} />
        </div>
        <p className={`mt-6 font-display text-[clamp(32px,3.4vw,48px)] leading-[1] font-medium ${struck ? 'text-mute line-through' : ''}`}>{price.amount}</p>
        {price.note && <p className="mt-2 text-[12px] text-ink2">{price.note}</p>}
        {plan.notice && (
          <p className="mt-6 flex gap-3 border-l-2 border-bronze bg-bg px-4 py-3 text-[13px] leading-[1.55] text-ink">
            <Info aria-hidden="true" className="mt-0.5 size-4 shrink-0 text-bronze" strokeWidth={1.6} />
            {plan.notice}
          </p>
        )}
      </div>
      <div className="border-t border-line px-6 py-7 phone:px-7">
        {plan.closed ? (
          <div className="space-y-3">
            <ButtonLink to={`${routes.realEstate}?type=${property.category.slug}`} className="w-full">
              See similar properties
            </ButtonLink>
            <ButtonLink to={routes.consultation({ service: 'real-estate' })} variant="secondary" className="w-full">
              Request a consultation
            </ButtonLink>
          </div>
        ) : (
          <>
            <EnquiryForm compact context={{ property: { id: property.id, title: property.title }, serviceSlug: 'real-estate' }} defaultMessage={plan.message} submitLabel={plan.submit} />
            <ButtonLink to={routes.consultation({ property: property.slug })} variant="secondary" className="mt-3 w-full">
              Request a consultation
            </ButtonLink>
          </>
        )}
        <div className="mt-4">
          <SaveTextButton kind="property" id={property.id} variant="link" />
        </div>
      </div>
      <div className="flex flex-wrap justify-between gap-2 border-t border-line px-6 py-4 text-[13px] phone:px-7">
        {company.phones.map((phone) => (
          <a key={phone.href} href={phone.href} className="hover:text-bronze">
            {phone.display}
          </a>
        ))}
      </div>
    </aside>
  )
}

function Similar({ property }: { property: Property }) {
  const similar = useProperties({ category_slug: property.category.slug })
  const items = similar.data?.results.filter((item) => item.id !== property.id).slice(0, 3) ?? []
  if (items.length === 0) return null
  return (
    <section id="similar" className="border-t border-line py-section" aria-labelledby="similar-title">
      <div className="container-page">
        <h2 id="similar-title" className="font-display text-[clamp(36px,4vw,56px)] leading-[1] font-medium">
          Similar <em className="font-normal">properties</em>
        </h2>
        <div className="mt-12 grid gap-x-6 gap-y-14 phone:grid-cols-2 desk:grid-cols-3">
          {items.map((item) => (
            <PropertyItem key={item.id} property={item} titleSize="text-[24px]" sizes="(min-width: 980px) 33vw, 50vw" />
          ))}
        </div>
      </div>
    </section>
  )
}

export default function PropertyDetailPage() {
  const { slug = '' } = useParams()
  const query = useProperty(slug)
  const [viewer, setViewer] = useState<number | null>(null)

  if (query.isPending)
    return (
      <div className={`container-page ${BAR_OFFSET} pb-section`} aria-busy="true">
        <LoadingAnnouncement label="Loading property" />
        <Skeleton className="aspect-[2/1] w-full" />
        <Skeleton className="mt-10 h-14 w-2/3" />
        <Skeleton className="mt-8 h-16 w-full" />
      </div>
    )
  if (query.isError) {
    if (isNotFound(query.error)) return <NotFoundPage title="This property isn’t listed." message="It may have been removed or unpublished. Browse current listings instead." />
    return (
      <div className={`container-page ${BAR_OFFSET} pb-section`}>
        <ErrorState title="We couldn’t load this property." error={query.error} onRetry={() => void query.refetch()} />
      </div>
    )
  }

  const property = query.data
  const cover = coverImage(property.images)
  const ordered = cover ? [cover, ...property.images.filter((image) => image.id !== cover.id)] : property.images
  const images: GalleryImage[] = ordered.map((image) => ({ id: image.id, src: image.image, alt: image.alt_text, caption: image.caption }))
  const facts = propertyFacts(property)
  const paragraphs = property.description.split(/\n\s*\n/).filter(Boolean)

  return (
    <>
      <title>{`${property.title} — BRIGHTHOMES Real Estate`}</title>
      <div className={`container-page ${BAR_OFFSET}`}>
        <div className="mb-6 flex flex-wrap items-center justify-between gap-4">
          <Link to={routes.realEstate} className="text-link no-underline">
            <ArrowLeft aria-hidden="true" className="size-4" strokeWidth={1.5} /> All properties
          </Link>
          {property.is_demo && <p className="label text-[10px] text-ink2">Sample listing — not a real BRIGHTHOMES property</p>}
        </div>
        <Mosaic property={property} images={images} onOpen={setViewer} />
      </div>
      <Viewer images={images} index={viewer} onIndexChange={setViewer} onClose={() => setViewer(null)} title={property.title} illustrative={property.is_demo} />

      <div className="container-page grid-editorial gap-y-12 py-[clamp(48px,6vw,96px)]">
        <div className="min-w-0 desk:col-span-7">
          <p className="label text-[10px] text-mute">
            {property.category.name}
            {property.is_demo && ' · Sample listing'}
          </p>
          <h1 className="mt-4 font-display text-[clamp(40px,5vw,72px)] leading-[1] font-medium tracking-[-0.015em]">{property.title}</h1>
          {property.summary && <p className="mt-5 text-[16px] leading-[1.65] text-ink2">{property.summary}</p>}

          <dl className="mt-10 grid grid-cols-2 border-y border-line phone:grid-cols-4">
            {facts.map((fact, index) => (
              <div key={fact.label} className={`border-line py-4 pr-3 ${index ? 'border-l pl-4' : ''} ${index === 2 ? 'border-l-0 pl-0 phone:border-l phone:pl-4' : ''} ${index >= 2 ? 'border-t phone:border-t-0' : ''}`}>
                <dt className="label text-[10px] text-mute">{fact.label}</dt>
                <dd className="mt-2 font-display text-[24px] leading-none">{fact.value}</dd>
              </div>
            ))}
          </dl>

          <div className="mt-12 grid gap-y-4 phone:grid-cols-[10rem_1fr]">
            <h2 className="label text-[10px] text-mute">Description</h2>
            <div className="space-y-4 text-[15px] leading-[1.6] text-ink2">
              {paragraphs.length ? paragraphs.map((text, index) => <p key={index}>{text}</p>) : <p>Details for this listing will be added soon.</p>}
            </div>
          </div>

          {property.features.length > 0 && (
            <div className="mt-12 grid gap-y-4 phone:grid-cols-[10rem_1fr]">
              <h2 className="label text-[10px] text-mute">Features</h2>
              <ul className="grid gap-x-8 phone:grid-cols-2">
                {property.features.map((feature) => (
                  <li key={feature} className="flex min-h-11 items-center gap-3 border-b border-line text-[14px]">
                    <Check aria-hidden="true" className="size-3.5 text-bronze" strokeWidth={2} />
                    {feature}
                  </li>
                ))}
              </ul>
            </div>
          )}

          <div className="mt-12 grid gap-y-4 phone:grid-cols-[10rem_1fr]">
            <h2 className="label text-[10px] text-mute">Location</h2>
            <div className="border border-line bg-paper p-5">
              <p className="flex items-center gap-2 text-[15px]">
                <MapPin aria-hidden="true" className="size-4 text-bronze" strokeWidth={1.5} />
                {property.location || 'Location to be confirmed'}
              </p>
              <p className="mt-2 text-[13px] text-ink2">The exact address is shared on enquiry.</p>
            </div>
          </div>
        </div>

        <div className="desk:col-span-4 desk:col-start-9">
          <div className="desk:sticky desk:top-24">
            <EnquiryPanel property={property} />
          </div>
        </div>
      </div>
      <Similar property={property} />
    </>
  )
}
