import type { TextStyle } from 'react-native'

import { colors } from './colors'

// Instrument Serif for editorial display type, Manrope for interface and body text,
// matching the website. Families are loaded in the root layout before the splash hides.
export const fonts = {
  display: 'InstrumentSerif_400Regular',
  displayItalic: 'InstrumentSerif_400Regular_Italic',
  regular: 'Manrope_400Regular',
  medium: 'Manrope_500Medium',
  semibold: 'Manrope_600SemiBold',
  bold: 'Manrope_700Bold',
} as const

export const type = {
  hero: { fontFamily: fonts.display, fontSize: 44, lineHeight: 46, color: colors.ink },
  display: { fontFamily: fonts.display, fontSize: 36, lineHeight: 40, color: colors.ink },
  title: { fontFamily: fonts.display, fontSize: 28, lineHeight: 32, color: colors.ink },
  heading: { fontFamily: fonts.display, fontSize: 22, lineHeight: 27, color: colors.ink },
  lead: { fontFamily: fonts.regular, fontSize: 17, lineHeight: 26, color: colors.graphite },
  body: { fontFamily: fonts.regular, fontSize: 15, lineHeight: 23, color: colors.stone600 },
  label: { fontFamily: fonts.semibold, fontSize: 15, lineHeight: 20, color: colors.ink },
  small: { fontFamily: fonts.medium, fontSize: 13, lineHeight: 18, color: colors.stone600 },
  eyebrow: { fontFamily: fonts.semibold, fontSize: 11, lineHeight: 14, letterSpacing: 2.2, textTransform: 'uppercase', color: colors.bronzeDark },
} satisfies Record<string, TextStyle>

export type TypeVariant = keyof typeof type
