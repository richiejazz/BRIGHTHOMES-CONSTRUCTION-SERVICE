import type { ReactNode } from 'react'
import { StyleSheet, View } from 'react-native'

import { colors, layout, space } from '../../theme'
import { Text } from './Text'

/** Editorial title block at the top of each tab screen. */
export function PageHeader({ eyebrow, title, intro, children }: { eyebrow: string; title: string; intro?: string; children?: ReactNode }) {
  return (
    <View style={styles.wrap}>
      <View style={styles.eyebrowRow}>
        <View style={styles.rule} />
        <Text variant="eyebrow">{eyebrow}</Text>
      </View>
      <Text variant="display">{title}</Text>
      {intro ? <Text variant="body">{intro}</Text> : null}
      {children}
    </View>
  )
}

const styles = StyleSheet.create({
  wrap: { paddingHorizontal: layout.gutter, paddingTop: space.xl, paddingBottom: space.lg, gap: space.md },
  eyebrowRow: { flexDirection: 'row', alignItems: 'center', gap: space.sm },
  rule: { width: 24, height: 1, backgroundColor: colors.bronze },
})
