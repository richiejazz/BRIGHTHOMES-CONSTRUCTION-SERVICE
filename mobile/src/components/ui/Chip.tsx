import { Pressable, StyleSheet } from 'react-native'

import { colors, fonts, layout } from '../../theme'
import { Text } from './Text'

/** A selectable filter pill (square-cornered, as elsewhere in the brand). */
export function Chip({ label, selected, onPress, accessibilityLabel }: { label: string; selected: boolean; onPress: () => void; accessibilityLabel?: string }) {
  return (
    <Pressable
      onPress={onPress}
      accessibilityRole="button"
      accessibilityLabel={accessibilityLabel ?? label}
      accessibilityState={{ selected }}
      style={({ pressed }) => [styles.chip, selected && styles.selected, pressed && !selected && styles.pressed]}
    >
      <Text style={[styles.label, selected && styles.labelSelected]} maxFontSizeMultiplier={1.4}>
        {label}
      </Text>
    </Pressable>
  )
}

const styles = StyleSheet.create({
  chip: { minHeight: 40, paddingHorizontal: 14, justifyContent: 'center', borderWidth: 1, borderColor: colors.stone300, borderRadius: layout.radius, backgroundColor: colors.paper },
  selected: { backgroundColor: colors.ink, borderColor: colors.ink },
  pressed: { backgroundColor: colors.bone },
  label: { fontFamily: fonts.semibold, fontSize: 13, color: colors.graphite },
  labelSelected: { color: colors.paper },
})
