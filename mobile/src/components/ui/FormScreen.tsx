import { useHeaderHeight } from 'expo-router/react-navigation'
import { CircleAlert } from 'lucide-react-native'
import { forwardRef, type ReactNode } from 'react'
import { KeyboardAvoidingView, Platform, ScrollView, StyleSheet, View } from 'react-native'
import { useSafeAreaInsets } from 'react-native-safe-area-context'

import { layout, makeStyles, space, useTheme } from '../../theme'
import { Text } from './Text'

/**
 * Scrollable form body that stays clear of the keyboard on both platforms. `header` renders
 * edge to edge above the padded form column (used for the image band on auth screens).
 */
export const FormScreen = forwardRef<ScrollView, { children: ReactNode; header?: ReactNode }>(function FormScreen({ children, header }, ref) {
  const insets = useSafeAreaInsets()
  const headerHeight = useHeaderHeight()
  const styles = useStyles()
  return (
    <KeyboardAvoidingView style={styles.flex} behavior={Platform.OS === 'ios' ? 'padding' : undefined} keyboardVerticalOffset={headerHeight}>
      <ScrollView ref={ref} style={styles.screen} contentContainerStyle={{ paddingBottom: insets.bottom + space.xxxl }} keyboardShouldPersistTaps="handled" keyboardDismissMode="interactive">
        {header}
        <View style={styles.content}>{children}</View>
      </ScrollView>
    </KeyboardAvoidingView>
  )
})

/** Form-level error, announced to screen readers. */
export function FormAlert({ message }: { message?: string }) {
  const styles = useStyles()
  const { colors } = useTheme()
  if (!message) return null
  return (
    <View accessibilityRole="alert" accessibilityLiveRegion="assertive" style={styles.alert}>
      <CircleAlert size={18} color={colors.danger} strokeWidth={1.6} />
      <Text variant="small" color={colors.danger} style={styles.flex}>
        {message}
      </Text>
    </View>
  )
}

/** Neutral, ruled notice used for context such as "Regarding this property" or a session note. */
export function Notice({ children, tone = 'neutral' }: { children: ReactNode; tone?: 'neutral' | 'accent' }) {
  const styles = useStyles()
  const { colors } = useTheme()
  return <View style={[styles.notice, { borderLeftColor: tone === 'accent' ? colors.accent : colors.borderStrong }]}>{children}</View>
}

const useStyles = makeStyles((c) =>
  StyleSheet.create({
    flex: { flex: 1 },
    screen: { flex: 1, backgroundColor: c.background },
    content: { paddingHorizontal: layout.gutter, paddingTop: space.xl, gap: space.xl, width: '100%', maxWidth: layout.maxWidth, alignSelf: 'center' },
    alert: { flexDirection: 'row', gap: space.sm, alignItems: 'flex-start', padding: space.md, borderLeftWidth: 2, borderLeftColor: c.danger, backgroundColor: c.dangerSurface },
    notice: { gap: space.sm, paddingVertical: space.md, paddingHorizontal: space.lg, borderLeftWidth: 2, backgroundColor: c.surface },
  }),
)
