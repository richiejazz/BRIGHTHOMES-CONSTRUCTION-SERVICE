import { ArrowRight } from 'lucide-react-native'
import { Pressable, StyleSheet, View } from 'react-native'

import { colors, fonts, layout, space } from '../../theme'
import { Text } from './Text'

type Props = {
  eyebrow?: string
  title: string
  actionLabel?: string
  onAction?: () => void
  tone?: 'light' | 'dark'
}

/** Eyebrow rule + serif heading, with an optional "see all" link. */
export function SectionHeader({ eyebrow, title, actionLabel, onAction, tone = 'light' }: Props) {
  const dark = tone === 'dark'
  return (
    <View style={styles.wrap}>
      <View style={styles.copy}>
        {eyebrow ? (
          <View style={styles.eyebrowRow}>
            <View style={[styles.rule, { backgroundColor: dark ? colors.bronzeLight : colors.bronze }]} />
            <Text variant="eyebrow" color={dark ? colors.bronzeLight : colors.bronzeDark}>
              {eyebrow}
            </Text>
          </View>
        ) : null}
        <Text variant="title" color={dark ? colors.paper : colors.ink}>
          {title}
        </Text>
      </View>
      {actionLabel && onAction ? (
        <Pressable onPress={onAction} accessibilityRole="link" accessibilityLabel={actionLabel} hitSlop={8} style={({ pressed }) => [styles.action, pressed && { opacity: 0.6 }]}>
          <Text style={[styles.actionText, { color: dark ? colors.paper : colors.ink }]}>{actionLabel}</Text>
          <ArrowRight size={16} color={dark ? colors.bronzeLight : colors.bronzeDark} strokeWidth={1.6} />
        </Pressable>
      ) : null}
    </View>
  )
}

const styles = StyleSheet.create({
  wrap: { flexDirection: 'row', alignItems: 'flex-end', justifyContent: 'space-between', gap: space.lg, paddingHorizontal: layout.gutter },
  copy: { flex: 1, gap: space.sm },
  eyebrowRow: { flexDirection: 'row', alignItems: 'center', gap: space.sm },
  rule: { width: 24, height: 1 },
  action: { flexDirection: 'row', alignItems: 'center', gap: 6, minHeight: 44 },
  actionText: { fontFamily: fonts.semibold, fontSize: 14 },
})
