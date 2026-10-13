import { StyleSheet, Text, View } from 'react-native'

import type { AppointmentStatus, EnquiryStatus } from '../../api/types'
import { fonts, onImage, useTheme, type ThemeColors } from '../../theme'

export type Tone = 'neutral' | 'accent' | 'success' | 'danger'

const toneColor = (tone: Tone, c: ThemeColors) => ({ neutral: c.textMuted, accent: c.accentText, success: c.success, danger: c.danger })[tone]

/**
 * A status written out in small capitals beside a square marker. The words carry the meaning;
 * the marker's colour only reinforces it.
 */
export function StatusLabel({ label, tone = 'neutral', accessibilityLabel }: { label: string; tone?: Tone; accessibilityLabel?: string }) {
  const { colors } = useTheme()
  const color = toneColor(tone, colors)
  return (
    <View accessible accessibilityLabel={accessibilityLabel ?? label} style={styles.status}>
      <View style={[styles.marker, { backgroundColor: color }]} />
      <Text style={[styles.text, { color }]} maxFontSizeMultiplier={1.4}>
        {label}
      </Text>
    </View>
  )
}

/** Marks temporary illustrative content so it is never mistaken for real BRIGHTHOMES work. */
export function IllustrativeTag({ overImage = false }: { overImage?: boolean }) {
  const { colors } = useTheme()
  return (
    <View
      accessible
      accessibilityLabel="Illustrative content. Not a real BRIGHTHOMES project or listing."
      style={[styles.tag, overImage ? styles.tagOverImage : { borderColor: colors.accent }]}
    >
      <Text style={[styles.tagText, { color: overImage ? onImage.text : colors.accentText }]} maxFontSizeMultiplier={1.4}>
        Illustrative
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
  new: 'accent',
  in_progress: 'accent',
  resolved: 'success',
  closed: 'neutral',
  requested: 'accent',
  confirmed: 'success',
  declined: 'danger',
  completed: 'neutral',
  cancelled: 'neutral',
}

export function RequestStatusBadge({ status }: { status: EnquiryStatus | AppointmentStatus }) {
  const label = requestStatusLabels[status]
  return <StatusLabel label={label} tone={requestTones[status]} accessibilityLabel={`Status: ${label}`} />
}

const styles = StyleSheet.create({
  status: { flexDirection: 'row', alignItems: 'center', gap: 7, alignSelf: 'flex-start' },
  marker: { width: 6, height: 6 },
  text: { fontFamily: fonts.semibold, fontSize: 10.5, letterSpacing: 1.6, textTransform: 'uppercase' },
  tag: { alignSelf: 'flex-start', borderWidth: 1, paddingHorizontal: 8, paddingVertical: 4 },
  tagOverImage: { borderColor: onImage.border, backgroundColor: onImage.chrome },
  tagText: { fontFamily: fonts.semibold, fontSize: 9.5, letterSpacing: 1.8, textTransform: 'uppercase' },
})
