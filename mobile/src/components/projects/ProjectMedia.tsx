import { Image } from 'expo-image'
import { useState } from 'react'
import { StyleSheet, View, type StyleProp, type ViewStyle } from 'react-native'

import type { ProjectImage } from '../../api/types'
import { useReducedMotion } from '../../lib/useReducedMotion'
import { colors, fonts } from '../../theme'
import { ElevationPlaceholder } from '../brand/Elevation'
import { Text } from '../ui/Text'

type Props = {
  image: ProjectImage | null
  /** Picks a placeholder drawing, so neighbouring cards differ. */
  seed: number
  /** Used for the accessibility label when the image has no alt text. */
  title: string
  style?: StyleProp<ViewStyle>
}

/**
 * A project's photograph, or a clearly labelled illustration when none has been published or
 * the image fails to load. The wrapper sets the size; the media fills it with a centred crop.
 */
export function ProjectMedia({ image, seed, title, style }: Props) {
  const reduced = useReducedMotion()
  const [failed, setFailed] = useState(false)
  const showImage = image && !failed
  return (
    <View style={[styles.frame, style]}>
      {showImage ? (
        <Image
          source={{ uri: image.image }}
          alt={image.alt_text || title}
          accessibilityLabel={image.alt_text || `Photograph of ${title}`}
          contentFit="cover"
          transition={reduced ? null : 200}
          recyclingKey={String(image.id)}
          onError={() => setFailed(true)}
          style={StyleSheet.absoluteFill}
        />
      ) : (
        <View accessible accessibilityRole="image" accessibilityLabel={`Architectural illustration. No photograph of ${title} is available yet.`} style={StyleSheet.absoluteFill}>
          <ElevationPlaceholder seed={seed} />
          <Text style={styles.label}>Illustration</Text>
        </View>
      )}
    </View>
  )
}

const styles = StyleSheet.create({
  frame: { overflow: 'hidden', backgroundColor: colors.charcoal },
  label: { position: 'absolute', right: 10, bottom: 8, fontFamily: fonts.semibold, fontSize: 9.5, letterSpacing: 2, textTransform: 'uppercase', color: colors.stone400 },
})
