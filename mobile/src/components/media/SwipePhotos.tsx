import { useState, type ReactNode } from 'react'
import { FlatList, Pressable, StyleSheet, View } from 'react-native'

import type { GalleryImage } from '../../api/types'
import { haptics } from '../../lib/haptics'
import { fonts, onImage, space } from '../../theme'
import { Text } from '../ui/Text'
import { Photo } from './Media'

type Props = {
  images: GalleryImage[]
  width: number
  height: number
  title: string
  seed: number
  /** dots for cards, a numbered counter for full-width heroes. */
  indicator?: 'dots' | 'counter'
  onPress?: () => void
  accessibilityHint?: string
  /** Overlays drawn above the photos (tags, scrims). */
  children?: ReactNode
}

/** Swipe between a record's photographs, with the cover first. Falls back to a single photo. */
export function SwipePhotos({ images, width, height, title, seed, indicator = 'dots', onPress, accessibilityHint, children }: Props) {
  const [index, setIndex] = useState(0)
  const ordered = [...images].sort((a, b) => Number(b.is_cover) - Number(a.is_cover))
  const frame = { width, height }

  const photo = (image: GalleryImage | null, position: number) => {
    const content = <Photo image={image} seed={seed + position} title={title} style={frame} />
    if (!onPress) return content
    return (
      <Pressable onPress={onPress} accessibilityRole="link" accessibilityLabel={title} accessibilityHint={accessibilityHint} style={({ pressed }) => pressed && styles.pressed}>
        {content}
      </Pressable>
    )
  }

  if (ordered.length < 2) {
    return (
      <View style={frame}>
        {photo(ordered[0] ?? null, 0)}
        <View style={StyleSheet.absoluteFill} pointerEvents="box-none">
          {children}
        </View>
      </View>
    )
  }

  return (
    <View style={frame}>
      <FlatList
        data={ordered}
        horizontal
        pagingEnabled
        bounces={false}
        showsHorizontalScrollIndicator={false}
        keyExtractor={(image) => String(image.id)}
        getItemLayout={(_data, position) => ({ length: width, offset: width * position, index: position })}
        onMomentumScrollEnd={(event) => {
          const next = Math.round(event.nativeEvent.contentOffset.x / width)
          if (next !== index) haptics.selection()
          setIndex(next)
        }}
        onScroll={(event) => setIndex(Math.max(0, Math.min(ordered.length - 1, Math.round(event.nativeEvent.contentOffset.x / width))))}
        scrollEventThrottle={64}
        renderItem={({ item, index: position }) => photo(item, position)}
        accessibilityLabel={`${ordered.length} photographs of ${title}. Swipe to see more.`}
      />
      <View style={StyleSheet.absoluteFill} pointerEvents="box-none">
        {children}
      </View>
      {indicator === 'dots' ? (
        <View style={styles.dots} pointerEvents="none" aria-hidden>
          {ordered.map((image, position) => (
            <View key={image.id} style={[styles.dot, position === index && styles.dotActive]} />
          ))}
        </View>
      ) : (
        <View style={styles.counter} pointerEvents="none" aria-hidden>
          <Text style={styles.counterText}>
            {index + 1} / {ordered.length}
          </Text>
        </View>
      )}
    </View>
  )
}

const styles = StyleSheet.create({
  pressed: { opacity: 0.9 },
  dots: { position: 'absolute', bottom: space.md, left: 0, right: 0, flexDirection: 'row', justifyContent: 'center', gap: 6 },
  dot: { width: 6, height: 6, backgroundColor: 'rgba(246,242,234,0.5)' },
  dotActive: { backgroundColor: onImage.text, width: 14 },
  counter: { position: 'absolute', right: space.lg, bottom: space.lg, paddingHorizontal: 10, paddingVertical: 5, backgroundColor: onImage.chrome },
  counterText: { fontFamily: fonts.semibold, fontSize: 12, letterSpacing: 1, color: onImage.text },
})
