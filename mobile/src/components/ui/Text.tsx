import { Text as NativeText, useWindowDimensions, type TextProps } from 'react-native'

import { scaledVariants, type as typeScale, useTheme, type ThemeColors, type TypeVariant } from '../../theme'

type Props = TextProps & { variant?: TypeVariant; color?: string }

const headings: ReadonlySet<TypeVariant> = new Set(['hero', 'display', 'title', 'heading', 'subheading', 'tabTitle', 'greeting', 'detailTitle', 'authTitle', 'sectionHeader'])
const muted: ReadonlySet<TypeVariant> = new Set(['meta', 'tabLabel'])

const defaultColor = (variant: TypeVariant, colors: ThemeColors) =>
  variant === 'eyebrow' || variant === 'overline'
    ? colors.accentText
    : variant === 'body' || variant === 'small' || variant === 'lead'
      ? colors.textMuted
      : muted.has(variant)
        ? colors.textSubtle
        : colors.text

/** Text set in one of the BRIGHTHOMES type styles, coloured for the active theme. */
export function Text({ variant = 'body', color, style, ...props }: Props) {
  const { colors } = useTheme()
  const { width } = useWindowDimensions()
  const base = typeScale[variant]
  // Headlines shrink a little on narrow phones (320–360pt) so they keep a considered rag.
  const scale = scaledVariants.has(variant) ? Math.min(1.06, Math.max(0.84, width / 390)) : 1
  const sized = scale === 1 ? base : { ...base, fontSize: base.fontSize * scale, lineHeight: base.lineHeight * scale }
  const heading = headings.has(variant)
  return <NativeText accessibilityRole={heading ? 'header' : undefined} maxFontSizeMultiplier={heading ? 1.35 : 1.8} {...props} style={[sized, { color: color ?? defaultColor(variant, colors) }, style]} />
}
