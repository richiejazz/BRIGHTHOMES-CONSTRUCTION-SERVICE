import { Link } from 'react-router-dom'

import type { Property } from '../../api/types'
import { factsLine, formatPrice, isClosed } from '../../lib/labels'
import { coverImage } from '../../lib/projects'
import { routes } from '../../lib/routes'
import { Media } from '../media/Media'
import { ListingTag, PropertyStatusLabel } from '../ui/Badges'
import { Skeleton } from '../ui/States'
import { SaveHeart } from './SaveButton'

/**
 * W-07 listing (§14): 4:3 image with listing tag (top-left) and save (top-right); overline
 * "type · Sample listing"; serif title (bronze on hover); price; hairline; facts and status.
 * Property type, listing type and availability are always shown together.
 */
export function PropertyItem({ property, sizes, titleSize = 'text-[clamp(24px,2.2vw,32px)]', aspect = 'aspect-[4/3]' }: { property: Property; sizes?: string; titleSize?: string; aspect?: string }) {
  const cover = coverImage(property.images)
  const closed = isClosed(property.status) && !property.is_demo
  const price = formatPrice(property)
  const facts = factsLine(property)
  return (
    <article className="group relative">
      <div className="relative">
        <Link to={routes.property(property.slug)} className="block" aria-label={property.title}>
          <Media src={cover?.image} alt={cover?.alt_text ?? ''} aspect={aspect} zoom greyscale={closed} illustrative={property.is_demo} sizes={sizes} />
        </Link>
        <ListingTag listing={property.listing_type} className="absolute top-3 left-3" />
        <SaveHeart kind="property" id={property.id} title={property.title} className="absolute top-3 right-3" />
      </div>
      <div className="mt-4 flex flex-wrap items-start justify-between gap-x-6 gap-y-1">
        <div className="min-w-0 flex-1">
          <p className="label text-[10px] text-mute">
            {property.category.name}
            {property.is_demo && ' · Sample listing'}
          </p>
          <h3 className={`mt-2 font-display leading-[1.05] font-medium ${titleSize}`}>
            <Link to={routes.property(property.slug)} className="transition-colors duration-200 group-hover:text-bronze">
              {property.title}
            </Link>
          </h3>
        </div>
        <p className="pt-5 text-right">
          <span className={`block text-[16px] font-semibold ${closed && price.note ? 'text-mute line-through' : 'text-ink'}`}>{price.amount}</span>
          {price.note === 'per year' && <span className="block text-[11px] text-mute">per year</span>}
        </p>
      </div>
      <div className="mt-4 flex flex-wrap items-center justify-between gap-x-6 gap-y-2 border-t border-line pt-3">
        <p className="text-[12px] text-ink2">{facts || property.location || '—'}</p>
        <PropertyStatusLabel status={property.status} demo={property.is_demo} />
      </div>
    </article>
  )
}

export function PropertyItemSkeleton() {
  return (
    <div>
      <Skeleton className="aspect-[4/3]" />
      <Skeleton className="mt-4 h-2.5 w-28" />
      <div className="mt-3 flex justify-between gap-6">
        <Skeleton className="h-7 w-2/3" />
        <Skeleton className="h-5 w-24" />
      </div>
      <Skeleton className="mt-5 h-3 w-full" />
    </div>
  )
}
