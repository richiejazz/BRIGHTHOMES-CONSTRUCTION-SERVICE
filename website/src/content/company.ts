// Verified BRIGHTHOMES company information supplied by the business.
// Services, achievements and projects come from the API; only copy with no API source lives here.
// Do not add statistics, testimonials, history or claims that have not been supplied.

export const company = {
  name: 'BRIGHTHOMES CONSTRUCTION SERVICE',
  shortName: 'BRIGHTHOMES',
  tagline: 'Building Dreams, Constructing Reality.',
  description:
    'BRIGHTHOMES CONSTRUCTION SERVICE is a trusted partner for premium residential and commercial construction in Nigeria, combining engineering excellence, modern design, rigorous project management, and end-to-end construction solutions.',
  phones: [
    { display: '0802 557 7265', href: 'tel:+2348025577265' },
    { display: '0901 102 1771', href: 'tel:+2349011021771' },
  ],
  email: 'brighthomesconstructionservice@gmail.com',
  address: {
    lines: ['KM 38 Lotto Complex, opposite Farapark Estate', 'Majek Bus Stop, Ibeju-Lekki, Lagos'],
    mapUrl:
      'https://www.google.com/maps/search/?api=1&query=' +
      encodeURIComponent('KM 38 Lotto Complex, opposite Farapark Estate, Majek Bus Stop, Ibeju-Lekki, Lagos'),
  },
  /**
   * WhatsApp chat link (e.g. "https://wa.me/234XXXXXXXXXX"). Left unset until the business
   * confirms which number, if any, accepts WhatsApp messages.
   */
  whatsappUrl: null as string | null,
} as const

export const trustPillars = [
  {
    title: 'End-to-End Project Management',
    body: 'One accountable partner from the first drawing to the finished building, coordinating design, approvals, supervision and construction.',
  },
  {
    title: 'Diaspora-Friendly Services',
    body: 'Clients building in Nigeria from abroad can rely on BRIGHTHOMES to manage the work on the ground on their behalf.',
  },
  {
    title: 'Uncompromising Quality',
    body: 'Engineering excellence and careful supervision applied to every stage of the build.',
  },
] as const

export const objectives = [
  { title: 'Quality Assurance', body: 'Work is checked against approved drawings and specifications as the build progresses.' },
  { title: 'Client Satisfaction', body: 'Projects are shaped around the client’s brief, with clear communication throughout.' },
  { title: 'Regulatory Compliance', body: 'Approvals and documentation are handled properly, so every building stands on a sound footing.' },
  { title: 'Timely Delivery', body: 'Careful planning and coordination keep projects moving toward completion.' },
] as const

/** Website top bar (spec §05): five sections; account access and the CTA sit to the right. */
export const primaryNav = [
  { to: '/construction', label: 'Construction' },
  { to: '/real-estate', label: 'Real Estate' },
  { to: '/services', label: 'Services' },
  { to: '/about', label: 'About' },
  { to: '/contact', label: 'Contact' },
] as const

/** Footer "Explore" column (spec §05 / W-01 footer). */
export const footerNav = [
  { to: '/construction', label: 'Construction' },
  { to: '/real-estate', label: 'Real Estate' },
  { to: '/services', label: 'Services' },
  { to: '/about', label: 'About' },
  { to: '/achievements', label: 'Achievements' },
  { to: '/contact', label: 'Contact' },
] as const
