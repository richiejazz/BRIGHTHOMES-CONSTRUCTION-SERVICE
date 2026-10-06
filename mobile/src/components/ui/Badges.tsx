import { StyleSheet, Text, View } from 'react-native'

import type { AppointmentStatus, EnquiryStatus, ProjectStatus } from '../../api/types'
import { colors, fonts } from '../../theme'

type Tone = 'neutral' | 'bronze' | 'success' | 'danger' | 'onDark'

const tones: Record<Tone, { border: string; text: string }> = {
  neutral: { border: colors.stone300, text: colors.stone600 },
  bronze: { border: colors.bronze, text: colors.bronzeDark },
  success: { border: 'rgba(63,107,74,0.45)', text: colors.success },
  danger: { border: 'rgba(155,59,47,0.45)', text: colors.danger },
  onDark: { border: 'rgba(246,243,238,0.5)', text: colors.paper },
}

/** Status is always written out, never conveyed by colour alone. */
export function Badge({ label, tone = 'neutral', accessibilityLabel }: { label: string; tone?: Tone; accessibilityLabel?: string }) {
  const { border, text } = tones[tone]
  return (
    <View accessible accessibilityLabel={accessibilityLabel ?? label} style={[styles.badge, { borderColor: border }]}>
      <Text style={[styles.text, { color: text }]} maxFontSizeMultiplier={1.4}>
        {label}
      </Text>
    </View>
  )
}

const projectStatus: Record<ProjectStatus, { label: string; tone: Tone }> = {
  completed: { label: 'Completed', tone: 'neutral' },
  ongoing: { label: 'Ongoing', tone: 'bronze' },
}

export function ProjectStatusBadge({ status, onDark = false }: { status: ProjectStatus; onDark?: boolean }) {
  const { label, tone } = projectStatus[status]
  return <Badge label={label} tone={onDark ? 'onDark' : tone} accessibilityLabel={`Project status: ${label}`} />
}

/** Shown on every demo record so placeholder content is never mistaken for real work. */
export function DemoBadge() {
  return (
    <View accessible accessibilityLabel="Demo content. Not a real BRIGHTHOMES project." style={styles.demo}>
      <Text style={styles.demoText} maxFontSizeMultiplier={1.4}>
        Demo
      </Text>
    </View>
  )
}

// Labels follow the backend status choices exactly.
export const requestStatusLabels: Record<EnquiryStatus | AppointmentStatus, string> = {
  new: 'New',
  in_progress: 'In progress',
  resolved: 'Resolved',
  closed: 'Closed',
  requested: 'Requested',
  confirmed: 'Confirmed',
  declined: 'Declined',
  completed: 'Completed',
  cancelled: 'Cancelled',
}

const requestTones: Record<EnquiryStatus | AppointmentStatus, Tone> = {
  new: 'bronze',
  in_progress: 'bronze',
  resolved: 'success',
  closed: 'neutral',
  requested: 'bronze',
  confirmed: 'success',
  declined: 'danger',
  completed: 'neutral',
  cancelled: 'neutral',
}

export function RequestStatusBadge({ status }: { status: EnquiryStatus | AppointmentStatus }) {
  const label = requestStatusLabels[status]
  return <Badge label={label} tone={requestTones[status]} accessibilityLabel={`Status: ${label}`} />
}

const styles = StyleSheet.create({
  badge: { alignSelf: 'flex-start', borderWidth: 1, paddingHorizontal: 8, paddingVertical: 4 },
  text: { fontFamily: fonts.semibold, fontSize: 10.5, letterSpacing: 1.6, textTransform: 'uppercase' },
  demo: { alignSelf: 'flex-start', backgroundColor: colors.bronzeLight, paddingHorizontal: 8, paddingVertical: 4 },
  demoText: { fontFamily: fonts.bold, fontSize: 10.5, letterSpacing: 1.6, textTransform: 'uppercase', color: colors.ink },
})
