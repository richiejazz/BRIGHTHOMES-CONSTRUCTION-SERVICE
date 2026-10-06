import { forwardRef, useState, type ReactNode } from 'react'
import { StyleSheet, TextInput, View, type TextInputProps } from 'react-native'

import { colors, fonts, layout, space } from '../../theme'
import { Text } from './Text'

type FrameProps = { label: string; optional?: boolean; hint?: string; error?: string; children: ReactNode }

/** Label, hint and error text around any form control. */
export function FieldFrame({ label, optional, hint, error, children }: FrameProps) {
  return (
    <View style={styles.field}>
      <Text style={styles.label} maxFontSizeMultiplier={1.6}>
        {label}
        {optional ? <Text style={styles.optional}>{'  '}Optional</Text> : null}
      </Text>
      {children}
      {error ? (
        <Text accessibilityLiveRegion="polite" style={styles.error}>
          {error}
        </Text>
      ) : hint ? (
        <Text style={styles.hint}>{hint}</Text>
      ) : null}
    </View>
  )
}

type Props = TextInputProps & { label: string; optional?: boolean; hint?: string; error?: string }

export const TextField = forwardRef<TextInput, Props>(function TextField({ label, optional, hint, error, multiline, style, onFocus, onBlur, ...props }, ref) {
  const [focused, setFocused] = useState(false)
  return (
    <FieldFrame label={label} optional={optional} hint={hint} error={error}>
      <TextInput
        ref={ref}
        accessibilityLabel={label}
        accessibilityHint={error ?? hint}
        aria-invalid={Boolean(error)}
        placeholderTextColor={colors.stone400}
        selectionColor={colors.bronze}
        multiline={multiline}
        textAlignVertical={multiline ? 'top' : 'center'}
        onFocus={(event) => {
          setFocused(true)
          onFocus?.(event)
        }}
        onBlur={(event) => {
          setFocused(false)
          onBlur?.(event)
        }}
        style={[styles.input, multiline && styles.multiline, focused && styles.focused, error ? styles.invalid : null, style]}
        {...props}
      />
    </FieldFrame>
  )
})

export const fieldStyles = StyleSheet.create({
  control: { minHeight: 52, borderWidth: 1, borderColor: colors.stone300, backgroundColor: colors.white, borderRadius: layout.radius, paddingHorizontal: 14 },
})

const styles = StyleSheet.create({
  field: { gap: space.sm },
  label: { fontFamily: fonts.semibold, fontSize: 14, color: colors.ink },
  optional: { fontFamily: fonts.medium, fontSize: 12, color: colors.stone500 },
  hint: { fontFamily: fonts.regular, fontSize: 13, lineHeight: 18, color: colors.stone500 },
  error: { fontFamily: fonts.medium, fontSize: 13, lineHeight: 18, color: colors.danger },
  input: { ...fieldStyles.control, fontFamily: fonts.regular, fontSize: 16, color: colors.ink, paddingVertical: 12 },
  multiline: { minHeight: 132, paddingTop: 14 },
  focused: { borderColor: colors.ink },
  invalid: { borderColor: colors.danger },
})
