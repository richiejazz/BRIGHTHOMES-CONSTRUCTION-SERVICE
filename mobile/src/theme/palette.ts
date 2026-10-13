// BRIGHTHOMES colour tokens for light and dark mode. Components read these through useTheme()
// and never hard-code colours, so both schemes stay in step.
//
// Contrast (WCAG 2.1) was checked for both schemes: text, textMuted, textSubtle, accentText,
// danger and success all reach 4.5:1 or better on background, surface and elevated. `accent`
// is the bronze used for rules, icons and large type only (3:1 or better).

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
  text: '#F6F2EA',
  textMuted: 'rgba(246,242,234,0.82)',
  border: 'rgba(246,242,234,0.55)',
  accent: '#D9B983',
  chrome: 'rgba(16,15,13,0.42)',
} as const

export const lightColors: ThemeColors = {
  background: '#F6F2EA',
  surface: '#EDE7DC',
  elevated: '#FBF9F5',
  text: '#1A1917',
  textMuted: '#55504A',
  textSubtle: '#6A6359',
  border: '#D8D0C2',
  borderStrong: '#1A1917',
  accent: '#A57F47',
  accentText: '#7A592A',
  accentFill: '#C6A066',
  onAccent: '#1A1917',
  primaryFill: '#1A1917',
  onPrimary: '#F6F2EA',
  inputBackground: '#FBF9F5',
  navigation: '#F6F2EA',
  skeleton: '#E4DDD0',
  scrim: 'rgba(16,15,13,0.55)',
  success: '#3D6648',
  danger: '#9B3B2F',
  dangerSurface: '#F5E6E2',
  inverse: { background: '#1A1917', text: '#F2EDE4', textMuted: '#B8B0A3', border: 'rgba(198,160,102,0.35)', accent: '#C6A066' },
}

export const darkColors: ThemeColors = {
  background: '#100F0D',
  surface: '#191714',
  elevated: '#211E1B',
  text: '#F2EDE4',
  textMuted: '#B8B0A3',
  textSubtle: '#968E82',
  border: '#2F2B26',
  borderStrong: '#F2EDE4',
  accent: '#C6A066',
  accentText: '#D2AF79',
  accentFill: '#C6A066',
  onAccent: '#1A1917',
  primaryFill: '#F2EDE4',
  onPrimary: '#100F0D',
  inputBackground: '#191714',
  navigation: '#100F0D',
  skeleton: '#26231F',
  scrim: 'rgba(0,0,0,0.65)',
  success: '#93C29E',
  danger: '#E79A8F',
  dangerSurface: '#2A1A17',
  inverse: { background: '#1C1A17', text: '#F2EDE4', textMuted: '#B8B0A3', border: 'rgba(198,160,102,0.3)', accent: '#C6A066' },
}
