import DateTimePicker, { DateTimePickerAndroid } from '@react-native-community/datetimepicker'
import { CalendarDays, Clock } from 'lucide-react-native'
import { useState } from 'react'
import { Platform, Pressable, StyleSheet, View } from 'react-native'

import { formatTime, formatWeekdayDate, localDate, toIsoDate, toIsoTime } from '../../lib/format'
import { useTheme } from '../../theme'
import { BottomSheet } from './BottomSheet'
import { Button } from './Button'
import { Text } from './Text'
import { FieldFrame, useFieldStyles } from './TextField'

export type DateTimeFieldProps = {
  label: string
  mode: 'date' | 'time'
  /** "YYYY-MM-DD" for dates, "HH:MM" for times, or "" when unset. */
  value: string
  onChange: (value: string) => void
  placeholder: string
  minimumDate?: Date
  optional?: boolean
  hint?: string
  error?: string
}

function toDate(mode: 'date' | 'time', value: string, minimumDate?: Date) {
  if (!value) return minimumDate ?? new Date()
  if (mode === 'date') return localDate(value)
  const [hours, minutes] = value.split(':').map(Number)
  const date = new Date()
  date.setHours(hours, minutes, 0, 0)
  return date
}

/** Native date or time picker: the system dialog on Android, a bottom sheet on iOS. */
export function DateTimeField({ label, mode, value, onChange, placeholder, minimumDate, optional, hint, error }: DateTimeFieldProps) {
  const field = useFieldStyles()
  const { colors, scheme } = useTheme()
  const [open, setOpen] = useState(false)
  const [draft, setDraft] = useState(() => toDate(mode, value, minimumDate))
  const display = value ? (mode === 'date' ? formatWeekdayDate(value) : formatTime(value)) : placeholder
  const commit = (date: Date) => onChange(mode === 'date' ? toIsoDate(date) : toIsoTime(date))
  const Icon = mode === 'date' ? CalendarDays : Clock

  const openPicker = () => {
    const initial = toDate(mode, value, minimumDate)
    if (Platform.OS === 'android') {
      DateTimePickerAndroid.open({ value: initial, mode, minimumDate: mode === 'date' ? minimumDate : undefined, is24Hour: false, onValueChange: (_event, date) => commit(date) })
      return
    }
    setDraft(initial)
    setOpen(true)
  }

  return (
    <FieldFrame label={label} optional={optional} hint={hint} error={error}>
      <Pressable
        onPress={openPicker}
        accessibilityRole="button"
        accessibilityLabel={`${label}: ${value ? display : 'not set'}`}
        accessibilityHint={mode === 'date' ? 'Opens a date picker' : 'Opens a time picker'}
        style={({ pressed }) => [field.control, field.row, pressed && field.pressed, error ? field.invalid : null]}
      >
        <Text style={[field.value, !value && field.placeholder]} numberOfLines={1}>
          {display}
        </Text>
        <Icon size={18} color={colors.textMuted} strokeWidth={1.6} />
      </Pressable>
      {optional && value ? <Button variant="link" label={`Clear ${label.toLowerCase()}`} onPress={() => onChange('')} /> : null}
      {Platform.OS === 'ios' ? (
        <BottomSheet visible={open} onClose={() => setOpen(false)} title={label}>
          <View style={styles.picker}>
            <DateTimePicker
              value={draft}
              mode={mode}
              display={mode === 'date' ? 'inline' : 'spinner'}
              minimumDate={mode === 'date' ? minimumDate : undefined}
              accentColor={colors.accentText}
              textColor={colors.text}
              themeVariant={scheme}
              onValueChange={(_event, date) => setDraft(date)}
            />
          </View>
          <Button
            label="Done"
            fullWidth
            onPress={() => {
              commit(draft)
              setOpen(false)
            }}
          />
        </BottomSheet>
      ) : null}
    </FieldFrame>
  )
}

const styles = StyleSheet.create({
  picker: { alignItems: 'center' },
})
