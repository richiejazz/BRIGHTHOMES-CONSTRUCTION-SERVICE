import type { TextStyle } from 'react-native'

// Cormorant Garamond for editorial display type; Inter for body text, labels, buttons and
// navigation. Families are loaded in the root layout before the splash screen hides.
export const fonts = {
  display: 'CormorantGaramond_500Medium',
  displayRegular: 'CormorantGaramond_400Regular',
  displaySemibold: 'CormorantGaramond_600SemiBold',
  displayItalic: 'CormorantGaramond_500Medium_Italic',
  regular: 'Inter_400Regular',
  medium: 'Inter_500Medium',
  semibold: 'Inter_600SemiBold',
} as const

/** Colour-free type scale; the Text component applies the theme colour for each role. */
export const type = {
  hero: { fontFamily: fonts.display, fontSize: 46, lineHeight: 47, letterSpacing: -0.6 },
  display: { fontFamily: fonts.display, fontSize: 38, lineHeight: 41, letterSpacing: -0.4 },
  title: { fontFamily: fonts.display, fontSize: 30, lineHeight: 34, letterSpacing: -0.2 },
  heading: { fontFamily: fonts.display, fontSize: 24, lineHeight: 28 },
  subheading: { fontFamily: fonts.displaySemibold, fontSize: 20, lineHeight: 24 },
  lead: { fontFamily: fonts.regular, fontSize: 16, lineHeight: 25 },
  body: { fontFamily: fonts.regular, fontSize: 15, lineHeight: 23 },
  label: { fontFamily: fonts.medium, fontSize: 15, lineHeight: 20 },
  small: { fontFamily: fonts.regular, fontSize: 13, lineHeight: 19 },
  caption: { fontFamily: fonts.medium, fontSize: 12, lineHeight: 16 },
  eyebrow: { fontFamily: fonts.semibold, fontSize: 10.5, lineHeight: 14, letterSpacing: 2.2, textTransform: 'uppercase' },
  // Lining figures: Cormorant's default old-style 1 reads as a capital I in statistics.
  numeral: { fontFamily: fonts.display, fontSize: 52, lineHeight: 54, letterSpacing: -1, fontVariant: ['lining-nums'] },
} satisfies Record<string, TextStyle>

export type TypeVariant = keyof typeof type

/** Display sizes scale gently with screen width so headlines fit small phones without wrapping awkwardly. */
export const scaledVariants: ReadonlySet<TypeVariant> = new Set(['hero', 'display', 'title', 'numeral'])
