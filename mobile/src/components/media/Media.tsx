import { Image, type ImageSource } from 'expo-image'
import { useEffect, useRef, useState, type ReactNode } from 'react'
import { Animated, StyleSheet, View, type ImageSourcePropType, type StyleProp, type ViewStyle } from 'react-native'
import Svg, { Defs, LinearGradient, Rect, Stop } from 'react-native-svg'

import type { GalleryImage } from '../../api/types'
import { useReducedMotion } from '../../lib/useReducedMotion'
import { useTheme } from '../../theme'
import { ElevationPlaceholder } from '../brand/Elevation'

let scrimId = 0

/**
 * A vertical gradient that darkens photography so light text stays legible over it.
 * `from`/`to` are 0–1 opacities at the top and bottom edges.
 */
export function Scrim({ from = 0, to = 0.75, mid, style }: { from?: number; to?: number; mid?: number; style?: StyleProp<ViewStyle> }) {
  const [id] = useState(() => `scrim-${(scrimId += 1)}`)
  return (
    <View style={[StyleSheet.absoluteFill, style]} pointerEvents="none" aria-hidden>
      <Svg width="100%" height="100%" preserveAspectRatio="none">
        <Defs>
          <LinearGradient id={id} x1="0" y1="0" x2="0" y2="1">
            <Stop offset="0" stopColor="#0C0B0A" stopOpacity={from} />
            <Stop offset="0.5" stopColor="#0C0B0A" stopOpacity={mid ?? (from + to) / 2} />
            <Stop offset="1" stopColor="#0C0B0A" stopOpacity={to} />
          </LinearGradient>
        </Defs>
        <Rect width="100%" height="100%" fill={`url(#${id})`} />
      </Svg>
    </View>
  )
}

type PhotoProps = {
  /** An API gallery image, or a bundled editorial image. */
  image: GalleryImage | null
  /** Picks the placeholder drawing so neighbouring cards differ. */
  seed: number
  /** Used for the accessibility label when the image has no alt text. */
  title: string
  style?: StyleProp<ViewStyle>
  children?: ReactNode
  priority?: 'low' | 'normal' | 'high'
}

/**
 * A content photograph that fills its frame, or a clearly labelled drawing when none has been
 * published or the image fails to load. The wrapper sets the size and the image crops to fit.
 */
export function Photo({ image, seed, title, style, children, priority }: PhotoProps) {
  const reduced = useReducedMotion()
  const { colors } = useTheme()
  const [failed, setFailed] = useState(false)
  const showImage = image && !failed
  return (
    <View style={[styles.frame, { backgroundColor: colors.surface }, style]}>
      {showImage ? (
        <Image
          source={{ uri: image.image }}
          alt={image.alt_text || title}
          accessibilityLabel={image.alt_text || `Photograph: ${title}`}
          contentFit="cover"
          transition={reduced ? null : { duration: 350, effect: 'cross-dissolve' }}
          recyclingKey={String(image.id)}
          priority={priority}
          onError={() => setFailed(true)}
          style={StyleSheet.absoluteFill}
        />
      ) : (
        <View accessible accessibilityRole="image" accessibilityLabel={`Architectural drawing. No photograph of ${title} is available yet.`} style={StyleSheet.absoluteFill}>
          <ElevationPlaceholder seed={seed} />
        </View>
      )}
      {children}
    </View>
  )
}

/** A bundled editorial photograph (see src/content/media.ts). */
export function EditorialPhoto({ source, alt, style, children, priority }: { source: ImageSourcePropType; alt: string; style?: StyleProp<ViewStyle>; children?: ReactNode; priority?: 'low' | 'normal' | 'high' }) {
  const reduced = useReducedMotion()
  const { colors } = useTheme()
  return (
    <View style={[styles.frame, { backgroundColor: colors.inverse.background }, style]}>
      <Image source={source as ImageSource} alt={alt} accessibilityLabel={alt} contentFit="cover" transition={reduced ? null : { duration: 450, effect: 'cross-dissolve' }} priority={priority} style={StyleSheet.absoluteFill} />
      {children}
    </View>
  )
}

/** Fades and lifts its content into place once, on mount. Static when reduced motion is on. */
export function Reveal({ children, delay = 0, style }: { children: ReactNode; delay?: number; style?: StyleProp<ViewStyle> }) {
  const reduced = useReducedMotion()
  const progress = useRef(new Animated.Value(reduced ? 1 : 0)).current
  useEffect(() => {
    if (reduced) {
      progress.setValue(1)
      return
    }
    const animation = Animated.timing(progress, { toValue: 1, duration: 600, delay, useNativeDriver: true })
    animation.start()
    return () => animation.stop()
  }, [progress, reduced, delay])
  const translateY = progress.interpolate({ inputRange: [0, 1], outputRange: [14, 0] })
  return <Animated.View style={[style, { opacity: progress, transform: [{ translateY }] }]}>{children}</Animated.View>
}

const styles = StyleSheet.create({
  frame: { overflow: 'hidden' },
})
