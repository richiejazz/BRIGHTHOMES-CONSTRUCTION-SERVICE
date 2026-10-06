import { StyleSheet, View } from 'react-native'
import Svg, { Path, Rect } from 'react-native-svg'

import { colors, fonts } from '../../theme'
import { Text } from '../ui/Text'

/** The BRIGHTHOMES mark: a bronze line-drawn house inside a hairline square (as on the website). */
export function LogoMark({ size = 36, frame = colors.paper }: { size?: number; frame?: string }) {
  return (
    <View aria-hidden>
      <Svg width={size} height={size} viewBox="0 0 32 32">
        <Rect x={0.5} y={0.5} width={31} height={31} fill="none" stroke={frame} strokeOpacity={0.35} />
        <Path d="M6.5 15.5 16 7l9.5 8.5M9 13.4V25h14V13.4M16 17.5V25" fill="none" stroke={colors.bronzeLight} strokeWidth={1.6} strokeLinecap="square" />
      </Svg>
    </View>
  )
}

export function Wordmark({ tone = 'dark' }: { tone?: 'dark' | 'light' }) {
  const onDark = tone === 'dark'
  return (
    <View accessible accessibilityRole="header" accessibilityLabel="BRIGHTHOMES Construction Service" style={styles.row}>
      <LogoMark size={38} frame={onDark ? colors.paper : colors.ink} />
      <View>
        <Text style={[styles.name, { color: onDark ? colors.paper : colors.ink }]} maxFontSizeMultiplier={1.3}>
          BRIGHTHOMES
        </Text>
        <Text style={[styles.sub, { color: onDark ? colors.stone400 : colors.stone500 }]} maxFontSizeMultiplier={1.3}>
          CONSTRUCTION SERVICE
        </Text>
      </View>
    </View>
  )
}

const styles = StyleSheet.create({
  row: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  name: { fontFamily: fonts.bold, fontSize: 15, letterSpacing: 3 },
  sub: { fontFamily: fonts.semibold, fontSize: 8.5, letterSpacing: 2.8, marginTop: 4 },
})
