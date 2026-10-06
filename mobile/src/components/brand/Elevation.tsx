import type { ReactNode } from 'react'
import { StyleSheet, View, type StyleProp, type ViewStyle } from 'react-native'
import Svg, { G, Path, Rect, Text as SvgText } from 'react-native-svg'

// Line-drawn architectural elevations used wherever real photography is not yet available.
// They are deliberately drawings, not photographs, so they can never be mistaken for actual
// BRIGHTHOMES projects. Ported from website/src/components/art/Elevations.tsx.

type Tone = 'dark' | 'light'
type Palette = { bg: string; line: string; faint: string; accent: string }

const palettes: Record<Tone, Palette> = {
  dark: { bg: '#1d1c1a', line: '#c9a46a', faint: 'rgba(201,164,106,0.18)', accent: '#e2dcd1' },
  light: { bg: '#ece7de', line: '#7a5a2c', faint: 'rgba(122,90,44,0.16)', accent: '#3a3835' },
}

function windows(x: number, y: number, cols: number, rows: number, w: number, h: number, gx: number, gy: number) {
  const cells: string[] = []
  for (let r = 0; r < rows; r++) for (let c = 0; c < cols; c++) cells.push(`M${x + c * (w + gx)} ${y + r * (h + gy)}h${w}v${h}h${-w}z`)
  return cells.join('')
}

function DimensionLine({ x1, x2, y, label, color }: { x1: number; x2: number; y: number; label: string; color: string }) {
  return (
    <G>
      <Path d={`M${x1} ${y}H${x2}M${x1} ${y - 6}v12M${x2} ${y - 6}v12M${x1 - 5} ${y + 5}l10 -10M${x2 - 5} ${y + 5}l10 -10`} stroke={color} strokeWidth={1} fill="none" />
      <SvgText x={(x1 + x2) / 2} y={y - 8} fill={color} fontSize={13} letterSpacing={2} textAnchor="middle">
        {label}
      </SvgText>
    </G>
  )
}

const variants: ((c: Palette) => ReactNode)[] = [
  // Two-storey villa with cantilevered roof slab.
  (c) => (
    <G>
      <Path d="M150 470V300h330v170M120 300h400M430 300v-30h-200v30M480 380h120v90" stroke={c.line} strokeWidth={2} fill="none" />
      <Path d={windows(180, 330, 3, 1, 70, 50, 25, 0) + windows(180, 400, 2, 1, 70, 70, 25, 0) + 'M375 400h60v70h-60z' + windows(510, 400, 2, 1, 30, 40, 20, 0)} stroke={c.line} strokeWidth={1.2} fill="none" />
      <DimensionLine x1={150} x2={600} y={530} label="ELEVATION A" color={c.accent} />
    </G>
  ),
  // Pitched-roof family home.
  (c) => (
    <G>
      <Path d="M190 470V290l170-120 170 120v180M160 310l200-140 200 140M440 230v-50h40v85" stroke={c.line} strokeWidth={2} fill="none" />
      <Path d={windows(225, 320, 3, 1, 60, 55, 45, 0) + 'M330 400h60v70h-60z' + windows(225, 400, 1, 1, 70, 50, 0, 0) + windows(425, 400, 1, 1, 70, 50, 0, 0) + 'M345 230a15 15 0 1 0 30 0a15 15 0 1 0 -30 0'} stroke={c.line} strokeWidth={1.2} fill="none" />
      <DimensionLine x1={190} x2={530} y={530} label="FRONT ELEVATION" color={c.accent} />
    </G>
  ),
  // Multi-storey commercial block.
  (c) => (
    <G>
      <Path d="M260 470V110h280v360M240 110h320M260 430h280" stroke={c.line} strokeWidth={2} fill="none" />
      <Path d={windows(285, 135, 4, 6, 45, 30, 15, 20) + 'M370 430h60v40h-60z'} stroke={c.line} strokeWidth={1.2} fill="none" />
      <Path d="M200 470V250h60M540 300h70v170" stroke={c.line} strokeWidth={1.5} fill="none" />
      <DimensionLine x1={200} x2={610} y={530} label="SECTION B-B" color={c.accent} />
    </G>
  ),
  // Terrace of three units.
  (c) => (
    <G>
      <Path d="M110 470V280h580v190M110 280l60-60h460l60 60M303 280v190M496 280v190" stroke={c.line} strokeWidth={2} fill="none" />
      <Path d={[0, 1, 2].map((i) => windows(135 + i * 193, 310, 2, 1, 55, 45, 30, 0) + `M${180 + i * 193} 400h50v70h-50z`).join('')} stroke={c.line} strokeWidth={1.2} fill="none" />
      <DimensionLine x1={110} x2={690} y={530} label="STREET ELEVATION" color={c.accent} />
    </G>
  ),
]

const grid = Array.from({ length: 16 }, (_, i) => `M${i * 50} 0V600`).join('') + Array.from({ length: 12 }, (_, i) => `M0 ${i * 50}H800`).join('')

/** 4:3 elevation drawing used as a stand-in image for projects without photography. */
export function ElevationPlaceholder({ seed = 0, tone = 'dark', style }: { seed?: number; tone?: Tone; style?: StyleProp<ViewStyle> }) {
  const c = palettes[tone]
  return (
    <View style={[StyleSheet.absoluteFill, style]} aria-hidden>
      <Svg width="100%" height="100%" viewBox="0 0 800 600" preserveAspectRatio="xMidYMid slice">
        <Rect width={800} height={600} fill={c.bg} />
        <Path d={grid} stroke={c.faint} strokeWidth={1} />
        <Path d="M60 470H740" stroke={c.line} strokeWidth={2} />
        <Path d="M60 476H740" stroke={c.faint} strokeWidth={6} />
        {variants[Math.abs(seed) % variants.length](c)}
      </Svg>
    </View>
  )
}

/** Faint drawing grid for dark hero panels. */
export function BlueprintGrid({ style }: { style?: StyleProp<ViewStyle> }) {
  const lines = Array.from({ length: 20 }, (_, i) => `M${i * 40} 0V1200M0 ${i * 40}H800`).join('') + Array.from({ length: 12 }, (_, i) => `M0 ${(i + 20) * 40}H800`).join('')
  return (
    <View style={[StyleSheet.absoluteFill, style]} aria-hidden>
      <Svg width="100%" height="100%">
        <Path d={lines} stroke="rgba(201,164,106,0.08)" strokeWidth={1} />
      </Svg>
    </View>
  )
}
