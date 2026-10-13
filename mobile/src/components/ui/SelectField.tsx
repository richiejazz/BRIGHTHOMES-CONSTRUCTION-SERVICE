import { Check, ChevronDown } from 'lucide-react-native'
import { useState } from 'react'
import { Pressable, StyleSheet, View } from 'react-native'

import { fonts, makeStyles, useTheme } from '../../theme'
import { BottomSheet } from './BottomSheet'
import { Text } from './Text'
import { FieldFrame, useFieldStyles } from './TextField'

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
  const field = useFieldStyles()
  const styles = useStyles()
  const { colors } = useTheme()
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
        style={({ pressed }) => [field.control, field.row, pressed && field.pressed, error ? field.invalid : null, disabled && field.disabled]}
      >
        <Text style={[field.value, !selected && field.placeholder]} numberOfLines={1}>
          {selected?.label ?? placeholder}
        </Text>
        <ChevronDown size={18} color={colors.textMuted} strokeWidth={1.6} />
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
                style={({ pressed }) => [styles.option, pressed && field.pressed]}
              >
                <Text style={[styles.optionText, active && styles.optionActive]}>{option.label}</Text>
                {active ? <Check size={18} color={colors.accentText} strokeWidth={2} /> : null}
              </Pressable>
            )
          })}
        </View>
      </BottomSheet>
    </FieldFrame>
  )
}

const useStyles = makeStyles((c) =>
  StyleSheet.create({
    option: { minHeight: 54, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', borderBottomWidth: StyleSheet.hairlineWidth, borderBottomColor: c.border },
    optionText: { fontFamily: fonts.regular, fontSize: 16, color: c.text, flex: 1 },
    optionActive: { fontFamily: fonts.semibold },
  }),
)
