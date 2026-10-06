import { router } from 'expo-router'
import { ArrowRight } from 'lucide-react-native'
import type { ReactNode } from 'react'
import { Pressable, ScrollView, StyleSheet, View } from 'react-native'
import { useSafeAreaInsets } from 'react-native-safe-area-context'

import { isNotFound } from '../../api/errors'
import type { AppointmentStatus, Enquiry, EnquiryStatus } from '../../api/types'
import { colors, fonts, layout, space } from '../../theme'
import { RequestStatusBadge } from '../ui/Badges'
import { Button } from '../ui/Button'
import { EmptyState, ErrorState, LoadingBlock, Skeleton } from '../ui/States'
import { Text } from '../ui/Text'
import { requestSubject } from './RequestRows'

type Query<T> = { data?: T; isError: boolean; error: unknown; refetch: () => unknown }

/** Loading, not-found and error handling shared by the request detail screens. */
export function RequestDetailFrame<T>({ query, noun, children }: { query: Query<T>; noun: string; children: (data: T) => ReactNode }) {
  const insets = useSafeAreaInsets()
  if (query.data) {
    return (
      <ScrollView style={styles.screen} contentContainerStyle={[styles.content, { paddingBottom: insets.bottom + space.xxxl }]}>
        {children(query.data)}
      </ScrollView>
    )
  }
  return (
    <View style={[styles.screen, styles.content]}>
      {query.isError ? (
        isNotFound(query.error) ? (
          <EmptyState title={`${noun} not found`} message={`This ${noun.toLowerCase()} isn’t linked to your account.`} action={<Button label="Back to Activity" onPress={() => router.replace('/activity')} />} />
        ) : (
          <ErrorState error={query.error} onRetry={() => void query.refetch()} />
        )
      ) : (
        <LoadingBlock label={`Loading ${noun.toLowerCase()}`}>
          <Skeleton width="30%" height={12} />
          <Skeleton width="80%" height={34} style={styles.gap} />
          <Skeleton height={80} style={styles.gap} />
        </LoadingBlock>
      )}
    </View>
  )
}

/** Status badge with a plain-language explanation of what it means. */
export function StatusPanel({ status, note }: { status: EnquiryStatus | AppointmentStatus; note: string }) {
  return (
    <View style={styles.status}>
      <RequestStatusBadge status={status} />
      <Text variant="body" color={colors.graphite}>
        {note}
      </Text>
    </View>
  )
}

export function SubjectHeader({ record, eyebrow, fallback }: { record: Pick<Enquiry, 'project_summary' | 'service_summary'>; eyebrow: string; fallback: string }) {
  const subject = requestSubject(record, fallback)
  const href = record.project_summary ? `/projects/${record.project_summary.slug}` : record.service_summary ? `/services/${record.service_summary.slug}` : null
  return (
    <View style={styles.subject}>
      <Text variant="eyebrow">{eyebrow}</Text>
      <Text variant="display">{subject.title}</Text>
      {href ? (
        <Pressable onPress={() => router.push(href)} accessibilityRole="link" accessibilityLabel={`View ${subject.kind?.toLowerCase()}: ${subject.title}`} style={styles.link} hitSlop={6}>
          <Text style={styles.linkText}>View {subject.kind?.toLowerCase()}</Text>
          <ArrowRight size={15} color={colors.bronzeDark} strokeWidth={1.6} />
        </Pressable>
      ) : null}
    </View>
  )
}

/** Label/value rows; empty values are omitted rather than shown blank. */
export function DetailList({ title, rows }: { title: string; rows: { label: string; value: string | null | undefined }[] }) {
  return (
    <View style={styles.block}>
      <Text variant="heading">{title}</Text>
      <View style={styles.rows}>
        {rows
          .filter((row) => row.value)
          .map((row) => (
            <View key={row.label} style={styles.row} accessible accessibilityLabel={`${row.label}: ${row.value}`}>
              <Text variant="eyebrow" color={colors.stone500}>
                {row.label}
              </Text>
              <Text variant="label" style={styles.value}>
                {row.value}
              </Text>
            </View>
          ))}
      </View>
    </View>
  )
}

export function MessageBlock({ title, message }: { title: string; message: string }) {
  if (!message) return null
  return (
    <View style={styles.block}>
      <Text variant="heading">{title}</Text>
      <Text variant="body" color={colors.graphite} selectable>
        {message}
      </Text>
    </View>
  )
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: colors.paper },
  content: { paddingHorizontal: layout.gutter, paddingTop: space.xl, gap: space.xl },
  gap: { marginTop: space.lg },
  subject: { gap: space.md },
  link: { flexDirection: 'row', alignItems: 'center', gap: 6, minHeight: 44, alignSelf: 'flex-start' },
  linkText: { fontFamily: fonts.semibold, fontSize: 14, color: colors.ink, textDecorationLine: 'underline', textDecorationColor: colors.bronze },
  status: { gap: space.md, padding: space.lg, backgroundColor: colors.bone, borderLeftWidth: 2, borderLeftColor: colors.bronze },
  block: { gap: space.md },
  rows: { borderTopWidth: 1, borderTopColor: colors.ink },
  row: { paddingVertical: space.md, gap: 4, borderBottomWidth: 1, borderBottomColor: colors.stone200 },
  value: { fontFamily: fonts.medium },
})
