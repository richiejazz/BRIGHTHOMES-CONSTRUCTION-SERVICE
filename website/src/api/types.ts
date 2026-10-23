// Shapes returned by the BRIGHTHOMES API (/api/v1/). Kept in sync with the backend serializers.

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
  is_demo: boolean
  location: string
  building_type: string
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

// --- Real estate -----------------------------------------------------------------------------

export type PropertyCategory = ProjectCategory
export type ListingType = 'sale' | 'rent' | 'lease' | 'coming_soon'
export type PriceDisplay = 'exact' | 'from' | 'on_request'
export type PropertyStatus = 'available' | 'reserved' | 'sold' | 'rented' | 'coming_soon' | 'unavailable'
export type PropertyImage = ProjectImage

export type Property = {
  id: number
  title: string
  slug: string
  summary: string
  description: string
  category: PropertyCategory
  listing_type: ListingType
  status: PropertyStatus
  /** Decimal string in naira; always null for the public when the price is on request. */
  price: string | null
  price_display: PriceDisplay
  location: string
  address: string
  bedrooms: number | null
  bathrooms: number | null
  land_size: string
  building_size: string
  features: string[]
  images: PropertyImage[]
  is_featured: boolean
  is_published: boolean
  is_demo: boolean
  created_at: string
  updated_at: string
}

export type PropertySummary = Pick<Property, 'id' | 'slug' | 'title' | 'listing_type' | 'status' | 'price' | 'price_display' | 'location' | 'is_published' | 'is_demo'> & {
  category: string
  cover_image: PropertyImage | null
}

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
  /** Human-readable reference, e.g. ENQ-2041 or CON-0118. */
  reference: string
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
}

export type ContactMethod = 'call' | 'whatsapp' | 'email'
export type ConsultationMode = 'in_person' | 'video' | 'phone'
export type ConsultationProjectType = 'new_build' | 'renovation' | 'buying_selling' | 'land_documentation' | 'other'
export type ConsultationTimeline = 'asap' | 'within_3_months' | 'within_6_months' | 'within_12_months' | 'not_sure'

export type Enquiry = ClientRecord & { status: EnquiryStatus; preferred_contact: ContactMethod | '' }

export type Appointment = ClientRecord & {
  status: AppointmentStatus
  preferred_date: string
  preferred_time: string | null
  time_window: string
  mode: ConsultationMode | ''
  based_abroad: boolean | null
  project_type: ConsultationProjectType | ''
  site_location: string
  timeline: ConsultationTimeline | ''
  services: number[]
  services_summary: ServiceSummary[]
  services_not_sure: boolean
}

export type EnquiryInput = {
  name: string
  email: string
  phone?: string
  message: string
  project?: number | null
  service?: number | null
  property?: number | null
  preferred_contact?: ContactMethod | ''
}

export type AppointmentInput = Omit<EnquiryInput, 'preferred_contact'> & {
  preferred_date: string
  preferred_time?: string | null
  time_window?: string
  mode?: ConsultationMode | ''
  based_abroad?: boolean | null
  project_type?: ConsultationProjectType | ''
  site_location?: string
  timeline?: ConsultationTimeline | ''
  services?: number[]
  services_not_sure?: boolean
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
  /** Absolute URL of a server-processed 512px square JPEG, or null. */
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
  phone?: string
  password: string
}
