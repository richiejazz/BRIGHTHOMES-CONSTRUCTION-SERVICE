import { Pressable, StyleSheet, View } from 'react-native'

import { haptics } from '../../lib/haptics'
import { fonts, layout, makeStyles, space } from '../../theme'
import { Text } from './Text'

/** A selectable filter: thin outline, solid when selected. */
export function Chip({ label, selected, onPress, accessibilityLabel }: { label: string; selected: boolean; onPress: () => void; accessibilityLabel?: string }) {
  const styles = useStyles()
  return (
    <Pressable
      onPress={() => {
        haptics.selection()
        onPress()
      }}
      accessibilityRole="button"
      accessibilityLabel={accessibilityLabel ?? label}
      accessibilityState={{ selected }}
      aria-selected={selected}
      style={({ pressed }) => [styles.chip, selected && styles.selected, pressed && !selected && styles.pressed]}
    >
      <Text style={[styles.label, selected && styles.labelSelected]} maxFontSizeMultiplier={1.4}>
        {label}
      </Text>
    </Pressable>
  )
}

export type SegmentOption<T extends string> = { value: T; label: string; count?: number }

/**
 * A contained segmented control (equal-width segments, the active one filled), used to switch
 * between views of one screen: Explore, Saved, Activity and the appearance setting.
 */
export function Segmented<T extends string>({ options, value, onChange, accessibilityLabel, role = 'tab' }: { options: SegmentOption<T>[]; value: T; onChange: (value: T) => void; accessibilityLabel: string; role?: 'tab' | 'radio' }) {
  const styles = useStyles()
  return (
    <View style={styles.segments} accessibilityRole={role === 'tab' ? 'tablist' : 'radiogroup'} accessibilityLabel={accessibilityLabel}>
      {options.map((option) => {
        const active = option.value === value
        return (
          <Pressable
            key={option.value}
            onPress={() => {
              if (active) return
              haptics.selection()
              onChange(option.value)
            }}
            accessibilityRole={role}
            accessibilityState={role === 'tab' ? { selected: active } : { checked: active }}
            {...(role === 'tab' ? { 'aria-selected': active } : { 'aria-checked': active })}
            accessibilityLabel={`${option.label}${option.count !== undefined ? `, ${option.count}` : ''}`}
            style={({ pressed }) => [styles.segment, active && styles.segmentActive, pressed && !active && styles.pressed]}
          >
            <Text style={[styles.segmentText, active && styles.labelSelected]} numberOfLines={1} maxFontSizeMultiplier={1.3}>
              {option.label}
              {option.count !== undefined ? <Text style={[styles.count, active && styles.countActive]}>{`  ${option.count}`}</Text> : null}
            </Text>
          </Pressable>
        )
      })}
    </View>
  )
}

const useStyles = makeStyles((c) =>
  StyleSheet.create({
    chip: { minHeight: 36, paddingHorizontal: 14, justifyContent: 'center', borderWidth: StyleSheet.hairlineWidth * 2, borderColor: c.border, borderRadius: layout.radius },
    selected: { backgroundColor: c.primaryFill, borderColor: c.primaryFill },
    pressed: { backgroundColor: c.surface },
    label: { fontFamily: fonts.medium, fontSize: 13, color: c.textMuted },
    labelSelected: { color: c.onPrimary },
    segments: { flexDirection: 'row', padding: 3, gap: 3, backgroundColor: c.surface, marginHorizontal: layout.gutter },
    segment: { flex: 1, minHeight: 40, alignItems: 'center', justifyContent: 'center', paddingHorizontal: space.xs },
    segmentActive: { backgroundColor: c.primaryFill },
    segmentText: { fontFamily: fonts.semibold, fontSize: 13, color: c.textMuted },
    count: { fontFamily: fonts.semibold, fontSize: 12, color: c.accentText },
    countActive: { color: c.accentFill },
  }),
)
