import { router } from 'expo-router'
import { CalendarDays, ChevronRight } from 'lucide-react-native'
import { Pressable, StyleSheet, View } from 'react-native'

import type { Appointment, AppointmentStatus, Enquiry, EnquiryStatus } from '../../api/types'
import { formatShortDate, formatTime } from '../../lib/format'
import { colors, space } from '../../theme'
import { RequestStatusBadge, requestStatusLabels } from '../ui/Badges'
import { Skeleton } from '../ui/States'
import { Text } from '../ui/Text'

type RecordContext = Pick<Enquiry, 'project_summary' | 'service_summary'>

/** What a request is about: its project, its service, or a general request. */
export function requestSubject(record: RecordContext, fallback: string) {
  if (record.project_summary) return { kind: 'Project', title: record.project_summary.title }
  if (record.service_summary) return { kind: 'Service', title: record.service_summary.name }
  return { kind: null, title: fallback }
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

export function EnquiryRow({ enquiry }: { enquiry: Enquiry }) {
  const subject = requestSubject(enquiry, 'General enquiry')
  const submitted = formatShortDate(enquiry.created_at)
  return (
    <Pressable
      onPress={() => router.push(`/enquiries/${enquiry.id}`)}
      accessibilityRole="link"
      accessibilityLabel={`${subject.kind ? `${subject.kind}: ` : ''}${subject.title}. Sent ${submitted}. Status: ${requestStatusLabels[enquiry.status]}`}
      accessibilityHint="Opens enquiry details"
      style={({ pressed }) => [styles.row, pressed && styles.pressed]}
    >
      <View style={styles.copy}>
        <View style={styles.top}>
          <Text variant="eyebrow" color={colors.stone500}>
            {subject.kind ?? 'Enquiry'}
          </Text>
          <RequestStatusBadge status={enquiry.status} />
        </View>
        <Text variant="heading" numberOfLines={2}>
          {subject.title}
        </Text>
        <Text variant="small" numberOfLines={2}>
          {enquiry.message}
        </Text>
        <Text variant="small" color={colors.stone500}>
          Sent {submitted}
        </Text>
      </View>
      <ChevronRight size={18} color={colors.stone500} strokeWidth={1.5} />
    </Pressable>
  )
}

export function AppointmentRow({ appointment }: { appointment: Appointment }) {
  const subject = requestSubject(appointment, 'General consultation')
  const date = formatShortDate(appointment.preferred_date)
  const slot = preferredSlot(appointment)
  return (
    <Pressable
      onPress={() => router.push(`/appointments/${appointment.id}`)}
      accessibilityRole="link"
      accessibilityLabel={`${subject.kind ? `${subject.kind}: ` : ''}${subject.title}. Preferred ${date}, ${slot}. Status: ${requestStatusLabels[appointment.status]}`}
      accessibilityHint="Opens consultation request details"
      style={({ pressed }) => [styles.row, pressed && styles.pressed]}
    >
      <View style={styles.copy}>
        <View style={styles.top}>
          <Text variant="eyebrow" color={colors.stone500}>
            {subject.kind ?? 'Consultation'}
          </Text>
          <RequestStatusBadge status={appointment.status} />
        </View>
        <Text variant="heading" numberOfLines={2}>
          {subject.title}
        </Text>
        <View style={styles.slot}>
          <CalendarDays size={15} color={colors.bronzeDark} strokeWidth={1.6} />
          <Text variant="small" color={colors.graphite}>
            Preferred: {date} · {slot}
          </Text>
        </View>
      </View>
      <ChevronRight size={18} color={colors.stone500} strokeWidth={1.5} />
    </Pressable>
  )
}

export function RequestRowSkeleton() {
  return (
    <View style={styles.row}>
      <View style={styles.copy}>
        <Skeleton width="30%" height={11} />
        <Skeleton width="75%" height={22} />
        <Skeleton width="50%" height={13} />
      </View>
    </View>
  )
}

const styles = StyleSheet.create({
  row: { flexDirection: 'row', alignItems: 'center', gap: space.md, paddingVertical: space.lg, borderBottomWidth: 1, borderBottomColor: colors.stone200 },
  pressed: { backgroundColor: colors.bone },
  copy: { flex: 1, gap: space.sm },
  top: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: space.md },
  slot: { flexDirection: 'row', alignItems: 'center', gap: 6 },
})
