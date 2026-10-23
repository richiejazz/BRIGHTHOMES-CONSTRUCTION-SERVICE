import type {
  AppointmentStatus,
  ConsultationMode,
  ConsultationProjectType,
  ConsultationTimeline,
  ContactMethod,
  EnquiryStatus,
  ListingType,
  PriceDisplay,
  Property,
  PropertyStatus,
  PropertySummary,
  ProjectStatus,
} from '../api/types'

// User-facing wording for stored values (spec §03, §14, §18). The database keeps its own values;
// only presentation changes here.

export const projectStatusLabels: Record<ProjectStatus, string> = { completed: 'Completed', ongoing: 'Ongoing' }

/** §18: an enquiry is Received, then In review, then Responded. */
export const enquiryStatusLabels: Record<EnquiryStatus, string> = { new: 'Received', in_progress: 'In review', resolved: 'Responded', closed: 'Closed' }

/** §18: a consultation is a request until BRIGHTHOMES confirms it. */
export const consultationStatusLabels: Record<AppointmentStatus, string> = {
  requested: 'Requested',
  confirmed: 'Confirmed',
  declined: 'Declined',
  completed: 'Completed',
  cancelled: 'Cancelled',
}

export const listingTypeLabels: Record<ListingType, string> = { sale: 'For Sale', rent: 'For Rent', lease: 'For Lease', coming_soon: 'Coming Soon' }

export const propertyStatusLabels: Record<PropertyStatus, string> = {
  available: 'Available',
  reserved: 'Reserved',
  sold: 'Sold',
  rented: 'Rented',
  coming_soon: 'Coming Soon',
  unavailable: 'Unavailable',
}

export const contactMethodLabels: Record<ContactMethod, string> = { call: 'Call', whatsapp: 'WhatsApp', email: 'Email' }
export const consultationModeLabels: Record<ConsultationMode, string> = { in_person: 'In person', video: 'Video call', phone: 'Phone call' }
export const projectTypeLabels: Record<ConsultationProjectType, string> = {
  new_build: 'New build',
  renovation: 'Renovation',
  buying_selling: 'Buying or selling',
  land_documentation: 'Land & documentation',
  other: 'Other',
}
export const timelineLabels: Record<ConsultationTimeline, string> = {
  asap: 'As soon as possible',
  within_3_months: 'Within 3 months',
  within_6_months: 'Within 6 months',
  within_12_months: 'Within a year',
  not_sure: 'Not sure yet',
}

// --- Property presentation --------------------------------------------------------------------

const naira = new Intl.NumberFormat('en-NG', { maximumFractionDigits: 0 })

/** §14: rent and lease are quoted per year. */
const perYear = (listing: ListingType) => listing === 'rent' || listing === 'lease'

/**
 * Full price for lists and detail pages, or "Price on request". Never shows an amount the API
 * withheld, and Coming Soon listings always read "Price on request" (§14).
 */
export function formatPrice(property: Pick<PropertySummary, 'price' | 'price_display' | 'listing_type'>) {
  const { price, price_display: display, listing_type: listing } = property
  if (display === 'on_request' || price === null || listing === 'coming_soon') return { amount: 'Price on request', note: '' }
  const amount = `₦${naira.format(Number(price))}`
  return { amount: display === 'from' ? `From ${amount}` : amount, note: perYear(listing) ? 'per year' : display === 'from' ? 'Starting price' : 'Asking price' }
}

export const priceIsShown = (display: PriceDisplay, price: string | null) => display !== 'on_request' && price !== null

/** Sold, rented and unavailable listings stay visible but greyed, with enquiries closed (§14). */
export const isClosed = (status: PropertyStatus) => status === 'sold' || status === 'rented' || status === 'unavailable'

/** Illustrative listings make no availability claim; their status reads "Illustrative". */
export const availabilityText = (property: Pick<PropertySummary, 'status' | 'is_demo'>) => (property.is_demo ? 'Illustrative' : propertyStatusLabels[property.status])

/**
 * §14 facts by property type: houses and apartments show beds · baths · size; land shows plot
 * size; commercial shows floor area. Only values that exist are returned; nothing is invented.
 */
export function propertyFacts(property: Pick<Property, 'bedrooms' | 'bathrooms' | 'land_size' | 'building_size' | 'category'>) {
  const type = property.category.slug
  const facts: { label: string; value: string }[] = []
  if (type === 'land') {
    if (property.land_size) facts.push({ label: 'Plot size', value: property.land_size })
  } else {
    if (property.bedrooms != null) facts.push({ label: 'Bedrooms', value: String(property.bedrooms) })
    if (property.bathrooms != null) facts.push({ label: type === 'commercial' ? 'Washrooms' : 'Bathrooms', value: String(property.bathrooms) })
    if (property.building_size) facts.push({ label: type === 'commercial' ? 'Floor area' : 'Size', value: property.building_size })
    else if (property.land_size) facts.push({ label: 'Plot size', value: property.land_size })
  }
  facts.push({ label: 'Type', value: property.category.name })
  return facts
}

/** Short facts line for listing cards: "5 Bed · 6 Bath · 650 m²". */
export function factsLine(property: Pick<Property, 'bedrooms' | 'bathrooms' | 'land_size' | 'building_size'>) {
  return [
    property.bedrooms != null ? `${property.bedrooms} Bed` : null,
    property.bathrooms != null ? `${property.bathrooms} Bath` : null,
    property.building_size || property.land_size || null,
  ]
    .filter(Boolean)
    .join(' · ')
}
