import type { ReactNode } from 'react'
import { ActivityIndicator, ScrollView, StyleSheet, View } from 'react-native'

import { layout, makeStyles, space, useTheme } from '../../theme'
import { Text } from '../ui/Text'

/** A horizontally scrolling row of filter chips. */
export function ChipRow({ label, children }: { label: string; children: ReactNode }) {
  const styles = useStyles()
  return (
    <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.chips} accessibilityLabel={label}>
      {children}
    </ScrollView>
  )
}

/** "12 properties" with a quiet refresh indicator, and room for filter actions on the right. */
export function ResultCount({ total, noun, plural, fetching, actions }: { total: number | undefined; noun: string; plural: string; fetching: boolean; actions?: ReactNode }) {
  const styles = useStyles()
  const { colors } = useTheme()
  return (
    <View style={styles.countRow}>
      <View style={styles.countLeft}>
        <Text variant="eyebrow" color={colors.textSubtle} accessibilityLiveRegion="polite">
          {total === undefined ? ' ' : `${total} ${total === 1 ? noun : plural}`}
        </Text>
        {fetching ? <ActivityIndicator size="small" color={colors.accent} /> : null}
      </View>
      {actions}
    </View>
  )
}

export const useBrowserStyles = makeStyles(() =>
  StyleSheet.create({
    list: { paddingBottom: space.xxxl },
    card: { marginHorizontal: layout.gutter, marginTop: space.xl },
    state: { marginHorizontal: layout.gutter, marginTop: space.xl },
    footer: { marginVertical: space.xl },
    filters: { gap: space.md, paddingTop: space.lg },
  }),
)

const useStyles = makeStyles((c) =>
  StyleSheet.create({
    chips: { paddingHorizontal: layout.gutter, gap: space.sm },
    countRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: space.md, marginHorizontal: layout.gutter, marginTop: space.lg, minHeight: 44, borderBottomWidth: StyleSheet.hairlineWidth, borderBottomColor: c.border },
    countLeft: { flexDirection: 'row', alignItems: 'center', gap: space.sm },
  }),
)
