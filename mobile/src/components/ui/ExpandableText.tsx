import { useState } from 'react'
import { Pressable, StyleSheet } from 'react-native'

import { fonts, useTheme } from '../../theme'
import { Text } from './Text'

/** Long copy collapsed to a few lines with a "Read more" toggle, so detail screens stay scannable. */
export function ExpandableText({ children, lines = 4 }: { children: string; lines?: number }) {
  const { colors } = useTheme()
  const [expanded, setExpanded] = useState(false)
  // Short copy never needs the toggle; long copy almost always wraps past the limit.
  const long = children.length > lines * 60
  return (
    <>
      <Text variant="body" numberOfLines={expanded || !long ? undefined : lines}>
        {children}
      </Text>
      {long ? (
        <Pressable onPress={() => setExpanded((value) => !value)} accessibilityRole="button" accessibilityState={{ expanded }} hitSlop={8} style={styles.toggle}>
          <Text style={[styles.toggleText, { color: colors.accentText }]}>{expanded ? 'Show less' : 'Read more'}</Text>
        </Pressable>
      ) : null}
    </>
  )
}

const styles = StyleSheet.create({
  toggle: { minHeight: 44, justifyContent: 'center', alignSelf: 'flex-start' },
  toggleText: { fontFamily: fonts.semibold, fontSize: 14 },
})
