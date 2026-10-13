import type { LucideIcon } from 'lucide-react-native'
import { ActivityIndicator, Pressable, StyleSheet, Text, View, type PressableProps, type StyleProp, type ViewStyle } from 'react-native'

import { fonts, layout, onImage, useTheme, type ThemeColors } from '../../theme'

/**
 * - primary: solid, the inverse of the page
 * - accent: bronze fill, for the single most important action on a screen
 * - secondary: outlined
 * - onImage: outlined in light tones, for use over photography or dark bands
 * - link: text with an underline rule
 */
export type ButtonVariant = 'primary' | 'accent' | 'secondary' | 'onImage' | 'link'

type Props = Omit<PressableProps, 'children' | 'style'> & {
  label: string
  variant?: ButtonVariant
  icon?: LucideIcon
  /** Place the icon after the label (used for forward arrows). */
  iconAfter?: boolean
  loading?: boolean
  fullWidth?: boolean
  size?: 'regular' | 'compact'
  style?: StyleProp<ViewStyle>
}

function tones(variant: ButtonVariant, c: ThemeColors) {
  switch (variant) {
    case 'primary':
      return { bg: c.primaryFill, fg: c.onPrimary, border: c.primaryFill }
    case 'accent':
      return { bg: c.accentFill, fg: c.onAccent, border: c.accentFill }
    case 'secondary':
      return { bg: 'transparent', fg: c.text, border: c.borderStrong }
    case 'onImage':
      return { bg: 'transparent', fg: onImage.text, border: onImage.border }
    case 'link':
      return { bg: 'transparent', fg: c.text, border: 'transparent' }
  }
}

export function Button({ label, variant = 'primary', icon: Icon, iconAfter = false, loading = false, fullWidth = false, size = 'regular', disabled, style, accessibilityLabel, accessibilityState, ...props }: Props) {
  const { colors } = useTheme()
  const tone = tones(variant, colors)
  const inactive = disabled || loading
  const isLink = variant === 'link'
  const iconNode = Icon && !loading ? <Icon size={16} color={tone.fg} strokeWidth={1.6} /> : null
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={accessibilityLabel ?? label}
      accessibilityState={{ disabled: Boolean(inactive), busy: loading, ...accessibilityState }}
      disabled={inactive}
      hitSlop={isLink ? 6 : undefined}
      style={({ pressed }) => [
        styles.base,
        size === 'compact' && styles.compact,
        isLink ? styles.link : { backgroundColor: tone.bg, borderColor: tone.border },
        fullWidth && styles.full,
        inactive && !loading && styles.disabled,
        pressed && (isLink ? styles.linkPressed : styles.pressed),
        style,
      ]}
      {...props}
    >
      <View style={styles.content}>
        {loading && <ActivityIndicator size="small" color={tone.fg} />}
        {!iconAfter && iconNode}
        <Text style={[isLink ? styles.linkLabel : styles.label, { color: tone.fg }, isLink && { textDecorationColor: colors.accent }]} maxFontSizeMultiplier={1.5}>
          {label}
        </Text>
        {iconAfter && iconNode}
      </View>
    </Pressable>
  )
}

const styles = StyleSheet.create({
  base: { minHeight: 52, paddingHorizontal: 24, borderWidth: 1, borderRadius: layout.radius, justifyContent: 'center', alignItems: 'center' },
  compact: { minHeight: layout.touch, paddingHorizontal: 18 },
  full: { alignSelf: 'stretch' },
  content: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 10 },
  label: { fontFamily: fonts.semibold, fontSize: 12.5, letterSpacing: 1.6, textTransform: 'uppercase', textAlign: 'center' },
  link: { paddingHorizontal: 0, borderWidth: 0, alignItems: 'flex-start', minHeight: 44 },
  linkLabel: { fontFamily: fonts.semibold, fontSize: 14, textDecorationLine: 'underline' },
  pressed: { opacity: 0.82, transform: [{ scale: 0.985 }] },
  linkPressed: { opacity: 0.6 },
  disabled: { opacity: 0.45 },
})
