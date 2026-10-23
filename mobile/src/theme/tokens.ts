// BRIGHTHOMES app design tokens, transcribed from Design Specification v1.0 (§03 "App tokens"
// and Appendix B). These are the source of truth: the semantic palette in palette.ts is derived
// from them, and new components should read them through useTheme().tokens.

export type AppTokens = {
  /** Screen. */
  bg: string
  /** Cards, groups, sheets. */
  s1: string
  /** Icon wells, segmented track. */
  s2: string
  /** Grabbers, toggles off. */
  s3: string
  ink: string
  ink2: string
  /** Metadata. */
  mute: string
  /** Dividers. */
  line: string
  /** Accent and links. Never used for body copy. */
  bronze: string
  /** "Requested" fill. */
  bronzeTint: string
  /** Primary button fill and the text on it. */
  primary: string
  onPrimary: string
  /** Available, toggles on. */
  ok: string
  /** Errors, sign out. */
  danger: string
  /** Frosted tab bar and action bar background. */
  glass: string
}

export const lightTokens: AppTokens = {
  bg: '#F4F1EB',
  s1: '#FCFBF8',
  s2: '#EBE5DA',
  s3: '#DCD4C6',
  ink: '#1A1917',
  ink2: '#46413A',
  mute: '#6C665C',
  line: '#E2DBCF',
  bronze: '#8A5A2E',
  bronzeTint: 'rgba(138,90,46,0.11)',
  primary: '#1A1917',
  onPrimary: '#F7F4EE',
  ok: '#3F6B3A',
  danger: '#A13F2D',
  // Not given a value in the spec; --bg at 86% so content shows through the blur.
  glass: 'rgba(244,241,235,0.86)',
}

export const darkTokens: AppTokens = {
  bg: '#0E0D0C',
  s1: '#191816',
  s2: '#252320',
  s3: '#34312C',
  ink: '#F0EBE2',
  ink2: '#CEC6B9',
  mute: '#9D9589',
  line: '#2B2825',
  bronze: '#D2A677',
  bronzeTint: 'rgba(210,166,119,0.13)',
  primary: '#EFE9DF',
  onPrimary: '#141311',
  ok: '#8DB886',
  danger: '#E58A72',
  glass: 'rgba(14,13,12,0.86)',
}

/** Corner radii (Appendix B). Website corners are always square; these are app-only. */
export const radius = { field: 13, button: 15, card: 20, group: 18, sheet: 26, chip: 999, search: 14, well: 13, tile: 18, option: 14, check: 7 } as const

/** Fixed dimensions (Appendix B, §11, §12, §21). */
export const size = {
  gutter: 20,
  tabBar: 86,
  button: 54,
  field: 52,
  search: 48,
  chip: 38,
  optionRow: 56,
  groupRow: 58,
  iconWell: 34,
  quickActionWell: 42,
  floatingButton: 42,
  touch: 44,
  dateTile: { width: 62, height: 76 },
  toggle: { width: 46, height: 28 },
  grabber: { width: 36, height: 5 },
  dot: 6,
  dotActive: 18,
  /** Detail sheet overlaps its gallery header by this much. */
  sheetOverlap: 22,
} as const

/** Motion (§07, §24). Durations in ms. */
export const motion = {
  push: 340,
  sheet: 360,
  scrimFade: 250,
  modal: 400,
  rise: 450,
  press: 160,
  toastIn: 300,
  toastHold: 2200,
  skeleton: 1250,
  pressScale: 0.98,
  tilePressScale: 0.97,
  pushDistance: 56,
  riseDistance: 10,
  /** cubic-bezier(.2,.8,.2,1) */
  easing: [0.2, 0.8, 0.2, 1] as const,
} as const
