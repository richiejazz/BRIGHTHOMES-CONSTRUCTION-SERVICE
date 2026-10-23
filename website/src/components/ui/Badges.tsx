import type { AppointmentStatus, EnquiryStatus, ListingType, ProjectStatus, PropertyStatus } from '../../api/types'
import { consultationStatusLabels, enquiryStatusLabels, listingTypeLabels, projectStatusLabels, propertyStatusLabels } from '../../lib/labels'

// Status vocabulary (spec §03 "Status colours", §18). Status is never shown by colour alone:
// every dot or pill carries its label, and pill text stays at ink/bronze contrast in both themes.

const pillBase = 'inline-flex min-h-6 items-center whitespace-nowrap px-2.5 text-[10px] font-semibold tracking-[0.18em] uppercase'

type PillTone = 'requested' | 'confirmed' | 'review' | 'responded' | 'neutral'
const pillTones: Record<PillTone, string> = {
  requested: 'border border-bronze text-bronze',
  confirmed: 'bg-ink text-bg',
  review: 'border border-control-line text-ink',
  responded: 'bg-stone text-ink',
  neutral: 'border border-control-line text-ink2',
}

function Pill({ tone, children }: { tone: PillTone; children: string }) {
  return <span className={`${pillBase} ${pillTones[tone]}`}>{children}</span>
}

const consultationTone: Record<AppointmentStatus, PillTone> = { requested: 'requested', confirmed: 'confirmed', declined: 'neutral', completed: 'responded', cancelled: 'neutral' }
const enquiryTone: Record<EnquiryStatus, PillTone> = { new: 'requested', in_progress: 'review', resolved: 'responded', closed: 'neutral' }

/** Consultation status. "Requested" reads "Requested · awaiting confirmation" where there is room. */
export function ConsultationPill({ status, long = false }: { status: AppointmentStatus; long?: boolean }) {
  return <Pill tone={consultationTone[status]}>{status === 'requested' && long ? 'Requested · awaiting confirmation' : consultationStatusLabels[status]}</Pill>
}

export function EnquiryPill({ status }: { status: EnquiryStatus }) {
  return <Pill tone={enquiryTone[status]}>{enquiryStatusLabels[status]}</Pill>
}

type DotKind = 'ok' | 'ring' | 'dashed' | 'mute' | 'ink'

function Dot({ kind }: { kind: DotKind }) {
  const style: Record<DotKind, string> = {
    ok: 'bg-ok',
    ring: 'border-[1.5px] border-bronze',
    dashed: 'border-[1.5px] border-dashed border-bronze',
    mute: 'bg-mute',
    ink: 'bg-ink',
  }
  return <span aria-hidden="true" className={`inline-block size-[7px] shrink-0 rounded-full ${style[kind]}`} />
}

const propertyDot: Record<PropertyStatus, DotKind> = { available: 'ok', reserved: 'ring', coming_soon: 'dashed', sold: 'mute', rented: 'mute', unavailable: 'mute' }

/** Availability: dot + label. Illustrative listings make no availability claim. */
export function PropertyStatusLabel({ status, demo, className = '' }: { status: PropertyStatus; demo?: boolean; className?: string }) {
  return (
    <span className={`inline-flex items-center gap-2 text-[12px] text-ink2 ${className}`}>
      <Dot kind={demo ? 'dashed' : propertyDot[status]} />
      {demo ? 'Illustrative' : propertyStatusLabels[status]}
    </span>
  )
}

/** §15: Completed = ink dot; Ongoing (in progress) = bronze ring. */
export function ProjectStatusLabel({ status, className = '' }: { status: ProjectStatus; className?: string }) {
  return (
    <span className={`inline-flex items-center gap-2 text-[12px] text-ink2 ${className}`}>
      <Dot kind={status === 'completed' ? 'ink' : 'ring'} />
      {projectStatusLabels[status]}
    </span>
  )
}

/** §14 listing tag: top-left on the image, 10px caps on --bg; `inverse` (ink fill) inside panels. */
export function ListingTag({ listing, inverse = false, className = '' }: { listing: ListingType; inverse?: boolean; className?: string }) {
  return <span className={`${pillBase} ${inverse ? 'bg-ink text-bg' : 'bg-bg text-ink'} ${className}`}>{listingTypeLabels[listing]}</span>
}

/** §16 placeholder label: "Illustrative image" chip, kept for any future placeholder. */
export function IllustrativeLabel({ children = 'Illustrative image', className = '' }: { children?: string; className?: string }) {
  return <span className={`${pillBase} bg-black/65 text-[#EEE8DD] ${className}`}>{children}</span>
}
