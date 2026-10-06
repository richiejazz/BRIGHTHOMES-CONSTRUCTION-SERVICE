import { Image } from 'expo-image'
import { useState } from 'react'
import { FlatList, StyleSheet, View, useWindowDimensions } from 'react-native'

import type { ProjectImage } from '../../api/types'
import { padIndex } from '../../lib/format'
import { useReducedMotion } from '../../lib/useReducedMotion'
import { colors, layout, space } from '../../theme'
import { Text } from '../ui/Text'

/** Swipeable, paged gallery with captions and a position counter. */
export function ProjectGallery({ images, title }: { images: ProjectImage[]; title: string }) {
  const { width } = useWindowDimensions()
  const reduced = useReducedMotion()
  const [index, setIndex] = useState(0)
  const itemWidth = width - layout.gutter * 2
  const step = itemWidth + space.md

  return (
    <View>
      <FlatList
        data={images}
        horizontal
        keyExtractor={(image) => String(image.id)}
        showsHorizontalScrollIndicator={false}
        snapToInterval={step}
        decelerationRate="fast"
        disableIntervalMomentum
        contentContainerStyle={styles.track}
        onScroll={(event) => setIndex(Math.max(0, Math.min(images.length - 1, Math.round(event.nativeEvent.contentOffset.x / step))))}
        scrollEventThrottle={32}
        renderItem={({ item, index: position }) => (
          <View style={{ width: itemWidth }} accessible accessibilityLabel={`Image ${position + 1} of ${images.length}. ${item.alt_text || title}${item.caption ? `. ${item.caption}` : ''}`}>
            <View style={styles.frame}>
              <Image source={{ uri: item.image }} alt={item.alt_text || title} contentFit="cover" transition={reduced ? null : 200} style={StyleSheet.absoluteFill} />
            </View>
            {item.caption ? (
              <Text variant="small" style={styles.caption}>
                {item.caption}
              </Text>
            ) : null}
          </View>
        )}
      />
      <Text variant="eyebrow" color={colors.stone500} style={styles.counter} aria-hidden>
        {padIndex(index)} / {padIndex(images.length - 1)}
      </Text>
    </View>
  )
}

const styles = StyleSheet.create({
  track: { paddingHorizontal: layout.gutter, gap: space.md },
  frame: { aspectRatio: 4 / 3, width: '100%', backgroundColor: colors.charcoal, overflow: 'hidden' },
  caption: { marginTop: space.sm },
  counter: { paddingHorizontal: layout.gutter, marginTop: space.md },
})
