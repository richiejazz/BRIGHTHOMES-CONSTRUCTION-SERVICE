import { router } from 'expo-router'
import type { ReactNode } from 'react'
import { ScrollView, StyleSheet, View } from 'react-native'
import { useSafeAreaInsets } from 'react-native-safe-area-context'

import { isNotFound } from '../../api/errors'
import type { AppointmentStatus, Enquiry, EnquiryStatus } from '../../api/types'
import { layout, makeStyles, space } from '../../theme'
import { RequestStatusBadge } from '../ui/Badges'
import { Button } from '../ui/Button'
import { Eyebrow, FactRow, TextLink } from '../ui/Editorial'
import { EmptyState, ErrorState, LoadingBlock, Skeleton } from '../ui/States'
import { Text } from '../ui/Text'
import { requestSubject } from './RequestRows'

type Query<T> = { data?: T; isError: boolean; error: unknown; refetch: () => unknown }

/** Loading, not-found and error handling shared by the request detail screens. */
export function RequestDetailFrame<T>({ query, noun, children }: { query: Query<T>; noun: string; children: (data: T) => ReactNode }) {
  const insets = useSafeAreaInsets()
  const styles = useStyles()
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

/** Status with a plain-language explanation of what it means. */
export function StatusPanel({ status, note }: { status: EnquiryStatus | AppointmentStatus; note: string }) {
  const styles = useStyles()
  return (
    <View style={styles.status}>
      <RequestStatusBadge status={status} />
      <Text variant="body">{note}</Text>
    </View>
  )
}

export function SubjectHeader({ record, eyebrow, fallback }: { record: Pick<Enquiry, 'project_summary' | 'service_summary' | 'property_summary'>; eyebrow: string; fallback: string }) {
  const styles = useStyles()
  const subject = requestSubject(record, fallback)
  return (
    <View style={styles.subject}>
      <Eyebrow label={subject.kind ? `${eyebrow} · ${subject.kind}` : eyebrow} />
      <Text variant="display">{subject.title}</Text>
      {subject.href ? <TextLink label={`View ${subject.kind?.toLowerCase()}`} href={subject.href} /> : null}
    </View>
  )
}

/** Label/value rows; empty values are omitted rather than shown blank. */
export function DetailList({ title, rows }: { title: string; rows: { label: string; value: string | null | undefined }[] }) {
  const styles = useStyles()
  const visible = rows.filter((row): row is { label: string; value: string } => Boolean(row.value))
  return (
    <View style={styles.block}>
      <Text variant="heading">{title}</Text>
      <View style={styles.rows}>
        {visible.map((row, index) => (
          <FactRow key={row.label} label={row.label} value={row.value} last={index === visible.length - 1} />
        ))}
      </View>
    </View>
  )
}

export function MessageBlock({ title, message }: { title: string; message: string }) {
  const styles = useStyles()
  if (!message) return null
  return (
    <View style={styles.block}>
      <Text variant="heading">{title}</Text>
      <Text variant="lead" selectable style={styles.message}>
        {message}
      </Text>
    </View>
  )
}

const useStyles = makeStyles((c) =>
  StyleSheet.create({
    screen: { flex: 1, backgroundColor: c.background },
    content: { paddingHorizontal: layout.gutter, paddingTop: space.xl, gap: space.xxl, width: '100%', maxWidth: layout.maxWidth, alignSelf: 'center' },
    gap: { marginTop: space.lg },
    subject: { gap: space.md },
    status: { gap: space.md, paddingVertical: space.lg, paddingHorizontal: space.lg, backgroundColor: c.surface, borderLeftWidth: 2, borderLeftColor: c.accent },
    block: { gap: space.md },
    rows: { borderTopWidth: 1, borderTopColor: c.borderStrong },
    message: { color: c.text, borderLeftWidth: 1, borderLeftColor: c.border, paddingLeft: space.lg },
  }),
)
