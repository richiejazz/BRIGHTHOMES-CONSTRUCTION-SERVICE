import { darkTokens, lightTokens, type AppTokens } from './tokens'

// Semantic colour roles used by existing components. Every value is derived from the
// Design Specification v1.0 app tokens in tokens.ts, so screens that have not yet been rebuilt
// already render in the approved palette. New components should prefer the spec token names
// (useTheme().tokens).
//
// Contrast (WCAG 2.1, spec §03): ink on bg 15.5:1, mute on bg 5.0:1, bronze on bg 5.1:1,
// danger on bg 5.7:1; the dark values are lifted to stay above 4.5:1.

export type ThemeColors = {
  /** Screen background. */
  background: string
  /** Sunken bands and quiet panels. */
  surface: string
  /** Sheets, inputs and anything raised above the page. */
  elevated: string
  text: string
  textMuted: string
  textSubtle: string
  /** Hairline dividers. */
  border: string
  /** Strong rules and outlined controls. */
  borderStrong: string
  accent: string
  /** Bronze for small text, where `accent` would lack contrast. */
  accentText: string
  /** Fill for accent buttons, and the text that sits on it. */
  accentFill: string
  onAccent: string
  /** Primary buttons: the inverse of the page. */
  primaryFill: string
  onPrimary: string
  inputBackground: string
  navigation: string
  skeleton: string
  scrim: string
  success: string
  danger: string
  dangerSurface: string
  /** Bands that are always dark (achievements, consultation call to action). */
  inverse: { background: string; text: string; textMuted: string; border: string; accent: string }
}

/** Text and controls laid over photography are always light, whatever the scheme. */
export const onImage = {
  text: '#F7F4EE',
  textMuted: 'rgba(247,244,238,0.82)',
  border: 'rgba(247,244,238,0.55)',
  accent: darkTokens.bronze,
  /** Floating controls on photos: 38% charcoal behind a 14px blur (§11). */
  chrome: 'rgba(26,25,23,0.38)',
  /** Image-card scrim runs from 40% to 82% black under text (§13). */
  scrimFrom: 'rgba(0,0,0,0.4)',
  scrimTo: 'rgba(0,0,0,0.82)',
} as const

function fromTokens(t: AppTokens, scheme: 'light' | 'dark'): ThemeColors {
  const dark = scheme === 'dark'
  return {
    background: t.bg,
    surface: t.s2,
    elevated: t.s1,
    text: t.ink,
    textMuted: t.ink2,
    textSubtle: t.mute,
    border: t.line,
    borderStrong: t.ink,
    accent: t.bronze,
    accentText: t.bronze,
    accentFill: t.bronze,
    onAccent: t.onPrimary,
    primaryFill: t.primary,
    onPrimary: t.onPrimary,
    inputBackground: t.s1,
    navigation: t.bg,
    skeleton: t.s2,
    // §07: sheets rise over a 45% scrim.
    scrim: 'rgba(0,0,0,0.45)',
    success: t.ok,
    danger: t.danger,
    dangerSurface: dark ? 'rgba(229,138,114,0.12)' : 'rgba(161,63,45,0.08)',
    // The consultation call-to-action card stays dark in both schemes (§08 A-05).
    inverse: dark
      ? { background: t.s2, text: t.ink, textMuted: t.mute, border: 'rgba(210,166,119,0.3)', accent: t.bronze }
      : { background: t.ink, text: darkTokens.ink, textMuted: darkTokens.mute, border: 'rgba(210,166,119,0.35)', accent: darkTokens.bronze },
  }
}

export const lightColors: ThemeColors = fromTokens(lightTokens, 'light')
export const darkColors: ThemeColors = fromTokens(darkTokens, 'dark')
