import type { AppointmentStatus, EnquiryStatus, ProjectStatus } from '../../api/types'

type Tone = 'neutral' | 'bronze' | 'success' | 'danger' | 'outline-dark'

const tones: Record<Tone, string> = {
  neutral: 'border-stone-300 text-stone-600',
  bronze: 'border-bronze/60 text-bronze-dark',
  success: 'border-success/40 text-success',
  danger: 'border-danger/40 text-danger',
  'outline-dark': 'border-paper/40 text-paper',
}

export function Badge({ children, tone = 'neutral', className = '' }: { children: string; tone?: Tone; className?: string }) {
  return <span className={`inline-flex items-center border px-2.5 py-1 text-[0.68rem] font-semibold uppercase tracking-[0.16em] ${tones[tone]} ${className}`}>{children}</span>
}

const projectStatus: Record<ProjectStatus, { label: string; tone: Tone }> = {
  completed: { label: 'Completed', tone: 'neutral' },
  ongoing: { label: 'Ongoing', tone: 'bronze' },
}

export function ProjectStatusBadge({ status, onDark = false }: { status: ProjectStatus; onDark?: boolean }) {
  const { label, tone } = projectStatus[status]
  return <Badge tone={onDark ? 'outline-dark' : tone}>{label}</Badge>
}

/** Always shown on demo records so placeholder content is never mistaken for real work. */
export function DemoBadge({ className = '' }: { className?: string }) {
  return (
    <span className={`inline-flex items-center bg-bronze-light px-2.5 py-1 text-[0.68rem] font-bold uppercase tracking-[0.16em] text-ink ${className}`} title="Demonstration content — not a real BRIGHTHOMES project">
      Demo content
    </span>
  )
}

const requestStatus: Record<EnquiryStatus | AppointmentStatus, { label: string; tone: Tone }> = {
  new: { label: 'Received', tone: 'bronze' },
  in_progress: { label: 'In progress', tone: 'bronze' },
  resolved: { label: 'Resolved', tone: 'success' },
  closed: { label: 'Closed', tone: 'neutral' },
  requested: { label: 'Requested', tone: 'bronze' },
  confirmed: { label: 'Confirmed', tone: 'success' },
  declined: { label: 'Declined', tone: 'danger' },
  completed: { label: 'Completed', tone: 'neutral' },
  cancelled: { label: 'Cancelled', tone: 'neutral' },
}

export function RequestStatusBadge({ status }: { status: EnquiryStatus | AppointmentStatus }) {
  const { label, tone } = requestStatus[status]
  return <Badge tone={tone}>{label}</Badge>
}
