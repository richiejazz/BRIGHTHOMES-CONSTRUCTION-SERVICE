export { colors } from './colors'
export { fonts, type, type TypeVariant } from './typography'

/** 4pt spacing scale. */
export const space = { xs: 4, sm: 8, md: 12, lg: 16, xl: 24, xxl: 32, xxxl: 48 } as const

export const layout = {
  /** Horizontal screen gutter. */
  gutter: 20,
  /** Minimum touch target. */
  touch: 48,
  /** The brand is architectural: corners stay nearly square. */
  radius: 2,
  hairline: 1,
} as const
