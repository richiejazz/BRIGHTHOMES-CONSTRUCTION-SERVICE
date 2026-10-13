import { router } from 'expo-router'
import { ArrowRight } from 'lucide-react-native'
import { Pressable, StyleSheet, View } from 'react-native'

import type { Appointment, AppointmentStatus, Enquiry, EnquiryStatus } from '../../api/types'
import { formatShortDate, formatTime } from '../../lib/format'
import { makeStyles, space, useTheme } from '../../theme'
import { RequestStatusBadge, requestStatusLabels } from '../ui/Badges'
import { Skeleton } from '../ui/States'
import { Text } from '../ui/Text'

type RecordContext = Pick<Enquiry, 'project_summary' | 'service_summary' | 'property_summary'>
type Subject = { kind: 'Project' | 'Property' | 'Service' | null; title: string; href: string | null }

/** What a request is about: its property, project or service, or a general request. */
export function requestSubject(record: RecordContext, fallback: string): Subject {
  if (record.property_summary) return { kind: 'Property', title: record.property_summary.title, href: `/properties/${record.property_summary.slug}` }
  if (record.project_summary) return { kind: 'Project', title: record.project_summary.title, href: `/projects/${record.project_summary.slug}` }
  if (record.service_summary) return { kind: 'Service', title: record.service_summary.name, href: `/services/${record.service_summary.slug}` }
  return { kind: null, title: fallback, href: null }
}

/** The client's preferred slot, written out. Always a preference until staff confirm. */
export function preferredSlot(appointment: Pick<Appointment, 'preferred_time' | 'time_window'>) {
  if (appointment.preferred_time) return formatTime(appointment.preferred_time)
  return appointment.time_window || 'Any time'
}

// What each status means for the client, without implying anything the backend does not record.
export const enquiryStatusNotes: Record<EnquiryStatus, string> = {
  new: 'We’ve received your enquiry. A member of the team will be in touch using the details you provided.',
  in_progress: 'Our team is working on your enquiry.',
  resolved: 'Our team has marked this enquiry as resolved.',
  closed: 'This enquiry is closed. Send a new enquiry if you need anything else.',
}

export const appointmentStatusNotes: Record<AppointmentStatus, string> = {
  requested: 'This is a request, not yet a confirmed booking. Our team will contact you to confirm a suitable date and time.',
  confirmed: 'Our team has confirmed this consultation. If anything changes, we’ll contact you.',
  declined: 'We weren’t able to accommodate this request. Contact us or send a new request to arrange another time.',
  completed: 'This consultation has taken place.',
  cancelled: 'This consultation request has been cancelled.',
}

function Row({ href, label, hint, eyebrow, status, title, lines }: { href: string; label: string; hint: string; eyebrow: string; status: EnquiryStatus | AppointmentStatus; title: string; lines: { text: string; strong?: boolean }[] }) {
  const styles = useStyles()
  const { colors } = useTheme()
  return (
    <Pressable onPress={() => router.push(href)} accessibilityRole="link" accessibilityLabel={label} accessibilityHint={hint} style={({ pressed }) => [styles.row, pressed && styles.pressed]}>
      <View style={styles.top}>
        <Text variant="eyebrow" color={colors.textSubtle}>
          {eyebrow}
        </Text>
        <RequestStatusBadge status={status} />
      </View>
      <View style={styles.titleRow}>
        <Text variant="heading" numberOfLines={2} style={styles.title}>
          {title}
        </Text>
        <ArrowRight size={18} color={colors.accent} strokeWidth={1.4} />
      </View>
      {lines.map((line) => (
        <Text key={line.text} variant="small" color={line.strong ? colors.text : undefined} numberOfLines={2}>
          {line.text}
        </Text>
      ))}
    </Pressable>
  )
}

export function EnquiryRow({ enquiry }: { enquiry: Enquiry }) {
  const subject = requestSubject(enquiry, 'General enquiry')
  const submitted = formatShortDate(enquiry.created_at)
  return (
    <Row
      href={`/enquiries/${enquiry.id}`}
      label={`${subject.kind ? `${subject.kind}: ` : ''}${subject.title}. Sent ${submitted}. Status: ${requestStatusLabels[enquiry.status]}`}
      hint="Opens enquiry details"
      eyebrow={`${subject.kind ?? 'Enquiry'} · Sent ${submitted}`}
      status={enquiry.status}
      title={subject.title}
      lines={[{ text: enquiry.message }]}
    />
  )
}

export function AppointmentRow({ appointment }: { appointment: Appointment }) {
  const subject = requestSubject(appointment, 'General consultation')
  const date = formatShortDate(appointment.preferred_date)
  const slot = preferredSlot(appointment)
  return (
    <Row
      href={`/appointments/${appointment.id}`}
      label={`${subject.kind ? `${subject.kind}: ` : ''}${subject.title}. Preferred ${date}, ${slot}. Status: ${requestStatusLabels[appointment.status]}`}
      hint="Opens consultation request details"
      eyebrow={subject.kind ?? 'Consultation'}
      status={appointment.status}
      title={subject.title}
      lines={[{ text: `Preferred ${date} · ${slot}`, strong: true }]}
    />
  )
}

export function RequestRowSkeleton() {
  const styles = useStyles()
  return (
    <View style={styles.row}>
      <Skeleton width="35%" height={11} />
      <Skeleton width="75%" height={24} />
      <Skeleton width="55%" height={13} />
    </View>
  )
}

const useStyles = makeStyles((c) =>
  StyleSheet.create({
    row: { gap: space.sm, paddingVertical: space.xl, borderBottomWidth: StyleSheet.hairlineWidth, borderBottomColor: c.border },
    pressed: { backgroundColor: c.surface },
    top: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: space.md, flexWrap: 'wrap' },
    titleRow: { flexDirection: 'row', alignItems: 'center', gap: space.md },
    title: { flex: 1 },
  }),
)
