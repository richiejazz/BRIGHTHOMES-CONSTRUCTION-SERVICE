// Canonical website paths (Design Specification v1.0 §05). Build links with these helpers rather
// than string literals, so a route only ever changes in one place.

type ConsultationContext = { service?: string; project?: string; property?: string }

function withQuery(path: string, params: Record<string, string | undefined>) {
  const query = new URLSearchParams()
  Object.entries(params).forEach(([key, value]) => value && query.set(key, value))
  const search = query.toString()
  return search ? `${path}?${search}` : path
}

export const routes = {
  home: '/',
  construction: '/construction',
  project: (slug: string) => `/construction/${slug}`,
  realEstate: '/real-estate',
  property: (slug: string) => `/real-estate/${slug}`,
  propertyGallery: (slug: string) => `/real-estate/${slug}/gallery`,
  services: '/services',
  service: (slug: string) => `/services/${slug}`,
  about: '/about',
  achievements: '/achievements',
  contact: '/contact',
  /** Enquiry form on the contact page, optionally about a project or service. */
  enquiry: (context: ConsultationContext = {}) => withQuery('/contact', { ...context }),
  /** Consultation request, pre-filled from the page it was started on. */
  consultation: (context: ConsultationContext = {}) => withQuery('/consultation', { ...context }),
  login: '/login',
  register: '/register',
  forgotPassword: '/forgot-password',
  account: {
    overview: '/account',
    savedProjects: '/account/saved-projects',
    savedProperties: '/account/saved-properties',
    enquiries: '/account/enquiries',
    consultations: '/account/consultations',
    profile: '/account/profile',
  },
} as const
