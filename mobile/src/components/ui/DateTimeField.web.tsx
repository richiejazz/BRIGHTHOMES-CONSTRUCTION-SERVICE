import { toIsoDate } from '../../lib/format'
import { colors } from '../../theme'
import { Button } from './Button'
import type { DateTimeFieldProps } from './DateTimeField'
import { FieldFrame } from './TextField'

// Web preview only: the native picker module has no web implementation, so the browser's own
// date and time inputs are used instead.
export function DateTimeField({ label, mode, value, onChange, minimumDate, optional, hint, error }: DateTimeFieldProps) {
  return (
    <FieldFrame label={label} optional={optional} hint={hint} error={error}>
      <input
        type={mode}
        aria-label={label}
        aria-invalid={Boolean(error)}
        value={value}
        min={mode === 'date' && minimumDate ? toIsoDate(minimumDate) : undefined}
        onChange={(event) => onChange(event.target.value)}
        style={{
          minHeight: 52,
          border: `1px solid ${error ? colors.danger : colors.stone300}`,
          borderRadius: 2,
          background: colors.white,
          color: colors.ink,
          padding: '0 14px',
          fontFamily: 'Manrope_400Regular, sans-serif',
          fontSize: 16,
        }}
      />
      {optional && value ? <Button variant="link" label={`Clear ${label.toLowerCase()}`} onPress={() => onChange('')} /> : null}
    </FieldFrame>
  )
}
