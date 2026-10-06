import { Text as NativeText, type TextProps } from 'react-native'

import { type as typeScale, type TypeVariant } from '../../theme'

type Props = TextProps & { variant?: TypeVariant; color?: string }

/** Text set in one of the BRIGHTHOMES type styles. */
export function Text({ variant = 'body', color, style, ...props }: Props) {
  const heading = variant === 'hero' || variant === 'display' || variant === 'title' || variant === 'heading'
  return <NativeText accessibilityRole={heading ? 'header' : undefined} maxFontSizeMultiplier={heading ? 1.4 : 1.8} {...props} style={[typeScale[variant], color ? { color } : null, style]} />
}
