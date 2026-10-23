import type { TextStyle } from 'react-native'

// Design Specification v1.0 §04: Cormorant Garamond carries the voice (screen and item titles,
// names, figures); Manrope does the work (section headers, body, prices, actions, labels).
// Never set buttons, labels, inputs or paragraphs in the serif, and never use it below 20px.
// Families are loaded in the root layout before the splash screen hides.
export const fonts = {
  display: 'CormorantGaramond_500Medium',
  displayRegular: 'CormorantGaramond_400Regular',
  displaySemibold: 'CormorantGaramond_600SemiBold',
  /** Italic completions in headlines are 400 ("Good afternoon, *Tolu.*"). */
  displayItalic: 'CormorantGaramond_400Regular_Italic',
  displayMediumItalic: 'CormorantGaramond_500Medium_Italic',
  regular: 'Manrope_400Regular',
  medium: 'Manrope_500Medium',
  semibold: 'Manrope_600SemiBold',
  bold: 'Manrope_700Bold',
  extrabold: 'Manrope_800ExtraBold',
} as const

// Cormorant tracking is −0.015em (§04).
const serifTracking = (size: number) => -0.015 * size

/** Colour-free type scale; the Text component applies the theme colour for each role. */
export const type = {
  // ── App type scale from the spec (§04 "App type scale") ───────────────────────────────
  /** Explore, Saved, Activity, Profile. */
  tabTitle: { fontFamily: fonts.display, fontSize: 44, lineHeight: 46, letterSpacing: serifTracking(44) },
  /** "Good afternoon, Tolu." Pair with `greetingItalic` for the completion. */
  greeting: { fontFamily: fonts.display, fontSize: 40, lineHeight: 42, letterSpacing: serifTracking(40) },
  greetingItalic: { fontFamily: fonts.displayItalic, fontSize: 40, lineHeight: 42, letterSpacing: serifTracking(40) },
  /** Property, project and service titles. */
  detailTitle: { fontFamily: fonts.display, fontSize: 34, lineHeight: 37, letterSpacing: serifTracking(34) },
  /** "Welcome back." */
  authTitle: { fontFamily: fonts.display, fontSize: 40, lineHeight: 42, letterSpacing: serifTracking(40) },
  /** White on a photo scrim (25–32px). */
  cardTitle: { fontFamily: fonts.display, fontSize: 28, lineHeight: 30, letterSpacing: serifTracking(28) },
  /** "Featured property". */
  sectionHeader: { fontFamily: fonts.extrabold, fontSize: 17, lineHeight: 22 },
  listTitle: { fontFamily: fonts.bold, fontSize: 15, lineHeight: 20 },
  meta: { fontFamily: fonts.medium, fontSize: 13, lineHeight: 18 },
  /** CONSULTATION · CON-118 — 10–11px caps, 0.14em. */
  overline: { fontFamily: fonts.bold, fontSize: 11, lineHeight: 14, letterSpacing: 0.14 * 11, textTransform: 'uppercase' },
  /** Short form, ₦320M. */
  priceList: { fontFamily: fonts.extrabold, fontSize: 16, lineHeight: 20 },
  /** Full form, ₦320,000,000. */
  priceDetail: { fontFamily: fonts.extrabold, fontSize: 28, lineHeight: 34 },
  button: { fontFamily: fonts.bold, fontSize: 15, lineHeight: 20 },
  chip: { fontFamily: fonts.semibold, fontSize: 13, lineHeight: 18 },
  tabLabel: { fontFamily: fonts.bold, fontSize: 10.5, lineHeight: 13 },
  /** Figures in stat tiles use the serif with lining numerals. */
  figure: { fontFamily: fonts.display, fontSize: 30, lineHeight: 32, letterSpacing: serifTracking(30), fontVariant: ['lining-nums'] },

  // ── Legacy roles, used by screens not yet rebuilt (Phase E/F migrates them) ───────────
  hero: { fontFamily: fonts.display, fontSize: 46, lineHeight: 47, letterSpacing: -0.6 },
  display: { fontFamily: fonts.display, fontSize: 38, lineHeight: 41, letterSpacing: -0.4 },
  title: { fontFamily: fonts.display, fontSize: 30, lineHeight: 34, letterSpacing: -0.2 },
  heading: { fontFamily: fonts.display, fontSize: 24, lineHeight: 28 },
  subheading: { fontFamily: fonts.displaySemibold, fontSize: 20, lineHeight: 24 },
  lead: { fontFamily: fonts.regular, fontSize: 16, lineHeight: 25 },
  /** Body: Manrope 400, 15px, 1.5. */
  body: { fontFamily: fonts.regular, fontSize: 15, lineHeight: 22.5 },
  label: { fontFamily: fonts.semibold, fontSize: 15, lineHeight: 20 },
  small: { fontFamily: fonts.regular, fontSize: 13, lineHeight: 19 },
  caption: { fontFamily: fonts.medium, fontSize: 12, lineHeight: 16 },
  eyebrow: { fontFamily: fonts.bold, fontSize: 10.5, lineHeight: 14, letterSpacing: 0.14 * 10.5, textTransform: 'uppercase' },
  // Lining figures: Cormorant's default old-style 1 reads as a capital I in statistics.
  numeral: { fontFamily: fonts.display, fontSize: 52, lineHeight: 54, letterSpacing: -1, fontVariant: ['lining-nums'] },
} satisfies Record<string, TextStyle>

export type TypeVariant = keyof typeof type

/** Display sizes scale gently with screen width so headlines fit small phones without wrapping awkwardly. */
export const scaledVariants: ReadonlySet<TypeVariant> = new Set(['hero', 'display', 'title', 'numeral', 'tabTitle', 'greeting', 'greetingItalic', 'authTitle', 'detailTitle'])
