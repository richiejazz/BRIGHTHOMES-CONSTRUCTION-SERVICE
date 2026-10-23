export { darkColors, lightColors, onImage, type ThemeColors } from './palette'
export { ThemeProvider, makeStyles, useTheme, type Elevation, type ThemePreference } from './ThemeProvider'
export { darkTokens, lightTokens, motion, radius, size, type AppTokens } from './tokens'
export { fonts, scaledVariants, type, type TypeVariant } from './typography'

/** 4pt spacing scale. */
export const space = { xs: 4, sm: 8, md: 12, lg: 16, xl: 24, xxl: 32, xxxl: 48, section: 72 } as const

export const layout = {
  /** Horizontal screen gutter. */
  gutter: 20,
  /** Minimum touch target. */
  touch: 48,
  /** Legacy square corners, still used by screens not yet rebuilt; new components use `radius`. */
  radius: 0,
  hairline: 1,
  /** Content never stretches wider than this on large phones and the web preview. */
  maxWidth: 560,
} as const
