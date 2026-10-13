import { router, type Href } from 'expo-router'
import { ArrowRight, ArrowUpRight } from 'lucide-react-native'
import type { ReactNode } from 'react'
import { Pressable, StyleSheet, View, type StyleProp, type ViewStyle } from 'react-native'

import { fonts, layout, makeStyles, space, useTheme } from '../../theme'
import { Text } from './Text'

// The editorial building blocks shared by every screen: eyebrow rules, section headings,
// numbered index rows and hairlines.

/** A short bronze rule followed by an uppercase label, optionally numbered ("01"). */
export function Eyebrow({ label, index, color, ruleColor, style }: { label: string; index?: string; color?: string; ruleColor?: string; style?: StyleProp<ViewStyle> }) {
  const { colors } = useTheme()
  return (
    <View style={[styles.eyebrow, style]}>
      {index ? (
        <Text variant="eyebrow" color={color}>
          {index}
        </Text>
      ) : null}
      <View style={[styles.rule, { backgroundColor: ruleColor ?? colors.accent }]} />
      <Text variant="eyebrow" color={color} style={styles.shrink}>
        {label}
      </Text>
    </View>
  )
}

type SectionHeaderProps = {
  eyebrow?: string
  index?: string
  title: string
  intro?: string
  actionLabel?: string
  href?: Href
  tone?: 'page' | 'inverse'
  style?: StyleProp<ViewStyle>
}

/** Large serif section title with an optional "view all" link set beneath it. */
export function SectionHeader({ eyebrow, index, title, intro, actionLabel, href, tone = 'page', style }: SectionHeaderProps) {
  const { colors } = useTheme()
  const inverse = tone === 'inverse'
  const text = inverse ? colors.inverse.text : colors.text
  return (
    <View style={[styles.section, style]}>
      {eyebrow ? <Eyebrow label={eyebrow} index={index} color={inverse ? colors.inverse.accent : undefined} ruleColor={inverse ? colors.inverse.accent : undefined} /> : null}
      <Text variant="title" color={text}>
        {title}
      </Text>
      {intro ? (
        <Text variant="body" color={inverse ? colors.inverse.textMuted : undefined}>
          {intro}
        </Text>
      ) : null}
      {actionLabel && href ? <TextLink label={actionLabel} href={href} color={text} /> : null}
    </View>
  )
}

/** Small uppercase link with an arrow, used for "View all" style navigation. */
export function TextLink({ label, href, onPress, color, external = false }: { label: string; href?: Href; onPress?: () => void; color?: string; external?: boolean }) {
  const { colors } = useTheme()
  const Icon = external ? ArrowUpRight : ArrowRight
  return (
    <Pressable
      onPress={onPress ?? (() => href && router.push(href))}
      accessibilityRole="link"
      accessibilityLabel={label}
      hitSlop={8}
      style={({ pressed }) => [styles.link, pressed && styles.pressed]}
    >
      <Text style={[styles.linkText, { color: color ?? colors.text }]}>{label}</Text>
      <Icon size={15} color={colors.accent} strokeWidth={1.6} />
    </Pressable>
  )
}

/** A full-width hairline. */
export function Rule({ strong = false, style }: { strong?: boolean; style?: StyleProp<ViewStyle> }) {
  const { colors } = useTheme()
  return <View style={[{ height: StyleSheet.hairlineWidth * (strong ? 2 : 1), backgroundColor: strong ? colors.borderStrong : colors.border }, style]} />
}

/**
 * Compact large-title header for tab and stack screens, app-style: the title, an optional short
 * subtitle and an optional control on the right (avatar, filter button).
 */
export function ScreenHeader({ title, subtitle, accessory, children }: { title: string; subtitle?: string; accessory?: ReactNode; children?: ReactNode }) {
  const themed = usePageHeaderStyles()
  return (
    <View style={themed.wrap}>
      <View style={themed.titleRow}>
        <Text variant="title" style={themed.title}>
          {title}
        </Text>
        {accessory}
      </View>
      {subtitle ? <Text variant="small">{subtitle}</Text> : null}
      {children}
    </View>
  )
}

/** In-screen section title with a "See all" action on the right, as in native app feeds. */
export function RowHeader({ title, actionLabel = 'See all', onAction, style }: { title: string; actionLabel?: string; onAction?: () => void; style?: StyleProp<ViewStyle> }) {
  const themed = usePageHeaderStyles()
  const { colors } = useTheme()
  return (
    <View style={[themed.rowHeader, style]}>
      <Text variant="heading" style={themed.title}>
        {title}
      </Text>
      {onAction ? (
        <Pressable onPress={onAction} accessibilityRole="link" accessibilityLabel={`${actionLabel}: ${title}`} hitSlop={10} style={({ pressed }) => [themed.rowAction, pressed && styles.pressed]}>
          <Text style={[themed.rowActionText, { color: colors.accentText }]}>{actionLabel}</Text>
        </Pressable>
      ) : null}
    </View>
  )
}

/** A label/value pair on a hairline, used for specification and detail lists. */
export function FactRow({ label, value, last = false }: { label: string; value: ReactNode; last?: boolean }) {
  const themed = usePageHeaderStyles()
  return (
    <View style={[themed.fact, last && themed.factLast]} accessible accessibilityLabel={typeof value === 'string' ? `${label}: ${value}` : undefined}>
      <Text variant="eyebrow" style={themed.factLabel}>
        {label}
      </Text>
      {typeof value === 'string' ? (
        <Text variant="label" style={themed.factValue}>
          {value}
        </Text>
      ) : (
        value
      )}
    </View>
  )
}

const usePageHeaderStyles = makeStyles((c) =>
  StyleSheet.create({
    wrap: { paddingHorizontal: layout.gutter, paddingTop: space.md, paddingBottom: space.lg, gap: space.xs },
    titleRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: space.md, minHeight: 48 },
    title: { flex: 1 },
    rowHeader: { flexDirection: 'row', alignItems: 'baseline', justifyContent: 'space-between', gap: space.md, paddingHorizontal: layout.gutter },
    rowAction: { minHeight: 44, justifyContent: 'center' },
    rowActionText: { fontFamily: fonts.semibold, fontSize: 13 },
    fact: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', gap: space.lg, paddingVertical: space.md + 2, borderBottomWidth: StyleSheet.hairlineWidth, borderBottomColor: c.border },
    factLast: { borderBottomWidth: 0 },
    factLabel: { color: c.textSubtle, paddingTop: 3 },
    factValue: { flex: 1, textAlign: 'right' },
  }),
)

const styles = StyleSheet.create({
  eyebrow: { flexDirection: 'row', alignItems: 'center', gap: space.sm },
  rule: { width: 22, height: 1 },
  shrink: { flexShrink: 1 },
  section: { gap: space.md },
  link: { flexDirection: 'row', alignItems: 'center', gap: 8, minHeight: 44, alignSelf: 'flex-start' },
  linkText: { fontFamily: fonts.semibold, fontSize: 12, letterSpacing: 1.6, textTransform: 'uppercase' },
  pressed: { opacity: 0.6 },
})
