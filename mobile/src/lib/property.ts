import type { ListingType, PriceDisplay, Property, PropertyStatus, PropertySummary } from '../api/types'

// Labels follow the backend choices exactly.
export const listingTypeLabels: Record<ListingType, string> = {
  sale: 'For sale',
  rent: 'For rent',
  lease: 'For lease',
  coming_soon: 'Coming soon',
}

export const propertyStatusLabels: Record<PropertyStatus, string> = {
  available: 'Available',
  reserved: 'Reserved',
  sold: 'Sold',
  rented: 'Rented',
  coming_soon: 'Coming soon',
  unavailable: 'Unavailable',
}

const naira = new Intl.NumberFormat('en-NG', { maximumFractionDigits: 0 })

/** "₦85,000,000", "From ₦40,000,000" or "Price on request". Never shows an amount the API withheld. */
export function formatPrice({ price, price_display }: { price: string | null; price_display: PriceDisplay }) {
  if (price_display === 'on_request' || price === null) return 'Price on request'
  const amount = `₦${naira.format(Number(price))}`
  return price_display === 'from' ? `From ${amount}` : amount
}

/** Short specification line for cards: "4 bed · 3 bath · 600 sqm". */
export function specLine(property: Pick<Property, 'bedrooms' | 'bathrooms' | 'land_size' | 'building_size'>) {
  return [
    property.bedrooms != null ? `${property.bedrooms} bed` : null,
    property.bathrooms != null ? `${property.bathrooms} bath` : null,
    property.building_size || property.land_size || null,
  ]
    .filter(Boolean)
    .join(' · ')
}

/** The availability shown on cards. Illustrative records make no availability claim. */
export function availabilityLabel(property: Pick<PropertySummary, 'status' | 'is_demo'>) {
  return property.is_demo ? 'Illustrative' : propertyStatusLabels[property.status]
}
