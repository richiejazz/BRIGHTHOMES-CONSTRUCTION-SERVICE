import { Search } from 'lucide-react'
import { useId } from 'react'
import { Link } from 'react-router-dom'

import { useSavedProperties } from '../api/account'
import { usePropertyTypes, useProperties } from '../api/content'
import type { ListingType } from '../api/types'
import { PropertyItem, PropertyItemSkeleton } from '../components/content/PropertyItem'
import { ConsultationCta } from '../components/sections/ConsultationCta'
import { Button, ButtonLink } from '../components/ui/Button'
import { Checkbox, ChipGroup, Segmented } from '../components/ui/Controls'
import { PageHeader } from '../components/ui/Layout'
import { Pagination } from '../components/ui/Pagination'
import { EmptyState, ErrorState, LoadingAnnouncement } from '../components/ui/States'
import { useAuth } from '../context/useAuth'
import { useDebouncedSearch, useUrlFilters } from '../hooks/useUrlFilters'
import { listingTypeLabels } from '../lib/labels'
import { routes } from '../lib/routes'

const LISTINGS: { value: ListingType | 'all'; label: string }[] = [{ value: 'all', label: 'All' }, ...(Object.keys(listingTypeLabels) as ListingType[]).map((value) => ({ value, label: listingTypeLabels[value] }))]

// Price ordering is deliberately not offered: sorting by the stored price would reveal the
// relative price of listings whose price is "on request".
const SORTS = [
  { value: '', label: 'Newest' },
  { value: 'created_at', label: 'Oldest' },
  { value: 'title', label: 'A–Z' },
]

function SavedLink() {
  const { status } = useAuth()
  const saved = useSavedProperties(1, status === 'authenticated')
  if (status !== 'authenticated') return null
  return (
    <Link to={routes.account.savedProperties} className="text-link min-h-9 text-[11px]">
      Saved ({saved.data?.count ?? 0})
    </Link>
  )
}

export default function RealEstatePage() {
  const { params, update, clear, page } = useUrlFilters()
  const listingParam = params.get('listing') as ListingType | null
  const listing: ListingType | 'all' = listingParam && listingParam in listingTypeLabels ? listingParam : 'all'
  const type = params.get('type') ?? ''
  const sort = SORTS.some((option) => option.value === params.get('sort')) ? (params.get('sort') ?? '') : ''
  const availableOnly = params.get('available') === '1'
  const search = params.get('q') ?? ''

  const types = usePropertyTypes()
  const properties = useProperties({
    page,
    listing_type: listing === 'all' ? undefined : listing,
    category_slug: type || undefined,
    status: availableOnly ? 'available' : undefined,
    ordering: sort || undefined,
    search,
  })
  const [draft, setDraft] = useDebouncedSearch(search, (value) => update({ q: value }))
  const searchId = useId()
  const sortId = useId()

  const results = properties.data?.results ?? []
  const count = properties.data?.count ?? 0
  const anyDemo = results.some((property) => property.is_demo)
  const filtersActive = Boolean(listingParam || type || availableOnly || search)

  return (
    <>
      <title>Real Estate — BRIGHTHOMES Construction Service</title>
      <PageHeader
        section="Real Estate"
        title="Real Estate"
        intro="Homes, land and commercial space for sale, rent and lease — with viewings, enquiries and paperwork handled by one team."
        note={anyDemo ? 'Listings shown are samples.' : undefined}
      />

      <div className="border-y border-line bg-paper">
        <div className="container-page space-y-4 py-5">
          <div className="flex flex-col gap-4 desk:flex-row desk:items-center desk:justify-between">
            <Segmented label="Listing type" value={listing} onChange={(value) => update({ listing: value === 'all' ? '' : value })} options={LISTINGS} />
            <div className="flex flex-wrap items-center gap-x-5 gap-y-3">
              <label htmlFor={searchId} className="flex min-h-11 items-center gap-2 border-b border-control-line focus-within:border-bronze">
                <Search aria-hidden="true" className="size-4 text-mute" strokeWidth={1.5} />
                <span className="sr-only">Search properties</span>
                <input id={searchId} type="search" value={draft} onChange={(event) => setDraft(event.target.value)} placeholder="Search properties" className="w-40 bg-transparent py-2 text-[14px] outline-none placeholder:text-mute" />
              </label>
              <label htmlFor={sortId} className="flex items-center gap-3">
                <span className="label text-[10px] text-mute">Sort</span>
                <select id={sortId} value={sort} onChange={(event) => update({ sort: event.target.value })} className="h-11 cursor-pointer border border-control-line bg-transparent px-3 text-[13px] text-ink [&>option]:bg-paper">
                  {SORTS.map((option) => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
              </label>
            </div>
          </div>
          <div className="flex flex-col gap-3 desk:flex-row desk:items-center desk:justify-between">
            <div className="flex flex-wrap items-center gap-x-4 gap-y-2">
              <span className="label text-[10px] text-mute">Type</span>
              <ChipGroup label="Property type" value={type || 'all'} onChange={(value) => update({ type: value === 'all' ? '' : value })} options={[{ value: 'all', label: 'All types' }, ...(types.data ?? []).map((item) => ({ value: item.slug, label: item.name }))]} />
            </div>
            <Checkbox label="Available only" checked={availableOnly} onChange={(event) => update({ available: event.target.checked ? '1' : '' })} />
          </div>
        </div>
      </div>

      <section className="container-page py-[clamp(32px,4vw,64px)]" aria-label="Listings" aria-busy={properties.isPending}>
        <div className="mb-8 flex items-center justify-between gap-4">
          <p className="text-[12px] text-ink2 tabular-nums" aria-live="polite">
            {properties.data ? `${String(count).padStart(2, '0')} ${count === 1 ? 'property' : 'properties'}` : ' '}
          </p>
          <SavedLink />
        </div>
        {properties.isPending ? (
          <div className="grid gap-x-6 gap-y-16 phone:grid-cols-2">
            <LoadingAnnouncement label="Loading properties" />
            {[0, 1, 2, 3].map((index) => (
              <PropertyItemSkeleton key={index} />
            ))}
          </div>
        ) : properties.isError ? (
          <ErrorState title="We couldn’t load properties." error={properties.error} onRetry={() => void properties.refetch()} />
        ) : results.length === 0 ? (
          filtersActive ? (
            <EmptyState title="Nothing listed here yet." action={<Button onClick={clear}>Clear filters</Button>}>
              No properties match these filters. Try fewer filters, or tell us what you’re looking for.
            </EmptyState>
          ) : (
            <EmptyState title="Listings are being prepared." action={<ButtonLink to={routes.consultation({ service: 'real-estate' })} arrow>Request a consultation</ButtonLink>}>
              Property listings will appear here soon. To ask about buying, renting or leasing now, request a consultation.
            </EmptyState>
          )
        ) : (
          <>
            <div className="grid gap-x-6 gap-y-[clamp(48px,5vw,80px)] phone:grid-cols-2">
              {results.map((property) => (
                <PropertyItem key={property.id} property={property} sizes="(min-width: 600px) 50vw, 100vw" />
              ))}
            </div>
            <div className="mt-[clamp(56px,6vw,96px)]">
              <Pagination page={page} count={count} onChange={(next) => update({ page: String(next) }, { keepPage: true })} label="Property pages" />
            </div>
          </>
        )}
      </section>
      <ConsultationCta context={{ service: 'real-estate' }} />
    </>
  )
}
