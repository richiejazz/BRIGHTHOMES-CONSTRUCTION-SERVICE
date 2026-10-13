// Shapes returned by the BRIGHTHOMES API (/api/v1/). Kept in sync with the backend serializers;
// website/src/api/types.ts covers the subset the website uses.

export type Paginated<T> = {
  count: number
  next: string | null
  previous: string | null
  results: T[]
}

export type ProjectStatus = 'completed' | 'ongoing'

export type ProjectCategory = {
  id: number
  name: string
  slug: string
  description: string
  display_order: number
  is_active: boolean
}

export type ProjectImage = {
  id: number
  image: string
  alt_text: string
  caption: string
  display_order: number
  is_cover: boolean
}

export type Project = {
  id: number
  title: string
  slug: string
  summary: string
  description: string
  category: ProjectCategory
  status: ProjectStatus
  is_published: boolean
  is_featured: boolean
  /** Illustrative or placeholder content, never presented as real BRIGHTHOMES work. */
  is_demo: boolean
  location: string
  start_date: string | null
  end_date: string | null
  services: number[]
  images: ProjectImage[]
  created_at: string
  updated_at: string
}

export type ProjectSummary = {
  id: number
  slug: string
  title: string
  category: string
  status: ProjectStatus
  is_published: boolean
  is_demo: boolean
  cover_image: ProjectImage | null
}

export type PropertyCategory = ProjectCategory

export type ListingType = 'sale' | 'rent' | 'lease' | 'coming_soon'
export type PriceDisplay = 'exact' | 'from' | 'on_request'
export type PropertyStatus = 'available' | 'reserved' | 'sold' | 'rented' | 'coming_soon' | 'unavailable'

/** Gallery images share one shape across projects and properties. */
export type GalleryImage = ProjectImage

export type Property = {
  id: number
  title: string
  slug: string
  summary: string
  description: string
  category: PropertyCategory
  listing_type: ListingType
  status: PropertyStatus
  /** Decimal string in Naira; always null for the public when the price is on request. */
  price: string | null
  price_display: PriceDisplay
  location: string
  address: string
  bedrooms: number | null
  bathrooms: number | null
  land_size: string
  building_size: string
  features: string[]
  images: GalleryImage[]
  is_featured: boolean
  is_published: boolean
  is_demo: boolean
  created_at: string
  updated_at: string
}

export type PropertySummary = Pick<Property, 'id' | 'slug' | 'title' | 'listing_type' | 'status' | 'price' | 'price_display' | 'location' | 'is_published' | 'is_demo'> & {
  category: string
  cover_image: GalleryImage | null
}

export type Service = {
  id: number
  name: string
  slug: string
  short_description: string
  description: string
  display_order: number
  is_published: boolean
}

export type ServiceSummary = Pick<Service, 'id' | 'slug' | 'name'>

export type Achievement = {
  id: number
  value: string
  label: string
  description: string
  display_order: number
}

export type EnquiryStatus = 'new' | 'in_progress' | 'resolved' | 'closed'
export type AppointmentStatus = 'requested' | 'confirmed' | 'declined' | 'completed' | 'cancelled'

type ClientRecord = {
  id: number
  name: string
  email: string
  phone: string
  message: string
  project: number | null
  project_summary: ProjectSummary | null
  service: number | null
  service_summary: ServiceSummary | null
  property: number | null
  property_summary: PropertySummary | null
  created_at: string
  updated_at: string
}

export type Enquiry = ClientRecord & { status: EnquiryStatus }

export type Appointment = ClientRecord & {
  status: AppointmentStatus
  preferred_date: string
  preferred_time: string | null
  time_window: string
}

export type EnquiryInput = {
  name: string
  email: string
  phone?: string
  message: string
  project?: number | null
  service?: number | null
  property?: number | null
}

export type AppointmentInput = EnquiryInput & {
  preferred_date: string
  preferred_time?: string | null
  time_window?: string
}

export type SavedProject = {
  id: number
  project: number
  project_summary: ProjectSummary
  created_at: string
}

export type SavedProperty = {
  id: number
  property: number
  property_summary: PropertySummary
  created_at: string
}

export type UserRole = 'client' | 'staff' | 'admin'

export type User = {
  id: number
  email: string
  first_name: string
  last_name: string
  phone: string
  /** Absolute URL of a 512px square photo, or null to show initials. */
  avatar: string | null
  role: UserRole
  date_joined: string
}

export type ProfileInput = Partial<Pick<User, 'first_name' | 'last_name' | 'phone'>>

export type TokenPair = { access: string; refresh: string }

export type RegisterInput = {
  email: string
  first_name: string
  last_name: string
  password: string
}
