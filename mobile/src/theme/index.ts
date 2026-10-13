export { darkColors, lightColors, onImage, type ThemeColors } from './palette'
export { ThemeProvider, makeStyles, useTheme, type ThemePreference } from './ThemeProvider'
export { fonts, scaledVariants, type, type TypeVariant } from './typography'

/** 4pt spacing scale. */
export const space = { xs: 4, sm: 8, md: 12, lg: 16, xl: 24, xxl: 32, xxxl: 48, section: 72 } as const

export const layout = {
  /** Horizontal screen gutter. */
  gutter: 20,
  /** Minimum touch target. */
  touch: 48,
  /** The brand is architectural: corners stay square. */
  radius: 0,
  hairline: 1,
  /** Content never stretches wider than this on large phones and the web preview. */
  maxWidth: 560,
} as const
