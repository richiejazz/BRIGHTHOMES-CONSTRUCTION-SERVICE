import { Check, ChevronDown } from 'lucide-react-native'
import { useState } from 'react'
import { Pressable, StyleSheet, View } from 'react-native'

import { colors, fonts, space } from '../../theme'
import { BottomSheet } from './BottomSheet'
import { Text } from './Text'
import { FieldFrame, fieldStyles } from './TextField'

export type SelectOption = { value: string; label: string }

type Props = {
  label: string
  value: string
  options: SelectOption[]
  onChange: (value: string) => void
  placeholder: string
  optional?: boolean
  hint?: string
  error?: string
  disabled?: boolean
}

/** A select control that opens its options in a bottom sheet. */
export function SelectField({ label, value, options, onChange, placeholder, optional, hint, error, disabled }: Props) {
  const [open, setOpen] = useState(false)
  const selected = options.find((option) => option.value === value)
  return (
    <FieldFrame label={label} optional={optional} hint={hint} error={error}>
      <Pressable
        onPress={() => setOpen(true)}
        disabled={disabled}
        accessibilityRole="button"
        accessibilityLabel={`${label}: ${selected?.label ?? placeholder}`}
        accessibilityHint="Opens a list of options"
        accessibilityState={{ disabled: Boolean(disabled), expanded: open }}
        style={({ pressed }) => [fieldStyles.control, styles.control, pressed && styles.pressed, error ? styles.invalid : null, disabled && styles.disabled]}
      >
        <Text style={[styles.value, !selected && styles.placeholder]} numberOfLines={1}>
          {selected?.label ?? placeholder}
        </Text>
        <ChevronDown size={18} color={colors.stone600} strokeWidth={1.6} />
      </Pressable>
      <BottomSheet visible={open} onClose={() => setOpen(false)} title={label}>
        <View accessibilityRole="radiogroup">
          {options.map((option) => {
            const active = option.value === value
            return (
              <Pressable
                key={option.value}
                accessibilityRole="radio"
                accessibilityState={{ checked: active }}
                onPress={() => {
                  onChange(option.value)
                  setOpen(false)
                }}
                style={({ pressed }) => [styles.option, pressed && styles.pressed]}
              >
                <Text style={[styles.optionText, active && styles.optionActive]}>{option.label}</Text>
                {active ? <Check size={18} color={colors.bronzeDark} strokeWidth={2} /> : null}
              </Pressable>
            )
          })}
        </View>
      </BottomSheet>
    </FieldFrame>
  )
}

const styles = StyleSheet.create({
  control: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: space.md },
  value: { flex: 1, fontFamily: fonts.regular, fontSize: 16, color: colors.ink },
  placeholder: { color: colors.stone500 },
  pressed: { backgroundColor: colors.bone },
  invalid: { borderColor: colors.danger },
  disabled: { opacity: 0.5 },
  option: { minHeight: 52, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', borderBottomWidth: 1, borderBottomColor: colors.stone200 },
  optionText: { fontFamily: fonts.regular, fontSize: 16, color: colors.ink, flex: 1 },
  optionActive: { fontFamily: fonts.semibold },
})
