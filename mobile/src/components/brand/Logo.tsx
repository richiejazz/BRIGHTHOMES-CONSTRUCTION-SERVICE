import { StyleSheet, Text, View } from 'react-native'
import Svg, { Path, Rect } from 'react-native-svg'

import { fonts, lightColors, onImage } from '../../theme'

/** Light: for photography and dark surfaces. Dark: for light pages. */
export type LogoTone = 'light' | 'dark'

const tones = {
  light: { name: onImage.text, sub: onImage.textMuted, frame: onImage.text, mark: onImage.accent },
  dark: { name: lightColors.text, sub: lightColors.textMuted, frame: lightColors.text, mark: lightColors.accent },
} as const

/** The BRIGHTHOMES mark: a bronze line-drawn house inside a hairline square (as on the website). */
export function LogoMark({ size = 36, tone = 'light' }: { size?: number; tone?: LogoTone }) {
  const c = tones[tone]
  return (
    <View aria-hidden>
      <Svg width={size} height={size} viewBox="0 0 32 32">
        <Rect x={0.5} y={0.5} width={31} height={31} fill="none" stroke={c.frame} strokeOpacity={0.4} />
        <Path d="M6.5 15.5 16 7l9.5 8.5M9 13.4V25h14V13.4M16 17.5V25" fill="none" stroke={c.mark} strokeWidth={1.6} strokeLinecap="square" />
      </Svg>
    </View>
  )
}

/** Mark plus the spaced-out company name. */
export function Wordmark({ tone = 'light', compact = false, nameOnly = false }: { tone?: LogoTone; compact?: boolean; nameOnly?: boolean }) {
  const c = tones[tone]
  return (
    <View accessible accessibilityRole="header" accessibilityLabel="BRIGHTHOMES Construction Service" style={styles.row}>
      <LogoMark size={compact ? 30 : 36} tone={tone} />
      <View>
        <Text style={[styles.name, { color: c.name }]} maxFontSizeMultiplier={1.3}>
          BRIGHTHOMES
        </Text>
        {nameOnly ? null : (
          <Text style={[styles.sub, { color: c.sub }]} maxFontSizeMultiplier={1.3}>
            CONSTRUCTION · REAL ESTATE
          </Text>
        )}
      </View>
    </View>
  )
}

/** Wordmark tone that reads on the current page background. */
export const pageLogoTone = (scheme: 'light' | 'dark'): LogoTone => (scheme === 'dark' ? 'light' : 'dark')

const styles = StyleSheet.create({
  row: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  name: { fontFamily: fonts.semibold, fontSize: 14, letterSpacing: 3.6 },
  sub: { fontFamily: fonts.medium, fontSize: 8, letterSpacing: 2.4, marginTop: 4 },
})
