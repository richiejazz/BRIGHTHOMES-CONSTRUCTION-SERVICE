import { forwardRef, useState, type ReactNode } from 'react'
import { StyleSheet, TextInput, View, type TextInputProps } from 'react-native'

import { fonts, layout, makeStyles, space, useTheme } from '../../theme'
import { Text } from './Text'

type FrameProps = { label: string; optional?: boolean; hint?: string; error?: string; children: ReactNode }

/** Label, hint and error text around any form control. */
export function FieldFrame({ label, optional, hint, error, children }: FrameProps) {
  const styles = useFieldStyles()
  return (
    <View style={styles.field}>
      <Text style={styles.label} maxFontSizeMultiplier={1.6}>
        {label}
        {optional ? <Text style={styles.optional}>{'   '}Optional</Text> : null}
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
  const styles = useFieldStyles()
  const { colors } = useTheme()
  const [focused, setFocused] = useState(false)
  return (
    <FieldFrame label={label} optional={optional} hint={hint} error={error}>
      <TextInput
        ref={ref}
        accessibilityLabel={label}
        accessibilityHint={error ?? hint}
        aria-invalid={Boolean(error)}
        placeholderTextColor={colors.textSubtle}
        selectionColor={colors.accent}
        cursorColor={colors.accent}
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
        style={[styles.control, styles.input, multiline && styles.multiline, focused && styles.focused, error ? styles.invalid : null, style]}
        {...props}
      />
    </FieldFrame>
  )
})

export const useFieldStyles = makeStyles((c) =>
  StyleSheet.create({
    field: { gap: space.sm },
    label: { fontFamily: fonts.semibold, fontSize: 11, letterSpacing: 1.6, textTransform: 'uppercase', color: c.text },
    optional: { fontFamily: fonts.medium, fontSize: 11, letterSpacing: 0.6, textTransform: 'none', color: c.textSubtle },
    hint: { fontFamily: fonts.regular, fontSize: 13, lineHeight: 18, color: c.textSubtle },
    error: { fontFamily: fonts.medium, fontSize: 13, lineHeight: 18, color: c.danger },
    control: { minHeight: 52, borderWidth: StyleSheet.hairlineWidth * 2, borderColor: c.border, backgroundColor: c.inputBackground, borderRadius: layout.radius, paddingHorizontal: 14 },
    input: { fontFamily: fonts.regular, fontSize: 16, color: c.text, paddingVertical: 12 },
    value: { flex: 1, fontFamily: fonts.regular, fontSize: 16, color: c.text },
    placeholder: { color: c.textSubtle },
    multiline: { minHeight: 140, paddingTop: 14 },
    focused: { borderColor: c.borderStrong },
    invalid: { borderColor: c.danger },
    pressed: { backgroundColor: c.surface },
    disabled: { opacity: 0.5 },
    row: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: space.md },
  }),
)
