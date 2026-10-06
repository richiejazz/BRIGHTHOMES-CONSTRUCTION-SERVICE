import type { LucideIcon } from 'lucide-react-native'
import { ActivityIndicator, Pressable, StyleSheet, Text, View, type PressableProps, type StyleProp, type ViewStyle } from 'react-native'

import { colors, fonts, layout } from '../../theme'

export type ButtonVariant = 'primary' | 'accent' | 'secondary' | 'inverse' | 'link'

type Props = Omit<PressableProps, 'children' | 'style'> & {
  label: string
  variant?: ButtonVariant
  icon?: LucideIcon
  /** Place the icon after the label (used for forward arrows). */
  iconAfter?: boolean
  loading?: boolean
  fullWidth?: boolean
  style?: StyleProp<ViewStyle>
}

const palette: Record<ButtonVariant, { bg: string; fg: string; border: string; pressed: string }> = {
  primary: { bg: colors.ink, fg: colors.paper, border: colors.ink, pressed: colors.graphite },
  accent: { bg: colors.bronzeLight, fg: colors.ink, border: colors.bronzeLight, pressed: colors.bronze },
  secondary: { bg: 'transparent', fg: colors.ink, border: colors.ink, pressed: colors.bone },
  inverse: { bg: 'transparent', fg: colors.paper, border: 'rgba(246,243,238,0.5)', pressed: colors.graphite },
  link: { bg: 'transparent', fg: colors.ink, border: 'transparent', pressed: 'transparent' },
}

export function Button({ label, variant = 'primary', icon: Icon, iconAfter = false, loading = false, fullWidth = false, disabled, style, accessibilityLabel, accessibilityState, ...props }: Props) {
  const tone = palette[variant]
  const inactive = disabled || loading
  const isLink = variant === 'link'
  const iconNode = Icon && !loading ? <Icon size={18} color={tone.fg} strokeWidth={1.6} /> : null
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={accessibilityLabel ?? label}
      accessibilityState={{ disabled: Boolean(inactive), busy: loading, ...accessibilityState }}
      disabled={inactive}
      hitSlop={isLink ? 6 : undefined}
      style={({ pressed }) => [
        styles.base,
        isLink ? styles.link : { backgroundColor: pressed ? tone.pressed : tone.bg, borderColor: tone.border },
        fullWidth && styles.full,
        inactive && !loading && styles.disabled,
        pressed && isLink && styles.linkPressed,
        style,
      ]}
      {...props}
    >
      <View style={styles.content}>
        {loading && <ActivityIndicator size="small" color={tone.fg} />}
        {!iconAfter && iconNode}
        <Text style={[styles.label, { color: tone.fg }, isLink && styles.linkLabel]} maxFontSizeMultiplier={1.5}>
          {label}
        </Text>
        {iconAfter && iconNode}
      </View>
    </Pressable>
  )
}

const styles = StyleSheet.create({
  base: { minHeight: layout.touch, paddingHorizontal: 22, borderWidth: 1, borderRadius: layout.radius, justifyContent: 'center', alignItems: 'center' },
  full: { alignSelf: 'stretch' },
  content: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 10 },
  label: { fontFamily: fonts.semibold, fontSize: 15, letterSpacing: 0.3 },
  link: { paddingHorizontal: 0, borderWidth: 0, alignItems: 'flex-start', minHeight: 44 },
  linkLabel: { textDecorationLine: 'underline', textDecorationColor: colors.bronze },
  linkPressed: { opacity: 0.6 },
  disabled: { opacity: 0.45 },
})
